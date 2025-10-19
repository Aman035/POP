import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, Users, Twitter, MessageSquare, TrendingUp } from "lucide-react"
import Link from "next/link"

interface MarketOption {
  id: string
  label: string
  odds: number
  pool: number
}

interface Market {
  id: string
  question: string
  creator: string
  platform: "twitter" | "farcaster"
  postUrl: string
  totalPool: number
  participants: number
  endsAt: Date
  options: MarketOption[]
  category: string
  status: "active" | "resolved" | "cancelled"
}

interface MarketCardProps {
  market: Market
}

export function MarketCard({ market }: MarketCardProps) {
  const timeRemaining = getTimeRemaining(market.endsAt)
  const PlatformIcon = market.platform === "twitter" ? Twitter : MessageSquare

  return (
    <Link href={`/app/markets/${market.id}`}>
      <Card className="p-5 bg-card border-border hover:border-gold-2/50 transition-all cursor-pointer card-glow group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 group-hover:text-gold-2 transition-colors text-balance">
              {market.question}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {market.category}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <PlatformIcon className="w-3 h-3" />
                <span>{market.platform}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Options with Odds */}
        <div className="space-y-2 mb-4">
          {market.options.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
            >
              <span className="font-medium">{option.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">${option.pool.toLocaleString()}</span>
                <Badge className="gold-gradient text-background font-semibold">{option.odds}%</Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>${market.totalPool.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{market.participants}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-gold-2">
            <Clock className="w-4 h-4" />
            <span>{timeRemaining}</span>
          </div>
        </div>

        {/* Quick Bet Button */}
        <Button className="w-full mt-4 gold-gradient text-background font-semibold group-hover:opacity-90 transition-opacity">
          <TrendingUp className="w-4 h-4 mr-2" />
          Place Bet
        </Button>
      </Card>
    </Link>
  )
}

function getTimeRemaining(endsAt: Date): string {
  const now = new Date()
  const diff = endsAt.getTime() - now.getTime()

  if (diff < 0) return "Ended"

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h`
  return "< 1h"
}
