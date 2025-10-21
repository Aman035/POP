import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { 
  MARKET_FACTORY_ADDRESS, 
  MARKET_FACTORY_ABI, 
  MARKET_ABI, 
  IERC20_ABI,
  COLLATERAL_TOKEN_ADDRESS,
  MarketCreationParams 
} from '@/lib/contracts';
import { getCurrentNetworkContracts } from '@/constants/addresses';

// Contract instances
let marketFactoryContract: ethers.Contract | null = null;
let collateralTokenContract: ethers.Contract | null = null;

// Hook for MarketFactory contract
export const useMarketFactory = () => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initContract = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          
          const contractInstance = new ethers.Contract(
            MARKET_FACTORY_ADDRESS,
            MARKET_FACTORY_ABI,
            signer
          );
          
          setContract(contractInstance);
          marketFactoryContract = contractInstance;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize contract');
      } finally {
        setLoading(false);
      }
    };

    initContract();
  }, []);

  return { contract, loading, error };
};

// Hook for Market contract
export const useMarket = (marketAddress: string) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!marketAddress) {
      setLoading(false);
      return;
    }

    const initContract = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          
          const contractInstance = new ethers.Contract(
            marketAddress,
            MARKET_ABI,
            signer
          );
          
          setContract(contractInstance);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize market contract');
      } finally {
        setLoading(false);
      }
    };

    initContract();
  }, [marketAddress]);

  return { contract, loading, error };
};

// Hook for Collateral Token (USDC)
export const useCollateralToken = () => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initContract = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          
          const contractInstance = new ethers.Contract(
            COLLATERAL_TOKEN_ADDRESS,
            IERC20_ABI,
            signer
          );
          
          setContract(contractInstance);
          collateralTokenContract = contractInstance;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize collateral token contract');
      } finally {
        setLoading(false);
      }
    };

    initContract();
  }, []);

  return { contract, loading, error };
};

// Hook for creating a new market
export const useCreateMarket = () => {
  const { contract: marketFactory } = useMarketFactory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMarket = useCallback(async (params: MarketCreationParams) => {
    if (!marketFactory) {
      setError('MarketFactory contract not initialized');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const tx = await marketFactory.createMarket(params);
      const receipt = await tx.wait();
      
      // Extract market address from MarketCreated event
      const event = receipt.logs.find(
        (log: any) => log.topics[0] === marketFactory.interface.getEvent('MarketCreated').topicHash
      );
      
      if (event) {
        const decoded = marketFactory.interface.parseLog(event);
        return decoded?.args.market;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create market');
      return null;
    } finally {
      setLoading(false);
    }
  }, [marketFactory]);

  return { createMarket, loading, error };
};

// Hook for getting all markets
export const useAllMarkets = () => {
  const { contract: marketFactory } = useMarketFactory();
  const [markets, setMarkets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      if (!marketFactory) return;

      try {
        setLoading(true);
        const allMarkets = await marketFactory.allMarkets();
        setMarkets(allMarkets);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch markets');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, [marketFactory]);

  return { markets, loading, error };
};

// Hook for getting market by identifier
export const useMarketByIdentifier = (identifier: string) => {
  const { contract: marketFactory } = useMarketFactory();
  const [marketAddress, setMarketAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarket = async () => {
      if (!marketFactory || !identifier) return;

      try {
        setLoading(true);
        const address = await marketFactory.marketForIdentifier(identifier);
        setMarketAddress(address !== ethers.ZeroAddress ? address : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market');
      } finally {
        setLoading(false);
      }
    };

    fetchMarket();
  }, [marketFactory, identifier]);

  return { marketAddress, loading, error };
};
