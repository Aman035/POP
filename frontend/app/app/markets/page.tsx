"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MarketCard } from "@/components/markets/market-card"
import { MarketFilters } from "@/components/markets/market-filters"
import { Search, SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

// Mock market data
const mockMarkets = [
  {
    id: "1",
    question: "Will Bitcoin reach $100k by end of 2025?",
    creator: "0x1234...5678",
    platform: "twitter" as const,
    postUrl: "https://twitter.com/example/status/123",
    totalPool: 2450,
    participants: 42,
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    options: [
      { id: "yes", label: "Yes", odds: 65, pool: 1592.5 },
      { id: "no", label: "No", odds: 35, pool: 857.5 },
    ],
    category: "crypto",
    status: "active" as const,
  },
  {
    id: "2",
    question: "Will the next iPhone have USB-C?",
    creator: "0xabcd...efgh",
    platform: "farcaster" as const,
    postUrl: "https://warpcast.com/example/123",
    totalPool: 1820,
    participants: 28,
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    options: [
      { id: "yes", label: "Yes", odds: 82, pool: 1492.4 },
      { id: "no", label: "No", odds: 18, pool: 327.6 },
    ],
    category: "tech",
    status: "active" as const,
  },
  {
    id: "3",
    question: "Will AI replace software engineers by 2030?",
    creator: "0x9876...5432",
    platform: "twitter" as const,
    postUrl: "https://twitter.com/example/status/456",
    totalPool: 5600,
    participants: 89,
    endsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    options: [
      { id: "yes", label: "Yes", odds: 25, pool: 1400 },
      { id: "no", label: "No", odds: 75, pool: 4200 },
    ],
    category: "tech",
    status: "active" as const,
  },
  {
    id: "4",
    question: "Will SpaceX land on Mars in 2026?",
    creator: "0xdef0...1234",
    platform: "twitter" as const,
    postUrl: "https://twitter.com/example/status/789",
    totalPool: 3200,
    participants: 56,
    endsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    options: [
      { id: "yes", label: "Yes", odds: 15, pool: 480 },
      { id: "no", label: "No", odds: 85, pool: 2720 },
    ],
    category: "science",
    status: "active" as const,
  },
  {
    id: "5",
    question: "Will the S&P 500 hit 6000 this year?",
    creator: "0xfeed...beef",
    platform: "farcaster" as const,
    postUrl: "https://warpcast.com/example/456",
    totalPool: 8900,
    participants: 124,
    endsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    options: [
      { id: "yes", label: "Yes", odds: 58, pool: 5162 },
      { id: "no", label: "No", odds: 42, pool: 3738 },
    ],
    category: "finance",
    status: "active" as const,
  },
  {
    id: "6",
    question: "Will there be a new COVID variant by summer?",
    creator: "0xc0de...cafe",
    platform: "twitter" as const,
    postUrl: "https://twitter.com/example/status/999",
    totalPool: 1200,
    participants: 34,
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    options: [
      { id: "yes", label: "Yes", odds: 45, pool: 540 },
      { id: "no", label: "No", odds: 55, pool: 660 },
    ],
    category: "health",
    status: "active" as const,
  },
]

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("trending")

  // Filter and sort markets
  const filteredMarkets = mockMarkets
    .filter((market) => {
      const matchesSearch = market.question.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || market.category === selectedCategory
      const matchesPlatform = selectedPlatform === "all" || market.platform === selectedPlatform
      return matchesSearch && matchesCategory && matchesPlatform
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "pool":
          return b.totalPool - a.totalPool
        case "ending-soon":
          return a.endsAt.getTime() - b.endsAt.getTime()
        case "participants":
          return b.participants - a.participants
        default:
          return b.totalPool - a.totalPool // trending = highest pool
      }
    })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Markets</h1>
        <p className="text-muted-foreground">Browse and bet on prediction markets from social media</p>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden bg-transparent">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <MarketFilters
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedPlatform={selectedPlatform}
                  setSelectedPlatform={setSelectedPlatform}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Filters */}
          <div className="hidden md:flex gap-2">
            <MarketFilters
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedPlatform={selectedPlatform}
              setSelectedPlatform={setSelectedPlatform}
              sortBy={sortBy}
              setSortBy={setSortBy}
              compact
            />
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredMarkets.length} of {mockMarkets.length} markets
        </p>
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredMarkets.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>

      {/* Empty State */}
      {filteredMarkets.length === 0 && (
        <Card className="p-12 bg-card border-border text-center">
          <p className="text-muted-foreground mb-4">No markets found matching your filters</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory("all")
              setSelectedPlatform("all")
            }}
          >
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  )
}
