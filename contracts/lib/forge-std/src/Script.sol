// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Test.sol";

abstract contract Script {
    Vm internal constant vm = Vm(HEVM_ADDRESS);
}
