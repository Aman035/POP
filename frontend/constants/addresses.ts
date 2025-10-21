// Contract addresses by network
// POP - Predict on Posts

export const CONTRACTS = {
  ARBITRUM_SEPOLIA: {
    MARKET_FACTORY: "0xbF5520A88eAec703042Dd53693DA943FE6EC3Faa",
    COLLATERAL_TOKEN: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC
    RPC_URL: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
    BLOCK_EXPLORER: "https://sepolia.arbiscan.io",
    CHAIN_ID: 421614,
  },
  ARBITRUM_MAINNET: {
    MARKET_FACTORY: "TBD", // Not deployed yet
    COLLATERAL_TOKEN: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC
    RPC_URL: process.env.NEXT_PUBLIC_ARBITRUM_MAINNET_RPC_URL || "https://arb1.arbitrum.io/rpc",
    BLOCK_EXPLORER: "https://arbiscan.io",
    CHAIN_ID: 42161,
  },
  ETHEREUM_MAINNET: {
    MARKET_FACTORY: "TBD", // Not deployed yet
    COLLATERAL_TOKEN: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
    RPC_URL: process.env.NEXT_PUBLIC_ETHEREUM_MAINNET_RPC_URL || "https://eth.llamarpc.com",
    BLOCK_EXPLORER: "https://etherscan.io",
    CHAIN_ID: 1,
  },
} as const;

// Current active network
export const CURRENT_NETWORK = "ARBITRUM_SEPOLIA" as const;

// Get current network contracts
export const getCurrentNetworkContracts = () => CONTRACTS[CURRENT_NETWORK];

// Network configurations for wallet connection
export const NETWORK_CONFIGS = {
  arbitrumSepolia: {
    chainId: `0x${CONTRACTS.ARBITRUM_SEPOLIA.CHAIN_ID.toString(16)}`,
    chainName: "Arbitrum Sepolia",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [CONTRACTS.ARBITRUM_SEPOLIA.RPC_URL],
    blockExplorerUrls: [CONTRACTS.ARBITRUM_SEPOLIA.BLOCK_EXPLORER],
  },
  arbitrumMainnet: {
    chainId: `0x${CONTRACTS.ARBITRUM_MAINNET.CHAIN_ID.toString(16)}`,
    chainName: "Arbitrum One",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [CONTRACTS.ARBITRUM_MAINNET.RPC_URL],
    blockExplorerUrls: [CONTRACTS.ARBITRUM_MAINNET.BLOCK_EXPLORER],
  },
} as const;

// Type definitions
export type NetworkName = keyof typeof CONTRACTS;
export type ContractAddresses = typeof CONTRACTS[NetworkName];
