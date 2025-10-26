'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  RefreshCw, 
  ExternalLink,
  Loader2,
  Wallet,
  Zap
} from 'lucide-react';
import { useEthBalance } from '@/hooks/use-eth-balance';
import { useWallet } from '@/hooks/use-wallet';
import { toast } from '@/hooks/use-toast';

interface EthBalanceCheckerProps {
  onBalanceSufficient: () => void;
  onBalanceInsufficient: () => void;
  minimumRequired?: string;
}

export function EthBalanceChecker({ 
  onBalanceSufficient, 
  onBalanceInsufficient, 
  minimumRequired = '0.001' 
}: EthBalanceCheckerProps) {
  const [selectedSourceChain, setSelectedSourceChain] = useState<string>('');
  const [bridgeAmount, setBridgeAmount] = useState<string>('0.01');
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  
  const {
    balance,
    balanceFormatted,
    hasInsufficientBalance,
    isLoading,
    error,
    isBridging,
    bridgeError,
    bridgeSuccess,
    availableChains,
    sourceChain,
    targetChain,
    checkBalance,
    bridgeEthFromOtherChain,
    getAvailableChains,
    refreshBalance,
  } = useEthBalance();

  const { isConnected, isCorrectChain, switchToArbitrumSepolia } = useWallet();

  // Initialize available chains
  useEffect(() => {
    const initChains = async () => {
      setIsInitializing(true);
      try {
        const chains = await getAvailableChains();
        if (chains.length > 0) {
          setSelectedSourceChain(chains[0]);
        }
      } catch (err) {
        console.error('Failed to initialize chains:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    if (isConnected) {
      initChains();
    }
  }, [isConnected, getAvailableChains]);

  // Handle balance changes
  useEffect(() => {
    if (hasInsufficientBalance) {
      onBalanceInsufficient();
    } else if (!isLoading && !error) {
      onBalanceSufficient();
    }
  }, [hasInsufficientBalance, isLoading, error, onBalanceSufficient, onBalanceInsufficient]);

  // Handle bridge success
  useEffect(() => {
    if (bridgeSuccess) {
      toast({
        title: "Bridge Successful!",
        description: "ETH has been bridged to Arbitrum Sepolia. Your balance will update shortly.",
      });
      
      // Refresh balance after successful bridge
      setTimeout(() => {
        refreshBalance();
      }, 2000);
    }
  }, [bridgeSuccess, refreshBalance]);

  const handleBridge = async () => {
    if (!selectedSourceChain || !bridgeAmount) {
      toast({
        title: "Missing Information",
        description: "Please select a source chain and enter an amount to bridge.",
        variant: "destructive"
      });
      return;
    }

    // Validate amount
    const amountNum = parseFloat(bridgeAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid ETH amount.",
        variant: "destructive"
      });
      return;
    }

    if (amountNum < 0.001) {
      toast({
        title: "Amount Too Small",
        description: "Minimum bridge amount is 0.001 ETH.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Starting Bridge",
        description: `Bridging ${bridgeAmount} ETH from ${selectedSourceChain} to Arbitrum Sepolia...`,
      });

      const success = await bridgeEthFromOtherChain(selectedSourceChain, bridgeAmount);
      if (success) {
        console.log('Bridge initiated successfully');
      } else {
        toast({
          title: "Bridge Failed",
          description: "Failed to initiate bridge. Please try again.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Bridge failed:', err);
      toast({
        title: "Bridge Error",
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  const handleSwitchChain = async () => {
    try {
      await switchToArbitrumSepolia();
      toast({
        title: "Switching Network",
        description: "Please confirm the network switch in your wallet.",
      });
    } catch (err) {
      console.error('Failed to switch chain:', err);
    }
  };

  if (!isConnected) {
    return (
      <Card className="p-6 bg-background border-border">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto">
            <Wallet className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Wallet Not Connected</h3>
            <p className="text-sm text-muted-foreground">
              Please connect your wallet to check your ETH balance and create markets.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!isCorrectChain) {
    return (
      <Card className="p-6 bg-background border-border">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Unsupported Network</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please switch to Ethereum mainnet or Arbitrum Sepolia to create markets.
            </p>
            <Button onClick={handleSwitchChain} className="w-full">
              Switch to Arbitrum Sepolia
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Balance Status */}
      <Card className="p-4 bg-background border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              hasInsufficientBalance ? 'bg-red-500/10' : 'bg-green-500/10'
            }`}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : hasInsufficientBalance ? (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">ETH Balance</p>
              <p className="text-lg font-bold">{balanceFormatted} ETH</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshBalance}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {hasInsufficientBalance ? (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              Insufficient ETH balance. You need at least {minimumRequired} ETH to create markets.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              Sufficient ETH balance. You can proceed with market creation.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Cross-Chain Bridge Section */}
      {hasInsufficientBalance && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Bridge ETH from Another Chain</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use Avail Nexus to bridge ETH from other testnets to Arbitrum Sepolia.
              </p>
            </div>

            {/* Bridge Form */}
            <div className="space-y-4">
              {/* Source Chain Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Source Chain</label>
                <select
                  value={selectedSourceChain}
                  onChange={(e) => setSelectedSourceChain(e.target.value)}
                  className="w-full p-3 border border-border rounded-lg bg-background"
                  disabled={isInitializing || isBridging}
                >
                  <option value="">Select source chain</option>
                  {availableChains.map((chain) => (
                    <option key={chain} value={chain}>
                      {chain.charAt(0).toUpperCase() + chain.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount to Bridge (ETH)</label>
                <input
                  type="number"
                  value={bridgeAmount}
                  onChange={(e) => setBridgeAmount(e.target.value)}
                  placeholder="0.01"
                  min="0.001"
                  step="0.001"
                  className="w-full p-3 border border-border rounded-lg bg-background"
                  disabled={isBridging}
                />
              </div>

              {/* Bridge Button */}
              <Button
                onClick={handleBridge}
                disabled={!selectedSourceChain || !bridgeAmount || isBridging || isInitializing}
                className="w-full gold-gradient text-background font-semibold"
              >
                {isBridging ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Bridging ETH...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Bridge ETH to Arbitrum Sepolia
                  </>
                )}
              </Button>

              {/* Bridge Status */}
              {isBridging && (
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Bridging in Progress</p>
                      <p className="text-xs text-muted-foreground">
                        From {sourceChain} to {targetChain}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bridge Error */}
              {bridgeError && (
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    {bridgeError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Bridge Success */}
              {bridgeSuccess && (
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    ETH successfully bridged! Your balance will update shortly.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Help Text */}
            <div className="text-xs text-muted-foreground">
              <p>
                💡 Tip: You can get testnet ETH from faucets like:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  <a href="https://faucet.quicknode.com/arbitrum/sepolia" target="_blank" rel="noopener noreferrer">
                    Arbitrum Sepolia Faucet
                  </a>
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  <a href="https://sepoliafaucet.com/" target="_blank" rel="noopener noreferrer">
                    Sepolia Faucet
                  </a>
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700 dark:text-red-300">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
