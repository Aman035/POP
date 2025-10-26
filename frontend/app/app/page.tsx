"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Clock, DollarSign, Users, ArrowRight, BarChart3, Activity } from "lucide-react"
import Link from "next/link"
import { useTrendingMarketsGraphQL } from "@/hooks/graphql/use-trending-markets-graphql"
import { useMarketStatsGraphQL } from "@/hooks/graphql/use-market-stats-graphql"
import { useAnalytics } from "@/hooks/graphql/use-analytics"
import { CategoryChart } from "@/components/analytics/category-chart"
import { PlatformChart } from "@/components/analytics/platform-chart"
import { MarketInsights } from "@/components/analytics/market-insights"
import { TrendingCreators } from "@/components/analytics/trending-creators"
import { EnhancedMarketCard } from "@/components/markets/enhanced-market-card"

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

export default function AppHomePage() {
  const { markets: trendingMarkets, loading: trendingLoading, error: trendingError } = useTrendingMarketsGraphQL()
  const { stats, loading: statsLoading, error: statsError } = useMarketStatsGraphQL()
  const { categoryData, platformData, topCreators, loading: analyticsLoading, error: analyticsError } = useAnalytics()

  // Use stats from API or fallback to 0
  const totalLiquidity = stats ? parseFloat(stats.totalLiquidity) : 0
  const activeMarkets = stats?.activeMarkets || 0
  const resolvedMarkets = stats?.resolvedMarkets || 0
  const totalMarkets = stats?.totalMarkets || 0
  const totalParticipants = stats?.totalParticipants || 0
  const uniqueCategories = stats?.uniqueCategories || 0

  const loading = trendingLoading || statsLoading || analyticsLoading
  const error = trendingError || statsError || analyticsError

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <Card className="p-6 gold-gradient">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-background mb-2">Welcome to POP</h1>
            <p className="text-background/80">Start predicting on social media polls and earn rewards</p>
          </div>
          <Link href="/app/create">
            <Button size="lg" variant="outline" className="bg-background text-foreground hover:bg-background/90">
              Create Market
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold-2/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-gold-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Markets</p>
              <p className="text-2xl font-bold">{activeMarkets}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-1/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-teal-1" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Liquidity</p>
              <p className="text-2xl font-bold">${totalLiquidity.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-1/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-rose-1" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Participants</p>
              <p className="text-2xl font-bold">{totalParticipants.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold-2/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-gold-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold">{resolvedMarkets}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Market Insights */}
      {stats && (
        <MarketInsights
          totalMarkets={stats.totalMarkets}
          activeMarkets={stats.activeMarkets}
          resolvedMarkets={stats.resolvedMarkets}
          categoryBreakdown={stats.categoryBreakdown}
          platformBreakdown={stats.platformBreakdown}
          avgResolutionTime={stats.avgResolutionTime}
        />
      )}

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Markets */}
        <Card className="lg:col-span-2 p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Trending Markets</h2>
            <Link href="/app/markets">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-2"></div>
                <span>Loading markets...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Error loading markets</p>
              <p className="text-muted-foreground text-sm">{error}</p>
            </div>
          ) : trendingMarkets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No markets available yet</p>
              <Link href="/app/create">
                <Button variant="outline" size="sm" className="mt-2">
                  Create First Market
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {trendingMarkets.slice(0, 3).map((market) => (
                <EnhancedMarketCard
                  key={market.address}
                  address={market.address}
                  question={market.question}
                  description={market.description}
                  category={market.category}
                  platform={market.platform}
                  creator={market.creator}
                  createdAt={market.createdAt}
                  endTime={market.endTime}
                  totalLiquidity={market.totalLiquidity}
                  activeParticipantsCount={market.activeParticipantsCount}
                  options={market.options}
                  isResolved={market.isResolved}
                  timeRemaining={market.timeRemaining}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Market Stats */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold mb-4">Market Stats</h2>
          {statsLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold-2"></div>
                <span className="text-sm">Loading stats...</span>
              </div>
            </div>
          ) : statsError ? (
            <div className="text-center py-4">
              <p className="text-red-600 text-sm">Error loading stats</p>
            </div>
          ) : stats ? (
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-foreground">
                  <span className="font-semibold">Active Markets:</span> {activeMarkets}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-foreground">
                  <span className="font-semibold">Resolved Markets:</span> {resolvedMarkets}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-foreground">
                  <span className="font-semibold">Total Liquidity:</span> <span className="text-gold-2">${totalLiquidity.toLocaleString()}</span>
                </p>
              </div>
              <div className="text-sm">
                <p className="text-foreground">
                  <span className="font-semibold">Total Participants:</span> {totalParticipants.toLocaleString()}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-foreground">
                  <span className="font-semibold">Categories:</span> {uniqueCategories}
                </p>
              </div>
              {stats.avgResolutionTime > 0 && (
                <div className="text-sm">
                  <p className="text-foreground">
                    <span className="font-semibold">Avg Resolution:</span> {stats.avgResolutionTime.toFixed(1)}h
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">No stats available</p>
            </div>
          )}
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart data={categoryData} />
        <PlatformChart data={platformData} />
      </div>

      {/* Top Creators */}
      <TrendingCreators creators={topCreators} />
    </div>
  )
}
