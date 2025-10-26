'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { arbitrumSepolia } from 'wagmi/chains';
import { useNexusSDK } from './use-nexus-sdk';

export interface EthBalanceState {
  balance: string;
  balanceFormatted: string;
  hasInsufficientBalance: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CrossChainBridgeState {
  isBridging: boolean;
  bridgeError: string | null;
  bridgeSuccess: boolean;
  availableChains: string[];
  sourceChain: string | null;
  targetChain: string | null;
}

export interface EthBalanceActions {
  checkBalance: () => Promise<void>;
  bridgeEthFromOtherChain: (sourceChain: string, amount: string) => Promise<boolean>;
  getAvailableChains: () => Promise<string[]>;
  refreshBalance: () => Promise<void>;
}

const MINIMUM_ETH_REQUIRED = '0.001'; // Minimum ETH required for transactions
const ARBITRUM_SEPOLIA_CHAIN_ID = arbitrumSepolia.id;

export function useEthBalance(): EthBalanceState & CrossChainBridgeState & EthBalanceActions {
  const { address, chainId } = useAccount();
  const [balance, setBalance] = useState<string>('0');
  const [balanceFormatted, setBalanceFormatted] = useState<string>('0.000');
  const [hasInsufficientBalance, setHasInsufficientBalance] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cross-chain bridge state
  const [isBridging, setIsBridging] = useState<boolean>(false);
  const [bridgeError, setBridgeError] = useState<string | null>(null);
  const [bridgeSuccess, setBridgeSuccess] = useState<boolean>(false);
  const [availableChains, setAvailableChains] = useState<string[]>([]);
  const [sourceChain, setSourceChain] = useState<string | null>(null);
  const [targetChain, setTargetChain] = useState<string | null>(null);

  // Nexus SDK integration
  const nexusSDK = useNexusSDK();

  // Get ETH balance using wagmi
  const { data: balanceData, isLoading: balanceLoading, error: balanceError } = useBalance({
    address: address as `0x${string}`,
    chainId: ARBITRUM_SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Check if we're on the correct chain
  const isCorrectChain = chainId === ARBITRUM_SEPOLIA_CHAIN_ID;

  // Update balance state when balance data changes
  useEffect(() => {
    if (balanceData) {
      const balanceWei = balanceData.value.toString();
      const balanceEth = formatUnits(balanceData.value, 18);
      
      setBalance(balanceWei);
      setBalanceFormatted(parseFloat(balanceEth).toFixed(6));
      
      // Check if balance is sufficient
      const minimumRequired = parseUnits(MINIMUM_ETH_REQUIRED, 18);
      const hasInsufficient = balanceData.value < minimumRequired;
      setHasInsufficientBalance(hasInsufficient);
    }
  }, [balanceData]);

  // Update loading state
  useEffect(() => {
    setIsLoading(balanceLoading);
  }, [balanceLoading]);

  // Update error state
  useEffect(() => {
    if (balanceError) {
      setError(balanceError.message);
    } else {
      setError(null);
    }
  }, [balanceError]);

  // Check balance manually
  const checkBalance = useCallback(async () => {
    if (!address) {
      setError('No wallet connected');
      return;
    }

    if (!isCorrectChain) {
      setError('Please switch to Arbitrum Sepolia network');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // The balance will be automatically updated by the useBalance hook
      // This function is mainly for manual refresh
      console.log('Balance check completed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check balance';
      setError(errorMessage);
      console.error('Error checking balance:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address, isCorrectChain]);

  // Get available chains for bridging
  const getAvailableChains = useCallback(async (): Promise<string[]> => {
    try {
      if (!nexusSDK.isInitialized) {
        throw new Error('Nexus SDK not initialized');
      }

      // Get available chains from Nexus SDK
      const chains = ['ethereum-sepolia', 'polygon-mumbai', 'avalanche-fuji'];
      setAvailableChains(chains);
      return chains;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get available chains';
      setBridgeError(errorMessage);
      console.error('Error getting available chains:', err);
      return [];
    }
  }, [nexusSDK.isInitialized]);

  // Bridge ETH from another chain
  const bridgeEthFromOtherChain = useCallback(async (
    sourceChainName: string, 
    amount: string
  ): Promise<boolean> => {
    if (!nexusSDK.isInitialized) {
      setBridgeError('Nexus SDK not initialized. Please try refreshing the page.');
      return false;
    }

    if (!address) {
      setBridgeError('No wallet connected. Please connect your wallet first.');
      return false;
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setBridgeError('Invalid amount. Please enter a valid ETH amount.');
      return false;
    }

    if (amountNum < 0.001) {
      setBridgeError('Amount too small. Minimum bridge amount is 0.001 ETH.');
      return false;
    }

    setIsBridging(true);
    setBridgeError(null);
    setBridgeSuccess(false);

    try {
      // Set source and target chains
      setSourceChain(sourceChainName);
      setTargetChain('arbitrum-sepolia');

      // Prepare bridge parameters
      const bridgeParams = {
        fromChain: sourceChainName,
        toChain: 'arbitrum-sepolia',
        token: 'ETH' as const, // Cast to const to match SUPPORTED_TOKENS
        amount: amount,
        recipient: address,
        chainId: ARBITRUM_SEPOLIA_CHAIN_ID, // Add required chainId
      };

      console.log('Bridging ETH with params:', bridgeParams);

      // Simulate bridge first with timeout
      const simulation = await Promise.race([
        nexusSDK.simulateBridge(bridgeParams),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Simulation timeout')), 30000)
        )
      ]) as any;

      console.log('Bridge simulation result:', simulation);

      if (!simulation || !simulation.success) {
        throw new Error(simulation?.error || 'Bridge simulation failed');
      }

      // Execute the bridge with timeout
      const result = await Promise.race([
        nexusSDK.bridge(bridgeParams),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Bridge execution timeout')), 120000)
        )
      ]) as any;

      console.log('Bridge result:', result);

      if (result && result.success) {
        setBridgeSuccess(true);
        
        // Wait for balance to update (this will be handled by the useBalance hook)
        console.log('Bridge completed successfully');
        
        return true;
      } else {
        throw new Error(result?.error || 'Bridge failed');
      }
    } catch (err) {
      let errorMessage = 'Bridge failed';
      
      if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          errorMessage = 'Bridge operation timed out. Please try again.';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds on source chain. Please check your balance.';
        } else if (err.message.includes('user rejected')) {
          errorMessage = 'Transaction was cancelled by user.';
        } else if (err.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setBridgeError(errorMessage);
      console.error('Error bridging ETH:', err);
      return false;
    } finally {
      setIsBridging(false);
    }
  }, [nexusSDK, address]);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    await checkBalance();
  }, [checkBalance]);

  // Auto-check balance when address or chain changes
  useEffect(() => {
    if (address && isCorrectChain) {
      checkBalance();
    }
  }, [address, isCorrectChain, checkBalance]);

  return {
    // Balance state
    balance,
    balanceFormatted,
    hasInsufficientBalance,
    isLoading,
    error,
    
    // Cross-chain bridge state
    isBridging,
    bridgeError,
    bridgeSuccess,
    availableChains,
    sourceChain,
    targetChain,
    
    // Actions
    checkBalance,
    bridgeEthFromOtherChain,
    getAvailableChains,
    refreshBalance,
  };
}
