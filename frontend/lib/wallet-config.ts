import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia } from 'wagmi/chains';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Get environment variables with fallbacks
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const customRpcUrl = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL;
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Construct RPC URL
const rpcUrl = alchemyApiKey 
  ? `https://arb-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
  : customRpcUrl || arbitrumSepolia.rpcUrls.default.http[0];

// Use a fallback project ID if not provided
const finalProjectId = walletConnectProjectId && walletConnectProjectId !== 'your_walletconnect_project_id_here' 
  ? walletConnectProjectId 
  : '2f05a7f74c876b3a8b0b8b8b8b8b8b8b8';

// Only create config in browser environment
export const config = isBrowser ? getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'POP',
  projectId: finalProjectId,
  chains: [arbitrumSepolia],
  ssr: false, // Disable SSR to prevent indexedDB errors
}) : null;

// Export chain configuration for easy access
export const chainConfig = {
  chain: arbitrumSepolia,
  rpcUrl,
  chainId: arbitrumSepolia.id,
  name: arbitrumSepolia.name,
  nativeCurrency: arbitrumSepolia.nativeCurrency,
  blockExplorer: arbitrumSepolia.blockExplorers?.default,
};
