import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbiItem, encodeFunctionData, decodeEventLog } from 'viem';
import { 
  MARKET_FACTORY_ADDRESS, 
  MARKET_FACTORY_ABI, 
  MARKET_ABI, 
  IERC20_ABI,
  COLLATERAL_TOKEN_ADDRESS,
  MarketCreationParams 
} from '@/lib/contracts';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const createMarket = useCallback(async (params: MarketCreationParams) => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare the createMarket function call
      const createMarketData = encodeFunctionData({
        abi: MARKET_FACTORY_ABI,
        functionName: 'createMarket',
        args: [{
          identifier: BigInt(params.identifier),
          options: params.options,
          creator: address as `0x${string}`,
          endTime: BigInt(params.endTime),
          creatorFeeBps: BigInt(params.creatorFeeBps),
          question: params.question,
          description: params.description,
          category: params.category,
          resolutionSource: params.resolutionSource,
        }]
      });

      // Write the contract
      writeContract({
        address: MARKET_FACTORY_ADDRESS as `0x${string}`,
        abi: MARKET_FACTORY_ABI,
        functionName: 'createMarket',
        args: [{
          identifier: BigInt(params.identifier),
          options: params.options,
          creator: address as `0x${string}`,
          endTime: BigInt(params.endTime),
          creatorFeeBps: BigInt(params.creatorFeeBps),
          question: params.question,
          description: params.description,
          category: params.category,
          resolutionSource: params.resolutionSource,
        }]
      });

      return { hash, isPending, isConfirming, isConfirmed };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create market');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConnected, address, writeContract]);

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

// Hook for getting all markets
export const useAllMarkets = () => {
  const { data: markets, isLoading, error } = useReadContract({
    address: MARKET_FACTORY_ADDRESS as `0x${string}`,
    abi: MARKET_FACTORY_ABI,
    functionName: 'allMarkets',
  });

  return { 
    markets: markets || [], 
    loading: isLoading, 
    error: error?.message || null 
  };
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