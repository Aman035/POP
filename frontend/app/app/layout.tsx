'use client'

import type React from 'react'
import { Suspense } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { ClientOnlyBridgeGuard } from '@/components/wallet/client-only-bridge-guard'
import { ClientOnly } from '@/components/providers/client-only'
import { useSearchParams, usePathname } from 'next/navigation'

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const hideUI = searchParams.get('hideUI') === 'true'

  // If UI should be hidden, show header with wallet only and no sidebar
  if (hideUI) {
    return (
      <ClientOnly fallback={<div className="min-h-screen bg-background" />}>
        <ClientOnlyBridgeGuard requireCorrectChain={true}>
          <div className="min-h-screen bg-background">
            <AppHeader minimalMode={true} />
            <main className="w-full p-6">{children}</main>
          </div>
        </ClientOnlyBridgeGuard>
      </ClientOnly>
    )
  }

  // Normal layout with header and sidebar - protected by wallet guard
  return (
    <ClientOnly fallback={<div className="min-h-screen bg-background" />}>
      <ClientOnlyBridgeGuard requireCorrectChain={true}>
        <div className="min-h-screen bg-background">
          <AppHeader />
          <div className="flex">
            <AppSidebar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </ClientOnlyBridgeGuard>
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
