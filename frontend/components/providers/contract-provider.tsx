'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { 
  MARKET_FACTORY_ADDRESS, 
  MARKET_FACTORY_ABI, 
  MARKET_ABI, 
  IERC20_ABI,
  COLLATERAL_TOKEN_ADDRESS,
  MarketCreationParams 
} from '@/lib/contracts';

// Contract context types
interface ContractContextType {
  // Contract instances
  marketFactory: ethers.Contract | null;
  collateralToken: ethers.Contract | null;
  
  // Contract states
  loading: boolean;
  error: string | null;
  
  // Contract methods
  createMarket: (params: MarketCreationParams) => Promise<string | null>;
  getAllMarkets: () => Promise<string[]>;
  getMarketByIdentifier: (identifier: string) => Promise<string | null>;
  
  // Utility methods
  getContractInfo: () => {
    marketFactoryAddress: string;
    collateralTokenAddress: string;
    network: string;
  };
}

// Create context
const ContractContext = createContext<ContractContextType | undefined>(undefined);

// Provider component
interface ContractProviderProps {
  children: ReactNode;
}

export const ContractProvider: React.FC<ContractProviderProps> = ({ children }) => {
  const [marketFactory, setMarketFactory] = useState<ethers.Contract | null>(null);
  const [collateralToken, setCollateralToken] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize contracts
  useEffect(() => {
    const initContracts = async () => {
      try {
        setLoading(true);
        setError(null);

        if (typeof window !== 'undefined' && window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();

          // Initialize MarketFactory contract
          const marketFactoryContract = new ethers.Contract(
            MARKET_FACTORY_ADDRESS,
            MARKET_FACTORY_ABI,
            signer
          );

          // Initialize Collateral Token contract
          const collateralTokenContract = new ethers.Contract(
            COLLATERAL_TOKEN_ADDRESS,
            IERC20_ABI,
            signer
          );

          setMarketFactory(marketFactoryContract);
          setCollateralToken(collateralTokenContract);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize contracts');
      } finally {
        setLoading(false);
      }
    };

    initContracts();
  }, []);

  // Create market method
  const createMarket = async (params: MarketCreationParams): Promise<string | null> => {
    if (!marketFactory) {
      throw new Error('MarketFactory contract not initialized');
    }

    try {
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
      throw new Error(err instanceof Error ? err.message : 'Failed to create market');
    }
  };

  // Get all markets method
  const getAllMarkets = async (): Promise<string[]> => {
    if (!marketFactory) {
      throw new Error('MarketFactory contract not initialized');
    }

    try {
      return await marketFactory.allMarkets();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch markets');
    }
  };

  // Get market by identifier method
  const getMarketByIdentifier = async (identifier: string): Promise<string | null> => {
    if (!marketFactory) {
      throw new Error('MarketFactory contract not initialized');
    }

    try {
      const address = await marketFactory.marketForIdentifier(identifier);
      return address !== ethers.ZeroAddress ? address : null;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch market');
    }
  };

  // Get contract info method
  const getContractInfo = () => ({
    marketFactoryAddress: MARKET_FACTORY_ADDRESS,
    collateralTokenAddress: COLLATERAL_TOKEN_ADDRESS,
    network: 'BSC Testnet',
  });

  // Context value
  const value: ContractContextType = {
    marketFactory,
    collateralToken,
    loading,
    error,
    createMarket,
    getAllMarkets,
    getMarketByIdentifier,
    getContractInfo,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};

// Hook to use contract context
export const useContractContext = (): ContractContextType => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContractContext must be used within a ContractProvider');
  }
  return context;
};

// Hook for MarketFactory contract
export const useMarketFactory = () => {
  const { marketFactory, loading, error } = useContractContext();
  return { contract: marketFactory, loading, error };
};

// Hook for Collateral Token contract
export const useCollateralToken = () => {
  const { collateralToken, loading, error } = useContractContext();
  return { contract: collateralToken, loading, error };
};

// Hook for contract methods
export const useContractMethods = () => {
  const { createMarket, getAllMarkets, getMarketByIdentifier, getContractInfo } = useContractContext();
  return { createMarket, getAllMarkets, getMarketByIdentifier, getContractInfo };
};
