// Contract addresses by network
// POP - Predict on Posts
import { config } from '@/lib/config';

export const CONTRACTS = {
  BSC_TESTNET: {
    MARKET_FACTORY: config.contracts.marketFactory,
    COLLATERAL_TOKEN: config.contracts.collateralToken,
    RPC_URL: process.env.NEXT_PUBLIC_BSC_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545",
    BLOCK_EXPLORER: "https://testnet.bscscan.com",
    CHAIN_ID: 97,
  },
} as const;

// Current active network
export const CURRENT_NETWORK = "BSC_TESTNET" as const;

// Get current network contracts
export const getCurrentNetworkContracts = () => CONTRACTS[CURRENT_NETWORK];

// Network configurations for wallet connection
export const NETWORK_CONFIGS = {
  bscTestnet: {
    chainId: `0x${CONTRACTS.BSC_TESTNET.CHAIN_ID.toString(16)}`,
    chainName: "BSC Testnet",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: [CONTRACTS.BSC_TESTNET.RPC_URL],
    blockExplorerUrls: [CONTRACTS.BSC_TESTNET.BLOCK_EXPLORER],
  },
} as const;

// Type definitions
export type NetworkName = keyof typeof CONTRACTS;
export type ContractAddresses = typeof CONTRACTS[NetworkName];
