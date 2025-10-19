"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MarketFiltersProps {
  selectedCategory: string
  setSelectedCategory: (value: string) => void
  selectedPlatform: string
  setSelectedPlatform: (value: string) => void
  sortBy: string
  setSortBy: (value: string) => void
  compact?: boolean
}

export function MarketFilters({
  selectedCategory,
  setSelectedCategory,
  selectedPlatform,
  setSelectedPlatform,
  sortBy,
  setSortBy,
  compact = false,
}: MarketFiltersProps) {
  if (compact) {
    return (
      <>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="crypto">Crypto</SelectItem>
            <SelectItem value="tech">Tech</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="science">Science</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="sports">Sports</SelectItem>
            <SelectItem value="politics">Politics</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="twitter">Twitter/X</SelectItem>
            <SelectItem value="farcaster">Farcaster</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="pool">Highest Pool</SelectItem>
            <SelectItem value="ending-soon">Ending Soon</SelectItem>
            <SelectItem value="participants">Most Active</SelectItem>
          </SelectContent>
        </Select>
      </>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Category</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="crypto">Crypto</SelectItem>
            <SelectItem value="tech">Tech</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="science">Science</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="sports">Sports</SelectItem>
            <SelectItem value="politics">Politics</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Platform</label>
        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger>
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="twitter">Twitter/X</SelectItem>
            <SelectItem value="farcaster">Farcaster</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Sort By</label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="pool">Highest Pool</SelectItem>
            <SelectItem value="ending-soon">Ending Soon</SelectItem>
            <SelectItem value="participants">Most Active</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
