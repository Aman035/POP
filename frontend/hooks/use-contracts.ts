import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { parseAbiItem, encodeFunctionData, decodeEventLog, formatUnits } from 'viem';
import type { Abi } from 'viem';
import { 
  MARKET_FACTORY_ADDRESS, 
  MARKET_FACTORY_ABI, 
  MARKET_ABI, 
  IERC20_ABI,
  COLLATERAL_TOKEN_ADDRESS,
  MarketCreationParams 
} from '@/lib/contracts';
import { MarketInfo, BetInfo, MarketStats } from '@/lib/types';
import { useWallet } from './use-wallet';

// Hook for MarketFactory contract
export const useMarketFactory = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return { 
    isConnected,
    address,
    loading, 
    error 
  };
};

// Hook for Market contract
export const useMarket = (marketAddress: string) => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!marketAddress) {
      setLoading(false);
      return;
    }
    setLoading(false);
  }, [marketAddress]);

  return { 
    isConnected,
    address,
    loading, 
    error 
  };
};

// Hook for Collateral Token (USDC)
export const useCollateralToken = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return { 
    isConnected,
    address,
    loading, 
    error 
  };
};

// Hook for creating a new market
export const useCreateMarket = () => {
  const { address, isConnected } = useAccount();
  const { address: walletAddress, isConnected: walletConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const createMarket = useCallback(async (params: MarketCreationParams) => {
    // Use wallet address as fallback if useAccount address is not available
    const userAddress = address || walletAddress;
    const isWalletConnected = isConnected || walletConnected;

    if (!isWalletConnected || !userAddress) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Creating market with params:', params);
      console.log('useAccount address:', address);
      console.log('useWallet address:', walletAddress);
      console.log('Final user address:', userAddress);
      console.log('Contract address:', MARKET_FACTORY_ADDRESS);

      // Validate required parameters
      if (!params.question || !params.description || !params.options || params.options.length < 2) {
        throw new Error('Missing required market parameters');
      }

      if (params.endTime <= Math.floor(Date.now() / 1000)) {
        throw new Error('End time must be in the future');
      }

      // Check if the user address is the same as contract address (this would cause the error)
      if (userAddress === MARKET_FACTORY_ADDRESS) {
        console.error('CRITICAL: Wallet is returning contract address instead of user address!');
        console.error('This indicates a serious wallet connection issue.');
        console.error('Please try: 1) Disconnect wallet 2) Refresh page 3) Reconnect wallet');
        throw new Error('Wallet address is the same as contract address. Please disconnect and reconnect your wallet.');
      }

      // Additional validation: check if address looks like a contract address (starts with 0x and is 42 chars)
      if (!userAddress || userAddress.length !== 42 || !userAddress.startsWith('0x')) {
        throw new Error('Invalid wallet address format. Please reconnect your wallet.');
      }

      // Write the contract with all required parameters
      const marketCreationParams = {
        identifier: BigInt(params.identifier),
        options: params.options,
        creator: userAddress as `0x${string}`, // Use the validated user address
        endTime: BigInt(params.endTime),
        creatorFeeBps: BigInt(params.creatorFeeBps),
        question: params.question,
        description: params.description,
        category: params.category,
        resolutionSource: params.resolutionSource,
        platform: params.platform,
        postUrl: params.postUrl,
        minBet: BigInt(params.minBet),
        maxBetPerUser: BigInt(params.maxBetPerUser),
        maxTotalStake: BigInt(params.maxTotalStake),
      };

      console.log('Creator in params:', marketCreationParams.creator);
      console.log('Market creation params:', marketCreationParams);

      writeContract({
        address: MARKET_FACTORY_ADDRESS as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'createMarket',
        args: [marketCreationParams]
      });

      return { hash, isPending, isConfirming, isConfirmed };
    } catch (err) {
      console.error('Error in createMarket:', err);
      setError(err instanceof Error ? err.message : 'Failed to create market');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, walletConnected, walletAddress, writeContract]);

  // Return transaction status for the component to handle
  const getTransactionResult = useCallback(() => {
    if (isConfirmed && hash) {
      return {
        marketAddress: hash, // This should be the actual market address from the event
        txHash: hash
      };
    }
    return null;
  }, [isConfirmed, hash]);

  return { 
    createMarket, 
    loading: loading || isPending || isConfirming, 
    error: error || (writeError ? writeError.message : null),
    hash,
    isConfirmed,
    getTransactionResult
  };
};

// Hook for getting all markets with detailed information
export const useAllMarkets = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: marketAddresses, isLoading: addressesLoading, error: addressesError } = useReadContract({
    address: MARKET_FACTORY_ADDRESS as `0x${string}`,
    abi: MARKET_FACTORY_ABI,
    functionName: 'allMarkets',
    query: {
      enabled: mounted,
    },
  });

  // Create contract calls for each market address
  const marketContracts = marketAddresses && Array.isArray(marketAddresses) 
    ? (marketAddresses as string[]).flatMap(address => [
        // Basic market info
        { address: address as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'question' as const },
        { address: address as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'description' as const },
        { address: address as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'category' as const },
        { address: address as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'resolutionSource' as const },
        { address: address as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'getOptions' as const },
        { address: address as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'endTime' as const },
        { address: address as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'creator' as const },
        { address: address as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'creatorFeeBps' as const },
        { address: address as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'identifier' as const },
        { address: address as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'state' as const },
        { address: address as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'totalStaked' as const },
        { address: address as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'finalOutcome' as const },
        { address: address as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'optionCount' as const },
      ])
    : [];

  const { data: marketData, isLoading: marketDataLoading, error: marketDataError } = useReadContracts({
    contracts: marketContracts,
    query: {
      enabled: mounted && marketContracts.length > 0,
    },
  });

  const [markets, setMarkets] = useState<MarketInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!marketAddresses || !Array.isArray(marketAddresses) || marketAddresses.length === 0) {
      setMarkets([]);
      return;
    }

    if (!marketData || marketData.length === 0) {
      return;
    }

    const processMarketData = () => {
      setLoading(true);
      setError(null);

      try {
        const marketDetails: MarketInfo[] = [];
        const marketsPerContract = 13; // Number of contract calls per market

        (marketAddresses as string[]).forEach((address, marketIndex) => {
          const startIndex = marketIndex * marketsPerContract;
          const marketDataSlice = marketData.slice(startIndex, startIndex + marketsPerContract);

          if (marketDataSlice.length === marketsPerContract) {
            const [
              question,
              description,
              category,
              resolutionSource,
              options,
              endTime,
              creator,
              creatorFeeBps,
              identifier,
              state,
              totalStaked,
              finalOutcome,
              optionCount
            ] = marketDataSlice;

            // Check if any data is null/undefined
            if (question?.result && description?.result && category?.result && 
                resolutionSource?.result && options?.result && endTime?.result &&
                creator?.result && creatorFeeBps?.result && identifier?.result &&
                state?.result && totalStaked?.result && finalOutcome?.result && optionCount?.result) {
              
              const marketInfo: MarketInfo = {
                address,
                identifier: Number(identifier.result),
                creator: creator.result as string,
                options: options.result as string[],
                endTime: Number(endTime.result),
                creatorFeeBps: Number(creatorFeeBps.result),
                totalLiquidity: formatUnits(totalStaked.result as bigint, 6),
                isResolved: Number(state.result) === 2,
                winningOption: Number(state.result) === 2 ? Number(finalOutcome.result) : undefined,
                question: question.result as string,
                description: description.result as string,
                category: category.result as string,
                resolutionSource: resolutionSource.result as string,
                platform: 0, // Default platform
                postUrl: "", // Will be populated from contract
                createdAt: Math.floor(Date.now() / 1000), // Will be populated from contract
                minBet: 0, // Will be populated from contract
                maxBetPerUser: 0, // Will be populated from contract
                maxTotalStake: 0, // Will be populated from contract
                optionLiquidity: [], // Will be populated separately
                state: Number(state.result) as any,
                status: Number(state.result) === 2 ? 1 : Number(state.result) === 3 ? 2 : 0,
                activeParticipantsCount: 0, // Will be populated from contract
              };

              marketDetails.push(marketInfo);
            }
          }
        });

        setMarkets(marketDetails);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process market details');
      } finally {
        setLoading(false);
      }
    };

    processMarketData();
  }, [marketAddresses, marketData]);

  return { 
    markets, 
    loading: loading || addressesLoading || marketDataLoading, 
    error: error || addressesError?.message || marketDataError?.message || null 
  };
};

