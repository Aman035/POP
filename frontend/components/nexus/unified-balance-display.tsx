'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Coins, 
  RefreshCw, 
  ExternalLink, 
  TrendingUp, 
  Wallet,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useNexusSDK } from '@/components/providers/nexus-provider';
import { useWallet } from '@/hooks/wallet/use-wallet';
import { cn } from '@/lib/utils';

interface UnifiedBalanceDisplayProps {
  className?: string;
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function UnifiedBalanceDisplay({ 
  className,
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 10000
}: UnifiedBalanceDisplayProps) {
  const { isConnected, address } = useWallet();
  const { 
    isInitialized, 
    isLoading, 
    error, 
    balances, 
    usdcBalance, 
    refreshBalances 
  } = useNexusSDK();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('UnifiedBalanceDisplay state:', {
      isConnected,
      address,
      isInitialized,
      isLoading,
      error,
      balancesCount: balances.length,
      hasUsdcBalance: !!usdcBalance
    });
  }, [isConnected, address, isInitialized, isLoading, error, balances, usdcBalance]);

  // Auto refresh balances
  useEffect(() => {
    if (!autoRefresh || !isInitialized || !isConnected) return;

    const interval = setInterval(async () => {
      await refreshBalances();
      setLastRefresh(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, isInitialized, isConnected, refreshInterval, refreshBalances]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalances();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh balances:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatBalance = (balance: string | number, decimals: number = 6) => {
    const num = typeof balance === 'string' ? parseFloat(balance) : balance;
    if (num === 0) return '0.00';
    if (num < 0.01) return '< 0.01';
    return num.toFixed(2);
  };

  const getTotalValue = () => {
    return balances.reduce((total, asset) => {
      return total + (parseFloat(String(asset.balanceInFiat || '0')));
    }, 0);
  };

  const getChainBreakdown = (asset: any) => {
    if (!asset.breakdown || asset.breakdown.length === 0) return null;
    
    return asset.breakdown.map((chainBalance: any, index: number) => (
      <div key={index} className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{chainBalance.chain.name}</span>
        <span className="font-medium">{formatBalance(chainBalance.balance, 6)}</span>
      </div>
    ));
  };

  if (!isConnected) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gold-2" />
            Cross-Chain Portfolio
          </CardTitle>
          <CardDescription>
            Connect your wallet to view unified balances across all chains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to access cross-chain features
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!isInitialized && isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gold-2" />
            Cross-Chain Portfolio
          </CardTitle>
          <CardDescription>
            Initializing cross-chain SDK... Please sign the message in your wallet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-gold-2" />
            <p className="text-sm text-muted-foreground text-center">
              Waiting for wallet signature...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isInitialized && !isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gold-2" />
            Cross-Chain Portfolio
          </CardTitle>
          <CardDescription>
            SDK not initialized
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Please connect your wallet to initialize the cross-chain SDK'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gold-2" />
            Cross-Chain Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load cross-chain balances: {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm" 
            className="mt-4"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-gold-2" />
              Cross-Chain Portfolio
            </CardTitle>
            <CardDescription>
              Unified balances across {balances.length > 0 ? balances[0]?.breakdown?.length || 0 : 0} chains
            </CardDescription>
          </div>
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            disabled={isRefreshing || isLoading}
            className="h-8 w-8 p-0"
          >
            {isRefreshing || isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
        {lastRefresh && (
          <p className="text-xs text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Total Portfolio Value */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gold-1/10 to-gold-2/10 border border-gold-1/20">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gold-2" />
            <span className="font-semibold">Total Portfolio</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gold-2">
              ${getTotalValue().toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              Across all chains
            </div>
          </div>
        </div>

        {/* USDC Balance (Primary) */}
        {usdcBalance && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-blue-500" />
                <span className="font-medium">USDC</span>
                <Badge variant="secondary" className="text-xs">
                  Primary
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  {formatBalance(usdcBalance.balance)}
                </div>
                <div className="text-xs text-muted-foreground">
                  ${usdcBalance.balanceInFiat || '0.00'}
                </div>
              </div>
            </div>

            {showDetails && usdcBalance.breakdown && (
              <div className="pl-6 space-y-1">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Chain Breakdown:
                </div>
                {getChainBreakdown(usdcBalance)}
              </div>
            )}
          </div>
        )}

        {/* Other Assets */}
        {balances.filter(asset => asset.symbol !== 'USDC').map((asset, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
                <span className="font-medium">{asset.symbol}</span>
                <Badge variant="outline" className="text-xs">
                  {asset.breakdown?.length || 0} chains
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  {formatBalance(asset.balance)}
                </div>
                <div className="text-xs text-muted-foreground">
                  ${asset.balanceInFiat || '0.00'}
                </div>
              </div>
            </div>

            {showDetails && asset.breakdown && (
              <div className="pl-6 space-y-1">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Chain Breakdown:
                </div>
                {getChainBreakdown(asset)}
              </div>
            )}
          </div>
        ))}

        {/* No balances */}
        {balances.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No cross-chain balances found. Try bridging some tokens to get started.
            </AlertDescription>
          </Alert>
        )}

        {/* Success indicator */}
        {balances.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Cross-chain portfolio synced successfully</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
