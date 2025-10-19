"use client"

import { PopLogo } from "@/components/branding/pop-logo"
import { Button } from "@/components/ui/button"
import { Bell, Settings, Wallet, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppHeader() {
  const [isConnected, setIsConnected] = useState(false)

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
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">0x1234...5678</span>
                  <span className="inline sm:hidden">Wallet</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Wallet className="w-4 h-4 mr-2" />
                  Balance: 100 PYUSD
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsConnected(false)}>Disconnect</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setIsConnected(true)} className="gold-gradient text-background font-semibold">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          )}

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
