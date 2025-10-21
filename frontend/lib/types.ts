// TypeScript interfaces for POP - Predict on Posts contracts

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

export interface MarketInfo {
  address: string;
  identifier: number;
  creator: string;
  options: string[];
  endTime: number;
  creatorFeeBps: number;
  totalLiquidity: string;
  isResolved: boolean;
  winningOption?: number;
  question: string;
  description: string;
  category: string;
  resolutionSource: string;
}

export interface BetInfo {
  option: number;
  amount: string;
  timestamp: number;
  user: string;
}

export interface MarketStats {
  totalLiquidity: string;
  totalBets: number;
  optionLiquidity: string[];
  isActive: boolean;
  isResolved: boolean;
  winningOption?: number;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface ContractAddresses {
  MARKET_FACTORY: string;
  COLLATERAL_TOKEN: string;
  RPC_URL: string;
  BLOCK_EXPLORER: string;
  CHAIN_ID: number;
}

// Event types
export interface MarketCreatedEvent {
  identifier: number;
  creator: string;
  market: string;
  options: string[];
  endTime: number;
  creatorFeeBps: number;
  question: string;
  description: string;
  category: string;
  resolutionSource: string;
}

export interface BetPlacedEvent {
  user: string;
  option: number;
  amount: string;
  timestamp: number;
}

export interface MarketResolvedEvent {
  winningOption: number;
  timestamp: number;
}

export interface MarketMetadataSetEvent {
  identifier: number;
  question: string;
  description: string;
  category: string;
  resolutionSource: string;
  options: string[];
  endTime: number;
  creatorFeeBps: number;
  creator: string;
}

// Contract method return types
export type ContractMethodResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  transactionHash?: string;
};

// Hook return types
export interface UseContractReturn<T> {
  contract: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseContractMethodsReturn {
  createMarket: (params: MarketCreationParams) => Promise<string | null>;
  getAllMarkets: () => Promise<string[]>;
  getMarketByIdentifier: (identifier: string) => Promise<string | null>;
  getContractInfo: () => {
    marketFactoryAddress: string;
    collateralTokenAddress: string;
    network: string;
  };
}
