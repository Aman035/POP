// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Market} from "./Market.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import {Ownable} from "./utils/Ownable.sol";

contract MarketFactory is Ownable {
    uint256 public constant BPS = 10_000;

    struct FactoryConfig {
        IERC20 collateral;
        uint64 creatorOverrideWindow;
    }

    struct MarketCreation {
        uint256 identifier;
        string[] options;
        address creator;
        uint64 endTime;
        uint96 creatorFeeBps;

        // metadata
        string question;
        string description;
        string category;
        string resolutionSource;
        Market.Platform platform;
        string postUrl;

        // optional limits
        uint256 minBet;
        uint256 maxBetPerUser;
        uint256 maxTotalStake;
    }

    event MarketCreated(
        uint256 indexed identifier,
        address indexed creator,
        address market,
        string[] options,
        uint64 endTime,
        uint96 creatorFeeBps,
        string question,
        string description,
        string category,
        string resolutionSource,
        Market.Platform platform,
        string postUrl,
        uint64 createdAt,
        uint256 minBet,
        uint256 maxBetPerUser,
        uint256 maxTotalStake
    );

    event CreatorOverrideWindowUpdated(uint64 previousWindow, uint64 newWindow);

    IERC20 public immutable collateral;
    uint64 public creatorOverrideWindow;

    mapping(uint256 => address) public marketForIdentifier;
    address[] private _markets;

    constructor(FactoryConfig memory config, address initialOwner) Ownable(initialOwner) {
        require(address(config.collateral) != address(0), "Factory: collateral required");
        collateral = config.collateral;
        creatorOverrideWindow = config.creatorOverrideWindow;
    }

    function createMarket(MarketCreation calldata params) external returns (address market) {
        if (params.options.length < 2) revert("Factory: min two options");
        if (params.creator == address(0)) revert("Factory: creator is zero");
        if (params.endTime <= block.timestamp) revert("Factory: invalid end time");
        if (params.creatorFeeBps > BPS) revert("Factory: fee exceeds bps");
        if (marketForIdentifier[params.identifier] != address(0)) revert("Factory: market exists");

        string[] memory optionsCopy = new string[](params.options.length);
        for (uint256 i = 0; i < params.options.length; i++) {
            optionsCopy[i] = params.options[i];
        }

        Market.ConstructorParams memory constructorParams = Market.ConstructorParams({
            collateral: collateral,
            creatorOverrideWindow: creatorOverrideWindow,
            creator: params.creator,
            creatorFeeBps: params.creatorFeeBps,
            endTime: params.endTime,
            identifier: params.identifier,
            options: optionsCopy,
            question: params.question,
            description: params.description,
            category: params.category,
            resolutionSource: params.resolutionSource,
            platform: params.platform,
            postUrl: params.postUrl,
            minBet: params.minBet,
            maxBetPerUser: params.maxBetPerUser,
            maxTotalStake: params.maxTotalStake
        });

        Market deployed = new Market(constructorParams);

        market = address(deployed);
        marketForIdentifier[params.identifier] = market;
        _markets.push(market);

        emit MarketCreated(
            params.identifier,
            params.creator,
            market,
            optionsCopy,
            params.endTime,
            params.creatorFeeBps,
            params.question,
            params.description,
            params.category,
            params.resolutionSource,
            params.platform,
            params.postUrl,
            uint64(block.timestamp),
            params.minBet,
            params.maxBetPerUser,
            params.maxTotalStake
        );
    }

    function setCreatorOverrideWindow(uint64 newWindow) external onlyOwner {
        emit CreatorOverrideWindowUpdated(creatorOverrideWindow, newWindow);
        creatorOverrideWindow = newWindow;
    }

    function totalMarkets() external view returns (uint256) {
        return _markets.length;
    }

    function marketAt(uint256 index) external view returns (address) {
        if (index >= _markets.length) revert("Factory: index out of bounds");
        return _markets[index];
    }

    function allMarkets() external view returns (address[] memory markets) {
        markets = new address[](_markets.length);
        for (uint256 i = 0; i < _markets.length; i++) {
            markets[i] = _markets[i];
        }
    }
}
