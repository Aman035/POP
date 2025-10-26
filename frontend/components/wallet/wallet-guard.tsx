'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@/hooks/wallet/use-wallet'
import { WalletLoading } from './wallet-loading'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface WalletGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireCorrectChain?: boolean
}

export function WalletGuard({
  children,
  fallback,
  requireCorrectChain = true,
}: WalletGuardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Always call useWallet to maintain consistent hook order
  const { isConnected, isCorrectChain, isConnecting, isSwitchingChain } =
    useWallet()

  // Don't render until mounted to prevent SSR issues
  if (!mounted) {
    return <>{children}</>
  }

  // Show loading state while checking connection
  if (isConnecting || isSwitchingChain) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <WalletLoading type="spinner" className="w-8 h-8" />
          <p className="text-muted-foreground">
            {isConnecting ? 'Connecting wallet...' : 'Switching network...'}
          </p>
        </div>
      </div>
    )
  }

  // Show modal if wallet is not connected or on wrong chain
  if (!isConnected || (requireCorrectChain && !isCorrectChain)) {
    return (
      fallback || (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md mx-auto p-6">
            <div className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-background"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Wallet Required</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to access this page.
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        </div>
      )
    )
  }

  // Wallet is connected and on correct chain, render children
  return <>{children}</>
}
