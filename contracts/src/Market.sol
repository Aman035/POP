// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "./interfaces/IERC20.sol";
import {ReentrancyGuard} from "./utils/ReentrancyGuard.sol";

contract Market is ReentrancyGuard {
    uint256 public constant BPS = 10_000;

    enum State {
        Trading,
        Proposed,
        Resolved
    }

    struct ConstructorParams {
        IERC20 collateral;
        uint64 creatorOverrideWindow;
        address creator;
        uint96 creatorFeeBps;
        uint64 endTime;
        uint256 identifier;
        string[] options;

        // NEW metadata fields
        string question;
        string description;
        string category;
        string resolutionSource;
    }

    event BetPlaced(address indexed user, uint8 indexed option, uint256 amount, uint256 newPool);
    event BetExited(address indexed user, uint8 indexed option, uint256 amount, uint256 newPool);
    event ProposedResolution(uint8 indexed option, address indexed proposer, string evidenceURI);
    event MarketResolved(uint8 indexed option, address indexed resolver, uint256 creatorFee);
    event PayoutClaimed(address indexed user, uint256 amount);

    // Emitted once, at deployment, so indexers/UIs can read metadata without extra calls.
    event MarketMetadataSet(
        uint256 indexed identifier,
        string question,
        string description,
        string category,
        string resolutionSource,
        string[] options,
        uint64 endTime,
        uint96 creatorFeeBps,
        address creator
    );

    IERC20 public immutable collateral;
    address public immutable factory;
    uint64 public immutable creatorOverrideWindow;
    uint256 public immutable identifier;

    address public immutable creator;
    uint96 public immutable creatorFeeBps;
    uint64 public immutable endTime;

    // NEW metadata storage
    string public question;
    string public description;
    string public category;
    string public resolutionSource;

    State public state;
    uint8 public proposedOutcome;
    uint8 public finalOutcome;
    address public proposer;
    address public resolver;
    uint256 public proposalTimestamp;
    string public resolutionEvidence;

    uint256 public totalStaked;
    uint256 public finalWinningPool;
    uint256 public resolvedPayoutPool;
    uint256 public creatorFeePaid;

    string[] private _options;

    mapping(uint8 => uint256) public optionLiquidity;
    mapping(address => mapping(uint8 => uint256)) public userPositions;
    mapping(address => bool) public hasClaimed;

    error InvalidOption();
    error TradingClosed();
    error InvalidAmount();
    error Unauthorized();
    error MarketNotResolved();
    error AlreadyClaimed();
    error NothingToClaim();

    modifier onlyTrading() {
        if (state != State.Trading) revert TradingClosed();
        _;
    }

    modifier onlyAfterEnd() {
        if (block.timestamp < endTime) revert TradingClosed();
        _;
    }

    modifier validOption(uint8 option) {
        if (option >= _options.length) revert InvalidOption();
        _;
    }

    constructor(ConstructorParams memory params) {
        require(address(params.collateral) != address(0), "Market: collateral required");
        require(params.options.length >= 2, "Market: min two options");
        require(params.creatorFeeBps <= BPS, "Market: invalid creator fee");
        require(params.endTime > block.timestamp, "Market: end in past");
        require(params.creator != address(0), "Market: creator required");

        collateral = params.collateral;
        creatorOverrideWindow = params.creatorOverrideWindow;
        creator = params.creator;
        creatorFeeBps = params.creatorFeeBps;
        endTime = params.endTime;
        identifier = params.identifier;
        factory = msg.sender;

        // Copy options into storage
        for (uint256 i = 0; i < params.options.length; i++) {
            _options.push(params.options[i]);
        }

        // Store metadata
        question = params.question;
        description = params.description;
        category = params.category;
        resolutionSource = params.resolutionSource;

        state = State.Trading;

        emit MarketMetadataSet(
            params.identifier,
            params.question,
            params.description,
            params.category,
            params.resolutionSource,
            params.options,
            params.endTime,
            params.creatorFeeBps,
            params.creator
        );
    }

    // ----- Views -----

    function optionCount() external view returns (uint256) {
        return _options.length;
    }

    function optionAt(uint256 index) external view returns (string memory) {
        if (index >= _options.length) revert InvalidOption();
        return _options[index];
    }

    function getOptions() external view returns (string[] memory) {
        string[] memory optionsCopy = new string[](_options.length);
        for (uint256 i = 0; i < _options.length; i++) {
            optionsCopy[i] = _options[i];
        }
        return optionsCopy;
    }

    // ----- Trading -----

    function placeBet(uint8 option, uint256 amount)
        external
        nonReentrant
        onlyTrading
        validOption(option)
    {
        if (block.timestamp >= endTime) revert TradingClosed();
        if (amount == 0) revert InvalidAmount();

        _safeTransferFrom(msg.sender, amount);

        userPositions[msg.sender][option] += amount;
        optionLiquidity[option] += amount;
        totalStaked += amount;

        emit BetPlaced(msg.sender, option, amount, optionLiquidity[option]);
    }

    function exit(uint8 option, uint256 amount)
        external
        nonReentrant
        onlyTrading
        validOption(option)
    {
        if (block.timestamp >= endTime) revert TradingClosed();
        if (amount == 0) revert InvalidAmount();

        uint256 position = userPositions[msg.sender][option];
        if (position < amount) revert InvalidAmount();

        unchecked {
            userPositions[msg.sender][option] = position - amount;
            optionLiquidity[option] -= amount;
            totalStaked -= amount;
        }

        _safeTransfer(msg.sender, amount);

        emit BetExited(msg.sender, option, amount, optionLiquidity[option]);
    }

    // ----- Resolution -----

    function proposeResolution(uint8 option, string calldata evidenceURI)
        external
        nonReentrant
        onlyAfterEnd
        onlyTrading
        validOption(option)
    {
        state = State.Proposed;
        proposedOutcome = option;
        proposer = msg.sender;
        proposalTimestamp = block.timestamp;
        resolutionEvidence = evidenceURI;

        emit ProposedResolution(option, msg.sender, evidenceURI);
    }

    function overrideResolution(uint8 option) external nonReentrant validOption(option) {
        if (state != State.Proposed) revert Unauthorized();
        if (msg.sender != creator) revert Unauthorized();
        if (block.timestamp > proposalTimestamp + creatorOverrideWindow) revert Unauthorized();

        _finalize(option, msg.sender);
    }

    function finalizeResolution() external nonReentrant {
        if (state != State.Proposed) revert Unauthorized();
        if (block.timestamp < proposalTimestamp + creatorOverrideWindow) revert Unauthorized();

        _finalize(proposedOutcome, msg.sender);
    }

    function claimPayout() external nonReentrant {
        if (state != State.Resolved) revert MarketNotResolved();
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();
        if (finalWinningPool == 0) revert NothingToClaim();

        uint256 stake = userPositions[msg.sender][finalOutcome];
        if (stake == 0) revert NothingToClaim();

        hasClaimed[msg.sender] = true;
        userPositions[msg.sender][finalOutcome] = 0;

        uint256 payout = (stake * resolvedPayoutPool) / finalWinningPool;
        _safeTransfer(msg.sender, payout);

        emit PayoutClaimed(msg.sender, payout);
    }

    function _finalize(uint8 outcome, address resolvingAddress) private {
        if (state == State.Resolved) revert Unauthorized();

        state = State.Resolved;
        finalOutcome = outcome;
        resolver = resolvingAddress;

        uint256 winningPool = optionLiquidity[outcome];
        uint256 losingPool = totalStaked - winningPool;

        uint256 creatorFee;
        if (losingPool > 0) {
            creatorFee = (losingPool * creatorFeeBps) / BPS;
        }

        finalWinningPool = winningPool;
        creatorFeePaid = creatorFee;

        if (creatorFee > 0) {
            resolvedPayoutPool = totalStaked - creatorFee;
        } else {
            resolvedPayoutPool = totalStaked;
        }

        if (creatorFee > 0) {
            _safeTransfer(creator, creatorFee);
        }

        emit MarketResolved(outcome, resolvingAddress, creatorFee);
    }

    // ----- Internal token helpers -----

    function _safeTransferFrom(address from, uint256 amount) private {
        (bool success, bytes memory data) = address(collateral).call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, from, address(this), amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Market: transferFrom failed");
    }

    function _safeTransfer(address to, uint256 amount) private {
        (bool success, bytes memory data) = address(collateral).call(
            abi.encodeWithSelector(IERC20.transfer.selector, to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Market: transfer failed");
    }
}
