# USDC Token Acquisition Guide

## 🎯 Getting Tokens from `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`

This guide explains how to get USDC tokens from the specific contract address for use in the POP prediction market system.

## 📋 Prerequisites

### 1. Wallet Setup
- **Wallet**: MetaMask or compatible wallet
- **Network**: Arbitrum Sepolia (Chain ID: 421614)
- **RPC URL**: `https://sepolia-rollup.arbitrum.io/rpc`

### 2. Get Arbitrum Sepolia ETH First
You need ETH for gas fees before getting USDC:

**Faucets for Arbitrum Sepolia ETH:**
- [QuickNode Faucet](https://faucet.quicknode.com/arbitrum/sepolia)
- [Alchemy Faucet](https://sepoliafaucet.com/)
- [Chainlink Faucet](https://faucets.chain.link/arbitrum-sepolia)

## 🪙 Getting USDC Tokens

### Method 1: Built-in Faucet (If Available)

Some testnet USDC contracts have built-in faucet functions. Try these methods:

```javascript
// Connect to the contract
const usdcContract = new ethers.Contract(
  "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  [
    "function faucet() external",
    "function mint(address to, uint256 amount) external",
    "function claim() external",
    "function getTokens() external",
    "function drip() external"
  ],
  signer
);

// Try different faucet methods
const methods = ['faucet', 'mint', 'claim', 'getTokens', 'drip'];

for (const method of methods) {
  try {
    if (method === 'mint') {
      const tx = await usdcContract.mint(yourAddress, ethers.parseUnits("100", 6));
      await tx.wait();
    } else {
      const tx = await usdcContract[method]();
      await tx.wait();
    }
    console.log(`✅ Success with ${method}!`);
    break;
  } catch (error) {
    console.log(`❌ ${method} failed:`, error.message);
  }
}
```

### Method 2: External Faucets

If the built-in faucet doesn't work, try these external options:

#### Option A: Interlace USDC Faucet
- **URL**: https://developer.interlace.money/docs/usdc-on-testing-networks
- **Steps**:
  1. Connect your wallet
  2. Switch to Arbitrum Sepolia
  3. Request USDC tokens
  4. Add token to wallet: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`

#### Option B: QuickNode Faucet
- **URL**: https://faucet.quicknode.com/arbitrum/sepolia
- **Steps**:
  1. Enter your wallet address
  2. Complete captcha
  3. Request tokens

#### Option C: Bridge from Ethereum Sepolia
1. Get USDC on Ethereum Sepolia first
2. Use [Arbitrum Bridge](https://bridge.arbitrum.io/)
3. Bridge USDC to Arbitrum Sepolia

### Method 3: Manual Token Addition

If you get USDC from external sources, add it to your wallet:

**Token Details:**
- **Address**: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`
- **Symbol**: USDC
- **Decimals**: 6
- **Network**: Arbitrum Sepolia

## 🔧 Integration with POP System

### Update Your Frontend

The POP system has been updated to use this USDC address. The changes are in:

```typescript
// frontend/constants/addresses.ts
ARBITRUM_SEPOLIA: {
  MARKET_FACTORY: "0xbF5520A88eAec703042Dd53693DA943FE6EC3Faa",
  COLLATERAL_TOKEN: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // Updated
  // ... other config
}
```

### Use the USDC Acquisition Component

```tsx
import { USDCAcquisition } from '@/components/wallet/usdc-acquisition';

function BettingInterface() {
  return (
    <div>
      <USDCAcquisition onUSDCReceived={() => console.log('USDC received!')} />
      {/* Your betting interface */}
    </div>
  );
}
```

## 🚀 Quick Start Script

Use the provided script to automatically try getting USDC:

```javascript
// Load the script in your browser console
// Then run:
getUSDCTokens();
```

## 🔍 Troubleshooting

### Common Issues

1. **"Insufficient funds"**
   - Get Arbitrum Sepolia ETH first
   - Check you're on the right network

2. **"Contract method not found"**
   - Try external faucets instead
   - Check if the contract has changed

3. **"Transaction failed"**
   - Increase gas limit
   - Check network congestion

4. **"Token not showing in wallet"**
   - Manually add token with address: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`
   - Check you're on Arbitrum Sepolia

### Verification Steps

1. **Check Balance**:
```javascript
const balance = await usdcContract.balanceOf(yourAddress);
console.log('USDC Balance:', ethers.formatUnits(balance, 6));
```

2. **Verify Token Details**:
```javascript
const name = await usdcContract.name();
const symbol = await usdcContract.symbol();
const decimals = await usdcContract.decimals();
console.log({ name, symbol, decimals });
```

## 📚 Additional Resources

- [Arbitrum Sepolia Documentation](https://docs.arbitrum.io/for-devs/concepts/arbitrum-sepolia)
- [USDC on Arbitrum Sepolia Explorer](https://sepolia.arbiscan.io/token/0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d)
- [Ethers.js Documentation](https://docs.ethers.org/)

## 🎯 Next Steps

Once you have USDC tokens:

1. **Check Balance**: Verify you have enough USDC for betting
2. **Approve Spending**: Allow the market contract to spend your USDC
3. **Place Bets**: Use USDC to place bets in prediction markets
4. **Claim Winnings**: Get more USDC back if you win

---

**Note**: These are testnet tokens with no real value. They're only for testing the POP prediction market system.
