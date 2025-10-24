// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "./interfaces/IERC20.sol";
import {ReentrancyGuard} from "./utils/ReentrancyGuard.sol";

contract Market is ReentrancyGuard {
    uint256 public constant BPS = 10_000;

    enum State {
        Trading, // Active
        Proposed, // Active (post-end, awaiting finalize/override)
        Resolved // Resolved

    }

    enum Platform {
        Twitter,
        Farcaster,
        Lens,
        Other
    }

    // -------- Events --------

    event BetPlaced(address indexed user, uint8 indexed option, uint256 amount, uint256 newPool);
    event BetExited(address indexed user, uint8 indexed option, uint256 amount, uint256 newPool);

    event ProposedResolution(address indexed proposer, uint8 indexed option, string evidenceURI);
    event MarketResolved(address indexed resolver, uint8 indexed option, uint256 creatorFee);

    event PayoutClaimed(address indexed user, uint256 amount);
    event ParticipantCountUpdated(uint256 newCount);

    // -------- Immutables / Config --------

    // Market Params
    address public immutable factory;
    IERC20 public immutable collateral;
    uint64 public immutable creatorOverrideWindow;
    address public immutable creator;
    string public identifier;
    uint64 public immutable createdAt;
    uint64 public immutable endTime;
    uint96 public immutable creatorFeeBps;

    // Market Metadata
    string public question;
    string public description;
    string public category;
    Platform public immutable platform;
    string public resolutionSource;
    string[] public options;

    // -------- State --------

    State public state;
    uint8 public outcome;
    address public proposer;
    address public resolver;
    uint256 public proposalTimestamp;
    string public resolutionEvidence;

    uint256 public totalStaked;
    uint256 public finalWinningPool;
    uint256 public resolvedPayoutPool;
    uint256 public creatorFeePaid;
    uint256 public activeParticipantsCount;

    mapping(uint8 => uint256) public optionLiquidity; // option => pool
    mapping(address => mapping(uint8 => uint256)) public userPositions; // user => option => amount
    mapping(address => bool) public hasClaimed;
    mapping(address => uint256) public userTotalPosition; // aggregate across options
    mapping(address => bool) private _isActiveParticipant;

    // -------- Errors --------

    error NotCreator();
    error TradingEnded();
    error TradingNotEnded();
    error InvalidOption();
    error InvalidState();
    error OverrideWindowActive();
    error OverrideWindowExpired();

    error InvalidAmount();
    error MarketNotResolved();
    error AlreadyClaimed();
    error NothingToClaim();

    // -------- Modifiers --------
    modifier onlyCreator() {
        if (msg.sender != creator) revert NotCreator();
        _;
    }

    modifier onlyAfterEnd() {
        if (block.timestamp < endTime) revert TradingNotEnded();
        _;
    }

    modifier onlyBeforeEnd() {
        if (block.timestamp >= endTime) revert TradingEnded();
        _;
    }

    modifier validOption(uint8 option) {
        if (option >= options.length) revert InvalidOption();
        _;
    }

    // -------- Constructor --------

    constructor(
        IERC20 _collateral,
        uint64 _creatorOverrideWindow,
        address _creator,
        string memory _identifier,
        uint64 _endTime,
        uint96 _creatorFeeBps,
        string memory _question,
        string memory _description,
        string memory _category,
        Platform _platform,
        string memory _resolutionSource,
        string[] memory _options
    ) {
        require(address(_collateral) != address(0), "Market: collateral required");
        require(_options.length >= 2, "Market: min two options");
        require(_options.length <= 4, "Market: max four options");
        require(_creatorFeeBps <= BPS, "Market: invalid creator fee");
        require(_endTime > block.timestamp, "Market: end in past");

        collateral = _collateral;
        factory = msg.sender;
        creatorOverrideWindow = _creatorOverrideWindow;
        creator = _creator;
        identifier = _identifier;
        createdAt = uint64(block.timestamp);
        endTime = _endTime;
        creatorFeeBps = _creatorFeeBps;

        question = _question;
        description = _description;
        category = _category;
        platform = _platform;
        resolutionSource = _resolutionSource;

        // Copy options into storage
        uint256 optionsLength = _options.length;
        for (uint256 i = 0; i < optionsLength;) {
            options.push(_options[i]);
            unchecked {
                ++i;
            }
        }

        state = State.Trading;
    }

    // -------- Trading --------

    function placeBet(uint8 option, uint256 amount)
        external
        nonReentrant
        validOption(option)
        onlyBeforeEnd
    {
        if (amount == 0) revert InvalidAmount();

        _safeTransferFrom(msg.sender, amount);

        userPositions[msg.sender][option] += amount;
        optionLiquidity[option] += amount;
        totalStaked += amount;

        // participants tracking
        uint256 newUserTotal = userTotalPosition[msg.sender] + amount;
        userTotalPosition[msg.sender] = newUserTotal;
        if (!_isActiveParticipant[msg.sender]) {
            _isActiveParticipant[msg.sender] = true;
            unchecked {
                activeParticipantsCount += 1;
            }
            emit ParticipantCountUpdated(activeParticipantsCount);
        }

        emit BetPlaced(msg.sender, option, amount, optionLiquidity[option]);
    }

    /// @notice Exit during Trading (before endTime).
    function exit(uint8 option, uint256 amount)
        external
        nonReentrant
        validOption(option)
        onlyBeforeEnd
    {
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

    // -------- Market Data Views --------

    /// @notice Get the current percentage for a specific option
    /// @param option The option index (0-based)
    /// @return percentage Percentage (0-100, where 100 = 100%)
    function getOptionPercentage(uint8 option)
        external
        view
        validOption(option)
        returns (uint256 percentage)
    {
        if (totalStaked == 0) return 0;
        return (optionLiquidity[option] * 100) / totalStaked;
    }

    /// @notice Calculate potential winning amount for a bet
    /// @param option The option to bet on
    /// @param amount The amount to bet
    /// @return winning The potential winning amount if this option wins
    function calculateWinning(uint8 option, uint256 amount)
        external
        view
        validOption(option)
        returns (uint256 winning)
    {
        if (state != State.Trading) return 0;

        uint256 newTotalStaked = totalStaked + amount;
        uint256 newOptionLiquidity = optionLiquidity[option] + amount;

        // Calculate creator fee from losing pool
        uint256 losingPool = newTotalStaked - newOptionLiquidity;
        uint256 creatorFee = (losingPool * creatorFeeBps) / BPS;
        uint256 payoutPool = newTotalStaked - creatorFee;

        if (newOptionLiquidity > 0) {
            winning = (amount * payoutPool) / newOptionLiquidity;
        }
    }

    /// @notice Get the number of options in this market
    /// @return count Number of options
    function getOptionCount() external view returns (uint256 count) {
        return options.length;
    }

    // -------- Resolution --------

    function proposeResolution(uint8 option, string calldata evidenceURI)
        external
        nonReentrant
        onlyAfterEnd
        validOption(option)
    {
        if (state != State.Trading) revert InvalidState();
        state = State.Proposed;
        outcome = option;
        proposer = msg.sender;
        proposalTimestamp = block.timestamp;
        resolutionEvidence = evidenceURI;

        emit ProposedResolution(msg.sender, option, evidenceURI);
    }

    function overrideResolution(uint8 option)
        external
        nonReentrant
        onlyCreator
        validOption(option)
    {
        if (state != State.Proposed) revert InvalidState();
        if (block.timestamp > proposalTimestamp + creatorOverrideWindow) {
            revert OverrideWindowExpired();
        }

        _finalize(option, msg.sender);
    }

    function finalizeResolution() external nonReentrant {
        if (state != State.Proposed) revert InvalidState();
        if (block.timestamp < proposalTimestamp + creatorOverrideWindow) {
            revert OverrideWindowActive();
        }

        _finalize(outcome, msg.sender);
    }

    function claimPayout() external nonReentrant {
        if (state != State.Resolved) revert MarketNotResolved();
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();
        if (finalWinningPool == 0) revert NothingToClaim();

        uint256 stake = userPositions[msg.sender][outcome];
        if (stake == 0) revert NothingToClaim();

        hasClaimed[msg.sender] = true;
        userPositions[msg.sender][outcome] = 0;

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
                unchecked {
                    activeParticipantsCount -= 1;
                }
                emit ParticipantCountUpdated(activeParticipantsCount);
            }
        }

        emit PayoutClaimed(msg.sender, payout);
    }

    // -------- Internal --------

    function _finalize(uint8 winningOption, address resolvingAddress) private {
        state = State.Resolved;
        outcome = winningOption;
        resolver = resolvingAddress;

        uint256 winningPool = optionLiquidity[winningOption];
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

        emit MarketResolved(resolvingAddress, winningOption, creatorFee);
    }

    function _recomputeUserTotal(address user) private view returns (uint256 total) {
        uint256 length = options.length;
        unchecked {
            for (uint8 i = 0; i < length;) {
                total += userPositions[user][i];
                ++i;
            }
        }
    }

    // ----- Internal token helpers -----

    function _safeTransferFrom(address from, uint256 amount) private {
        (bool success, bytes memory data) = address(collateral).call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, from, address(this), amount)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))), "Market: transferFrom failed"
        );
    }

    function _safeTransfer(address to, uint256 amount) private {
        (bool success, bytes memory data) =
            address(collateral).call(abi.encodeWithSelector(IERC20.transfer.selector, to, amount));
        require(
            success && (data.length == 0 || abi.decode(data, (bool))), "Market: transfer failed"
        );
    }
}
