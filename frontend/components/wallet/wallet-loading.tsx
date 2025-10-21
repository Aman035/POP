'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface WalletLoadingProps {
  type?: 'button' | 'skeleton' | 'spinner';
  className?: string;
}

export function WalletLoading({ type = 'button', className }: WalletLoadingProps) {
  if (type === 'skeleton') {
    return (
      <div className={`space-y-2 ${className}`}>
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  if (type === 'spinner') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <Button disabled className={`gold-gradient text-background font-semibold ${className}`}>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Connecting...
    </Button>
  );
}