// Helper function to fetch contract data using wagmi
const fetchContractData = async (contract: any, functionName: string, args: any[] = []) => {
  // This function is now deprecated - we should use wagmi hooks directly
  // Keeping for backward compatibility but should be replaced with direct wagmi calls
  throw new Error('fetchContractData is deprecated. Use wagmi hooks directly.');
};

// Hook for getting market by identifier
export const useMarketByIdentifier = (identifier: number) => {
  const { data: marketAddress, isLoading, error } = useReadContract({
    address: MARKET_FACTORY_ADDRESS as `0x${string}`,
    abi: MARKET_FACTORY_ABI,
    functionName: 'marketForIdentifier',
    args: [BigInt(identifier)],
  });

  return { 
    marketAddress: marketAddress && marketAddress !== '0x0000000000000000000000000000000000000000' ? marketAddress : null, 
    loading: isLoading, 
    error: error?.message || null 
  };
};

// Hook for individual market details
export const useMarketDetails = (marketAddress: string) => {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Create contract calls for market data
  const marketContracts = marketAddress ? [
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'question' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'description' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'category' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'resolutionSource' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'getOptions' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'endTime' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'creator' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'creatorFeeBps' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'identifier' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'state' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'totalStaked' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'finalOutcome' as const },
    { address: marketAddress as `0x${string}`, abi: MARKET_ABI as Abi, functionName: 'optionCount' as const },
  ] : [];

  const { data: marketData, isLoading: marketDataLoading, error: marketDataError } = useReadContracts({
    contracts: marketContracts,
    query: {
      enabled: mounted && marketContracts.length > 0,
    },
  });

  const [marketInfo, setMarketInfo] = useState<MarketInfo | null>(null);
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [userPositions, setUserPositions] = useState<{ [option: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!marketAddress || !marketData || marketData.length === 0) {
      setMarketInfo(null);
      setMarketStats(null);
      setUserPositions({});
      return;
    }

    const processMarketData = () => {
      setLoading(true);
      setError(null);

      try {
        const [
          question,
          description,
          category,
          resolutionSource,
          options,
          endTime,
          creator,
          creatorFeeBps,
          identifier,
          state,
          totalStaked,
          finalOutcome,
          optionCount
        ] = marketData;

        // Check if all data is available
        if (question?.result && description?.result && category?.result && 
            resolutionSource?.result && options?.result && endTime?.result &&
            creator?.result && creatorFeeBps?.result && identifier?.result &&
            state?.result && totalStaked?.result && finalOutcome?.result && optionCount?.result) {
          
          const marketInfoData: MarketInfo = {
            address: marketAddress,
            identifier: Number(identifier.result),
            creator: creator.result as string,
            options: options.result as string[],
            endTime: Number(endTime.result),
            creatorFeeBps: Number(creatorFeeBps.result),
            totalLiquidity: formatUnits(totalStaked.result as bigint, 6),
            isResolved: Number(state.result) === 2,
            winningOption: Number(state.result) === 2 ? Number(finalOutcome.result) : undefined,
            question: question.result as string,
            description: description.result as string,
            category: category.result as string,
            resolutionSource: resolutionSource.result as string,
            platform: 0, // Default platform
            postUrl: "", // Will be populated from contract
            createdAt: Math.floor(Date.now() / 1000), // Will be populated from contract
            minBet: 0, // Will be populated from contract
            maxBetPerUser: 0, // Will be populated from contract
            maxTotalStake: 0, // Will be populated from contract
            optionLiquidity: [], // Will be populated separately
            state: Number(state.result) as any,
            status: Number(state.result) === 2 ? 1 : Number(state.result) === 3 ? 2 : 0,
            activeParticipantsCount: 0, // Will be populated from contract
          };

          const marketStatsData: MarketStats = {
            totalLiquidity: formatUnits(totalStaked.result as bigint, 6),
            totalBets: 0, // Would need to count events
            optionLiquidity: [], // Will be populated separately
            isActive: Number(state.result) === 0 && Number(endTime.result) > Math.floor(Date.now() / 1000),
            isResolved: Number(state.result) === 2,
            winningOption: Number(state.result) === 2 ? Number(finalOutcome.result) : undefined,
            activeParticipantsCount: 0, // Will be populated from contract
            state: Number(state.result) as any,
            status: Number(state.result) === 2 ? 1 : Number(state.result) === 3 ? 2 : 0,
          };

          setMarketInfo(marketInfoData);
          setMarketStats(marketStatsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process market details');
      } finally {
        setLoading(false);
      }
    };

    processMarketData();
  }, [marketAddress, marketData]);

  return {
    marketInfo,
    marketStats,
    userPositions,
    loading: loading || marketDataLoading,
    error: error || marketDataError?.message || null,
  };
};

