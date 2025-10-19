"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, ExternalLink } from "lucide-react"

interface InlineMarketCardProps {
  market: {
    id: string
    question: string
    options: Array<{ id: string; label: string; odds: number }>
  }
}

export function InlineMarketCard({ market }: InlineMarketCardProps) {
  return (
    <div className="my-3 p-3 rounded-lg bg-card border border-border card-glow">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-background" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              POP Market
            </Badge>
          </div>
          <p className="text-sm font-semibold mb-3">{market.question}</p>

          {/* Options */}
          <div className="flex flex-wrap gap-2">
            {market.options.map((option) => (
              <Button key={option.id} size="sm" variant="outline" className="text-xs bg-transparent">
                {option.label} <span className="ml-1 text-gold-2">{option.odds}%</span>
              </Button>
            ))}
          </div>
        </div>

        {/* External Link */}
        <a href={`/app/markets/${market.id}`} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </a>
      </div>
    </div>
  )
}
