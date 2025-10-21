'use client'

import type React from 'react'
import { Suspense } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { WalletGuard } from '@/components/wallet/wallet-guard'
import { useSearchParams } from 'next/navigation'

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const isEmbedded = searchParams.get('embed') === 'true'
  const hideUI = searchParams.get('hideUI') === 'true'

  // If embedded and UI should be hidden, render only the content
  if (isEmbedded && hideUI) {
    return (
      <div className="w-full h-full bg-background overflow-hidden">
        <main className="w-full h-full p-4">{children}</main>
      </div>
    )
  }

  // Normal layout with header and sidebar - protected by wallet guard
  return (
    <WalletGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex">
          <AppSidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </WalletGuard>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  )
}
