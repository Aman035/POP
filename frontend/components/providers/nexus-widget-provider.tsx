'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { NexusProvider, useNexus } from '@avail-project/nexus-widgets';
import { useAccount } from 'wagmi';

interface NexusWidgetContextType {
  isInitialized: boolean;
  sdk: any;
  initializeSdk: (provider: any) => Promise<void>;
  deinitializeSdk: () => void;
}

const NexusWidgetContext = createContext<NexusWidgetContextType | null>(null);

export function NexusWidgetProviderWrapper({ children }: { children: ReactNode }) {
  const { connector, isConnected } = useAccount();
  const { setProvider, initializeSdk, sdk, isSdkInitialized, deinitializeSdk } = useNexus();

  useEffect(() => {
    if (isConnected && connector?.getProvider) {
      connector.getProvider().then((provider) => {
        if (provider) {
          setProvider(provider);
        }
      });
    }
  }, [isConnected, connector, setProvider]);

  const contextValue: NexusWidgetContextType = {
    isInitialized: isSdkInitialized,
    sdk,
    initializeSdk,
    deinitializeSdk,
  };

  return (
    <NexusWidgetContext.Provider value={contextValue}>
      {children}
    </NexusWidgetContext.Provider>
  );
}

export function useNexusWidget() {
  const context = useContext(NexusWidgetContext);
  if (!context) {
    throw new Error('useNexusWidget must be used within NexusWidgetProviderWrapper');
  }
  return context;
}

// Main provider component
export function NexusWidgetProvider({ children }: { children: ReactNode }) {
  return (
    <NexusProvider
      config={{
        debug: true, // Enable debug logs
        network: 'testnet', // Use testnet for Arbitrum Sepolia
      }}
    >
      <NexusWidgetProviderWrapper>
        {children}
      </NexusWidgetProviderWrapper>
    </NexusProvider>
  );
}
