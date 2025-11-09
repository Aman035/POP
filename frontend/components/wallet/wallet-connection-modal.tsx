'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/wallet/use-wallet';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WalletConnectButton } from './wallet-connect-button';
import { WalletLoading } from './wallet-loading';
import { AlertCircle, Wallet, Shield, Zap } from 'lucide-react';

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectionModal({ isOpen, onClose }: WalletConnectionModalProps) {
  const { 
    isConnected, 
    isCorrectChain, 
    isConnecting, 
    isSwitchingChain,
    error,
    clearError 
  } = useWallet();

  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  const handleConnect = async () => {
    setIsConnectingWallet(true);
    try {
      // The actual connection is handled by the WalletConnectButton
      // This is just for UI feedback
    } catch (err) {
      console.error('Connection error:', err);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleClose = () => {
    if (!isConnecting && !isSwitchingChain) {
      clearError();
      onClose();
    }
  };

  // Auto-close when wallet is connected and on correct chain
  if (isConnected && isCorrectChain && isOpen) {
    setTimeout(() => {
      onClose();
    }, 1000);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-background border-border shadow-xl backdrop-blur-sm" style={{ backgroundColor: 'hsl(var(--background))' }}>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 gold-gradient rounded-full flex items-center justify-center">
            <Wallet className="w-8 h-8 text-background" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription className="text-base">
            Connect your wallet to access prediction markets and start betting on social media polls.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 bg-background">
          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Secure & Transparent</p>
                <p className="text-xs text-muted-foreground">All transactions are verifiable onchain</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Instant Markets</p>
                <p className="text-xs text-muted-foreground">Turn any poll into a prediction market</p>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          {isConnected && !isCorrectChain && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please switch to BSC Testnet to continue.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Connect Button */}
          <div className="space-y-3">
            {isConnecting || isSwitchingChain ? (
              <div className="flex items-center justify-center p-4">
                <WalletLoading type="spinner" className="mr-2" />
                <span className="text-sm text-muted-foreground">
                  {isConnecting ? 'Connecting...' : 'Switching network...'}
                </span>
              </div>
            ) : (
              <WalletConnectButton 
                className="w-full" 
                showChainSwitch={true}
              />
            )}
          </div>

          {/* Success Message */}
          {isConnected && isCorrectChain && (
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-800 dark:text-green-200 font-medium">
                Wallet connected successfully!
              </p>
              <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                Redirecting to the app...
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By connecting your wallet, you agree to our terms of service.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
