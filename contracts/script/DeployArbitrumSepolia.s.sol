// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {MarketFactory} from "../src/MarketFactory.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";

contract DeployArbitrumSepolia is Script {
    function run() external returns (MarketFactory factory) {
        // Use the new testnet USDC address
        address collateral = 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d;
        uint64 overrideWindow = 21600; // 6 hours
        
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
