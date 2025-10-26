'use client';

import React, { useState } from 'react';
import { BridgeAndExecuteButton } from '@avail-project/nexus-widgets';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/utils/use-toast';
import { parseUnits } from 'viem';
import { BridgeAndBetProgress } from '@/components/ui/progress-bar';
import { MARKET_ABI } from '@/lib/contracts';

interface BridgeAndBetButtonProps {
  marketAddress: string;
  option: number;
  amount: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export function BridgeAndBetButton({ 
  marketAddress,
  option,
  amount,
  onSuccess, 
  onError, 
  className = '',
  children 
}: BridgeAndBetButtonProps) {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <BridgeAndExecuteButton
        contractAddress={marketAddress as `0x${string}`}
        contractAbi={MARKET_ABI}
        functionName="placeBet"
        buildFunctionParams={(token, amount, chainId, user) => {
          // The amount bridged will be in the token specified in prefill (USDC)
          // Convert to proper decimals based on token
          const decimals = token === 'USDC' || token === 'USDT' ? 6 : 18;
          const amountWei = parseUnits(amount, decimals);
          
          console.log('Bridge & Bet params:', {
            token,
            amount,
            amountWei: amountWei.toString(),
            chainId,
            user,
            option,
            marketAddress
          });
          
          return {
            functionParams: [option, amountWei],
          };
        }}
        prefill={{
          toChainId: 421614, // Arbitrum Sepolia
          token: 'USDC', // Bridge USDC (will convert from ETH automatically)
          amount: amount, // Use the bet amount
        }}
      >
        {({ onClick, isLoading, disabled }) => (
          <Button
            onClick={async () => {
              try {
                setStatus('Processing bridge and bet transaction...');
                setError(null);
                await onClick();
                setStatus('Transaction completed successfully!');
                toast({
                  title: "Success!",
                  description: "Bridge and bet completed successfully",
                });
                onSuccess?.(''); // Empty hash since we don't get it from the widget
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
                setError(errorMessage);
                setStatus(`Failed: ${errorMessage}`);
                toast({
                  title: "Transaction Failed",
                  description: errorMessage,
                  variant: "destructive"
                });
                onError?.(errorMessage);
              }
            }}
            disabled={isLoading || disabled}
            className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${className}`}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Bridge & Place Bet...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                {children || 'Bridge USDC & Place Bet'}
              </>
            )}
          </Button>
        )}
      </BridgeAndExecuteButton>

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
    </div>
  );
}
