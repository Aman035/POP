'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, Users, Twitter, MessageSquare, TrendingUp, Calendar, User, ExternalLink, Activity } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { MarketInfo } from "@/lib/types"
import { formatUnits } from "viem"

interface MarketCardProps {
  market: MarketInfo
}

export function MarketCard({ market }: MarketCardProps) {
  const searchParams = useSearchParams()
  const hideUI = searchParams.get('hideUI') === 'true'
  
  // Preserve hideUI parameter when navigating
  const marketUrl = hideUI 
    ? `/app/markets/${market.address}?hideUI=true&embed=true`
    : `/app/markets/${market.address}`
  const timeRemaining = getTimeRemaining(new Date(market.endTime * 1000))
  
  // Safely parse liquidity, handling NaN and invalid values
  const parseLiquidity = (value: string | number): number => {
    const parsed = typeof value === 'string' ? parseFloat(value) : value
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed
  }
  
  const totalLiquidity = parseLiquidity(market.totalLiquidity)
  
  // Use actual contract states
  const isTrading = market.state === 0 // Trading state
  const isProposed = market.state === 1 // Proposed state  
  const isResolved = market.state === 2 // Resolved state
  
  const getStatusInfo = () => {
    if (isResolved) return { label: "Resolved", color: "bg-green-500", textColor: "text-green-700" }
    if (isProposed) return { label: "Proposed", color: "bg-yellow-500", textColor: "text-yellow-700" }
    return { label: "Trading", color: "bg-blue-500", textColor: "text-blue-700" }
  }
  
  const statusInfo = getStatusInfo()

  // Calculate odds for each option using real contract data
  const optionsWithOdds = market.options.map((option, index) => {
    const optionLiquidity = market.optionLiquidity && market.optionLiquidity[index] 
      ? parseLiquidity(market.optionLiquidity[index]) 
      : 0
    // Calculate real odds based on actual liquidity data
    const odds = totalLiquidity > 0 ? (optionLiquidity / totalLiquidity) * 100 : 50
    return {
      label: option,
      odds: Math.round(odds * 100) / 100,
      pool: optionLiquidity,
    }
  })

  // Format creator address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Get platform icon and label
  const getPlatformInfo = () => {
    switch (market.platform) {
      case 0: return { icon: Twitter, label: "Twitter", color: "text-blue-500" }
      case 1: return { icon: MessageSquare, label: "Farcaster", color: "text-purple-500" }
      case 2: return { icon: Activity, label: "Lens", color: "text-green-500" }
      default: return { icon: ExternalLink, label: "Other", color: "text-gray-500" }
    }
  }

  const platformInfo = getPlatformInfo()
  const PlatformIcon = platformInfo.icon

  return (
    <Link href={marketUrl}>
      <Card className="group relative overflow-hidden bg-card border-border hover:border-gold-2/50 transition-all duration-300 hover:shadow-lg hover:shadow-gold-2/10 cursor-pointer h-full">
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold-2/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-2 group-hover:text-gold-2 transition-colors text-balance overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {market.question}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {market.category}
                </Badge>
                <Badge className={`text-xs text-white ${statusInfo.color}`}>
                  {statusInfo.label}
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
            <p className="text-sm text-muted-foreground mb-4 flex-shrink-0 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {market.description}
            </p>
          )}

          {/* Options with Odds */}
          <div className="space-y-2 mb-4 flex-1">
            {optionsWithOdds.map((option, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg bg-background border border-border transition-colors ${
                  isResolved && market.winningOption === index ? "border-green-500 bg-green-50" : ""
                }`}
              >
                <span className="font-medium text-sm truncate flex-1 mr-2">{option.label}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">${option.pool.toFixed(2)}</span>
                  <Badge className="gold-gradient text-background font-semibold text-xs">
                    {option.odds}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4 mt-auto">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span>${totalLiquidity.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{market.activeParticipantsCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <PlatformIcon className={`w-3 h-3 ${platformInfo.color}`} />
                <span className="hidden sm:inline">{platformInfo.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-gold-2">
              <Clock className="w-3 h-3" />
              <span>{timeRemaining}</span>
            </div>
          </div>

          {/* Creator Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>Creator: {formatAddress(market.creator)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(market.createdAt * 1000).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            className="w-full mt-4 gold-gradient text-background font-semibold group-hover:opacity-90 transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-gold-2/20"
            disabled={isResolved}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {isResolved ? "Market Resolved" : isProposed ? "Awaiting Resolution" : "Place Your Bet"}
          </Button>
        </div>
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
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m`
  return "< 1m"
}