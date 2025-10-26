'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@/hooks/wallet/use-wallet';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { arbitrumSepolia } from 'wagmi/chains';
import { WalletLoading } from './wallet-loading';
import { WalletErrorBoundary } from './wallet-error-boundary';

interface WalletConnectCompactProps {
  className?: string;
}

export function WalletConnectCompact({ className }: WalletConnectCompactProps) {
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
      <div className="flex items-center gap-1">
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
                        Connect
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
                        Wrong Net
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
                      {account.displayName.split('...')[0]}...
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
            <div className="w-2 h-2 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <span>Arb Sepolia</span>
          </div>
        </div>
      )}
      </div>

      {/* Chain Switch Button - Below */}
      {isConnected && !isCorrectChain && (
        <div className="mt-1">
          <Button
            onClick={handleChainSwitch}
            variant="outline"
            size="sm"
            className="w-full text-xs"
            disabled={isSwitchingChain}
          >
            {isSwitchingChain ? (
              <>
                <WalletLoading type="spinner" className="mr-1" />
                Switch
              </>
            ) : (
              'Switch Net'
            )}
          </Button>
        </div>
      )}

      {/* Error Display - Below */}
      {error && (
        <div className="mt-1">
          <Alert variant="destructive" className="text-xs">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="flex items-center justify-between">
              <span className="truncate">{error}</span>
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
