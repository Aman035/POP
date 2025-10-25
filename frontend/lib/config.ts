// Configuration for the POP application
export const config = {
  // Network configuration
  network: {
    chainId: 421614, // Arbitrum Sepolia
    name: 'Arbitrum Sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
  },
  
  // Contract addresses - Single source of truth for all contract addresses
  contracts: {
    marketFactory: process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS || '0x6b70e7fC5E40AcFC76EbC3Fa148159E5EF6F7643',
    collateralToken: process.env.NEXT_PUBLIC_COLLATERAL_TOKEN_ADDRESS || '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
  },
  
  // API configuration
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },
  
  // Application settings
  app: {
    name: 'POP - Predict on Posts',
    description: 'Micro-markets embedded in social media. Turn any social media poll into a prediction market in seconds.',
  }
} as const;

export type Config = typeof config;
