"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, Users, ExternalLink } from "lucide-react"
import { useState } from "react"
import { QuickBetModal } from "./quick-bet-modal"

interface MarketWidgetProps {
  market: {
    id: string
    address?: string
    question: string
    options: Array<{ id: string; label: string; odds: number }>
    totalPool: number
    participants: number
    endsAt: Date
  }
  compact?: boolean
}

export function MarketWidget({ market, compact = false }: MarketWidgetProps) {
  const [showBetModal, setShowBetModal] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const timeRemaining = getTimeRemaining(market.endsAt)

  const handleQuickBet = (optionId: string) => {
    setSelectedOption(optionId)
    setShowBetModal(true)
  }

  if (compact) {
    return (
      <>
        <Card className="p-3 bg-card border-border card-glow">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded gold-gradient flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-3 h-3 text-background" />
            </div>
            <p className="text-xs font-semibold flex-1 line-clamp-1">{market.question}</p>
          </div>

          <div className="flex items-center gap-2">
            {market.options.map((option) => (
              <Button
                key={option.id}
                size="sm"
                variant="outline"
                className="flex-1 text-xs bg-transparent"
                onClick={() => handleQuickBet(option.id)}
              >
                {option.label} {option.odds}%
              </Button>
            ))}
          </div>
        </Card>

        <QuickBetModal
          isOpen={showBetModal}
          onClose={() => setShowBetModal(false)}
          market={market}
          selectedOption={selectedOption}
        />
      </>
    )
  }

  return (
    <>
      <Card className="p-4 bg-card border-border card-glow">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-background" />
            </div>
            <Badge variant="secondary" className="text-xs">
              POP Market
            </Badge>
          </div>
          <a href={`/app/markets/${market.address || market.id}`} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        </div>

        {/* Question */}
        <h3 className="font-semibold mb-3 text-sm leading-tight">{market.question}</h3>

        {/* Options */}
        <div className="space-y-2 mb-3">
          {market.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleQuickBet(option.id)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-background border border-border hover:border-gold-2/50 transition-colors"
            >
              <span className="text-sm font-medium">{option.label}</span>
              <Badge className="gold-gradient text-background text-xs">{option.odds}%</Badge>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{market.participants}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>${market.totalPool.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-gold-2">
            <Clock className="w-3 h-3" />
            <span>{timeRemaining}</span>
          </div>
        </div>
      </Card>

      <QuickBetModal
        isOpen={showBetModal}
        onClose={() => setShowBetModal(false)}
        market={market}
        selectedOption={selectedOption}
      />
    </>
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
