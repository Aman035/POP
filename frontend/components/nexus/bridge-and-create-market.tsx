'use client';

import React, { useState } from 'react';
import { BridgeAndExecuteButton } from '@avail-project/nexus-widgets';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/utils/use-toast';
import { parseUnits } from 'viem';

interface BridgeAndCreateMarketProps {
  onSuccess?: (marketAddress: string, txHash: string) => void;
  onError?: (error: string) => void;
  marketParams: {
    identifier: string;
    options: string[];
    endTime: number;
    creatorFeeBps: number;
    question: string;
    description: string;
    category: string;
    platform: number;
    resolutionSource: string;
  };
  className?: string;
  children?: React.ReactNode;
}

export function BridgeAndCreateMarket({ 
  onSuccess, 
  onError, 
  marketParams,
  className = '',
  children 
}: BridgeAndCreateMarketProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');

  const handleStart = () => {
    setIsProcessing(true);
    setStatus('Preparing cross-chain transaction...');
  };

  const handleSuccess = () => {
    setIsProcessing(false);
    setStatus('Market created successfully!');
    toast({
      title: "Market Created",
      description: "Your prediction market has been deployed to Arbitrum Sepolia",
    });
    // Note: In a real implementation, you'd get the actual contract address from the transaction
    onSuccess?.('0x...', '0x...');
  };

  const handleError = (error: any) => {
    setIsProcessing(false);
    const errorMessage = error?.message || 'Transaction failed';
    setStatus(`Failed: ${errorMessage}`);
    toast({
      title: "Transaction Failed",
      description: errorMessage,
      variant: "destructive"
    });
    onError?.(errorMessage);
  };

  return (
    <div className="space-y-4">
      <BridgeAndExecuteButton
        contractAddress="0x0000000000000000000000000000000000000000" // MarketFactory address - you'll need to replace this
        contractAbi={[
          {
            name: 'createMarket',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'identifier', type: 'uint256' },
              { name: 'options', type: 'string[]' },
              { name: 'endTime', type: 'uint256' },
              { name: 'creatorFeeBps', type: 'uint256' },
              { name: 'question', type: 'string' },
              { name: 'description', type: 'string' },
              { name: 'category', type: 'string' },
              { name: 'platform', type: 'uint8' },
              { name: 'resolutionSource', type: 'string' }
            ],
            outputs: [],
          },
        ] as const}
        functionName="createMarket"
        buildFunctionParams={(token, amount, chainId, userAddress) => {
          // For ETH bridging, we don't need token parameters
          return {
            functionParams: [
              marketParams.identifier,
              marketParams.options,
              marketParams.endTime,
              marketParams.creatorFeeBps,
              marketParams.question,
              marketParams.description,
              marketParams.category,
              marketParams.platform,
              marketParams.resolutionSource
            ],
            value: parseUnits(amount, 18).toString(), // ETH value for gas
          };
        }}
        prefill={{
          toChainId: 421614, // Arbitrum Sepolia
          token: 'ETH',
          amount: '0.01', // Bridge 0.01 ETH
        }}
      >
        {({ onClick, isLoading, disabled }) => (
          <Button
            onClick={async () => {
              try {
                handleStart();
                await onClick();
                handleSuccess();
              } catch (error) {
                handleError(error);
              }
            }}
            disabled={isLoading || isProcessing || disabled}
            className={`w-full gold-gradient text-background font-semibold ${className}`}
            size="lg"
          >
            {isLoading || isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isProcessing ? 'Creating Market...' : 'Preparing Transaction...'}
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                {children || 'Bridge ETH & Create Market'}
              </>
            )}
          </Button>
        )}
      </BridgeAndExecuteButton>

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
    </div>
  );
}
