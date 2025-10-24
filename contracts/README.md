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

```bash
forge script script/DeployMarketFactory.s.sol \
    --rpc-url $RPC_URL_ARBITRUM_SEPOLIA \
    --broadcast \
    --private-key $PRIVATE_KEY \
    --verify \
    --verifier-url https://api.etherscan.io/v2/api?chainid=421614 \
    --etherscan-api-key $ARBISCAN_API_KEY
```

#### Latest Deployment Details

- **Contract Address**: `0x6b70e7fC5E40AcFC76EbC3Fa148159E5EF6F7643`
- **Network**: Arbitrum Sepolia (Chain ID: 421614)
- **Collateral Token**: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` (Testnet USDC)
- **Creator Override Window**: 21,600 seconds (6 hours)
- **Arbiscan**: https://sepolia.arbiscan.io/address/0x6b70e7fC5E40AcFC76EbC3Fa148159E5EF6F7643
