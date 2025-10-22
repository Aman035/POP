"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, DollarSign, Users, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import { MarketCard } from "@/components/markets/market-card"
import { BettingPanel } from "@/components/markets/betting-panel"
import { useMarketDetails } from "@/hooks/use-contracts"
import Link from "next/link"

export default function MarketDetailPage() {
  const params = useParams()
  const marketAddress = params.address as string
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  const { marketInfo, marketStats, userPositions, loading, error } = useMarketDetails(marketAddress)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-2"></div>
            <span>Loading market details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !marketInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Market</h2>
          <p className="text-muted-foreground mb-4">{error || "Market not found"}</p>
          <Link href="/app/markets">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Markets
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const totalLiquidity = parseFloat(marketInfo.totalLiquidity)
  const isResolved = marketInfo.isResolved
  const timeRemaining = getTimeRemaining(new Date(marketInfo.endTime * 1000))

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/app/markets">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Markets
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Market Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Header */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{marketInfo.question}</h1>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <Badge variant="secondary">{marketInfo.category}</Badge>
                  <Badge className={isResolved ? "bg-green-600" : "bg-blue-600"}>
                    {isResolved ? "Resolved" : "Active"}
                  </Badge>
                  {isResolved && marketInfo.winningOption !== undefined && (
                    <Badge className="bg-green-600 text-white">
                      Winner: {marketInfo.options[marketInfo.winningOption]}
                    </Badge>
                  )}
                </div>
                {marketInfo.description && (
                  <p className="text-muted-foreground mb-4">{marketInfo.description}</p>
                )}
              </div>
            </div>

            {/* Market Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <DollarSign className="w-4 h-4 text-gold-2" />
                  <span className="text-sm text-muted-foreground">Total Liquidity</span>
                </div>
                <p className="text-lg font-bold">${totalLiquidity.toLocaleString()}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Options</span>
                </div>
                <p className="text-lg font-bold">{marketInfo.options.length}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Creator</span>
                </div>
                <p className="text-sm font-mono">
                  {marketInfo.creator.slice(0, 6)}...{marketInfo.creator.slice(-4)}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-muted-foreground">Time Left</span>
                </div>
                <p className="text-lg font-bold">{timeRemaining}</p>
              </div>
            </div>
          </Card>

          {/* Options with Liquidity */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-bold mb-4">Market Options</h2>
            <div className="space-y-3">
              {marketInfo.options.map((option, index) => {
                const optionLiquidity = parseFloat(marketInfo.optionLiquidity[index] || "0")
                const odds = totalLiquidity > 0 ? (optionLiquidity / totalLiquidity) * 100 : 0
                const isWinningOption = isResolved && marketInfo.winningOption === index
                const userPosition = userPositions[index] || "0"
                
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isWinningOption
                        ? "border-green-500 bg-green-50"
                        : "border-border bg-background"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-lg">{option}</span>
                      <div className="flex items-center gap-2">
                        <Badge className="gold-gradient text-background font-bold">
                          {Math.round(odds * 100) / 100}%
                        </Badge>
                        {isWinningOption && (
                          <Badge className="bg-green-600 text-white">Winner</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Liquidity: ${optionLiquidity.toLocaleString()}</span>
                      {parseFloat(userPosition) > 0 && (
                        <span className="text-gold-2 font-medium">
                          Your Position: ${parseFloat(userPosition).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {optionLiquidity > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gold-2 h-2 rounded-full transition-all"
                            style={{ width: `${odds}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Resolution Info */}
          {isResolved && (
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-bold">Market Resolved</h2>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  <strong>Winning Option:</strong> {marketInfo.options[marketInfo.winningOption!]}
                </p>
                <p className="text-muted-foreground">
                  <strong>Resolution Source:</strong> {marketInfo.resolutionSource}
                </p>
                <p className="text-muted-foreground">
                  <strong>Creator Fee:</strong> {(marketInfo.creatorFeeBps / 100).toFixed(2)}%
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Betting Panel */}
        <div className="lg:col-span-1">
          <BettingPanel
            market={marketInfo}
            selectedOption={selectedOption}
            onSelectOption={setSelectedOption}
          />
        </div>
      </div>
    </div>
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
