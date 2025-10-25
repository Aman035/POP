'use client'

import type React from 'react'
import { Suspense } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { WalletGuard } from '@/components/wallet/wallet-guard'
import { ClientOnly } from '@/components/providers/client-only'
import { useSearchParams, usePathname } from 'next/navigation'

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const hideUI = searchParams.get('hideUI') === 'true'

  // Disable chain check for Nexus page - it handles its own chain management
  const isNexusPage = pathname === '/app/nexus'

  // If UI should be hidden, show header with wallet only and no sidebar
  if (hideUI) {
    return (
      <ClientOnly fallback={<div className="min-h-screen bg-background" />}>
        <WalletGuard requireCorrectChain={!isNexusPage}>
          <div className="min-h-screen bg-background">
            <AppHeader minimalMode={true} />
            <main className="w-full p-6">{children}</main>
          </div>
        </WalletGuard>
      </ClientOnly>
    )
  }

  // Normal layout with header and sidebar - protected by wallet guard
  return (
    <ClientOnly fallback={<div className="min-h-screen bg-background" />}>
      <WalletGuard requireCorrectChain={!isNexusPage}>
        <div className="min-h-screen bg-background">
          <AppHeader />
          <div className="flex">
            <AppSidebar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </WalletGuard>
    </ClientOnly>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  )
}
