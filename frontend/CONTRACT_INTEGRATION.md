# Contract Integration Guide

This document explains how to use the deployed POP contracts in the frontend application.

## 📋 Contract Details

### Deployed Contract
- **Contract Address**: `TBD` (Will be updated after redeployment)
- **Network**: Arbitrum Sepolia (Chain ID: 421614)
- **Collateral Token**: Testnet USDC (`0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`)
- **Creator Override Window**: 21,600 seconds (6 hours)
- **Owner**: TBD (Will be updated after deployment)

### Previous Deployment (Deprecated)
- **Contract Address**: `0x0F4f4c1BdDAf3e93fC55b2ecc600265B4C838263`
- **Collateral Token**: USDC (`0xaf88d065e77c8cC2239327C5EDb3A432268e5831`) - Mainnet USDC (not suitable for testnet)
- **Status**: ⚠️ **Deprecated - Using Mainnet USDC**

### Arbiscan Links
- **Contract**: https://sepolia.arbiscan.io/address/0xbf5520a88eaec703042dd53693da943fe6ec3faa
- **Transaction**: https://sepolia.arbiscan.io/tx/0xb5cf489dc739be79fc376498455e81fb5e19e1427cfebd1e3ce6b72c721246d9

## 🏗️ File Structure

```
frontend/
├── abis/                          # Contract ABIs
│   ├── MarketFactory.json         # MarketFactory ABI
│   ├── Market.json                # Market ABI
│   └── IERC20.json                # ERC20 interface ABI
├── lib/
│   ├── contracts.ts               # Contract addresses & ABIs
│   ├── types.ts                   # TypeScript interfaces
│   └── utils.ts                   # Utility functions
├── constants/
│   └── addresses.ts               # Network configurations
├── hooks/
│   └── use-contracts.ts           # Contract interaction hooks
└── components/
    └── providers/
        └── contract-provider.tsx   # Contract context provider
```

## 🚀 Usage Examples

### 1. Basic Contract Integration

```typescript
import { useContractContext } from '@/components/providers/contract-provider';

function MyComponent() {
  const { marketFactory, loading, error } = useContractContext();
  
  if (loading) return <div>Loading contracts...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>MarketFactory: {marketFactory?.target}</div>;
}
```

### 2. Creating a New Market

```typescript
import { useContractMethods } from '@/components/providers/contract-provider';

function CreateMarketForm() {
  const { createMarket } = useContractMethods();
  
  const handleCreateMarket = async () => {
    const params = {
      identifier: "1234567890", // Tweet ID
      options: ["Option A", "Option B"],
      creator: "0x...", // Creator address
      endTime: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
      creatorFeeBps: 250 // 2.5% fee
    };
    
    try {
      const marketAddress = await createMarket(params);
      console.log('Market created:', marketAddress);
    } catch (error) {
      console.error('Failed to create market:', error);
    }
  };
  
  return <button onClick={handleCreateMarket}>Create Market</button>;
}
```

### 3. Getting All Markets

```typescript
import { useAllMarkets } from '@/hooks/use-contracts';

function MarketsList() {
  const { markets, loading, error } = useAllMarkets();
  
  if (loading) return <div>Loading markets...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {markets.map((address, index) => (
        <div key={index}>Market: {address}</div>
      ))}
    </div>
  );
}
```

### 4. Using Individual Hooks

```typescript
import { useMarketFactory, useCollateralToken } from '@/hooks/use-contracts';

function ContractInfo() {
  const { contract: marketFactory } = useMarketFactory();
  const { contract: collateralToken } = useCollateralToken();
  
  return (
    <div>
      <p>MarketFactory: {marketFactory?.target}</p>
      <p>Collateral Token: {collateralToken?.target}</p>
    </div>
  );
}
```

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install ethers
```

### 2. Add Contract Provider to App
```typescript
// app/layout.tsx
import { ContractProvider } from '@/components/providers/contract-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ContractProvider>
          {children}
        </ContractProvider>
      </body>
    </html>
  );
}
```

### 3. Configure Environment Variables
Create a `.env.local` file in your frontend directory:
```bash
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL=your_alchemy_rpc_url_here
```

### 4. Configure Wallet Connection
Make sure your wallet is connected to Arbitrum Sepolia network:
- **Chain ID**: 421614
- **RPC URL**: Uses `NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL` from environment
- **Block Explorer**: https://sepolia.arbiscan.io

## 📝 Available Methods

### MarketFactory Contract
- `createMarket(params)` - Create a new prediction market
- `allMarkets()` - Get all deployed markets
- `marketForIdentifier(identifier)` - Get market by identifier
- `totalMarkets()` - Get total number of markets
- `collateral()` - Get collateral token address
- `creatorOverrideWindow()` - Get override window duration

### Market Contract
- `placeBet(option, amount)` - Place a bet on an option
- `exit(option, amount)` - Exit a position
- `proposeResolution(winningOption)` - Propose resolution
- `finalizeResolution()` - Finalize resolution
- `claimPayout()` - Claim winnings

## 🎯 Key Features

1. **Type Safety** - Full TypeScript support
2. **Error Handling** - Comprehensive error management
3. **Loading States** - Built-in loading indicators
4. **Event Listening** - Real-time contract events
5. **Network Support** - Multi-network configuration
6. **Reusable Hooks** - Easy to use across components

## 🔍 Troubleshooting

### Common Issues
1. **Contract not initialized** - Make sure wallet is connected
2. **Wrong network** - Ensure you're on Arbitrum Sepolia
3. **Insufficient funds** - Check USDC balance for transactions
4. **Transaction failed** - Check gas limits and network congestion
5. **RPC URL issues** - Verify `NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL` is set correctly

### Environment Variables
Make sure your `.env.local` file contains:
```bash
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL=https://arb-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```

**Note**: Never commit your `.env.local` file to version control!

### Debug Information
```typescript
import { getContractInfo } from '@/components/providers/contract-provider';

const info = getContractInfo();
console.log('Contract Info:', info);
```

## 📚 Additional Resources

- [Ethers.js Documentation](https://docs.ethers.org/)
- [Arbitrum Sepolia Faucet](https://faucet.quicknode.com/arbitrum/sepolia)
- [USDC on Arbitrum Sepolia](https://sepolia.arbiscan.io/token/0xaf88d065e77c8cC2239327C5EDb3A432268e5831)
