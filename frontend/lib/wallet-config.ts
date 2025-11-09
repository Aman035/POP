import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// BSC Testnet chain definition
const bscTestnet = defineChain({
  id: 97,
  name: 'BSC Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BscScan',
      url: 'https://testnet.bscscan.com',
    },
  },
  testnet: true,
});

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Get environment variables with fallbacks
const customRpcUrl = process.env.NEXT_PUBLIC_BSC_RPC_URL;
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Construct RPC URL
const rpcUrl = customRpcUrl || 'https://data-seed-prebsc-1-s1.binance.org:8545';

// Use a fallback project ID if not provided
const finalProjectId = walletConnectProjectId && walletConnectProjectId !== 'your_walletconnect_project_id_here' 
  ? walletConnectProjectId 
  : '2f05a7f74c876b3a8b0b8b8b8b8b8b8b8';

// Only create config in browser environment
export const config = isBrowser ? getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'POP',
  projectId: finalProjectId,
  chains: [bscTestnet],
  ssr: false, // Disable SSR to prevent indexedDB errors
}) : null;

// Export chain configuration for easy access
export const chainConfig = {
  chain: bscTestnet,
  rpcUrl,
  chainId: bscTestnet.id,
  name: bscTestnet.name,
  nativeCurrency: bscTestnet.nativeCurrency,
  blockExplorer: bscTestnet.blockExplorers?.default,
};