// Hook for placing bets
export const usePlaceBet = (marketAddress: string) => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const placeBet = useCallback(async (option: number, amount: string) => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }

    if (!marketAddress) {
      setError('Invalid market address');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert amount to wei (USDC has 6 decimals)
      const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e6));

      // First approve the market contract to spend USDC
      const approveData = encodeFunctionData({
        abi: IERC20_ABI,
        functionName: 'approve',
        args: [marketAddress as `0x${string}`, amountWei],
      });

      // Then place the bet
      const placeBetData = encodeFunctionData({
        abi: MARKET_ABI,
        functionName: 'placeBet',
        args: [option, amountWei],
      });

      // Execute the transaction
      writeContract({
        address: marketAddress as `0x${string}`,
        abi: MARKET_ABI,
        functionName: 'placeBet',
        args: [option, amountWei],
      });

      return { hash, isPending, isConfirming, isConfirmed };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bet');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, marketAddress, writeContract]);

  return {
    placeBet,
    loading: loading || isPending || isConfirming,
    error: error || (writeError ? writeError.message : null),
    hash,
    isConfirmed,
  };
};

// Hook for exiting bets
export const useExitBet = (marketAddress: string) => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const exitBet = useCallback(async (option: number, amount: string) => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }

    if (!marketAddress) {
      setError('Invalid market address');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert amount to wei (USDC has 6 decimals)
      const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e6));

      // Execute the exit transaction
      writeContract({
        address: marketAddress as `0x${string}`,
        abi: MARKET_ABI,
        functionName: 'exit',
        args: [option, amountWei],
      });

      return { hash, isPending, isConfirming, isConfirmed };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to exit bet');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, marketAddress, writeContract]);

  return {
    exitBet,
    loading: loading || isPending || isConfirming,
    error: error || (writeError ? writeError.message : null),
    hash,
    isConfirmed,
  };
};

// Hook for claiming payouts
export const useClaimPayout = (marketAddress: string) => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const claimPayout = useCallback(async () => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }

    if (!marketAddress) {
      setError('Invalid market address');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Execute the claim payout transaction
      writeContract({
        address: marketAddress as `0x${string}`,
        abi: MARKET_ABI,
        functionName: 'claimPayout',
        args: [],
      });

      return { hash, isPending, isConfirming, isConfirmed };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim payout');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, marketAddress, writeContract]);

  return {
    claimPayout,
    loading: loading || isPending || isConfirming,
    error: error || (writeError ? writeError.message : null),
    hash,
    isConfirmed,
  };
};