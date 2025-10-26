'use client';

import React, { useState } from 'react';
import { BridgeButton } from '@avail-project/nexus-widgets';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/utils/use-toast';

interface SimpleBridgeWidgetProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export function SimpleBridgeWidget({ 
  onSuccess, 
  onError, 
  className = '',
  children 
}: SimpleBridgeWidgetProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [txHash, setTxHash] = useState<string | undefined>();

  const handleStart = () => {
    setIsProcessing(true);
    setStatus('Starting bridge process...');
  };

  const handleSuccess = (txHash: string) => {
    setTxHash(txHash);
    setIsProcessing(false);
    setStatus('Bridge completed successfully!');
    toast({
      title: "Bridge Successful",
      description: "ETH bridged to Arbitrum Sepolia successfully",
    });
    onSuccess?.();
  };

  const handleError = (error: any) => {
    setIsProcessing(false);
    const errorMessage = error?.message || 'Bridge failed';
    setStatus(`Failed: ${errorMessage}`);
    toast({
      title: "Bridge Failed",
      description: errorMessage,
      variant: "destructive"
    });
    onError?.(errorMessage);
  };

  return (
    <div className="space-y-4">
      <BridgeButton
        prefill={{
          toChainId: 421614, // Arbitrum Sepolia
          token: 'USDC', // Bridge USDC (will convert from ETH on source chain)
        }}
        onBridgeStart={handleStart}
        onBridgeSuccess={handleSuccess}
        onBridgeError={handleError}
      >
        {({ onClick, isLoading, disabled }) => (
          <Button
            onClick={async () => {
              try {
                await onClick();
              } catch (error) {
                handleError(error);
              }
            }}
            disabled={isLoading || isProcessing || disabled}
            className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${className}`}
            size="lg"
          >
            {isLoading || isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Bridging ETH...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                {children || 'Bridge ETH to Arbitrum Sepolia'}
              </>
            )}
          </Button>
        )}
      </BridgeButton>

      {/* Status Message */}
      {status && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          status.includes('Failed') || status.includes('error')
            ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
            : status.includes('successfully') || status.includes('successful')
            ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800'
            : 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800'
        }`}>
          {status.includes('Failed') || status.includes('error') ? (
            <AlertCircle className="w-4 h-4 text-red-500" />
          ) : status.includes('successfully') || status.includes('successful') ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <Clock className="w-4 h-4 animate-pulse text-blue-500" />
          )}
          <span className={`text-sm ${
            status.includes('Failed') || status.includes('error')
              ? 'text-red-700 dark:text-red-300'
              : status.includes('successfully') || status.includes('successful')
              ? 'text-green-700 dark:text-green-300'
              : 'text-blue-700 dark:text-blue-300'
          }`}>
            {status}
          </span>
        </div>
      )}

      {/* Transaction Hash */}
      {txHash && (
        <div className="p-3 rounded-lg bg-background border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Transaction Hash:</span>
            <a
              href={`https://sepolia.arbiscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View on Arbiscan
            </a>
          </div>
          <code className="text-xs font-mono text-muted-foreground break-all mt-1 block">
            {txHash}
          </code>
        </div>
      )}
    </div>
  );
}
