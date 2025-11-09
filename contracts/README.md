# POP – Predict on Posts · Smart Contracts

This package contains the onchain core for **POP – Predict on Posts**. It covers market lifecycle management for Twitter/X polls: deploying individual markets, handling liquidity, and distributing payouts once polls resolve.

## Key Contracts

### `MarketFactory`

- Stores global parameters (collateral token and creator override window).
- Any caller can deploy a market for now; future iterations can gate this behind allow-lists.
- Guarantees 1:1 mapping between an `identifier` and deployed market (tweet ID today, extendable later).
- Emits `MarketCreated` with the full poll payload for indexing.

### `Market`

- Tracks per-option liquidity and bettors’ balances.
- Handles pre-resolution interactions: `placeBet` and `exit` while the poll is open.
- Implements the resolution flow (`proposeResolution`, optional creator override, `finalizeResolution`).
- At settlement, a poll creator fee (configured per market) is skimmed and the remaining pool is distributed pro-rata to winning bettors via `claimPayout`.
- Uses a lightweight reentrancy guard and safe ERC-20 transfers.

## 🚀 Deployment

### Deploy And Verify

Set environment variables:
```bash
export COLLATERAL_BSC_TESTNET=<USDC_TOKEN_ADDRESS_ON_BSC_TESTNET>
export CREATOR_OVERRIDE_WINDOW=21600
export RPC_URL_BSC_TESTNET=https://data-seed-prebsc-1-s1.binance.org:8545
export PRIVATE_KEY=<YOUR_PRIVATE_KEY>
export BSCSCAN_API_KEY=<YOUR_BSCSCAN_API_KEY>
```

Deploy:
```bash
forge script script/DeployMarketFactory.s.sol \
    --rpc-url $RPC_URL_BSC_TESTNET \
    --broadcast \
    --private-key $PRIVATE_KEY \
    --verify \
    --verifier-url https://api-testnet.bscscan.com/api?chainid=97 \
    --etherscan-api-key $BSCSCAN_API_KEY
```

#### Latest Deployment Details

- **Contract Address**: TBD (Update after deployment)
- **Network**: BSC Testnet (Chain ID: 97)
- **Collateral Token**: TBD (Update after deployment)
- **Creator Override Window**: 21,600 seconds (6 hours)
- **BscScan**: https://testnet.bscscan.com/address/<CONTRACT_ADDRESS>
