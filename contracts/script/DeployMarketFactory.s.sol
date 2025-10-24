// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

import {MarketFactory} from "../src/MarketFactory.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";

contract DeployMarketFactory is Script {
    function run() external returns (MarketFactory factory) {
        // Load environment variables
        address collateral = vm.envAddress("COLLATERAL");
        uint64 overrideWindow = uint64(vm.envUint("CREATOR_OVERRIDE_WINDOW"));
        
        require(collateral != address(0), "Deploy: collateral not set");
        require(overrideWindow > 0, "Deploy: override window must be > 0");

        vm.startBroadcast();

        MarketFactory.FactoryConfig memory config = MarketFactory.FactoryConfig({
            collateral: IERC20(collateral),
            creatorOverrideWindow: overrideWindow
        });

        factory = new MarketFactory(config, tx.origin);

        vm.stopBroadcast();
    }
}
