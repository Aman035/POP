"use client"

import { PopLogo } from "@/components/branding/pop-logo"
import { Button } from "@/components/ui/button"
import { Bell, Settings } from "lucide-react"
import Link from "next/link"
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button"
import { WalletConnectCompact } from "@/components/wallet/wallet-connect-compact"
import { ThemeToggle } from "@/components/theme-toggle"

export function AppHeader() {
  return (
    <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/app" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <PopLogo />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent tracking-tight">POP</h1>
            <p className="text-xs text-muted-foreground font-medium">Predict on Posts</p>
          </div>
        </Link>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hidden sm:flex">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-gold-2 rounded-full" />
          </Button>

          {/* Wallet Connection */}
          <div className="min-w-0 flex-shrink-0">
            <div className="hidden sm:block">
              <WalletConnectButton />
            </div>
            <div className="block sm:hidden">
              <WalletConnectCompact />
            </div>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Settings */}
          <Link href="/app/settings">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}