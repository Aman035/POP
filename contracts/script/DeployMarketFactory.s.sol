// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

import {MarketFactory} from "../src/MarketFactory.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";

contract DeployMarketFactory is Script {
    /// @dev Update these constants per environment before broadcasting.
    address internal constant COLLATERAL = address(0x0000000000000000000000000000000000000001);
    uint64 internal constant CREATOR_OVERRIDE_WINDOW = 6 hours;

    function run() external returns (MarketFactory factory) {
        require(COLLATERAL != address(0), "Deploy: collateral not set");

        vm.startBroadcast();

        MarketFactory.FactoryConfig memory config = MarketFactory.FactoryConfig({
            collateral: IERC20(COLLATERAL),
            creatorOverrideWindow: CREATOR_OVERRIDE_WINDOW
        });

        factory = new MarketFactory(config, tx.origin);

        vm.stopBroadcast();
    }
}
