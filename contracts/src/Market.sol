// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "./interfaces/IERC20.sol";
import {ReentrancyGuard} from "./utils/ReentrancyGuard.sol";

contract Market is ReentrancyGuard {
    uint256 public constant BPS = 10_000;

    enum State {
        Trading,    // Active
        Proposed,   // Active (post-end, awaiting finalize/override)
        Resolved,   // Resolved
        Cancelled   // Cancelled
    }

    enum Platform {
        Default,
        Twitter,
        Farcaster,
        Lens,
        Other
    }

    /// @notice High-level UI status for convenience.
    /// 0: Active (Trading/Proposed), 1: Resolved, 2: Cancelled
    function status() public view returns (uint8) {
        if (state == State.Resolved) return 1;
        if (state == State.Cancelled) return 2;
        return 0;
    }

    struct ConstructorParams {
        IERC20 collateral;
        uint64 creatorOverrideWindow;
        address creator;
        uint96 creatorFeeBps;
        uint64 endTime;
        uint256 identifier;
        string[] options;

        // metadata
        string question;
        string description;
        string category;
        string resolutionSource;
        Platform platform;
        string postUrl;

        // optional bet limits (0 disables)
        uint256 minBet;
        uint256 maxBetPerUser;
        uint256 maxTotalStake;
    }

    // -------- Events --------

    event BetPlaced(address indexed user, uint8 indexed option, uint256 amount, uint256 newPool);
    event BetExited(address indexed user, uint8 indexed option, uint256 amount, uint256 newPool);

    event ProposedResolution(uint8 indexed option, address indexed proposer, string evidenceURI);
    event MarketResolved(uint8 indexed option, address indexed resolver, uint256 creatorFee);

    event PayoutClaimed(address indexed user, uint256 amount);

    event MarketMetadataSet(
        uint256 indexed identifier,
        string question,
        string description,
        string category,
        string resolutionSource,
        string[] options,
        uint64 endTime,
        uint96 creatorFeeBps,
        address creator,
        Platform platform,
        string postUrl,
        uint64 createdAt,
        uint256 minBet,
        uint256 maxBetPerUser,
        uint256 maxTotalStake
    );

    event MarketStatusChanged(uint8 newStatus); // 0 Active, 1 Resolved, 2 Cancelled
    event ParticipantCountUpdated(uint256 newCount);

    // -------- Immutables / Config --------

    IERC20 public immutable collateral;
    address public immutable factory;
    uint64 public immutable creatorOverrideWindow;
    uint256 public immutable identifier;

    address public immutable creator;
    uint96 public immutable creatorFeeBps;
    uint64 public immutable endTime;

    // Metadata
    string public question;
    string public description;
    string public category;
    string public resolutionSource;
    Platform public platform;
    string public postUrl;
    uint64 public createdAt;

    // Optional limits
    uint256 public immutable minBet;
    uint256 public immutable maxBetPerUser;
    uint256 public immutable maxTotalStake;

    // -------- State --------

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

    uint256 public activeParticipantsCount;

    string[] private _options;

    mapping(uint8 => uint256) public optionLiquidity; // option => pool
    mapping(address => mapping(uint8 => uint256)) public userPositions; // user => option => amount
    mapping(address => bool) public hasClaimed;
    mapping(address => uint256) public userTotalPosition; // aggregate across options
    mapping(address => bool) private _isActiveParticipant;

    // -------- Errors --------

    error InvalidOption();
    error TradingClosed();
    error InvalidAmount();
    error Unauthorized();
    error MarketNotResolved();
    error AlreadyClaimed();
    error NothingToClaim();
    error CancelNotAllowed();

    // -------- Modifiers --------

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

    // -------- Constructor --------

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
        platform = params.platform;
        postUrl = params.postUrl;
        createdAt = uint64(block.timestamp);

        // Limits
        minBet = params.minBet;
        maxBetPerUser = params.maxBetPerUser;
        maxTotalStake = params.maxTotalStake;

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
            params.creator,
            params.platform,
            params.postUrl,
            createdAt,
            params.minBet,
            params.maxBetPerUser,
            params.maxTotalStake
        );

        emit MarketStatusChanged(0); // Active
    }

    // -------- Views --------

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

    // -------- Trading --------

    function placeBet(uint8 option, uint256 amount)
        external
        nonReentrant
        validOption(option)
    {
        if (state != State.Trading) revert TradingClosed();
        if (block.timestamp >= endTime) revert TradingClosed();
        if (amount == 0) revert InvalidAmount();

        // Limits
        if (minBet > 0) {
            require(amount >= minBet, "Market: below minBet");
        }

        uint256 newUserTotal = userTotalPosition[msg.sender] + amount;
        if (maxBetPerUser > 0) {
            require(newUserTotal <= maxBetPerUser, "Market: exceeds maxBetPerUser");
        }

        uint256 newTotalStaked = totalStaked + amount;
        if (maxTotalStake > 0) {
            require(newTotalStaked <= maxTotalStake, "Market: exceeds maxTotalStake");
        }

        _safeTransferFrom(msg.sender, amount);

        userPositions[msg.sender][option] += amount;
        optionLiquidity[option] += amount;
        totalStaked = newTotalStaked;

        // participants tracking
        userTotalPosition[msg.sender] = newUserTotal;
        if (!_isActiveParticipant[msg.sender]) {
            _isActiveParticipant[msg.sender] = true;
            activeParticipantsCount += 1;
            emit ParticipantCountUpdated(activeParticipantsCount);
        }

        emit BetPlaced(msg.sender, option, amount, optionLiquidity[option]);
    }

    /// @notice Exit during Trading (before endTime) or any time if Cancelled.
    function exit(uint8 option, uint256 amount)
        external
        nonReentrant
        validOption(option)
    {
        bool canExitNow = (
            (state == State.Trading && block.timestamp < endTime) ||
            (state == State.Cancelled)
        );
        if (!canExitNow) revert TradingClosed();
        if (amount == 0) revert InvalidAmount();

        uint256 position = userPositions[msg.sender][option];
        if (position < amount) revert InvalidAmount();

        unchecked {
            userPositions[msg.sender][option] = position - amount;
            optionLiquidity[option] -= amount;
            totalStaked -= amount;

            uint256 newUserTotal = userTotalPosition[msg.sender] - amount;
            userTotalPosition[msg.sender] = newUserTotal;
            if (_isActiveParticipant[msg.sender] && newUserTotal == 0) {
                _isActiveParticipant[msg.sender] = false;
                activeParticipantsCount -= 1;
                emit ParticipantCountUpdated(activeParticipantsCount);
            }
        }

        _safeTransfer(msg.sender, amount);

        emit BetExited(msg.sender, option, amount, optionLiquidity[option]);
    }

    // -------- Resolution --------

    function proposeResolution(uint8 option, string calldata evidenceURI)
        external
        nonReentrant
        onlyAfterEnd
        // only active markets can be proposed
        // (Trading->Proposed only)
        validOption(option)
    {
        if (state != State.Trading) revert Unauthorized();
        state = State.Proposed;
        proposedOutcome = option;
        proposer = msg.sender;
        proposalTimestamp = block.timestamp;
        resolutionEvidence = evidenceURI;

        emit ProposedResolution(option, msg.sender, evidenceURI);
        emit MarketStatusChanged(0); // still Active
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

        // update participant count if this zeroed them out
        uint256 totalBefore = userTotalPosition[msg.sender];
        if (totalBefore > 0) {
            // reduce tracked total by the amount used for payout
            // NOTE: user might still have losing-side dust in storage; safe to recompute:
            uint256 newTotal = _recomputeUserTotal(msg.sender);
            userTotalPosition[msg.sender] = newTotal;
            if (_isActiveParticipant[msg.sender] && newTotal == 0) {
                _isActiveParticipant[msg.sender] = false;
                activeParticipantsCount -= 1;
                emit ParticipantCountUpdated(activeParticipantsCount);
            }
        }

        emit PayoutClaimed(msg.sender, payout);
    }

    // -------- Cancellation --------

    /// @notice Creator can cancel only while Trading (before or after endTime? -> before endTime),
    ///         to prevent ambiguous results after markets close.
    ///         Users can then withdraw via `exit()` at any time (since Cancelled allows exit).
    function cancelMarket() external nonReentrant {
        if (msg.sender != creator) revert Unauthorized();
        if (state != State.Trading) revert CancelNotAllowed();
        // Allow cancel anytime before endTime; after endTime the flow is propose/finalize.
        if (block.timestamp >= endTime) revert CancelNotAllowed();

        state = State.Cancelled;
        emit MarketStatusChanged(2);
    }

    // -------- Internal --------

    function _finalize(uint8 outcome, address resolvingAddress) private {
        if (state == State.Resolved || state == State.Cancelled) revert Unauthorized();

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

        resolvedPayoutPool = (creatorFee > 0) ? (totalStaked - creatorFee) : totalStaked;

        if (creatorFee > 0) {
            _safeTransfer(creator, creatorFee);
        }

        emit MarketResolved(outcome, resolvingAddress, creatorFee);
        emit MarketStatusChanged(1);
    }

    function _recomputeUserTotal(address user) private view returns (uint256 total) {
        unchecked {
            for (uint8 i = 0; i < _options.length; i++) {
                total += userPositions[user][i];
            }
        }
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
