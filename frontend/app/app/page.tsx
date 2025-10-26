"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, DollarSign, ArrowRight, BarChart3, CircleStop } from "lucide-react"
import Link from "next/link"
import { useTrendingMarketsGraphQL } from "@/hooks/graphql/use-trending-markets-graphql"
import { useMarketStatsGraphQL } from "@/hooks/graphql/use-market-stats-graphql"
import { useAnalytics } from "@/hooks/graphql/use-analytics"
import { useMarketsGraphQL } from "@/hooks/graphql/use-markets-graphql"
import { CategoryChart } from "@/components/analytics/category-chart"
import { PlatformChart } from "@/components/analytics/platform-chart"
import { MarketInsights } from "@/components/analytics/market-insights"
import { TrendingCreators } from "@/components/analytics/trending-creators"
import { EnhancedMarketCard } from "@/components/markets/enhanced-market-card"

export default function AppHomePage() {
  const { markets: trendingMarkets, loading: trendingLoading, error: trendingError } = useTrendingMarketsGraphQL()
  const { stats, loading: statsLoading, error: statsError } = useMarketStatsGraphQL()
  const { categoryData, platformData, topCreators, loading: analyticsLoading, error: analyticsError } = useAnalytics()
  const { markets: allMarkets, loading: marketsLoading, error: marketsError } = useMarketsGraphQL()

  // Use stats from API or fallback to 0
  const totalLiquidityAmount = allMarkets.reduce((sum, market) => {
    const numericLiquidity = typeof market.totalLiquidity === "string"
      ? parseFloat(market.totalLiquidity)
      : Number(market.totalLiquidity ?? 0)
    return sum + (Number.isFinite(numericLiquidity) ? numericLiquidity : 0)
  }, 0)
  const activeMarkets = stats?.activeMarkets ?? 0
  const totalMarkets = stats?.totalMarkets ?? 0
  const endedMarkets = stats ? Math.max(stats.totalMarkets - stats.activeMarkets, 0) : 0
  const trendingActive = trendingMarkets.filter((market) => market.timeRemaining > 0).length
  const trendingEnded = trendingMarkets.length - trendingActive
  const formattedTotalLiquidity = `$${totalLiquidityAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`

  const quickStats = [
    {
      title: "Total Markets",
      value: totalMarkets.toLocaleString(),
      icon: BarChart3,
      iconClasses: "text-blue-500",
      iconBg: "bg-blue-500/10",
      skeletonWidth: "w-20",
      loading: statsLoading
    },
    {
      title: "Total Liquidity",
      value: formattedTotalLiquidity,
      icon: DollarSign,
      iconClasses: "text-teal-500",
      iconBg: "bg-teal-500/10",
      skeletonWidth: "w-24",
      loading: marketsLoading
    },
    {
      title: "Active Markets",
      value: activeMarkets.toLocaleString(),
      icon: TrendingUp,
      iconClasses: "text-gold-2",
      iconBg: "bg-gold-2/20",
      skeletonWidth: "w-16",
      loading: statsLoading
    },
    {
      title: "Ended Markets",
      value: endedMarkets.toLocaleString(),
      icon: CircleStop,
      iconClasses: "text-rose-500",
      iconBg: "bg-rose-500/10",
      skeletonWidth: "w-16",
      loading: statsLoading
    }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.title} className="p-3 sm:p-4 bg-card border-border">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconClasses}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.title}</p>
                {stat.loading ? (
                  <div className={`h-6 sm:h-7 rounded bg-muted/40 animate-pulse ${stat.skeletonWidth}`} />
                ) : (
                  <p className="text-lg sm:text-2xl font-bold truncate">{stat.value}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {statsError && (
        <p className="text-sm text-red-500">Unable to load the latest stats. Showing fallback values.</p>
      )}
      {marketsError && (
        <p className="text-sm text-red-500">Unable to load liquidity totals. Displaying fallback values.</p>
      )}

      {/* Market Insights */}
      {stats && (
        <MarketInsights
          totalMarkets={stats.totalMarkets}
          resolvedMarkets={stats.resolvedMarkets}
          categoryBreakdown={stats.categoryBreakdown}
          platformBreakdown={stats.platformBreakdown}
        />
      )}

      {/* Trending Markets */}
      <Card className="p-6 bg-card border-border">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold">Trending Markets</h2>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {!trendingLoading && !trendingError && trendingMarkets.length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>Active: {trendingActive}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>Ended: {trendingEnded}</span>
                </div>
              </>
            )}
            <Link href="/app/markets">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
        {trendingLoading ? (
          <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-2"></div>
            <span>Loading markets...</span>
          </div>
          </div>
        ) : trendingError ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">Error loading markets</p>
            <p className="text-muted-foreground text-sm">{trendingError}</p>
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
          <div className="flex flex-col gap-4">
            {trendingMarkets.slice(0, 3).map((market) => (
              <div key={market.address} className="p-1">
                <EnhancedMarketCard
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
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analyticsLoading ? (
          <>
            <Card className="p-6 flex flex-col items-center justify-center min-h-[256px]">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-2" />
              <p className="text-sm text-muted-foreground mt-4">Loading analytics...</p>
            </Card>
            <Card className="p-6 flex flex-col items-center justify-center min-h-[256px]">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-2" />
              <p className="text-sm text-muted-foreground mt-4">Loading analytics...</p>
            </Card>
          </>
        ) : analyticsError ? (
          <Card className="p-6 lg:col-span-2">
            <p className="text-red-600 font-semibold mb-2">Error loading analytics</p>
            <p className="text-sm text-muted-foreground">{analyticsError}</p>
          </Card>
        ) : (
          <>
            <CategoryChart data={categoryData} />
            <PlatformChart data={platformData} />
          </>
        )}
      </div>

      {/* Top Creators */}
      {analyticsLoading ? (
        <Card className="p-6 flex flex-col items-center justify-center bg-card border-border">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-2" />
          <p className="text-sm text-muted-foreground mt-4">Loading creator insights...</p>
        </Card>
      ) : analyticsError ? (
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold mb-2">Top Creators</h2>
          <p className="text-sm text-red-500">Error loading creator insights.</p>
          <p className="text-xs text-muted-foreground mt-1">{analyticsError}</p>
        </Card>
      ) : (
        <TrendingCreators creators={topCreators} />
      )}
    </div>
  )
}
