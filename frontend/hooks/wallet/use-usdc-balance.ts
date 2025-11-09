'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { COLLATERAL_TOKEN_ADDRESS, IERC20_ABI } from '@/lib/contracts';

export interface UsdcBalanceState {
  balance: string;
  balanceFormatted: string;
  hasInsufficientBalance: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UsdcBalanceActions {
  checkBalance: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const BSC_TESTNET_CHAIN_ID = 97;

export function useUsdcBalance(requiredAmount?: string): UsdcBalanceState & UsdcBalanceActions {
  const { address, chainId } = useAccount();
  const [balance, setBalance] = useState<string>('0');
  const [balanceFormatted, setBalanceFormatted] = useState<string>('0.00');
  const [hasInsufficientBalance, setHasInsufficientBalance] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get USDC balance using wagmi
  const { data: balanceData, isLoading: balanceLoading, error: balanceError, refetch } = useReadContract({
    address: COLLATERAL_TOKEN_ADDRESS as `0x${string}`,
    abi: IERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Check if we're on the correct chain
  const isCorrectChain = chainId === BSC_TESTNET_CHAIN_ID;

  // Update balance state when balance data changes
  useEffect(() => {
    if (balanceData !== undefined && balanceData !== null) {
      const balanceWei = balanceData.toString();
      const balanceUsdc = formatUnits(balanceData as bigint, 6); // USDC has 6 decimals
      
      setBalance(balanceWei);
      setBalanceFormatted(parseFloat(balanceUsdc).toFixed(2));
      
      // Check if balance is sufficient for required amount
      if (requiredAmount) {
        const requiredAmountWei = parseUnits(requiredAmount, 6);
        const hasInsufficient = (balanceData as bigint) < requiredAmountWei;
        setHasInsufficientBalance(hasInsufficient);
      } else {
        setHasInsufficientBalance(false);
      }
    } else {
      setBalance('0');
      setBalanceFormatted('0.00');
      setHasInsufficientBalance(!!requiredAmount);
    }
  }, [balanceData, requiredAmount]);

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
      await refetch();
      console.log('USDC balance check completed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check USDC balance';
      setError(errorMessage);
      console.error('Error checking USDC balance:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address, isCorrectChain, refetch]);

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
