'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@/hooks/use-wallet';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { arbitrumSepolia } from 'wagmi/chains';
import { WalletLoading } from './wallet-loading';
import { WalletErrorBoundary } from './wallet-error-boundary';

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
    error, 
    switchToArbitrumSepolia, 
    clearError 
  } = useWallet();

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
      <div className="space-y-2">
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
                    >
                      Connect Wallet
                    </Button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <Button
                      onClick={openChainModal}
                      variant="destructive"
                      className={className}
                    >
                      Wrong network
                    </Button>
                  );
                }

                return (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={openAccountModal}
                      variant="outline"
                      className={`bg-transparent ${className}`}
                    >
                      {account.displayName}
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ''}
                    </Button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>

      {/* Chain Switch Button */}
      {isConnected && !isCorrectChain && showChainSwitch && (
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
              Switching...
            </>
          ) : (
            'Switch to Arbitrum Sepolia'
          )}
        </Button>
      )}

      {/* Error Display */}
      {error && (
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
      )}

      {/* Network Info */}
      {isConnected && isCorrectChain && (
        <div className="text-xs text-muted-foreground text-center">
          Connected to {arbitrumSepolia.name}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 h-auto p-1"
            onClick={() => window.open(arbitrumSepolia.blockExplorers?.default.url, '_blank')}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      )}
      </div>
    </WalletErrorBoundary>
  );
}
