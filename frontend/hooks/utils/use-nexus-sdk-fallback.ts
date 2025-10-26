'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Fallback types for when Nexus SDK is not available
type NexusNetwork = string;
type UserAsset = any;
type BridgeParams = any;
type BridgeResult = any;
type TransferParams = any;
type TransferResult = any;
type SimulationResult = any;
type ProgressStep = any;
type OnIntentHook = any;
type OnAllowanceHook = any;

interface NexusSDKState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  balances: UserAsset[];
  usdcBalance: UserAsset | null;
}

interface NexusSDKActions {
  initialize: (provider: any) => Promise<void>;
  bridge: (params: BridgeParams) => Promise<BridgeResult>;
  transfer: (params: TransferParams) => Promise<TransferResult>;
  simulateBridge: (params: BridgeParams) => Promise<SimulationResult>;
  simulateTransfer: (params: TransferParams) => Promise<SimulationResult>;
  refreshBalances: () => Promise<void>;
  deinit: () => Promise<void>;
}

interface ProgressState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  steps: ProgressStep[];
  currentStepData: ProgressStep | null;
  error: string | null;
}

// Fallback hook that provides safe defaults when Nexus SDK is not available
export function useNexusSDKFallback(): NexusSDKState & NexusSDKActions & {
  progress: ProgressState;
  setOnIntentHook: (hook: OnIntentHook) => void;
  setOnAllowanceHook: (hook: OnAllowanceHook) => void;
} {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe fallback implementations
  const initialize = useCallback(async (provider: any) => {
    console.warn('Nexus SDK not available - using fallback mode');
    // Do nothing in fallback mode
  }, []);

  const bridge = useCallback(async (params: BridgeParams): Promise<BridgeResult> => {
    console.warn('Nexus SDK not available - bridge operation not supported');
    return { 
      success: false, 
      error: 'Nexus SDK not available. Please use alternative bridge methods.' 
    };
  }, []);

  const transfer = useCallback(async (params: TransferParams): Promise<TransferResult> => {
    console.warn('Nexus SDK not available - transfer operation not supported');
    return { 
      success: false, 
      error: 'Nexus SDK not available. Please use alternative transfer methods.' 
    };
  }, []);

  const simulateBridge = useCallback(async (params: BridgeParams): Promise<SimulationResult> => {
    console.warn('Nexus SDK not available - bridge simulation not supported');
    return { 
      success: false, 
      error: 'Nexus SDK not available. Bridge simulation not supported.' 
    };
  }, []);

  const simulateTransfer = useCallback(async (params: TransferParams): Promise<SimulationResult> => {
    console.warn('Nexus SDK not available - transfer simulation not supported');
    return { 
      success: false, 
      error: 'Nexus SDK not available. Transfer simulation not supported.' 
    };
  }, []);

  const refreshBalances = useCallback(async () => {
    console.warn('Nexus SDK not available - balance refresh not supported');
  }, []);

  const deinit = useCallback(async () => {
    console.warn('Nexus SDK not available - deinit not needed');
  }, []);

  const setOnIntentHook = useCallback((hook: OnIntentHook) => {
    console.warn('Nexus SDK not available - intent hook not supported');
  }, []);

  const setOnAllowanceHook = useCallback((hook: OnAllowanceHook) => {
    console.warn('Nexus SDK not available - allowance hook not supported');
  }, []);

  // Return fallback state
  return {
    isInitialized: false,
    isLoading: false,
    error: 'Nexus SDK not available - using fallback mode',
    balances: [],
    usdcBalance: null,
    progress: {
      isActive: false,
      currentStep: 0,
      totalSteps: 0,
      steps: [],
      currentStepData: null,
      error: 'Nexus SDK not available',
    },
    initialize,
    bridge,
    transfer,
    simulateBridge,
    simulateTransfer,
    refreshBalances,
    deinit,
    setOnIntentHook,
    setOnAllowanceHook,
  };
}
