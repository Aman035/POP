// Contract addresses and ABIs for POP - Predict on Posts
// Deployed on Arbitrum Sepolia
import { config } from './config';

// Contract addresses - Imported from config.ts (single source of truth)
export const MARKET_FACTORY_ADDRESS = config.contracts.marketFactory;
export const COLLATERAL_TOKEN_ADDRESS = config.contracts.collateralToken;

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

// Export ABIs with proper typing
export const MARKET_FACTORY_ABI = MarketFactoryABI.abi as any;
export const MARKET_ABI = MarketABI.abi as any;
export const IERC20_ABI = IERC20ABI as any;

// Contract configuration
export const CONTRACT_CONFIG = {
  creatorOverrideWindow: 21600, // 6 hours in seconds
  bps: 10000, // Basis points (100%)
} as const;

// TypeScript interfaces for contract interactions
export interface MarketCreationParams {
  identifier: string;
  options: string[];
  endTime: number;
  creatorFeeBps: number;
  question: string;
  description: string;
  category: string;
  resolutionSource: string;
  platform: number;
  // Removed creator, postUrl, minBet, maxBetPerUser, maxTotalStake as they're not in new contract
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
