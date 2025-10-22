"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, RefreshCw, TrendingUp, DollarSign, Users, Clock } from "lucide-react"
import { MarketCard } from "@/components/markets/market-card"
import { useAllMarkets } from "@/hooks/use-contracts"
import { MarketInfo } from "@/lib/types"

export default function MarketsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"newest" | "liquidity" | "ending">("newest")
  
  const { markets, loading, error } = useAllMarkets()

  // Filter and sort markets
  const filteredMarkets = markets
    .filter((market) => {
      const matchesSearch = market.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           market.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || market.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "liquidity":
          return parseFloat(b.totalLiquidity) - parseFloat(a.totalLiquidity)
        case "ending":
          return a.endTime - b.endTime
        case "newest":
        default:
          return b.identifier - a.identifier
      }
    })

  // Get unique categories
  const categories = Array.from(new Set(markets.map(market => market.category)))

  // Calculate total stats
  const totalLiquidity = markets.reduce((sum, market) => sum + parseFloat(market.totalLiquidity), 0)
  const activeMarkets = markets.filter(market => !market.isResolved).length
  const resolvedMarkets = markets.filter(market => market.isResolved).length

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading markets...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Markets</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Prediction Markets</h1>
        <p className="text-muted-foreground">
          Bet on the outcome of real-world events and earn rewards for accurate predictions.
        </p>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-gold-2" />
            <span className="font-semibold">Total Liquidity</span>
          </div>
          <p className="text-2xl font-bold">${totalLiquidity.toLocaleString()}</p>
        </Card>
        
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="font-semibold">Active Markets</span>
          </div>
          <p className="text-2xl font-bold">{activeMarkets}</p>
        </Card>
        
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-500" />
            <span className="font-semibold">Resolved</span>
          </div>
          <p className="text-2xl font-bold">{resolvedMarkets}</p>
        </Card>
        
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="font-semibold">Total Markets</span>
          </div>
          <p className="text-2xl font-bold">{markets.length}</p>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search markets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="newest">Newest</option>
            <option value="liquidity">Most Liquidity</option>
            <option value="ending">Ending Soon</option>
          </select>
        </div>
      </div>

      {/* Markets Grid */}
      {filteredMarkets.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No markets found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory 
              ? "Try adjusting your search or filter criteria."
              : "No markets have been created yet."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarkets.map((market) => (
            <MarketCard key={market.address} market={market} />
          ))}
        </div>
      )}
    </div>
  )
}