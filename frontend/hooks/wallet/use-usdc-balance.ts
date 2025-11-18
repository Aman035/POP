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

  // Check if we're on the correct chain (must be defined before useReadContract)
  const isCorrectChain = chainId === BSC_TESTNET_CHAIN_ID;

  // Get USDC balance using wagmi - only refetch when needed (not on interval)
  const { data: balanceData, isLoading: balanceLoading, error: balanceError, refetch } = useReadContract({
    address: COLLATERAL_TOKEN_ADDRESS as `0x${string}`,
    abi: IERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isCorrectChain,
      // No automatic refetch interval - only refetch manually or on address/chain change
      refetchInterval: false,
      // Refetch on window focus (user comes back to tab)
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
  });

  // Update balance state when balance data changes
  useEffect(() => {
    if (balanceData !== undefined && balanceData !== null) {
      const balanceWei = balanceData.toString();
      const balanceUsdc = formatUnits(balanceData as bigint, 18); // USDC token has 18 decimals
      const balanceNum = parseFloat(balanceUsdc);
      
      setBalance(balanceWei);
      // Format with proper decimal handling - always show 2 decimal places for consistency
      if (isNaN(balanceNum) || !isFinite(balanceNum)) {
        setBalanceFormatted('0.00');
      } else if (balanceNum >= 1000000) {
        // For very large numbers, use abbreviated format
        setBalanceFormatted(balanceNum.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }));
      } else {
        // Always show 2 decimal places for consistency
        setBalanceFormatted(balanceNum.toFixed(2));
      }
      
      // Check if balance is sufficient for required amount
      if (requiredAmount) {
        // Convert required amount to 18 decimals to compare with balance
        const requiredAmountWei = parseUnits(requiredAmount, 18);
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

  // Auto-check balance when address or chain changes (only once, not on every render)
  useEffect(() => {
    if (address && isCorrectChain) {
      // Only refetch if we don't have data yet or if it's a new address/chain
      if (!balanceData && !balanceLoading) {
        refetch();
      }
    } else {
      // Reset balance when disconnected or wrong chain
      setBalance('0');
      setBalanceFormatted('0.00');
      setHasInsufficientBalance(!!requiredAmount);
    }
  }, [address, isCorrectChain, balanceData, balanceLoading, refetch]); // Include refetch but balanceData/balanceLoading prevent loops

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
