'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@/hooks/wallet/use-wallet'
import { WalletLoading } from './wallet-loading'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface BridgeAwareWalletGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireCorrectChain?: boolean
}

export function BridgeAwareWalletGuard({
  children,
  fallback,
  requireCorrectChain = true,
}: BridgeAwareWalletGuardProps) {
  const [mounted, setMounted] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)
  const [isBridgeInProgress, setIsBridgeInProgress] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check for bridge operations in session storage
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const checkBridgeState = () => {
      try {
        const bridgeInProgress = sessionStorage.getItem(
          'pop-bridge-in-progress'
        )
        const bridgeOperationId = sessionStorage.getItem(
          'pop-bridge-operation-id'
        )

        if (bridgeInProgress === 'true' && bridgeOperationId) {
          setIsBridgeInProgress(true)
          console.log(
            'Bridge operation detected, preventing wallet guard redirect'
          )
        } else {
          setIsBridgeInProgress(false)
        }
      } catch (error) {
        console.error('Error checking bridge state:', error)
        setIsBridgeInProgress(false)
      }
    }

    checkBridgeState()

    // Listen for storage changes (in case bridge state changes in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === 'pop-bridge-in-progress' ||
        e.key === 'pop-bridge-operation-id'
      ) {
        checkBridgeState()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Always call useWallet to maintain consistent hook order
  const { isConnected, isCorrectChain, isConnecting, isSwitchingChain } =
    useWallet()

  // Check wallet connection status - but be more lenient during bridge operations
  useEffect(() => {
    if (!mounted) {
      return // Don't run until mounted
    }

    if (isConnecting || isSwitchingChain) {
      return // Still loading, don't show modal yet
    }

    // If bridge is in progress, don't show wallet modal even if connection is lost
    if (isBridgeInProgress) {
      console.log('Bridge operation in progress, skipping wallet guard check')
      return
    }

    setHasChecked(true)
  }, [
    mounted,
    isConnected,
    isCorrectChain,
    isConnecting,
    isSwitchingChain,
    requireCorrectChain,
    hasChecked,
    isBridgeInProgress,
  ])

  // Don't render until mounted to prevent SSR issues
  if (!mounted || typeof window === 'undefined') {
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

  // If bridge is in progress, always show children (don't redirect)
  if (isBridgeInProgress) {
    console.log(
      'Bridge operation in progress, allowing access to prevent redirect'
    )
    return <>{children}</>
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

// Export as default for dynamic import compatibility
export default BridgeAwareWalletGuard
