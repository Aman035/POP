"use client"

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, useReadContracts, usePublicClient } from 'wagmi';
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
import { MarketReadAbi } from '@/lib/abi/Market.read';
import { MarketFactoryReadAbi } from '@/lib/abi/MarketFactory.read';
import { MarketInfo, BetInfo, MarketStats } from '@/lib/types';
import { useWallet } from '../wallet/use-wallet';

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

  // Debug wagmi hooks
  console.log('🔍 Wagmi hooks debug:');
  console.log('  - writeContract:', writeContract);
  console.log('  - hash:', hash);
  console.log('  - isPending:', isPending);
  console.log('  - writeError:', writeError);
  console.log('  - isConfirming:', isConfirming);
  console.log('  - isConfirmed:', isConfirmed);

  const createMarket = useCallback(async (params: MarketCreationParams) => {
    console.log('🚀 createMarket function called with params:', params);
    
    // Use wallet address as fallback if useAccount address is not available
    const userAddress = address || walletAddress;
    const isWalletConnected = isConnected || walletConnected;

    console.log('🔍 Wallet connection check:');
    console.log('  - isConnected (useAccount):', isConnected);
    console.log('  - walletConnected (useWallet):', walletConnected);
    console.log('  - address (useAccount):', address);
    console.log('  - walletAddress (useWallet):', walletAddress);
    console.log('  - Final userAddress:', userAddress);
    console.log('  - Final isWalletConnected:', isWalletConnected);

    if (!isWalletConnected || !userAddress) {
      console.error('❌ Wallet not connected or no address found');
      setError('Wallet not connected');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('✅ Wallet connection verified, proceeding with market creation');
      console.log('Creating market with params:', params);
      console.log('useAccount address:', address);
      console.log('useWallet address:', walletAddress);
      console.log('Final user address:', userAddress);
      console.log('Contract address:', MARKET_FACTORY_ADDRESS);
      console.log('Contract ABI length:', MARKET_FACTORY_ABI?.length);
      console.log('writeContract function:', writeContract);
      console.log('writeContract type:', typeof writeContract);

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
        identifier: params.identifier,
        endTime: params.endTime,
        creatorFeeBps: params.creatorFeeBps,
        question: params.question,
        description: params.description,
        category: params.category,
        platform: params.platform,
        resolutionSource: params.resolutionSource,
        options: params.options,
        // Removed postUrl, minBet, maxBetPerUser, maxTotalStake as they're not in the new contract
      };

      console.log('Market creation params:', marketCreationParams);

      console.log('🔄 About to call writeContract with:');
      console.log('  - address:', MARKET_FACTORY_ADDRESS);
      console.log('  - functionName: createMarket');
      console.log('  - args:', [
        params.identifier,
        params.endTime,
        params.creatorFeeBps,
        params.question,
        params.description,
        params.category,
        params.platform,
        params.resolutionSource,
        params.options
      ]);

      try {
        console.log('🔄 Attempting writeContract call...');
        const writeContractResult = await writeContract({
          address: MARKET_FACTORY_ADDRESS as `0x${string}`,
          abi: MARKET_FACTORY_ABI,
          functionName: 'createMarket',
          args: [
            params.identifier, // string
            params.endTime, // uint64 (number)
            params.creatorFeeBps, // uint96 (number)
            params.question, // string
            params.description, // string
            params.category, // string
            params.platform, // uint8 (number)
            params.resolutionSource, // string
            params.options // string[]
          ]
        });

        console.log('✅ writeContract call completed:', writeContractResult);
      } catch (writeError: any) {
        console.error('❌ writeContract call failed:', writeError);
        console.error('❌ Error details:', {
          name: writeError?.name,
          message: writeError?.message,
          stack: writeError?.stack,
          cause: writeError?.cause
        });
        throw writeError;
      }

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

// Hook for getting all markets using the exact MarketFactory functions
export const useAllMarkets = () => {
  const [mounted, setMounted] = useState(false);
  const client = usePublicClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use MarketFactory.allMarkets() to get all market addresses
  const { data: marketAddresses, isLoading: addressesLoading, error: addressesError } = useReadContract({
    address: MARKET_FACTORY_ADDRESS as `0x${string}`,
    abi: MARKET_FACTORY_ABI as Abi,
    functionName: 'allMarkets',
    query: {
      enabled: mounted,
      retry: 1,
      retryDelay: 2000,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Try to get total markets count as a fallback
  const { data: totalMarkets, isLoading: totalLoading, error: totalError } = useReadContract({
    address: MARKET_FACTORY_ADDRESS as `0x${string}`,
    abi: MARKET_FACTORY_ABI as Abi,
    functionName: 'totalMarkets',
    query: {
      enabled: mounted,
      retry: 1,
      retryDelay: 2000,
    },
  });

  // Try to get collateral token address to test basic contract connectivity
  const { data: collateral, isLoading: collateralLoading, error: collateralError } = useReadContract({
    address: MARKET_FACTORY_ADDRESS as `0x${string}`,
    abi: MARKET_FACTORY_ABI as Abi,
    functionName: 'collateral',
    query: {
      enabled: mounted,
      retry: 1,
      retryDelay: 2000,
    },
  });

  // Debug logging (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 useAllMarkets Debug:');
    console.log('  marketAddresses:', marketAddresses);
    console.log('  addressesLoading:', addressesLoading);
    console.log('  addressesError:', addressesError);
    console.log('  totalMarkets:', totalMarkets);
    console.log('  totalLoading:', totalLoading);
    console.log('  totalError:', totalError);
    console.log('  collateral:', collateral);
    console.log('  collateralLoading:', collateralLoading);
    console.log('  collateralError:', collateralError);
  }

  // Use individual contract calls instead of multicall (like our test script)
  const marketContracts = marketAddresses && Array.isArray(marketAddresses) 
    ? (marketAddresses as string[]).flatMap(address => [
        // Core metadata for cards & filters
        { address: address as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'question' as const },
        { address: address as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'description' as const },
        { address: address as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'category' as const },
        { address: address as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'platform' as const },
        { address: address as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'identifier' as const },
        { address: address as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'createdAt' as const },
        { address: address as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'endTime' as const },
        { address: address as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'creator' as const },
        { address: address as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'creatorFeeBps' as const },
        { address: address as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'state' as const },
        { address: address as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'getOptionCount' as const },
        
        // Liquidity, participants, and per-option info
        { address: address as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'totalStaked' as const },
        { address: address as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'activeParticipantsCount' as const },
      ])
    : [];

  const { data: marketData, isLoading: marketDataLoading, error: marketDataError } = useReadContracts({
    contracts: marketContracts,
    query: {
      enabled: mounted && marketContracts.length > 0,
    },
    allowFailure: true, // Allow individual calls to fail without breaking the whole multicall
  });

  // Debug logging for multicall (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Multicall Debug:');
    console.log('  marketContracts.length:', marketContracts.length);
    console.log('  marketData:', marketData);
    console.log('  marketDataLoading:', marketDataLoading);
    console.log('  marketDataError:', marketDataError);
  }

  const [markets, setMarkets] = useState<MarketInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle case when no markets exist (empty array is valid)
    if (marketAddresses && Array.isArray(marketAddresses) && marketAddresses.length === 0) {
      console.log('No markets found - empty array from allMarkets()');
      setMarkets([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Handle case when marketAddresses is null/undefined (contract call failed)
    if (!marketAddresses && !addressesLoading) {
      if (addressesError) {
        console.log('allMarkets() failed with error:', addressesError.message);
        setError(`Failed to fetch markets: ${addressesError.message}`);
      } else {
        console.log('allMarkets() returned null/undefined');
        setError('No markets found or contract call failed');
      }
      setLoading(false);
      return;
    }

    // If we have totalMarkets but no marketAddresses, try to get markets individually
    if (totalMarkets && Number(totalMarkets) > 0 && (!marketAddresses || !Array.isArray(marketAddresses))) {
      console.log(`Found ${totalMarkets} markets, but allMarkets() didn't work. This might be a contract issue.`);
      setError(`Found ${totalMarkets} markets but couldn't fetch addresses. Contract may not have allMarkets() function.`);
      setLoading(false);
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
        const marketsPerContract = 14; // Number of contract calls per market

        if (process.env.NODE_ENV === 'development') {
          console.log('Processing market data:', marketData);
          console.log('Market addresses:', marketAddresses);
          console.log('Markets per contract:', marketsPerContract);
        }

        (marketAddresses as string[]).forEach((address, marketIndex) => {
          const startIndex = marketIndex * marketsPerContract;
          const marketDataSlice = marketData.slice(startIndex, startIndex + marketsPerContract);

          if (process.env.NODE_ENV === 'development') {
            console.log(`Market ${marketIndex} (${address}):`, marketDataSlice);
          }

          if (marketDataSlice.length === marketsPerContract) {
            const [
              question,
              description,
              category,
              platform,
              identifier,
              createdAt,
              endTime,
              creator,
              creatorFeeBps,
              state,
              optionCount,
              totalStaked,
              activeParticipantsCount,
              optionCount2
            ] = marketDataSlice;

            if (process.env.NODE_ENV === 'development') {
              console.log('Raw data for market:', {
                question: question?.result,
                description: description?.result,
                category: category?.result,
                platform: platform?.result,
                identifier: identifier?.result,
                createdAt: createdAt?.result,
                endTime: endTime?.result,
                creator: creator?.result,
                creatorFeeBps: creatorFeeBps?.result,
                state: state?.result,
                optionCount: optionCount?.result,
                totalStaked: totalStaked?.result,
                activeParticipantsCount: activeParticipantsCount?.result,
              });
            }

            // Check if essential data is available (with proper null checks)
            if (question?.result && endTime?.result && creator?.result && state?.result) {
              
              const marketInfo: MarketInfo = {
                address,
                identifier: identifier?.result as string || "",
                creator: creator.result as string,
                options: [], // Will be populated separately by fetching individual options
                endTime: Number(endTime.result),
                creatorFeeBps: Number(creatorFeeBps?.result || 0),
                totalLiquidity: totalStaked?.result ? formatUnits(totalStaked.result as bigint, 6) : "0",
                isResolved: Number(state.result) === 2, // 2 = resolved
                winningOption: undefined, // Not available in read ABI
                question: question.result as string,
                description: description?.result as string || "",
                category: category?.result as string || "General",
                resolutionSource: "", // Not available in read ABI
                platform: Number(platform?.result || 0),
                createdAt: Number(createdAt?.result || Math.floor(Date.now() / 1000)),
                optionLiquidity: [], // Will be populated separately
                state: Number(state.result) as any,
                status: Number(state.result) === 2 ? 1 : 0, // Convert state to status: 2=resolved -> 1, others -> 0 (active)
                activeParticipantsCount: Number(activeParticipantsCount?.result || 0),
              };

                if (process.env.NODE_ENV === 'development') {
                  console.log(`✅ Processed market ${address}:`, marketInfo);
                }
                marketDetails.push(marketInfo);
              } else {
                if (process.env.NODE_ENV === 'development') {
                  console.log(`❌ Skipping market ${address} - missing essential data:`, {
                    question: !!question?.result,
                    endTime: !!endTime?.result,
                    creator: !!creator?.result,
                    state: !!state?.result
                  });
                }
              }
          }
        });

        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Processed ${marketDetails.length} markets:`, marketDetails);
        }
        setMarkets(marketDetails);
      } catch (err) {
        console.error('❌ Error processing market data:', err);
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

// Hook for getting total markets count
export const useTotalMarkets = () => {
  const { data: totalMarkets, isLoading, error } = useReadContract({
    address: MARKET_FACTORY_ADDRESS as `0x${string}`,
    abi: MarketFactoryReadAbi as Abi,
    functionName: 'totalMarkets',
  });

  return { 
    totalMarkets: totalMarkets ? Number(totalMarkets) : 0, 
    loading: isLoading, 
    error: error?.message || null 
  };
};

// Hook for getting market at specific index
export const useMarketAt = (index: number) => {
  const { data: marketAddress, isLoading, error } = useReadContract({
    address: MARKET_FACTORY_ADDRESS as `0x${string}`,
    abi: MarketFactoryReadAbi as Abi,
    functionName: 'marketAt',
    args: [BigInt(index)],
  });

  return { 
    marketAddress: marketAddress && marketAddress !== '0x0000000000000000000000000000000000000000' ? marketAddress : null, 
    loading: isLoading, 
    error: error?.message || null 
  };
};

// Hook for getting market by identifier
export const useMarketByIdentifier = (identifier: number) => {
  const { data: marketAddress, isLoading, error } = useReadContract({
    address: MARKET_FACTORY_ADDRESS as `0x${string}`,
    abi: MarketFactoryReadAbi as Abi,
    functionName: 'marketForIdentifier',
    args: [BigInt(identifier)],
  });

  return { 
    marketAddress: marketAddress && marketAddress !== '0x0000000000000000000000000000000000000000' ? marketAddress : null, 
    loading: isLoading, 
    error: error?.message || null 
  };
};

// Hook for individual market details using the exact Market functions
export const useMarketDetails = (marketAddress: string) => {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Create contract calls for market data using the exact Market functions
  const marketContracts = marketAddress ? [
    // Core metadata for cards & filters
    { address: marketAddress as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'question' as const },
    { address: marketAddress as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'description' as const },
    { address: marketAddress as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'category' as const },
    { address: marketAddress as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'platform' as const },
    { address: marketAddress as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'identifier' as const },
    { address: marketAddress as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'createdAt' as const },
    { address: marketAddress as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'endTime' as const },
    { address: marketAddress as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'creator' as const },
    { address: marketAddress as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'creatorFeeBps' as const },
    { address: marketAddress as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'state' as const },
    { address: marketAddress as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'getOptionCount' as const },
    
    // Liquidity, participants, and per-option info
    { address: marketAddress as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'totalStaked' as const },
    { address: marketAddress as `0x${string}`, abi: MarketReadAbi as Abi, functionName: 'activeParticipantsCount' as const },
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
          platform,
          identifier,
          createdAt,
          endTime,
          creator,
          creatorFeeBps,
          state,
          optionCount,
          totalStaked,
          activeParticipantsCount
        ] = marketData;

        // Check if essential data is available
        if (question?.result && endTime?.result && creator?.result && state?.result) {
          
          const marketInfoData: MarketInfo = {
            address: marketAddress,
            identifier: identifier?.result as string || "",
            creator: creator.result as string,
            options: [], // Will be populated separately by fetching individual options
            endTime: Number(endTime.result),
            creatorFeeBps: Number(creatorFeeBps?.result || 0),
            totalLiquidity: totalStaked?.result ? formatUnits(totalStaked.result as bigint, 6) : "0",
            isResolved: Number(state.result) === 2, // 2 = resolved
            winningOption: undefined, // Not available in read ABI
            question: question.result as string,
            description: description?.result as string || "",
            category: category?.result as string || "General",
            resolutionSource: "", // Not available in read ABI
            platform: Number(platform?.result || 0),
            createdAt: Number(createdAt?.result || Math.floor(Date.now() / 1000)),
            optionLiquidity: [], // Will be populated separately
            state: Number(state.result) as any,
            status: Number(state.result) === 2 ? 1 : 0, // Convert state to status: 2=resolved -> 1, others -> 0 (active)
            activeParticipantsCount: Number(activeParticipantsCount?.result || 0),
          };

          const marketStatsData: MarketStats = {
            totalLiquidity: totalStaked?.result ? formatUnits(totalStaked.result as bigint, 6) : "0",
            totalBets: 0, // Would need to count events
            optionLiquidity: [], // Will be populated separately
            isActive: Number(state.result) === 0 && Number(endTime.result) > Math.floor(Date.now() / 1000),
            isResolved: Number(state.result) === 2,
            winningOption: undefined, // Not available in read ABI
            activeParticipantsCount: Number(activeParticipantsCount?.result || 0),
            state: Number(state.result) as any,
            status: Number(state.result) === 2 ? 1 : 0,
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