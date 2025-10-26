"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, DollarSign, Users, Twitter, MessageSquare, TrendingUp, AlertCircle, Activity, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useMarketGraphQL } from "@/hooks/graphql/use-market-graphql"

interface MarketDetailsPageProps {
  params: {
    address: string
  }
}

export default function MarketDetailsPage({ params }: MarketDetailsPageProps) {
  const { market: marketInfo, loading, error } = useMarketGraphQL(params.address)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/markets">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Markets
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Loading market details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !marketInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/markets">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Markets
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Market Not Found</h3>
          <p className="text-muted-foreground mb-4">
            {error || "The market you're looking for doesn't exist or has been removed."}
          </p>
          <Button asChild>
            <Link href="/app/markets">Back to Markets</Link>
          </Button>
        </div>
      </div>
    )
  }

  const timeRemaining = getTimeRemaining(new Date(marketInfo.endTime * 1000))
  const totalLiquidity = parseFloat(marketInfo.totalLiquidity)
  
  // Use actual contract states
  const isTrading = marketInfo.state === 0 // Trading state
  const isProposed = marketInfo.state === 1 // Proposed state  
  const isResolved = marketInfo.state === 2 // Resolved state
  
  const getStatusInfo = () => {
    if (isResolved) return { label: "Resolved", color: "bg-green-500", textColor: "text-green-700" }
    if (isProposed) return { label: "Proposed", color: "bg-yellow-500", textColor: "text-yellow-700" }
    return { label: "Trading", color: "bg-blue-500", textColor: "text-blue-700" }
  }
  
  const statusInfo = getStatusInfo()

  // Calculate odds for each option
  const optionsWithOdds = marketInfo.options.map((option, index) => {
    const optionLiquidity = marketInfo.optionLiquidity && marketInfo.optionLiquidity[index] 
      ? parseFloat(marketInfo.optionLiquidity[index]) 
      : 0
    const odds = totalLiquidity > 0 ? (optionLiquidity / totalLiquidity) * 100 : 50
    return {
      label: option,
      odds: Math.round(odds * 100) / 100,
      pool: optionLiquidity,
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/app/markets">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Markets
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{marketInfo.question}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-sm">
              {marketInfo.category}
            </Badge>
            <Badge className={`text-sm text-white ${statusInfo.color}`}>
              {statusInfo.label}
            </Badge>
            {isResolved && marketInfo.winningOption !== undefined && (
              <Badge className="text-sm bg-green-600 text-white">
                Winner: {marketInfo.options[marketInfo.winningOption]}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {marketInfo.description && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground">{marketInfo.description}</p>
            </Card>
          )}

          {/* Options */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Prediction Options</h3>
            <div className="space-y-3">
              {optionsWithOdds.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg bg-background border border-border ${
                    isResolved && marketInfo.winningOption === index ? "border-green-500 bg-green-50" : ""
                  }`}
                >
                  <div className="flex-1">
                    <span className="font-medium text-lg">{option.label}</span>
                    {isResolved && marketInfo.winningOption === index && (
                      <Badge className="ml-2 bg-green-600 text-white">Winner</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Pool Size</div>
                      <div className="font-semibold">${option.pool.toLocaleString()}</div>
                    </div>
                    <Badge className="gold-gradient text-background font-semibold px-3 py-1">
                      {option.odds}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Betting Interface */}
          {isTrading && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Place Your Bet</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketInfo.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-center gap-2 hover:border-gold-2 transition-colors"
                    >
                      <span className="font-medium">{option}</span>
                      <span className="text-sm text-muted-foreground">
                        {optionsWithOdds[index]?.odds}% odds
                      </span>
                    </Button>
                  ))}
                </div>
                <div className="text-center">
                  <Button className="gold-gradient text-background font-semibold px-8 py-3 text-lg hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-gold-2/20">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Connect Wallet to Place Bet
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Proposed State Info */}
          {isProposed && (
            <Card className="p-6 border-yellow-200 bg-yellow-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-yellow-800">Resolution Proposed</h3>
              </div>
              <p className="text-yellow-700 text-sm">
                This market has ended and a resolution has been proposed. The creator has a window to override the resolution if needed.
              </p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Market Stats */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Market Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Total Liquidity</span>
                </div>
                <span className="font-semibold">${totalLiquidity.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Participants</span>
                </div>
                <span className="font-semibold">{marketInfo.activeParticipantsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Time Remaining</span>
                </div>
                <span className="font-semibold text-gold-2">{timeRemaining}</span>
              </div>
            </div>
          </Card>

          {/* Market Info */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Market Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Creator:</span>
                <div className="font-mono text-xs mt-1">{marketInfo.creator}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <div className="mt-1">
                  {new Date(marketInfo.createdAt * 1000).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Ends:</span>
                <div className="mt-1">
                  {new Date(marketInfo.endTime * 1000).toLocaleString()}
                </div>
              </div>
              {marketInfo.platform >= 0 && (
                <div>
                  <span className="text-muted-foreground">Platform:</span>
                  <div className="flex items-center gap-1 mt-1">
                    {marketInfo.platform === 0 && <Twitter className="w-3 h-3 text-blue-500" />}
                    {marketInfo.platform === 1 && <MessageSquare className="w-3 h-3 text-purple-500" />}
                    {marketInfo.platform === 2 && <Activity className="w-3 h-3 text-green-500" />}
                    {marketInfo.platform === 3 && <ExternalLink className="w-3 h-3 text-gray-500" />}
                    <span>
                      {marketInfo.platform === 0 ? 'Twitter' : 
                       marketInfo.platform === 1 ? 'Farcaster' : 
                       marketInfo.platform === 2 ? 'Lens' : 'Other'}
                    </span>
                  </div>
                </div>
              )}
              {marketInfo.resolutionSource && (
                <div>
                  <span className="text-muted-foreground">Resolution Source:</span>
                  <div className="mt-1">
                    <span className="text-xs text-muted-foreground">{marketInfo.resolutionSource}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Contract Info */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Contract Details</h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground">Address:</span>
                <div className="font-mono break-all">{marketInfo.address}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Network:</span>
                <div>Arbitrum Sepolia</div>
              </div>
            </div>
          </Card>
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

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h`
  return "< 1h"
}