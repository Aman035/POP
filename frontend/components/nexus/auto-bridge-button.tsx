'use client';

import React, { useState } from 'react';
import { BridgeButton } from '@avail-project/nexus-widgets';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AutoBridgeButtonProps {
  onBridgeSuccess?: () => void;
  onBridgeError?: (error: string) => void;
  bridgeAmount?: string;
  className?: string;
  children?: React.ReactNode;
}

export function AutoBridgeButton({ 
  onBridgeSuccess, 
  onBridgeError, 
  bridgeAmount = '0.01',
  className = '',
  children 
}: AutoBridgeButtonProps) {
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<string>('');

  const handleBridgeStart = () => {
    setIsBridging(true);
    setBridgeStatus('Preparing bridge...');
  };

  const handleBridgeComplete = () => {
    setIsBridging(false);
    setBridgeStatus('Bridge completed successfully!');
    toast({
      title: "Bridge Successful",
      description: "ETH has been bridged to Arbitrum Sepolia",
    });
    onBridgeSuccess?.();
  };

  const handleBridgeError = (error: any) => {
    setIsBridging(false);
    const errorMessage = error?.message || 'Bridge failed';
    setBridgeStatus(`Bridge failed: ${errorMessage}`);
    toast({
      title: "Bridge Failed",
      description: errorMessage,
      variant: "destructive"
    });
    onBridgeError?.(errorMessage);
  };

  return (
    <div className="space-y-4">
      <BridgeButton 
        prefill={{ 
          chainId: 421614, // Arbitrum Sepolia
          token: 'ETH', 
          amount: bridgeAmount 
        }}
      >
        {({ onClick, isLoading }) => (
          <Button
            onClick={async () => {
              try {
                handleBridgeStart();
                await onClick();
                handleBridgeComplete();
              } catch (error) {
                handleBridgeError(error);
              }
            }}
            disabled={isLoading || isBridging}
            className={`w-full gold-gradient text-background font-semibold ${className}`}
            size="lg"
          >
            {isLoading || isBridging ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isBridging ? 'Bridging ETH...' : 'Preparing Bridge...'}
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                {children || `Bridge ${bridgeAmount} ETH to Arbitrum Sepolia`}
              </>
            )}
          </Button>
        )}
      </BridgeButton>

      {bridgeStatus && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          bridgeStatus.includes('failed') || bridgeStatus.includes('error')
            ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
            : bridgeStatus.includes('completed') || bridgeStatus.includes('successful')
            ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800'
            : 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800'
        }`}>
          {bridgeStatus.includes('failed') || bridgeStatus.includes('error') ? (
            <AlertCircle className="w-4 h-4 text-red-500" />
          ) : bridgeStatus.includes('completed') || bridgeStatus.includes('successful') ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          )}
          <span className={`text-sm ${
            bridgeStatus.includes('failed') || bridgeStatus.includes('error')
              ? 'text-red-700 dark:text-red-300'
              : bridgeStatus.includes('completed') || bridgeStatus.includes('successful')
              ? 'text-green-700 dark:text-green-300'
              : 'text-blue-700 dark:text-blue-300'
          }`}>
            {bridgeStatus}
          </span>
        </div>
      )}
    </div>
  );
}
