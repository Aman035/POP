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

    struct MarketParams {
        address collateral;
        uint64 creatorOverrideWindow;
        uint256 identifier;
        uint64 endTime;
        uint96 creatorFeeBps;
    }

    struct MarketMetadata {
        string question;
        string description;
        string category;
        Market.Platform platform;
        string resolutionSource;
        string[] options;
    }

    event MarketCreated(
        address indexed creator,
        address indexed market,
        MarketParams params,
        MarketMetadata metadata
    );

    IERC20 public immutable collateral;
    uint64 public creatorOverrideWindow;

    mapping(uint256 => address) public marketForIdentifier;
    address[] private _markets;

    constructor(FactoryConfig memory config, address initialOwner) Ownable(initialOwner) {
        require(address(config.collateral) != address(0), "Factory: collateral required");
        collateral = config.collateral;
        creatorOverrideWindow = config.creatorOverrideWindow;
    }

    function createMarket(
        uint256 identifier,
        uint64 endTime,
        uint96 creatorFeeBps,
        string calldata question,
        string calldata description,
        string calldata category,
        Market.Platform platform,
        string calldata resolutionSource,
        string[] calldata options
    ) external returns (address market) {
        if (options.length < 2) revert("Factory: min two options");
        if (options.length > 4) revert("Factory: max four options");
        if (endTime <= block.timestamp) revert("Factory: invalid end time");
        if (creatorFeeBps > BPS) revert("Factory: fee exceeds bps");
        if (marketForIdentifier[identifier] != address(0)) revert("Factory: market exists");

        Market deployed = new Market(
            collateral,
            creatorOverrideWindow,
            msg.sender,
            identifier,
            endTime,
            creatorFeeBps,
            question,
            description,
            category,
            platform,
            resolutionSource,
            options
        );

        market = address(deployed);
        marketForIdentifier[identifier] = market;
        _markets.push(market);

        MarketParams memory params = MarketParams({
            collateral: address(collateral),
            creatorOverrideWindow: creatorOverrideWindow,
            identifier: identifier,
            endTime: endTime,
            creatorFeeBps: creatorFeeBps
        });

        MarketMetadata memory metadata = MarketMetadata({
            question: question,
            description: description,
            category: category,
            platform: platform,
            resolutionSource: resolutionSource,
            options: options
        });

        emit MarketCreated(msg.sender, market, params, metadata);
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
