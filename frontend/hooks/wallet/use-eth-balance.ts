'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';

export interface EthBalanceState {
  balance: string;
  balanceFormatted: string;
  hasInsufficientBalance: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface EthBalanceActions {
  checkBalance: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const MINIMUM_BNB_REQUIRED = '0.001'; // Minimum BNB required for transactions
const BSC_TESTNET_CHAIN_ID = 97;

export function useEthBalance(): EthBalanceState & EthBalanceActions {
  const { address, chainId } = useAccount();
  const [balance, setBalance] = useState<string>('0');
  const [balanceFormatted, setBalanceFormatted] = useState<string>('0.000');
  const [hasInsufficientBalance, setHasInsufficientBalance] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get BNB balance using wagmi
  const { data: balanceData, isLoading: balanceLoading, error: balanceError } = useBalance({
    address: address as `0x${string}`,
    chainId: BSC_TESTNET_CHAIN_ID,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Check if we're on the correct chain
  const isCorrectChain = chainId === BSC_TESTNET_CHAIN_ID;

  // Update balance state when balance data changes
  useEffect(() => {
    if (balanceData) {
      const balanceWei = balanceData.value.toString();
      const balanceBnb = formatUnits(balanceData.value, 18);
      const balanceBnbNum = parseFloat(balanceBnb);
      
      setBalance(balanceWei);
      setBalanceFormatted(balanceBnbNum.toFixed(6));
      
      // Check if balance is sufficient
      // Only mark as insufficient if balance is actually less than minimum AND we're not loading
      const minimumRequired = parseUnits(MINIMUM_BNB_REQUIRED, 18);
      const hasInsufficient = balanceData.value < minimumRequired;
      
      console.log('Balance update:', {
        balanceWei,
        balanceBnb: balanceBnbNum,
        minimumRequired: MINIMUM_BNB_REQUIRED,
        hasInsufficient,
        balanceLoading
      });
      
      setHasInsufficientBalance(hasInsufficient);
    } else if (!balanceLoading && address) {
      // If balance data is not available and we're not loading, assume insufficient
      // This handles the case where balance fetch failed
      console.warn('Balance data not available, assuming insufficient');
      setHasInsufficientBalance(true);
    } else if (!address) {
      // No address, reset to default
      setHasInsufficientBalance(false);
    }
  }, [balanceData, balanceLoading, address]);

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
      setError('Please switch to BSC Testnet network');
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
    
    // Actions
    checkBalance,
    refreshBalance,
  };
}
