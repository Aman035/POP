"use client"

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, useReadContracts, usePublicClient } from 'wagmi';
import { parseAbiItem, encodeFunctionData, decodeEventLog, formatUnits, parseUnits, keccak256, toBytes } from 'viem';
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
  const publicClient = usePublicClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketAddress, setMarketAddress] = useState<string | null>(null);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    isError: isReceiptError,
    error: receiptError,
    data: receipt
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Watch for transaction receipt errors
  useEffect(() => {
    if (isReceiptError && receiptError && hash) {
      console.error('❌ Transaction receipt error:', receiptError);
      const errorMsg = receiptError instanceof Error ? receiptError.message : 'Transaction failed on blockchain';
      setError(errorMsg);
    }
  }, [isReceiptError, receiptError, hash]);

  // Extract market address from receipt when confirmed
  useEffect(() => {
    if (isConfirmed && receipt && hash) {
      try {
        // Get the event signature hash
        // MarketCreated(address,address,tuple,tuple)
        const eventSignature = 'MarketCreated(address,address,tuple,tuple)';
        const eventTopic = keccak256(toBytes(eventSignature));

        // Parse MarketCreated event from receipt
        const marketCreatedEvent = receipt.logs.find((log) => {
          return log.topics[0] === eventTopic;
        });

        if (marketCreatedEvent) {
          // Decode the event to get the market address
          const decoded = decodeEventLog({
            abi: MARKET_FACTORY_ABI,
            eventName: 'MarketCreated',
            data: marketCreatedEvent.data,
            topics: marketCreatedEvent.topics,
          });
          
          // The market address is in topics[2] (indexed parameter)
          // topics[0] = event signature
          // topics[1] = creator (indexed)
          // topics[2] = market (indexed)
          if (marketCreatedEvent.topics && marketCreatedEvent.topics.length >= 3) {
            const extractedMarketAddress = marketCreatedEvent.topics[2] as string;
            console.log('✅ Market address extracted from event:', extractedMarketAddress);
            setMarketAddress(extractedMarketAddress);
          } else if (decoded && decoded.args && typeof decoded.args === 'object' && 'market' in decoded.args) {
            const extractedMarketAddress = (decoded.args as any).market as string;
            console.log('✅ Market address extracted from decoded args:', extractedMarketAddress);
            setMarketAddress(extractedMarketAddress);
          }
        } else {
          console.warn('⚠️ MarketCreated event not found in receipt');
        }
      } catch (err) {
        console.error('❌ Error parsing MarketCreated event:', err);
      }
    }
  }, [isConfirmed, receipt, hash]);

  const createMarket = useCallback(async (params: MarketCreationParams) => {
    console.log('🚀 createMarket function called with params:', params);
    
    // Use wallet address as fallback if useAccount address is not available
    const userAddress = address || walletAddress;
    const isWalletConnected = isConnected || walletConnected;

    if (!isWalletConnected || !userAddress) {
      console.error('❌ Wallet not connected or no address found');
      setError('Wallet not connected');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      setMarketAddress(null);

      // Validate MARKET_FACTORY_ADDRESS is set and valid
      if (!MARKET_FACTORY_ADDRESS || MARKET_FACTORY_ADDRESS.trim() === '') {
        throw new Error('Market Factory contract address is not configured. Please set NEXT_PUBLIC_MARKET_FACTORY_ADDRESS in your .env.local file. Expected: 0x84bBEB5383A2da8AcA2008B3505fCb338AE850c4');
      }

      // Validate MARKET_FACTORY_ADDRESS format
      if (!MARKET_FACTORY_ADDRESS.startsWith('0x') || MARKET_FACTORY_ADDRESS.length !== 42) {
        throw new Error(`Invalid Market Factory contract address format: ${MARKET_FACTORY_ADDRESS}. Expected a valid Ethereum address (42 characters starting with 0x).`);
      }

      // Expected correct address on BSC Testnet
      const EXPECTED_MARKET_FACTORY_ADDRESS = '0x84bBEB5383A2da8AcA2008B3505fCb338AE850c4';
      
      // Warn if address doesn't match expected (case-insensitive comparison)
      if (MARKET_FACTORY_ADDRESS.toLowerCase() !== EXPECTED_MARKET_FACTORY_ADDRESS.toLowerCase()) {
        console.warn('⚠️ WARNING: Market Factory address does not match expected address!');
        console.warn(`   Current: ${MARKET_FACTORY_ADDRESS}`);
        console.warn(`   Expected: ${EXPECTED_MARKET_FACTORY_ADDRESS}`);
        console.warn('   Please check your NEXT_PUBLIC_MARKET_FACTORY_ADDRESS environment variable.');
        
        // If it's the problematic address the user mentioned, throw an error
        if (MARKET_FACTORY_ADDRESS.toLowerCase() === '0x6b70e7fc5e40acfc76ebc3fa148159e5ef6f7643') {
          throw new Error(`Invalid Market Factory address detected: ${MARKET_FACTORY_ADDRESS}. This appears to be an incorrect address. Please update your .env.local file with: NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=0x84bBEB5383A2da8AcA2008B3505fCb338AE850c4`);
        }
      }

      // Log the addresses being used for debugging
      console.log('📋 Address validation:', {
        userAddress,
        marketFactoryAddress: MARKET_FACTORY_ADDRESS,
        userAddressLength: userAddress?.length,
        marketFactoryAddressLength: MARKET_FACTORY_ADDRESS.length,
      });

      // Validate required parameters
      if (!params.question || !params.description || !params.options || params.options.length < 2) {
        throw new Error('Missing required market parameters');
      }

      if (params.endTime <= Math.floor(Date.now() / 1000)) {
        throw new Error('End time must be in the future');
      }

      // Check if the user address is the same as contract address (this would cause the error)
      if (userAddress.toLowerCase() === MARKET_FACTORY_ADDRESS.toLowerCase()) {
        throw new Error('Wallet address is the same as contract address. Please disconnect and reconnect your wallet.');
      }

      // Additional validation: check if address looks like a contract address (starts with 0x and is 42 chars)
      if (!userAddress || userAddress.length !== 42 || !userAddress.startsWith('0x')) {
        throw new Error('Invalid wallet address format. Please reconnect your wallet.');
      }

      console.log('🔄 Submitting transaction to create market...');
      console.log('📍 Contract address:', MARKET_FACTORY_ADDRESS);
      console.log('👤 User address:', userAddress);
      
      // Submit the transaction - writeContract triggers wallet prompt
      // It may throw synchronously if user rejects immediately
      writeContract({
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

      // If writeContract didn't throw, transaction was submitted to wallet
      // The hash will be set by wagmi asynchronously after user confirms
      // We return immediately - the component should watch the hash from the hook's return value
      console.log('✅ Transaction submitted to wallet, waiting for user confirmation...');
      
      return { 
        hash: null, // Will be available from hook's return value after user confirms
        marketAddress: null, // Will be set by useEffect when receipt is confirmed
        isPending: true, 
        isConfirming: false, 
        isConfirmed: false 
      };
    } catch (err: any) {
      console.error('❌ Error in createMarket:', err);
      
      // Extract detailed error message
      let errorMsg = 'Failed to create market';
      
      if (err instanceof Error) {
        errorMsg = err.message;
      } else if (err?.message) {
        errorMsg = err.message;
      } else if (err?.error?.message) {
        errorMsg = err.error.message;
      } else if (err?.reason) {
        errorMsg = err.reason;
      } else if (typeof err === 'string') {
        errorMsg = err;
      }
      
      // Log full error details
      console.error('Error details:', {
        error: err,
        message: errorMsg,
        name: err?.name,
        code: err?.code,
        cause: err?.cause,
      });
      
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, walletConnected, walletAddress, writeContract]);

  // Combine all error sources
  const combinedError = error || 
    (writeError ? (writeError instanceof Error ? writeError.message : String(writeError)) : null) ||
    (receiptError ? (receiptError instanceof Error ? receiptError.message : String(receiptError)) : null);

  return { 
    createMarket, 
    loading: loading || isPending || isConfirming, 
    error: combinedError,
    hash,
    isConfirmed,
    isError: isReceiptError || !!writeError || !!error,
    marketAddress: marketAddress || (isConfirmed && hash ? null : null), // Will be set by useEffect
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

      // Convert amount to wei - token has 18 decimals, but contract stores in 6 decimals
      // So we send in 18 decimals (token native), and contract will store in 6 decimals internally
      const amountWei = parseUnits(amount, 18);
      console.log("🎯 Contract hook - placeBet:", { option, amount, amountWei, marketAddress });

      // Execute the transaction
      await writeContract({
        address: marketAddress as `0x${string}`,
        abi: MARKET_ABI,
        functionName: 'placeBet',
        args: [option, amountWei],
      });

      console.log("📝 Contract hook - writeContract called, hash:", hash);
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

      // Convert amount to wei - token has 18 decimals
      const amountWei = parseUnits(amount, 18);

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

// Hook for proposing resolution
export const useProposeResolution = (marketAddress: string) => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const proposeResolution = useCallback(async (option: number, evidenceURI: string) => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }

    if (!marketAddress) {
      setError('Invalid market address');
      return null;
    }

    if (option < 0) {
      setError('Invalid option');
      return null;
    }

    if (!evidenceURI || evidenceURI.trim() === '') {
      setError('Evidence URI is required');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Execute the propose resolution transaction
      writeContract({
        address: marketAddress as `0x${string}`,
        abi: MARKET_ABI,
        functionName: 'proposeResolution',
        args: [option, evidenceURI],
      });

      return { hash, isPending, isConfirming, isConfirmed };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to propose resolution';
      setError(errorMsg);
      console.error('Error proposing resolution:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, marketAddress, writeContract]);

  return {
    proposeResolution,
    loading: loading || isPending || isConfirming,
    error: error || (writeError ? writeError.message : null),
    hash,
    isConfirmed,
  };
};

// Hook for overriding resolution (creator only)
export const useOverrideResolution = (marketAddress: string) => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const overrideResolution = useCallback(async (option: number) => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }

    if (!marketAddress) {
      setError('Invalid market address');
      return null;
    }

    if (option < 0) {
      setError('Invalid option');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Execute the override resolution transaction
      writeContract({
        address: marketAddress as `0x${string}`,
        abi: MARKET_ABI,
        functionName: 'overrideResolution',
        args: [option],
      });

      return { hash, isPending, isConfirming, isConfirmed };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to override resolution';
      setError(errorMsg);
      console.error('Error overriding resolution:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, marketAddress, writeContract]);

  return {
    overrideResolution,
    loading: loading || isPending || isConfirming,
    error: error || (writeError ? writeError.message : null),
    hash,
    isConfirmed,
  };
};

// Hook for finalizing resolution
export const useFinalizeResolution = (marketAddress: string) => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const finalizeResolution = useCallback(async () => {
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

      // Execute the finalize resolution transaction
      writeContract({
        address: marketAddress as `0x${string}`,
        abi: MARKET_ABI,
        functionName: 'finalizeResolution',
        args: [],
      });

      return { hash, isPending, isConfirming, isConfirmed };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to finalize resolution';
      setError(errorMsg);
      console.error('Error finalizing resolution:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, marketAddress, writeContract]);

  return {
    finalizeResolution,
    loading: loading || isPending || isConfirming,
    error: error || (writeError ? writeError.message : null),
    hash,
    isConfirmed,
  };
};