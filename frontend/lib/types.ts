// TypeScript interfaces for POP - Predict on Posts contracts

// Platform enum matching the contract
export enum Platform {
  Twitter = 0,
  Farcaster = 1,
  Lens = 2,
  Other = 3
}

// Market state enum matching the contract
export enum MarketState {
  Trading = 0,
  Proposed = 1,
  Resolved = 2
}

// Market status enum for UI convenience
export enum MarketStatus {
  Active = 0,    // Trading/Proposed
  Resolved = 1,  // Resolved
  Cancelled = 2  // Cancelled
}

export interface MarketCreationParams {
  identifier: string;
  options: string[];
  endTime: number;
  creatorFeeBps: number;
  question: string;
  description: string;
  category: string;
  resolutionSource: string;
  platform: Platform;
  // Removed creator, postUrl, minBet, maxBetPerUser, maxTotalStake as they're not in new contract
}

export interface MarketFactoryConfig {
  collateral: string;
  creatorOverrideWindow: number;
}

export interface MarketInfo {
  address: string;
  identifier: string;
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
  platform: Platform;
  createdAt: number;
  optionLiquidity: string[];
  state: MarketState;
  status: MarketStatus;
  activeParticipantsCount: number;
  // Removed postUrl, minBet, maxBetPerUser, maxTotalStake as they're not in new contract
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
  activeParticipantsCount: number;
  state: MarketState;
  status: MarketStatus;
}

// New interfaces for enhanced contract functionality
export interface MarketResolution {
  proposedOutcome: number;
  finalOutcome: number;
  proposer: string;
  resolver: string;
  proposalTimestamp: number;
  resolutionEvidence: string;
  creatorFeePaid: string;
  resolvedPayoutPool: string;
  finalWinningPool: string;
}

// Removed MarketLimits interface as these fields are no longer in the contract

export interface MarketMetadata {
  question: string;
  description: string;
  category: string;
  resolutionSource: string;
  platform: Platform;
  createdAt: number;
}

export interface UserPosition {
  option: number;
  amount: string;
  hasClaimed: boolean;
  totalPosition: string;
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

// Event types matching contract events
export interface MarketCreatedEvent {
  identifier: string;
  creator: string;
  market: string;
  options: string[];
  endTime: number;
  creatorFeeBps: number;
  question: string;
  description: string;
  category: string;
  resolutionSource: string;
  platform: Platform;
  createdAt: number;
  // Removed postUrl, minBet, maxBetPerUser, maxTotalStake as they're not in new contract
}

export interface BetPlacedEvent {
  user: string;
  option: number;
  amount: string;
  newPool: string;
  timestamp: number;
}

export interface BetExitedEvent {
  user: string;
  option: number;
  amount: string;
  newPool: string;
  timestamp: number;
}

export interface ProposedResolutionEvent {
  option: number;
  proposer: string;
  evidenceURI: string;
  timestamp: number;
}

export interface MarketResolvedEvent {
  option: number;
  resolver: string;
  creatorFee: string;
  timestamp: number;
}

export interface PayoutClaimedEvent {
  user: string;
  amount: string;
  timestamp: number;
}

export interface MarketMetadataSetEvent {
  identifier: string;
  question: string;
  description: string;
  category: string;
  resolutionSource: string;
  options: string[];
  endTime: number;
  creatorFeeBps: number;
  creator: string;
  platform: Platform;
  createdAt: number;
  // Removed postUrl, minBet, maxBetPerUser, maxTotalStake as they're not in new contract
}

export interface MarketStatusChangedEvent {
  newStatus: MarketStatus;
  timestamp: number;
}

export interface ParticipantCountUpdatedEvent {
  newCount: number;
  timestamp: number;
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
  // MarketFactory methods
  createMarket: (params: MarketCreationParams) => Promise<string | null>;
  getAllMarkets: () => Promise<string[]>;
  getMarketByIdentifier: (identifier: string) => Promise<string | null>;
  getTotalMarkets: () => Promise<number>;
  getMarketAt: (index: number) => Promise<string | null>;
  getCollateralToken: () => Promise<string>;
  getCreatorOverrideWindow: () => Promise<number>;
  
  // Market methods
  placeBet: (marketAddress: string, option: number, amount: string) => Promise<boolean>;
  exit: (marketAddress: string, option: number, amount: string) => Promise<boolean>;
  proposeResolution: (marketAddress: string, option: number, evidenceURI: string) => Promise<boolean>;
  overrideResolution: (marketAddress: string, option: number) => Promise<boolean>;
  finalizeResolution: (marketAddress: string) => Promise<boolean>;
  claimPayout: (marketAddress: string) => Promise<boolean>;
  cancelMarket: (marketAddress: string) => Promise<boolean>;
  
  // Market info methods
  getMarketInfo: (marketAddress: string) => Promise<MarketInfo | null>;
  getMarketStats: (marketAddress: string) => Promise<MarketStats | null>;
  getMarketResolution: (marketAddress: string) => Promise<MarketResolution | null>;
  getUserPosition: (marketAddress: string, user: string, option: number) => Promise<string>;
  getUserTotalPosition: (marketAddress: string, user: string) => Promise<string>;
  getOptionLiquidity: (marketAddress: string, option: number) => Promise<string>;
  getMarketState: (marketAddress: string) => Promise<MarketState>;
  getMarketStatus: (marketAddress: string) => Promise<MarketStatus>;
  
  // Contract info
  getContractInfo: () => {
    marketFactoryAddress: string;
    collateralTokenAddress: string;
    network: string;
  };
}

// Utility types and helper functions
export type PlatformString = 'Twitter' | 'Farcaster' | 'Lens' | 'Other';

export type MarketStateString = 'Trading' | 'Proposed' | 'Resolved';

export type MarketStatusString = 'Active' | 'Resolved' | 'Cancelled';

// Helper functions for enum conversions
export const getPlatformString = (platform: Platform): PlatformString => {
  const platforms: PlatformString[] = ['Twitter', 'Farcaster', 'Lens', 'Other'];
  return platforms[platform] || 'Other';
};

export const getMarketStateString = (state: MarketState): MarketStateString => {
  const states: MarketStateString[] = ['Trading', 'Proposed', 'Resolved'];
  return states[state] || 'Trading';
};

export const getMarketStatusString = (status: MarketStatus): MarketStatusString => {
  const statuses: MarketStatusString[] = ['Active', 'Resolved', 'Cancelled'];
  return statuses[status] || 'Active';
};

// Type guards
export const isActiveMarket = (state: MarketState): boolean => {
  return state === MarketState.Trading || state === MarketState.Proposed;
};

export const isResolvedMarket = (state: MarketState): boolean => {
  return state === MarketState.Resolved;
};

export const isCancelledMarket = (state: MarketState): boolean => {
  return false; // Cancelled state doesn't exist in new contract
};

// Constants
export const BPS = 10000; // Basis points (100%)
export const DEFAULT_CREATOR_OVERRIDE_WINDOW = 21600; // 6 hours in seconds
