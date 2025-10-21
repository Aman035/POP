"use client"

import { PopLogo } from "@/components/branding/pop-logo"
import { Button } from "@/components/ui/button"
import { Bell, Settings } from "lucide-react"
import Link from "next/link"
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button"
import { ThemeToggle } from "@/components/theme-toggle"

export function AppHeader() {
  return (
    <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/app" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <PopLogo />
          <div>
            <h1 className="text-lg font-bold text-foreground">POP</h1>
            <p className="text-xs text-muted-foreground">Predict on Posts</p>
          </div>
        </Link>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-gold-2 rounded-full" />
          </Button>

          {/* Wallet Connection */}
          <WalletConnectButton />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Settings */}
          <Link href="/app/settings">
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}