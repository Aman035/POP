'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useNexusSDK as useNexusSDKHook } from '@/hooks/use-nexus-sdk';

type NexusSDKContextType = ReturnType<typeof useNexusSDKHook>;

const NexusSDKContext = createContext<NexusSDKContextType | null>(null);

export function NexusProvider({ children }: { children: ReactNode }) {
  const nexusSDK = useNexusSDKHook();
  
  return (
    <NexusSDKContext.Provider value={nexusSDK}>
      {children}
    </NexusSDKContext.Provider>
  );
}

export function useNexusSDK() {
  const context = useContext(NexusSDKContext);
  if (!context) {
    throw new Error('useNexusSDK must be used within NexusProvider');
  }
  return context;
}

