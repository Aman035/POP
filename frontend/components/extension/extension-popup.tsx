"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PopLogo } from "@/components/branding/pop-logo"
import { TrendingUp, PlusCircle, Trophy, Settings, ExternalLink } from "lucide-react"

export function ExtensionPopup() {
  const recentMarkets = [
    {
      id: "1",
      question: "Will Bitcoin reach $100k?",
      odds: 65,
    },
    {
      id: "2",
      question: "Will iPhone have USB-C?",
      odds: 82,
    },
  ]

  return (
    <div className="w-[360px] bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PopLogo className="scale-75" />
            <div>
              <h1 className="text-sm font-bold">POP</h1>
              <p className="text-xs text-muted-foreground">Predict on Posts</p>
            </div>
          </div>
          <Badge className="gold-gradient text-background text-xs">Connected</Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-sm font-bold">$100.00</p>
          </div>
          <div className="p-2 rounded-lg bg-card border border-border">
            <p className="text-xs text-muted-foreground">Active Bets</p>
            <p className="text-sm font-bold">5</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-border">
        <p className="text-xs font-semibold mb-2 text-muted-foreground">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" className="justify-start gap-2 bg-transparent">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Markets</span>
          </Button>
          <Button size="sm" variant="outline" className="justify-start gap-2 bg-transparent">
            <PlusCircle className="w-4 h-4" />
            <span className="text-xs">Create</span>
          </Button>
        </div>
      </div>

      {/* Recent Markets */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground">Recent Markets</p>
          <a href="/app/markets" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              View All
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </a>
        </div>

        <div className="space-y-2">
          {recentMarkets.map((market) => (
            <Card key={market.id} className="p-3 bg-card border-border hover:border-gold-2/50 transition-colors">
              <p className="text-xs font-medium mb-2 line-clamp-2">{market.question}</p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {market.odds}% odds
                </Badge>
                <Button size="sm" variant="ghost" className="h-6 text-xs">
                  Bet
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <a href="/app/leaderboard" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="gap-2">
              <Trophy className="w-4 h-4" />
              <span className="text-xs">Leaderboard</span>
            </Button>
          </a>
          <a href="/app/settings" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="text-xs">Settings</span>
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
