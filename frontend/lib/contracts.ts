// Contract addresses and ABIs for POP - Predict on Posts
// Deployed on Arbitrum Sepolia

// Contract addresses
export const MARKET_FACTORY_ADDRESS = "0x0F4f4c1BdDAf3e93fC55b2ecc600265B4C838263"; // Will be updated after redeployment
export const COLLATERAL_TOKEN_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"; // Testnet USDC

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 421614, // Arbitrum Sepolia
  name: "Arbitrum Sepolia",
  rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
  blockExplorer: "https://sepolia.arbiscan.io",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
} as const;

// Import ABIs
import MarketFactoryABI from '../abis/MarketFactory.json';
import MarketABI from '../abis/Market.json';
import IERC20ABI from '../abis/IERC20.json';

// Export ABIs
export const MARKET_FACTORY_ABI = MarketFactoryABI;
export const MARKET_ABI = MarketABI;
export const IERC20_ABI = IERC20ABI;

// Contract configuration
export const CONTRACT_CONFIG = {
  creatorOverrideWindow: 21600, // 6 hours in seconds
  bps: 10000, // Basis points (100%)
} as const;

// TypeScript interfaces for contract interactions
export interface MarketCreationParams {
  identifier: number;
  options: string[];
  creator: string;
  endTime: number;
  creatorFeeBps: number;
  question: string;
  description: string;
  category: string;
  resolutionSource: string;
}

export interface MarketFactoryConfig {
  collateral: string;
  creatorOverrideWindow: number;
}

// Contract interaction helpers
export const getContractAddresses = () => ({
  marketFactory: MARKET_FACTORY_ADDRESS,
  collateralToken: COLLATERAL_TOKEN_ADDRESS,
});

export const getNetworkConfig = () => NETWORK_CONFIG;

export const getContractConfig = () => CONTRACT_CONFIG;
