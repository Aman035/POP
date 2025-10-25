'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@/hooks/use-wallet';
import { useReadContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ExternalLink, Coins } from 'lucide-react';
import { arbitrumSepolia } from 'wagmi/chains';
import { WalletLoading } from './wallet-loading';
import { WalletErrorBoundary } from './wallet-error-boundary';
import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';
import { IERC20_ABI } from '@/lib/contracts';
import { COLLATERAL_TOKEN_ADDRESS } from '@/lib/contracts';

interface WalletConnectButtonProps {
  className?: string;
  showChainSwitch?: boolean;
}

export function WalletConnectButton({ 
  className, 
  showChainSwitch = true 
}: WalletConnectButtonProps) {
  const { 
    isConnected, 
    isCorrectChain, 
    isConnecting,
    isSwitchingChain,
    address,
    error, 
    switchToArbitrumSepolia, 
    clearError 
  } = useWallet();
  
  // Get USDC balance using wagmi hook
  const { data: usdcBalance, isLoading: isLoadingBalance } = useReadContract({
    address: COLLATERAL_TOKEN_ADDRESS as `0x${string}`,
    abi: IERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && isCorrectChain && !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Format the balance for display
  const formattedBalance = usdcBalance ? formatUnits(usdcBalance as bigint, 6) : '0';

  const handleChainSwitch = async () => {
    try {
      await switchToArbitrumSepolia();
    } catch (err) {
      console.error('Failed to switch chain:', err);
    }
  };

  // Show loading state while connecting
  if (isConnecting) {
    return <WalletLoading className={className} />;
  }

  return (
    <WalletErrorBoundary>
      <div className="flex items-center gap-2">
        <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          // Note: If your app doesn't use authentication, you
          // can remove all 'authenticationStatus' checks
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus ||
              authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': 'true',
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <Button
                      onClick={openConnectModal}
                      className={`gold-gradient text-background font-semibold ${className}`}
                      size="sm"
                    >
                      <span className="hidden sm:inline">Connect Wallet</span>
                      <span className="sm:hidden">Connect</span>
                    </Button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <Button
                      onClick={openChainModal}
                      variant="destructive"
                      className={className}
                      size="sm"
                    >
                      <span className="hidden sm:inline">Wrong Network</span>
                      <span className="sm:hidden">Wrong Net</span>
                    </Button>
                  );
                }

                return (
                  <Button
                    onClick={openAccountModal}
                    variant="outline"
                    className={`bg-transparent ${className}`}
                    size="sm"
                  >
                    <span className="hidden sm:inline">
                      {account.displayName}
                      {account.displayBalance ? ` (${account.displayBalance})` : ''}
                    </span>
                    <span className="sm:hidden">
                      {account.displayName.split('...')[0]}...
                    </span>
                  </Button>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>

      {/* Network Info - Right Side */}
      {isConnected && isCorrectChain && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <span className="hidden sm:inline">Arbitrum Sepolia</span>
            <span className="sm:hidden">Arb Sepolia</span>
          </div>
        </div>
      )}

      {/* USDC Balance Display */}
      {isConnected && isCorrectChain && (
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Coins className="w-3 h-3 text-gold-2" />
            <span className="hidden sm:inline">
              {isLoadingBalance ? 'Loading...' : `${parseFloat(formattedBalance).toFixed(2)} USDC`}
            </span>
            <span className="sm:hidden">
              {isLoadingBalance ? '...' : `${parseFloat(formattedBalance).toFixed(1)} USDC`}
            </span>
          </div>
          {parseFloat(formattedBalance) === 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs hover:bg-gold-50 dark:hover:bg-gold-950"
              onClick={() => window.open('https://faucet.circle.com/', '_blank')}
              title="Get USDC from Circle Faucet"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      </div>

      {/* Chain Switch Button - Below */}
      {isConnected && !isCorrectChain && showChainSwitch && (
        <div className="mt-2">
          <Button
            onClick={handleChainSwitch}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isSwitchingChain}
          >
            {isSwitchingChain ? (
              <>
                <WalletLoading type="spinner" className="mr-2" />
                <span className="hidden sm:inline">Switching...</span>
                <span className="sm:hidden">Switch</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Switch to Arbitrum Sepolia</span>
                <span className="sm:hidden">Switch Network</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Error Display - Below */}
      {error && (
        <div className="mt-2">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-2 h-auto p-1"
              >
                ×
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </WalletErrorBoundary>
  );
}
