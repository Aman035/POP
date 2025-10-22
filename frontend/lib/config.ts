// Configuration for the POP application
export const config = {
  // Network configuration
  network: {
    chainId: 421614, // Arbitrum Sepolia
    name: 'Arbitrum Sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
  },
  
  // Contract addresses
  contracts: {
    marketFactory: process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS || '0x84bBEB5383A2da8AcA2008B3505fCb338AE850c4',
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
