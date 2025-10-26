'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { NexusSDK } from '@avail-project/nexus-core';
import type {
  NexusNetwork,
  UserAsset,
  BridgeParams,
  BridgeResult,
  TransferParams,
  TransferResult,
  SimulationResult,
  ProgressStep,
  OnIntentHook,
  OnAllowanceHook,
} from '@avail-project/nexus-core';
import { NEXUS_EVENTS } from '@avail-project/nexus-core';

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

export function useNexusSDK(): NexusSDKState & NexusSDKActions & {
  progress: ProgressState;
  setOnIntentHook: (hook: OnIntentHook) => void;
  setOnAllowanceHook: (hook: OnAllowanceHook) => void;
} {
  const [state, setState] = useState<NexusSDKState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    balances: [],
    usdcBalance: null,
  });

  const [progress, setProgress] = useState<ProgressState>({
    isActive: false,
    currentStep: 0,
    totalSteps: 0,
    steps: [],
    currentStepData: null,
    error: null,
  });

  const sdkRef = useRef<NexusSDK | null>(null);
  const unsubscribeRefs = useRef<(() => void)[]>([]);

  // Initialize SDK
  const initialize = useCallback(async (provider: any) => {
    if (sdkRef.current) {
      await sdkRef.current.deinit();
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Initialize Nexus SDK - let it handle its own chain management
      const sdk = new NexusSDK({ network: 'testnet' as NexusNetwork });
      console.log('Initializing Nexus SDK with testnet...');
      console.log('Nexus SDK will handle chain switching and management');
      
      // Add timeout for SDK initialization
      const initTimeout = setTimeout(() => {
        console.warn('SDK initialization is taking longer than expected...');
      }, 5000);

      await sdk.initialize(provider);
      clearTimeout(initTimeout);
      console.log('Nexus SDK initialized successfully');
      
      sdkRef.current = sdk;

      // Set up event listeners
      setupEventListeners(sdk);

      // Mark as initialized before trying to get balances
      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
      }));

      // Try to get initial balances asynchronously (don't block initialization)
      try {
        console.log('Fetching initial balances...');
        const balances = await Promise.race([
          sdk.getUnifiedBalances(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Balance fetch timeout')), 10000))
        ]) as any[];
        
        const usdcBalance = await Promise.race([
          sdk.getUnifiedBalance('USDC'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('USDC balance timeout')), 10000))
        ]);

        console.log('Balances fetched:', { balances, usdcBalance });
        setState(prev => ({
          ...prev,
          balances: balances || [],
          usdcBalance: usdcBalance || null,
        }));
      } catch (balanceError) {
        console.warn('Failed to fetch balances (non-critical):', balanceError);
        // Don't fail initialization if balance fetch fails
        setState(prev => ({
          ...prev,
          balances: [],
          usdcBalance: null,
        }));
      }
    } catch (error) {
      console.error('Failed to initialize Nexus SDK:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        provider: !!provider,
        network: 'testnet'
      });
      
      // Check if it's a chunk loading error
      const isChunkError = error instanceof Error && 
        (error.message.includes('ChunkLoadError') || 
         error.message.includes('Loading chunk') ||
         error.message.includes('Loading CSS chunk'));
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isInitialized: false,
        error: isChunkError 
          ? 'SDK loading failed. Please refresh the page and try again.'
          : error instanceof Error ? error.message : 'Failed to initialize SDK',
      }));
    }
  }, []);

  // Set up event listeners
  const setupEventListeners = useCallback((sdk: NexusSDK) => {
    // Clean up existing listeners
    unsubscribeRefs.current.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    unsubscribeRefs.current = [];

    // Bridge & Execute Progress
    const unsubscribeBridgeExecuteExpected = sdk.nexusEvents.on(
      NEXUS_EVENTS.BRIDGE_EXECUTE_EXPECTED_STEPS,
      (steps: ProgressStep[]) => {
        setProgress(prev => ({
          ...prev,
          isActive: true,
          totalSteps: steps.length,
          steps,
          currentStep: 0,
          error: null,
        }));
      }
    );

    const unsubscribeBridgeExecuteCompleted = sdk.nexusEvents.on(
      NEXUS_EVENTS.BRIDGE_EXECUTE_COMPLETED_STEPS,
      (step: ProgressStep) => {
        setProgress(prev => ({
          ...prev,
          currentStep: prev.currentStep + 1,
          currentStepData: step,
        }));
      }
    );

    // Transfer & Bridge Progress
    const unsubscribeTransferExpected = sdk.nexusEvents.on(
      NEXUS_EVENTS.EXPECTED_STEPS,
      (steps: ProgressStep[]) => {
        setProgress(prev => ({
          ...prev,
          isActive: true,
          totalSteps: steps.length,
          steps,
          currentStep: 0,
          error: null,
        }));
      }
    );

    const unsubscribeTransferCompleted = sdk.nexusEvents.on(
      NEXUS_EVENTS.STEP_COMPLETE,
      (step: ProgressStep) => {
        setProgress(prev => ({
          ...prev,
          currentStep: prev.currentStep + 1,
          currentStepData: step,
        }));
      }
    );

    // Store unsubscribe functions
    unsubscribeRefs.current = [
      unsubscribeBridgeExecuteExpected,
      unsubscribeBridgeExecuteCompleted,
      unsubscribeTransferExpected,
      unsubscribeTransferCompleted,
    ];
  }, []);

  // Bridge tokens
  const bridge = useCallback(async (params: BridgeParams): Promise<BridgeResult> => {
    if (!sdkRef.current) {
      throw new Error('SDK not initialized');
    }

    setProgress(prev => ({ ...prev, isActive: true, error: null }));
    
    try {
      const result = await sdkRef.current.bridge(params);
      
      if (result.success) {
        // Refresh balances after successful bridge
        await refreshBalances();
      }
      
      setProgress(prev => ({ ...prev, isActive: false }));
      return result;
    } catch (error) {
      setProgress(prev => ({ 
        ...prev, 
        isActive: false, 
        error: error instanceof Error ? error.message : 'Bridge failed' 
      }));
      throw error;
    }
  }, []);

  // Transfer tokens
  const transfer = useCallback(async (params: TransferParams): Promise<TransferResult> => {
    if (!sdkRef.current) {
      throw new Error('SDK not initialized');
    }

    setProgress(prev => ({ ...prev, isActive: true, error: null }));
    
    try {
      const result = await sdkRef.current.transfer(params);
      
      if (result.success) {
        // Refresh balances after successful transfer
        await refreshBalances();
      }
      
      setProgress(prev => ({ ...prev, isActive: false }));
      return result;
    } catch (error) {
      setProgress(prev => ({ 
        ...prev, 
        isActive: false, 
        error: error instanceof Error ? error.message : 'Transfer failed' 
      }));
      throw error;
    }
  }, []);

  // Simulate bridge
  const simulateBridge = useCallback(async (params: BridgeParams): Promise<SimulationResult> => {
    if (!sdkRef.current) {
      throw new Error('SDK not initialized');
    }

    return await sdkRef.current.simulateBridge(params);
  }, []);

  // Simulate transfer
  const simulateTransfer = useCallback(async (params: TransferParams): Promise<SimulationResult> => {
    if (!sdkRef.current) {
      throw new Error('SDK not initialized');
    }

    return await sdkRef.current.simulateTransfer(params);
  }, []);

  // Refresh balances
  const refreshBalances = useCallback(async () => {
    if (!sdkRef.current) return;

    try {
      const balances = await sdkRef.current.getUnifiedBalances();
      const usdcBalance = await sdkRef.current.getUnifiedBalance('USDC');

      setState(prev => ({
        ...prev,
        balances,
        usdcBalance: usdcBalance || null,
      }));
    } catch (error) {
      console.error('Failed to refresh balances:', error);
    }
  }, []);

  // Set intent hook
  const setOnIntentHook = useCallback((hook: OnIntentHook) => {
    if (sdkRef.current) {
      sdkRef.current.setOnIntentHook(hook);
    }
  }, []);

  // Set allowance hook
  const setOnAllowanceHook = useCallback((hook: OnAllowanceHook) => {
    if (sdkRef.current) {
      sdkRef.current.setOnAllowanceHook(hook);
    }
  }, []);

  // Deinitialize
  const deinit = useCallback(async () => {
    if (sdkRef.current) {
      // Clean up event listeners
      unsubscribeRefs.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      unsubscribeRefs.current = [];

      await sdkRef.current.deinit();
      sdkRef.current = null;
    }

    setState({
      isInitialized: false,
      isLoading: false,
      error: null,
      balances: [],
      usdcBalance: null,
    });

    setProgress({
      isActive: false,
      currentStep: 0,
      totalSteps: 0,
      steps: [],
      currentStepData: null,
      error: null,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeRefs.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      if (sdkRef.current) {
        sdkRef.current.deinit();
      }
    };
  }, []);

  return {
    ...state,
    progress,
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
