'use client';

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';
import { arbitrumSepolia } from 'wagmi/chains';

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnecting: boolean;
  isSwitchingChain: boolean;
  address: string | undefined;
  chainId: number | undefined;
  isCorrectChain: boolean;
  error: string | null;
}

export interface WalletActions {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchToArbitrumSepolia: () => Promise<void>;
  clearError: () => void;
}

export function useWallet(): WalletState & WalletActions {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always call all hooks to maintain consistent order
  const { address, isConnected, chainId } = useAccount({
    query: { enabled: mounted }
  });
  const { connect, connectors, isPending: isConnecting, error: connectError } = useConnect({
    mutation: { onError: () => {} }
  });
  const { disconnect, isPending: isDisconnecting } = useDisconnect();
  const { switchChain, isPending: isSwitchingChain, error: switchError } = useSwitchChain();
  
  const [error, setError] = useState<string | null>(null);

  // Whitelist Ethereum mainnet (1) and Arbitrum Sepolia (421614)
  const isCorrectChain = chainId === 1 || chainId === arbitrumSepolia.id;

  // Clear error when connection state changes
  useEffect(() => {
    if (isConnected && error) {
      setError(null);
    }
  }, [isConnected, error]);

  // Handle connection errors
  useEffect(() => {
    if (connectError) {
      setError(connectError.message);
    }
  }, [connectError]);

  // Handle chain switch errors
  useEffect(() => {
    if (switchError) {
      setError(switchError.message);
    }
  }, [switchError]);

  const connectWallet = useCallback(async () => {
    try {
      setError(null);
      
      // Try to connect with the first available connector
      const connector = connectors[0];
      if (!connector) {
        throw new Error('No wallet connectors available');
      }

      await connect({ connector });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      throw err;
    }
  }, [connect, connectors]);

  const disconnectWallet = useCallback(async () => {
    try {
      setError(null);
      await disconnect();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect wallet';
      setError(errorMessage);
      throw err;
    }
  }, [disconnect]);

  const switchToArbitrumSepolia = useCallback(async () => {
    try {
      setError(null);
      await switchChain({ chainId: arbitrumSepolia.id });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch chain';
      setError(errorMessage);
      throw err;
    }
  }, [switchChain]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Return default values when not mounted to prevent SSR issues
  if (!mounted) {
    return {
      isConnected: false,
      isConnecting: false,
      isDisconnecting: false,
      isSwitchingChain: false,
      address: undefined,
      chainId: undefined,
      isCorrectChain: false,
      error: null,
      connect: async () => {},
      disconnect: async () => {},
      switchToArbitrumSepolia: async () => {},
      clearError: () => {},
    };
  }

  return {
    // State
    isConnected,
    isConnecting,
    isDisconnecting,
    isSwitchingChain,
    address,
    chainId,
    isCorrectChain,
    error,
    
    // Actions
    connect: connectWallet,
    disconnect: disconnectWallet,
    switchToArbitrumSepolia,
    clearError,
  };
}
