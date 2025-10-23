import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, Users, Twitter, MessageSquare, TrendingUp } from "lucide-react"
import Link from "next/link"
import { MarketInfo } from "@/lib/types"
import { formatUnits } from "viem"

interface MarketCardProps {
  market: MarketInfo
}

export function MarketCard({ market }: MarketCardProps) {
  const timeRemaining = getTimeRemaining(new Date(market.endTime * 1000))
  const totalLiquidity = parseFloat(market.totalLiquidity)
  const isResolved = market.status === 1 // 1 = resolved
  const isCancelled = market.status === 2 // 2 = cancelled
  const isActive = market.status === 0 // 0 = active
  const statusColor = isResolved ? "bg-green-500" : isCancelled ? "bg-red-500" : "bg-blue-500"

  // Calculate odds for each option (handle case when optionLiquidity is empty)
  const optionsWithOdds = market.options.map((option, index) => {
    const optionLiquidity = market.optionLiquidity && market.optionLiquidity[index] 
      ? parseFloat(market.optionLiquidity[index]) 
      : 0
    const odds = totalLiquidity > 0 ? (optionLiquidity / totalLiquidity) * 100 : 50 // Default to 50% if no liquidity
    return {
      label: option,
      odds: Math.round(odds * 100) / 100,
      pool: optionLiquidity,
    }
  })

  return (
    <Link href={`/app/markets/${market.address}`}>
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
              <Badge className={`text-xs text-white ${statusColor}`}>
                {isResolved ? "Resolved" : isCancelled ? "Cancelled" : "Active"}
              </Badge>
              {isResolved && market.winningOption !== undefined && (
                <Badge className="text-xs bg-green-600 text-white">
                  Winner: {market.options[market.winningOption]}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {market.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {market.description}
          </p>
        )}

        {/* Options with Odds */}
        <div className="space-y-2 mb-4">
          {optionsWithOdds.map((option, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg bg-background border border-border ${
                isResolved && market.winningOption === index ? "border-green-500 bg-green-50" : ""
              }`}
            >
              <span className="font-medium">{option.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">${option.pool.toLocaleString()}</span>
                <Badge className="gold-gradient text-background font-semibold">
                  {option.odds}%
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>${totalLiquidity.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Creator: {market.creator.slice(0, 6)}...{market.creator.slice(-4)}</span>
            </div>
            {market.platform > 0 && (
              <div className="flex items-center gap-1">
                <Twitter className="w-4 h-4" />
                <span>Platform: {market.platform === 1 ? 'Twitter' : market.platform === 2 ? 'Farcaster' : 'Other'}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-gold-2">
            <Clock className="w-4 h-4" />
            <span>{timeRemaining}</span>
          </div>
        </div>

        {/* Additional Info */}
        {market.minBet > 0 && (
          <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
            <div className="flex justify-between">
              <span>Min Bet: ${formatUnits(BigInt(market.minBet), 6)}</span>
              {market.maxBetPerUser > 0 && (
                <span>Max per User: ${formatUnits(BigInt(market.maxBetPerUser), 6)}</span>
              )}
            </div>
            {market.maxTotalStake > 0 && (
              <div className="mt-1">
                <span>Max Total: ${formatUnits(BigInt(market.maxTotalStake), 6)}</span>
              </div>
            )}
          </div>
        )}

        {/* Quick Bet Button */}
        <Button 
          className="w-full mt-4 gold-gradient text-background font-semibold group-hover:opacity-90 transition-opacity"
          disabled={isResolved || isCancelled}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          {isResolved ? "Market Resolved" : isCancelled ? "Market Cancelled" : "Place Bet"}
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
