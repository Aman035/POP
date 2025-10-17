# Bet on Tweets – Smart Contracts

This package contains the onchain core for Bet on Tweets. It covers market lifecycle management for Twitter/X polls: deploying individual markets, handling liquidity, and distributing payouts once polls resolve.

## Layout

```
contracts/
├── foundry.toml          # Foundry configuration (optimizer tuned, via-IR disabled pending solc fix)
├── script/
│   └── DeployMarketFactory.s.sol # Foundry deployment script (env-configurable)
├── src/
│   ├── Market.sol        # Single-market implementation (bets, exits, settlement)
│   ├── MarketFactory.sol # Deploys markets and enforces shared configuration
│   ├── interfaces/
│   │   └── IERC20.sol    # Minimal ERC-20 interface
│   └── utils/
│       ├── Ownable.sol
│       └── ReentrancyGuard.sol
├── lib/forge-std         # Minimal local test harness shims (vm + Test contract)
└── test/
    ├── Market.t.sol      # Unit coverage for core flows
    └── mocks/MockERC20.sol
```

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
