'use client';

import { Button } from '@/components/ui/button';
import { ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { arbitrumSepolia } from 'wagmi/chains';
import { useAccount } from 'wagmi';

interface NetworkIndicatorProps {
  isConnected: boolean;
  isCorrectChain: boolean;
  className?: string;
  compact?: boolean;
}

export function NetworkIndicator({ 
  isConnected, 
  isCorrectChain, 
  className = '',
  compact = false 
}: NetworkIndicatorProps) {
  const { chainId } = useAccount();
  
  if (!isConnected) {
    return null;
  }

  // Get network info based on chain ID
  const getNetworkInfo = () => {
    if (chainId === 1) {
      return {
        name: 'Ethereum',
        shortName: 'ETH',
        explorerUrl: 'https://etherscan.io',
        color: 'from-blue-400 to-blue-600'
      };
    } else if (chainId === arbitrumSepolia.id) {
      return {
        name: 'Arbitrum Sepolia',
        shortName: 'Arb Sepolia',
        explorerUrl: arbitrumSepolia.blockExplorers?.default.url || 'https://sepolia.arbiscan.io',
        color: 'from-blue-400 to-blue-600'
      };
    }
    return {
      name: 'Unknown Network',
      shortName: 'Unknown',
      explorerUrl: '#',
      color: 'from-gray-400 to-gray-600'
    };
  };

  const networkInfo = getNetworkInfo();

  const handleExplorerClick = () => {
    window.open(networkInfo.explorerUrl, '_blank');
  };

  if (!isCorrectChain) {
    return (
      <div className={`flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 ${className}`}>
        <WifiOff className="h-3 w-3" />
        <span className={compact ? 'hidden' : 'sm:inline'}>Wrong Network</span>
        <span className={compact ? 'sm:hidden' : 'hidden sm:hidden'}>Wrong Net</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 text-xs text-muted-foreground ${className}`}>
      <div className="flex items-center gap-1">
        {/* Network indicator */}
        <div className="relative">
          <div className={`w-3 h-3 bg-gradient-to-br ${networkInfo.color} rounded-full flex items-center justify-center shadow-sm`}>
            <div className="w-1.5 h-1.5 bg-white rounded-full opacity-90"></div>
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full border border-white"></div>
        </div>
        
        <span className={compact ? 'hidden sm:inline' : 'hidden sm:inline'}>
          {networkInfo.name}
        </span>
        <span className={compact ? 'sm:hidden' : 'sm:hidden'}>
          {networkInfo.shortName}
        </span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-1 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
        onClick={handleExplorerClick}
        title={`View on ${networkInfo.name} Explorer`}
      >
        <ExternalLink className="h-3 w-3" />
      </Button>
    </div>
  );
}
