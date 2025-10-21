# Wallet Integration with RainbowKit

This document describes the modular wallet integration using RainbowKit for Arbitrum Sepolia.

## 🚀 Features

- **RainbowKit Integration**: Modern wallet connection UI with support for 100+ wallets
- **Arbitrum Sepolia Support**: Configured for Arbitrum Sepolia testnet
- **Modular Architecture**: Clean separation of concerns with reusable components
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Loading States**: Smooth loading indicators for all wallet operations
- **Theme Support**: Automatic dark/light theme switching
- **TypeScript**: Full type safety throughout the integration

## 📁 File Structure

```
lib/
├── wallet-config.ts              # RainbowKit and Wagmi configuration
components/
├── providers/
│   └── wallet-provider.tsx       # Wallet provider wrapper
├── wallet/
│   ├── wallet-connect-button.tsx # Main wallet connection component
│   ├── wallet-error-boundary.tsx # Error boundary for wallet errors
│   └── wallet-loading.tsx        # Loading states component
hooks/
└── use-wallet.ts                 # Custom wallet hook with state management
```

## 🔧 Setup Instructions

### 1. Environment Variables

Copy `env.sample` to `.env.local` and fill in your credentials:

```bash
cp env.sample .env.local
```

Required environment variables:
- `NEXT_PUBLIC_ALCHEMY_API_KEY`: Your Alchemy API key for Arbitrum Sepolia
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com/)

### 2. Get Your Credentials

#### Alchemy API Key
1. Go to [Alchemy](https://www.alchemy.com/)
2. Create an account and new app
3. Select "Arbitrum Sepolia" as the chain
4. Copy your API key

#### WalletConnect Project ID
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your Project ID

### 3. Update Environment Variables

```env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

## 🎯 Usage

### Basic Wallet Connection

The wallet connection is automatically available in the app header. Users can:

1. **Connect Wallet**: Click the "Connect Wallet" button
2. **Choose Wallet**: Select from 100+ supported wallets
3. **Switch Networks**: Automatically prompts to switch to Arbitrum Sepolia
4. **View Account**: See wallet address and balance
5. **Disconnect**: Disconnect wallet when needed

### Using the Wallet Hook

```tsx
import { useWallet } from '@/hooks/use-wallet';

function MyComponent() {
  const {
    isConnected,
    address,
    chainId,
    isCorrectChain,
    error,
    connect,
    disconnect,
    switchToArbitrumSepolia,
    clearError
  } = useWallet();

  if (!isConnected) {
    return <button onClick={connect}>Connect Wallet</button>;
  }

  return (
    <div>
      <p>Address: {address}</p>
      <p>Chain: {chainId}</p>
      {!isCorrectChain && (
        <button onClick={switchToArbitrumSepolia}>
          Switch to Arbitrum Sepolia
        </button>
      )}
    </div>
  );
}
```

### Custom Wallet Button

```tsx
import { WalletConnectButton } from '@/components/wallet/wallet-connect-button';

function MyPage() {
  return (
    <div>
      <WalletConnectButton 
        className="my-custom-class"
        showChainSwitch={true}
      />
    </div>
  );
}
```

## 🛠️ Components

### WalletConnectButton

Main wallet connection component with full RainbowKit integration.

**Props:**
- `className?: string` - Custom CSS classes
- `showChainSwitch?: boolean` - Show chain switch button (default: true)

### WalletErrorBoundary

Error boundary component for handling wallet-related errors.

**Features:**
- Catches and displays wallet connection errors
- Provides retry functionality
- Customizable fallback UI

### WalletLoading

Loading state component with multiple display options.

**Types:**
- `button` - Loading button (default)
- `skeleton` - Skeleton loading
- `spinner` - Simple spinner

## 🔗 Chain Configuration

The integration is configured for **Arbitrum Sepolia**:

- **Chain ID**: 421614
- **RPC URL**: Alchemy or custom RPC
- **Block Explorer**: [Arbiscan Sepolia](https://sepolia.arbiscan.io/)
- **Native Currency**: ETH

## 🎨 Theming

The wallet components automatically adapt to your app's theme:

- **Light Theme**: Clean, modern appearance
- **Dark Theme**: Dark mode optimized
- **System Theme**: Follows user's system preference

## 🚨 Error Handling

The integration includes comprehensive error handling:

1. **Connection Errors**: User-friendly error messages
2. **Network Errors**: Automatic retry logic
3. **Chain Errors**: Clear instructions for network switching
4. **User Rejection**: Graceful handling of user cancellations

## 🔄 State Management

The `useWallet` hook provides:

- **Connection State**: `isConnected`, `isConnecting`, `isDisconnecting`
- **Account Info**: `address`, `chainId`, `isCorrectChain`
- **Actions**: `connect()`, `disconnect()`, `switchToArbitrumSepolia()`
- **Error Handling**: `error`, `clearError()`

## 🧪 Testing

To test the wallet integration:

1. **Development**: Use test wallets like MetaMask with Arbitrum Sepolia
2. **Testnet ETH**: Get testnet ETH from [Arbitrum Sepolia Faucet](https://faucet.arbitrum.io/)
3. **Network Switching**: Test automatic network switching
4. **Error Scenarios**: Test error handling and recovery

## 📱 Mobile Support

RainbowKit provides excellent mobile support:

- **Mobile Wallets**: WalletConnect integration for mobile wallets
- **QR Code**: Automatic QR code generation for mobile connections
- **Deep Links**: Automatic deep linking to mobile wallet apps

## 🔒 Security

- **No Private Keys**: Never handles private keys
- **Secure Connections**: Uses WalletConnect for secure connections
- **Error Boundaries**: Prevents wallet errors from crashing the app
- **Type Safety**: Full TypeScript support for compile-time safety

## 🚀 Production Deployment

For production deployment:

1. **Update RPC URLs**: Use production RPC endpoints
2. **Update Chain**: Switch to Arbitrum One (mainnet)
3. **Update Environment**: Use production environment variables
4. **Test Thoroughly**: Test with real wallets and transactions

## 📚 Additional Resources

- [RainbowKit Documentation](https://www.rainbowkit.com/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Arbitrum Documentation](https://docs.arbitrum.io/)
- [WalletConnect Documentation](https://docs.walletconnect.com/)

## 🤝 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure you're on the correct network
4. Check that your wallet supports Arbitrum Sepolia
