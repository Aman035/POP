'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
  Plus,
  BarChart3,
  Activity,
  Filter,
} from 'lucide-react'
import { MarketCard } from '@/components/markets/market-card'
import { useMarketsGraphQL } from '@/hooks/graphql/use-markets-graphql'
import { MarketInfo } from '@/lib/types'
import Link from 'next/link'

export default function MarketsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'liquidity' | 'ending'>(
    'newest'
  )
  const [refreshKey, setRefreshKey] = useState(0)

  const { markets, loading, error } = useMarketsGraphQL()

  // Memoized filtered and sorted markets
  const filteredMarkets = useMemo(() => {
    return markets
      .filter((market) => {
        const matchesSearch =
          market.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          market.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory =
          !selectedCategory || market.category === selectedCategory
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'liquidity':
            return parseFloat(b.totalLiquidity) - parseFloat(a.totalLiquidity)
          case 'ending':
            return a.endTime - b.endTime
          case 'newest':
          default:
            return b.createdAt - a.createdAt
        }
      })
  }, [markets, searchTerm, selectedCategory, sortBy])

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(
      new Set(markets.map((market) => market.category).filter(Boolean))
    )
  }, [markets])

  // Calculate comprehensive stats based on actual contract states and GraphQL data
  const stats = useMemo(() => {
    const totalLiquidity = markets.reduce(
      (sum, market) => sum + parseFloat(market.totalLiquidity),
      0
    )
    const tradingMarkets = markets.filter((market) => market.state === 0).length // Trading state
    const proposedMarkets = markets.filter(
      (market) => market.state === 1
    ).length // Proposed state
    const resolvedMarkets = markets.filter(
      (market) => market.state === 2
    ).length // Resolved state

    // Calculate total participants across all markets
    const totalParticipants = markets.reduce(
      (sum, market) => sum + market.activeParticipantsCount,
      0
    )

    // Calculate liquidity by state
    const tradingLiquidity = markets
      .filter((market) => market.state === 0)
      .reduce((sum, market) => sum + parseFloat(market.totalLiquidity), 0)
    
    const proposedLiquidity = markets
      .filter((market) => market.state === 1)
      .reduce((sum, market) => sum + parseFloat(market.totalLiquidity), 0)
    
    const resolvedLiquidity = markets
      .filter((market) => market.state === 2)
      .reduce((sum, market) => sum + parseFloat(market.totalLiquidity), 0)

    // Calculate average liquidity per market
    const averageLiquidity = markets.length > 0 ? totalLiquidity / markets.length : 0

    // Calculate total option liquidity across all markets
    const totalOptionLiquidity = markets.reduce((sum, market) => {
      return sum + market.optionLiquidity.reduce((optionSum, liquidity) => 
        optionSum + parseFloat(liquidity), 0
      )
    }, 0)

    return {
      totalLiquidity,
      tradingMarkets,
      proposedMarkets,
      resolvedMarkets,
      totalMarkets: markets.length,
      totalParticipants,
      tradingLiquidity,
      proposedLiquidity,
      resolvedLiquidity,
      averageLiquidity,
      totalOptionLiquidity,
    }
  }, [markets])

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 animate-spin text-gold-2" />
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Loading Markets</h2>
              <p className="text-muted-foreground">
                Fetching the latest prediction markets...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Markets
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-blue-900">Total Liquidity</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            ${stats.totalLiquidity.toLocaleString()}
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Avg: ${stats.averageLiquidity.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-green-900">Trading</span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {stats.tradingMarkets}
          </p>
          <p className="text-xs text-green-700 mt-1">
            ${stats.tradingLiquidity.toLocaleString()} liquidity
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-yellow-900">Proposed</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">
            {stats.proposedMarkets}
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            ${stats.proposedLiquidity.toLocaleString()} liquidity
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-purple-900">Resolved</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {stats.resolvedMarkets}
          </p>
          <p className="text-xs text-purple-700 mt-1">
            ${stats.resolvedLiquidity.toLocaleString()} liquidity
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-orange-900">Participants</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">
            {stats.totalParticipants}
          </p>
          <p className="text-xs text-orange-700 mt-1">
            Across all markets
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-indigo-900">Total Markets</span>
          </div>
          <p className="text-2xl font-bold text-indigo-900">
            {stats.totalMarkets}
          </p>
          <p className="text-xs text-indigo-700 mt-1">
            ${stats.totalOptionLiquidity.toLocaleString()} in options
          </p>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search markets by question or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="pl-10 pr-8 py-3 border border-border rounded-md bg-background h-12 min-w-[160px]"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 border border-border rounded-md bg-background h-12 min-w-[140px]"
            >
              <option value="newest">Newest First</option>
              <option value="liquidity">Most Liquidity</option>
              <option value="ending">Ending Soon</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Markets Grid */}
      {filteredMarkets.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm || selectedCategory
                ? 'No markets found'
                : 'No markets available'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedCategory
                ? 'Try adjusting your search or filter criteria to find more markets.'
                : 'No prediction markets have been created yet. Be the first to create one!'}
            </p>
            {!searchTerm && !selectedCategory && (
              <Button
                asChild
                className="gold-gradient text-background font-semibold"
              >
                <Link href="/app/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Market
                </Link>
              </Button>
            )}
            {(searchTerm || selectedCategory) && (
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory(null)
                  }}
                >
                  Clear Filters
                </Button>
                <Button asChild>
                  <Link href="/app/create">Create Market</Link>
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMarkets.map((market) => (
            <MarketCard key={market.address} market={market} />
          ))}
        </div>
      )}

      {/* Footer Stats */}
      {filteredMarkets.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border">
          <div className="text-center">
            <p className="text-muted-foreground">
              Showing {filteredMarkets.length} of {markets.length} markets
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedCategory && ` in ${selectedCategory}`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
