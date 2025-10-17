// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MarketFactory} from "../src/MarketFactory.sol";
import {Market} from "../src/Market.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract MarketTest is Test {
    MockERC20 internal collateral;
    MarketFactory internal factory;

    address internal pollCreator = address(0xC0FE);

    uint64 internal overrideWindow = 6 hours;
    uint96 internal creatorFeeBps = 100; // 1%

    function setUp() public {
        collateral = new MockERC20();

        MarketFactory.FactoryConfig memory config = MarketFactory.FactoryConfig({
            collateral: collateral,
            creatorOverrideWindow: overrideWindow
        });

        factory = new MarketFactory(config, address(this));
    }

    function _defaultOptions() internal pure returns (string[] memory options) {
        options = new string[](2);
        options[0] = "Yes";
        options[1] = "No";
    }

    function _createDefaultMarket() internal returns (Market market) {
        MarketFactory.MarketCreation memory params = MarketFactory.MarketCreation({
            identifier: 123,
            options: _defaultOptions(),
            creator: pollCreator,
            endTime: uint64(block.timestamp + 1 days),
            creatorFeeBps: creatorFeeBps
        });

        address deployed = factory.createMarket(params);
        market = Market(deployed);
    }

    function testCreateMarketStoresMetadata() public {
        Market market = _createDefaultMarket();

        assertEq(address(market.collateral()), address(collateral), "collateral mismatch");
        assertEq(market.creator(), pollCreator, "creator mismatch");
        assertEq(market.optionCount(), 2, "option count mismatch");
        assertEq(factory.marketForIdentifier(123), address(market), "factory mapping");
    }

    function testPlaceBetAndExit() public {
        Market market = _createDefaultMarket();

        address bettor = address(0x1111);
        collateral.mint(bettor, 2_000_000_000); // 2,000 units (6 decimals)

        vm.prank(bettor);
        collateral.approve(address(market), type(uint256).max);

        vm.prank(bettor);
        market.placeBet(0, 1_500_000_000);

        assertEq(market.userPositions(bettor, 0), 1_500_000_000, "position stored");
        assertEq(collateral.balanceOf(address(market)), 1_500_000_000, "market balance");

        vm.prank(bettor);
        market.exit(0, 500_000_000);

        assertEq(market.userPositions(bettor, 0), 1_000_000_000, "position reduced");
        assertEq(collateral.balanceOf(bettor), 1_000_000_000, "bettor exit balance");
    }

    function testCannotCreateDuplicateMarket() public {
        _createDefaultMarket();

        MarketFactory.MarketCreation memory params = MarketFactory.MarketCreation({
            identifier: 123,
            options: _defaultOptions(),
            creator: pollCreator,
            endTime: uint64(block.timestamp + 1 days),
            creatorFeeBps: creatorFeeBps
        });

        vm.expectRevert(bytes("Factory: market exists"));
        factory.createMarket(params);
    }

    function testPlaceBetRevertsAfterEnd() public {
        Market market = _createDefaultMarket();

        address bettor = address(0x2222);
        collateral.mint(bettor, 1_000_000_000);

        vm.prank(bettor);
        collateral.approve(address(market), type(uint256).max);

        vm.warp(uint256(market.endTime()));

        vm.expectRevert(Market.TradingClosed.selector);
        vm.prank(bettor);
        market.placeBet(0, 100_000_000);
    }

    function testSettlementFlow() public {
        Market market = _createDefaultMarket();

        address alice = address(0xA11);
        address bob = address(0xB22);

        collateral.mint(alice, 1_000_000_000);
        collateral.mint(bob, 2_000_000_000);

        vm.prank(alice);
        collateral.approve(address(market), type(uint256).max);
        vm.prank(bob);
        collateral.approve(address(market), type(uint256).max);

        vm.prank(alice);
        market.placeBet(0, 1_000_000_000);
        vm.prank(bob);
        market.placeBet(1, 2_000_000_000);

        vm.warp(block.timestamp + 1 days + 1);
        vm.prank(bob);
        market.proposeResolution(1, "ipfs://resolution");

        vm.warp(block.timestamp + overrideWindow + 1);
        market.finalizeResolution();

        assertEq(collateral.balanceOf(pollCreator), 10_000_000, "creator fee");

        vm.prank(bob);
        market.claimPayout();

        assertEq(collateral.balanceOf(bob), 2_990_000_000, "winner payout");
        assertTrue(market.hasClaimed(bob), "claim recorded");

        vm.expectRevert(Market.NothingToClaim.selector);
        vm.prank(alice);
        market.claimPayout();
    }

    function testCreatorOverrideResolvesMarket() public {
        Market market = _createDefaultMarket();

        address alice = address(0xA33);
        address bob = address(0xB44);

        collateral.mint(alice, 1_500_000_000);
        collateral.mint(bob, 1_500_000_000);

        vm.prank(alice);
        collateral.approve(address(market), type(uint256).max);
        vm.prank(bob);
        collateral.approve(address(market), type(uint256).max);

        vm.prank(alice);
        market.placeBet(0, 1_500_000_000);
        vm.prank(bob);
        market.placeBet(1, 1_500_000_000);

        vm.warp(uint256(market.endTime()) + 1);

        vm.prank(bob);
        market.proposeResolution(1, "ipfs://initial");

        vm.warp(block.timestamp + 1 hours);

        vm.prank(pollCreator);
        market.overrideResolution(0);

        assertEq(uint8(market.state()), uint8(Market.State.Resolved), "state resolved");
        assertEq(market.finalOutcome(), 0, "outcome overridden");
        assertEq(market.resolver(), pollCreator, "resolver creator");
        assertEq(market.creatorFeePaid(), 15_000_000, "creator fee skimmed");

        vm.prank(alice);
        market.claimPayout();
        assertTrue(market.hasClaimed(alice), "alice claimed");
        assertEq(collateral.balanceOf(alice), 2_985_000_000, "alice payout");
        assertEq(collateral.balanceOf(pollCreator), 15_000_000, "creator fee credited");

        vm.expectRevert(Market.NothingToClaim.selector);
        vm.prank(bob);
        market.claimPayout();
    }
}
