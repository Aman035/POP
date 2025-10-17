// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Cheatcode interface retained for compatibility with Foundry tests.
/// Only a subset is declared here; extend as needed when authoring new tests.
interface Vm {
    function warp(uint256) external;
    function roll(uint256) external;
    function prank(address) external;
    function startPrank(address) external;
    function startPrank(address, address) external;
    function stopPrank() external;
    function deal(address who, uint256 newBalance) external;
    function expectRevert(bytes calldata) external;
    function expectRevert(bytes4) external;
    function expectRevert() external;
    function startBroadcast() external;
    function startBroadcast(address) external;
    function startBroadcast(uint256) external;
    function stopBroadcast() external;
    function envUint(string calldata) external returns (uint256);
    function envAddress(string calldata) external returns (address);
    function envOr(string calldata, uint256) external returns (uint256);
    function envOr(string calldata, address) external returns (address);
    function addr(uint256) external returns (address);
}

address constant HEVM_ADDRESS = address(uint160(uint256(keccak256("hevm cheat code"))));

error AssertionFailed(string message);
error Uint256AssertionFailed(uint256 expected, uint256 actual, string message);
error Int256AssertionFailed(int256 expected, int256 actual, string message);
error AddressAssertionFailed(address expected, address actual, string message);
error Bytes32AssertionFailed(bytes32 expected, bytes32 actual, string message);
error BoolAssertionFailed(bool expected, bool actual, string message);

contract Test {
    Vm internal constant vm = Vm(HEVM_ADDRESS);

    event log(string message);
    event log_bytes(bytes data);
    event log_named_bytes(string key, bytes value);
    event log_named_bytes32(string key, bytes32 value);
    event log_named_decimal_int(string key, int256 value, uint256 decimals);
    event log_named_decimal_uint(string key, uint256 value, uint256 decimals);
    event log_named_string(string key, string value);
    event log_named_address(string key, address value);
    event log_named_uint(string key, uint256 value);
    event log_named_int(string key, int256 value);

    function fail() internal pure {
        revert AssertionFailed("Assertion failed");
    }

    function fail(string memory message) internal pure {
        revert AssertionFailed(message);
    }

    function assertTrue(bool condition) internal pure {
        if (!condition) revert BoolAssertionFailed(true, false, "");
    }

    function assertTrue(bool condition, string memory message) internal pure {
        if (!condition) revert BoolAssertionFailed(true, false, message);
    }

    function assertEq(uint256 expected, uint256 actual) internal pure {
        if (expected != actual) revert Uint256AssertionFailed(expected, actual, "");
    }

    function assertEq(uint256 expected, uint256 actual, string memory message) internal pure {
        if (expected != actual) revert Uint256AssertionFailed(expected, actual, message);
    }

    function assertEq(int256 expected, int256 actual) internal pure {
        if (expected != actual) revert Int256AssertionFailed(expected, actual, "");
    }

    function assertEq(int256 expected, int256 actual, string memory message) internal pure {
        if (expected != actual) revert Int256AssertionFailed(expected, actual, message);
    }

    function assertEq(address expected, address actual) internal pure {
        if (expected != actual) revert AddressAssertionFailed(expected, actual, "");
    }

    function assertEq(address expected, address actual, string memory message) internal pure {
        if (expected != actual) revert AddressAssertionFailed(expected, actual, message);
    }

    function assertEq(bytes32 expected, bytes32 actual) internal pure {
        if (expected != actual) revert Bytes32AssertionFailed(expected, actual, "");
    }

    function assertEq(bytes32 expected, bytes32 actual, string memory message) internal pure {
        if (expected != actual) revert Bytes32AssertionFailed(expected, actual, message);
    }

    function assertEq(bool expected, bool actual) internal pure {
        if (expected != actual) revert BoolAssertionFailed(expected, actual, "");
    }

    function assertEq(bool expected, bool actual, string memory message) internal pure {
        if (expected != actual) revert BoolAssertionFailed(expected, actual, message);
    }
}
