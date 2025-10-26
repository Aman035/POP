'use client';

import { useEffect, useState } from 'react';
import { BridgeAwareWalletGuard } from './bridge-aware-wallet-guard';

interface ClientOnlyBridgeGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireCorrectChain?: boolean;
}

export function ClientOnlyBridgeGuard({ 
  children, 
  fallback,
  requireCorrectChain = true 
}: ClientOnlyBridgeGuardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent SSR issues
  if (!mounted) {
    return fallback || <>{children}</>;
  }

  return (
    <BridgeAwareWalletGuard 
      requireCorrectChain={requireCorrectChain}
      fallback={fallback}
    >
      {children}
    </BridgeAwareWalletGuard>
  );
}
