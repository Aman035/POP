import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia } from 'wagmi/chains';

// Get environment variables with fallbacks
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const customRpcUrl = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL;
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Construct RPC URL
const rpcUrl = alchemyApiKey 
  ? `https://arb-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
  : customRpcUrl || arbitrumSepolia.rpcUrls.default.http[0];

// Validate required environment variables
if (!walletConnectProjectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required');
}

export const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'POP',
  projectId: walletConnectProjectId,
  chains: [arbitrumSepolia],
  ssr: true, // Enable SSR support
});

// Export chain configuration for easy access
export const chainConfig = {
  chain: arbitrumSepolia,
  rpcUrl,
  chainId: arbitrumSepolia.id,
  name: arbitrumSepolia.name,
  nativeCurrency: arbitrumSepolia.nativeCurrency,
  blockExplorer: arbitrumSepolia.blockExplorers?.default,
};
