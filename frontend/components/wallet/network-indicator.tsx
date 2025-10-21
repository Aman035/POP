'use client';

import { Button } from '@/components/ui/button';
import { ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { arbitrumSepolia } from 'wagmi/chains';

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
  if (!isConnected) {
    return null;
  }

  const handleExplorerClick = () => {
    window.open(arbitrumSepolia.blockExplorers?.default.url, '_blank');
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
        {/* Arbitrum-style indicator */}
        <div className="relative">
          <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <div className="w-1.5 h-1.5 bg-white rounded-full opacity-90"></div>
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full border border-white"></div>
        </div>
        
        <span className={compact ? 'hidden sm:inline' : 'hidden sm:inline'}>
          Arbitrum Sepolia
        </span>
        <span className={compact ? 'sm:hidden' : 'sm:hidden'}>
          Arb Sepolia
        </span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-1 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
        onClick={handleExplorerClick}
        title="View on Arbiscan Sepolia"
      >
        <ExternalLink className="h-3 w-3" />
      </Button>
    </div>
  );
}
