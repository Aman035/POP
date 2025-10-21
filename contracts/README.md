# POP – Predict on Posts · Smart Contracts

This package contains the onchain core for **POP – Predict on Posts**. It covers market lifecycle management for Twitter/X polls: deploying individual markets, handling liquidity, and distributing payouts once polls resolve.

## 🚀 Deployment

### Quick Deploy

```bash
# Create .env file with your configuration
# Then run deployment
./deploy.sh
```

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Network Configuration
RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Private Key (for deployment)
PRIVATE_KEY=your_private_key_here

# Collateral Token Address
COLLATERAL=0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d  # Testnet USDC on Arbitrum Sepolia

# Deployment Configuration
CREATOR_OVERRIDE_WINDOW=21600  # 6 hours in seconds

# Block Explorer API Keys (optional, for verification)
ARBISCAN_API_KEY=your_arbiscan_api_key
```

**Example for different networks:**

```bash
# Arbitrum Mainnet
RPC_URL=https://arb-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
COLLATERAL=0xaf88d065e77c8cC2239327C5EDb3A432268e5831

# Ethereum Mainnet  
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
COLLATERAL=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

### Deployment Scripts

- `deploy.sh` - Main deployment script (reads from .env)
- `script/DeployArbitrumSepolia.s.sol` - Foundry deployment script

### Deployed Contracts

| Network | Contract Address | Collateral Token | Status |
|---------|------------------|------------------|---------|
| Arbitrum Sepolia | [`0x0F4f4c1BdDAf3e93fC55b2ecc600265B4C838263`](https://sepolia.arbiscan.io/address/0x0F4f4c1BdDAf3e93fC55b2ecc600265B4C838263) | Testnet USDC (0x75faf...) | ✅ **Deployed & Verified** |
| Arbitrum Mainnet | `TBD` | USDC (0xaf88d...) | Ready for deployment |

### Previous Deployment (Deprecated)

| Network | Contract Address | Collateral Token | Status |
|---------|------------------|------------------|---------|
| Arbitrum Sepolia | [`0xbF5520A88eAec703042Dd53693DA943FE6EC3Faa`](https://sepolia.arbiscan.io/address/0xbf5520a88eaec703042dd53693da943fe6ec3faa) | USDC (0xaf88d...) | ⚠️ **Deprecated - Using Mainnet USDC** |

#### Latest Deployment Details

- **Contract Address**: `0x0F4f4c1BdDAf3e93fC55b2ecc600265B4C838263`
- **Network**: Arbitrum Sepolia (Chain ID: 421614)
- **Collateral Token**: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` (Testnet USDC)
- **Creator Override Window**: 21,600 seconds (6 hours)
- **Arbiscan**: https://sepolia.arbiscan.io/address/0x0F4f4c1BdDAf3e93fC55b2ecc600265B4C838263
- **Verification**: ✅ **Verified** (GUID: 6mhszduslisc8whzltnbz2ksyi3fv1rz8sa9mlafviy3hxm21s)
- **Deployment Date**: October 22, 2024

#### Previous Deployment (Deprecated)

- **Contract Address**: `0xbF5520A88eAec703042Dd53693DA943FE6EC3Faa`
- **Network**: Arbitrum Sepolia (Chain ID: 421614)
- **Transaction Hash**: `0xb5cf489dc739be79fc376498455e81fb5e19e1427cfebd1e3ce6b72c721246d9`
- **Arbiscan**: https://sepolia.arbiscan.io/address/0xbf5520a88eaec703042dd53693da943fe6ec3faa
- **Collateral Token**: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` (Mainnet USDC - Not suitable for testnet)
- **Creator Override Window**: 21,600 seconds (6 hours)
- **Owner**: `0x92380866B0Ea999097d6cd15D6B33888412A524d`
- **Deployment Date**: October 21, 2024

## 🔗 Contract Interaction

### Using the Deployed Contract

The MarketFactory is now live on Arbitrum Sepolia. You can interact with it using:

```solidity
// Contract ABI and address
address marketFactory = 0x0F4f4c1BdDAf3e93fC55b2ecc600265B4C838263;
```

### Key Functions

- `createMarket()` - Deploy a new prediction market
- `getMarket()` - Retrieve market address by identifier
- `collateral()` - Get the collateral token address
- `creatorOverrideWindow()` - Get the override window duration

### Frontend Integration

Update your frontend configuration with:

```javascript
// Updated with new deployment
const MARKET_FACTORY_ADDRESS = "0x0F4f4c1BdDAf3e93fC55b2ecc600265B4C838263";
const COLLATERAL_TOKEN = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"; // Testnet USDC
const NETWORK = "arbitrum-sepolia";
```

**✅ Updated**: The frontend has been updated with the new contract address and testnet USDC. All files are synchronized and ready for use.

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
