// Configuration for the POP application
// Debug: Log environment variable on module load (only in development)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  console.log('🔍 Environment variable check:');
  console.log('   NEXT_PUBLIC_MARKET_FACTORY_ADDRESS:', process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS || '(not set)');
  console.log('   Expected: 0x84bBEB5383A2da8AcA2008B3505fCb338AE850c4');
}

export const config = {
  // Network configuration
  network: {
    chainId: 97, // BSC Testnet
    name: 'BSC Testnet',
    rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
  },
  
  // Contract addresses - Single source of truth for all contract addresses
  contracts: {
    // Expected MarketFactory address on BSC Testnet: 0x84bBEB5383A2da8AcA2008B3505fCb338AE850c4
    marketFactory: process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS || '',
    collateralToken: process.env.NEXT_PUBLIC_COLLATERAL_TOKEN_ADDRESS || '',
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
