'use client';

import React, { useEffect, useState } from 'react';
import { NexusShowcase } from '@/components/nexus/nexus-showcase';
import { NexusProvider, useNexusSDK } from '@/components/providers/nexus-provider';
import { useWallet } from '@/hooks/use-wallet';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ExternalLink } from 'lucide-react';

function NexusPageContent() {
  const { isConnected, address } = useWallet();
  const { initialize, isInitialized, error, isLoading } = useNexusSDK();
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  // Check current chain
  useEffect(() => {
    const checkChain = async () => {
      if (window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setCurrentChainId(parseInt(chainId, 16));
        } catch (error) {
          console.error('Failed to get chain ID:', error);
        }
      }
    };
    
    checkChain();
  }, []);

  // Initialize Nexus SDK when wallet is connected - let SDK handle chain management
  useEffect(() => {
    console.log('Nexus page effect:', { isConnected, address, isInitialized, hasEthereum: !!window.ethereum });
    
    if (isConnected && address && !isInitialized && window.ethereum) {
      console.log('Attempting to initialize Nexus SDK...');
      console.log('Note: SDK will request signature and may prompt for network switch');
      initialize(window.ethereum).catch(err => {
        console.error('Failed to initialize Nexus SDK:', err);
      });
    }
  }, [isConnected, address, isInitialized, initialize]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-4">
            Cross-Chain DeFi Experience
          </h1>
          <p className="text-xl text-center text-muted-foreground max-w-3xl mx-auto">
            Experience the power of cross-chain operations with Avail Nexus. 
            Bridge tokens, manage unified balances, and interact with DeFi protocols 
            across multiple testnet chains seamlessly.
          </p>
        </div>

        {/* SDK Info Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription>
            <div>
              <strong className="text-blue-900 dark:text-blue-100">Cross-Chain Features Powered by Avail Nexus</strong>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Nexus SDK will request a signature to enable cross-chain operations. The SDK manages its own 
                chain switching and network selection. You can bridge tokens across multiple testnet chains seamlessly.
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                <strong>Note:</strong> The main POP app requires Arbitrum Sepolia, but cross-chain features work across all supported testnets.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <div className="text-sm space-y-1">
              <div>Wallet Connected: {isConnected ? '✅' : '❌'}</div>
              <div>Address: {address || 'None'}</div>
              <div>Current Chain ID: {currentChainId || 'Unknown'}</div>
              <div>Nexus Initialized: {isInitialized ? '✅' : '❌'}</div>
              <div>Loading: {isLoading ? '⏳' : '✅'}</div>
              <div>Note: Nexus SDK handles its own chain management</div>
              {error && <div className="text-red-600">Error: {error}</div>}
            </div>
          </div>
        )}

        <NexusShowcase />
      </div>
    </div>
  );
}

export default function NexusPage() {
  return (
    <NexusProvider>
      <NexusPageContent />
    </NexusProvider>
  );
}
