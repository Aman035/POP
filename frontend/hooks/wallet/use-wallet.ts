'use client';

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';
import { defineChain } from 'viem';

// BSC Testnet chain definition
const bscTestnet = defineChain({
  id: 97,
  name: 'BSC Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BscScan',
      url: 'https://testnet.bscscan.com',
    },
  },
  testnet: true,
});

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
  switchToBSCTestnet: () => Promise<void>;
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

  // Only allow BSC Testnet (97)
  const isCorrectChain = chainId === bscTestnet.id;

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

  const switchToBSCTestnet = useCallback(async () => {
    try {
      setError(null);
      await switchChain({ chainId: bscTestnet.id });
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
      switchToBSCTestnet: async () => {},
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
    switchToBSCTestnet,
    clearError,
  };
}
