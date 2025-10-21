"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BettingPanel } from "@/components/markets/betting-panel"
import { MarketActivity } from "@/components/markets/market-activity"
import { MarketChart } from "@/components/markets/market-chart"
import { SocialPostEmbed } from "@/components/markets/social-post-embed"
import {
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Share2,
  Bookmark,
  ExternalLink,
  Twitter,
  MessageSquare,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSearchParams } from "next/navigation"

// Mock market data - in real app this would come from API
const mockMarket = {
  id: "1",
  question: "Will Bitcoin reach $100k by end of 2025?",
  description:
    "This market resolves to YES if Bitcoin (BTC) reaches or exceeds $100,000 USD on any major exchange (Coinbase, Binance, Kraken) before December 31, 2025 11:59 PM UTC. Otherwise resolves to NO.",
  creator: "0x1234...5678",
  creatorName: "CryptoOracle",
  platform: "twitter" as const,
  postUrl: "https://twitter.com/example/status/123",
  totalPool: 2450,
  participants: 42,
  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  options: [
    { id: "yes", label: "Yes", odds: 65, pool: 1592.5, bettors: 28 },
    { id: "no", label: "No", odds: 35, pool: 857.5, bettors: 14 },
  ],
  category: "crypto",
  status: "active" as const,
  resolutionSource: "CoinMarketCap, Coinbase, Binance",
  creatorFee: 2,
}

export default function MarketDetailPage({ params }: { params: { id: string } }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const searchParams = useSearchParams()
  const isEmbedded = searchParams.get("embed") === "true"
  const hideUI = searchParams.get("hideUI") === "true"

  const timeRemaining = getTimeRemaining(mockMarket.endsAt)
  const PlatformIcon = mockMarket.platform === "twitter" ? Twitter : MessageSquare

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back Button - only show if not embedded */}
      {!(isEmbedded && hideUI) && (
        <Link href="/app/markets">
          <Button variant="ghost" size="sm">
            ← Back to Markets
          </Button>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Header */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">{mockMarket.category}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <PlatformIcon className="w-4 h-4" />
                    <span>{mockMarket.platform}</span>
                  </div>
                  <Badge className="gold-gradient text-background">{mockMarket.status}</Badge>
                </div>
                <h1 className="text-3xl font-bold mb-3 text-balance">{mockMarket.question}</h1>
                <p className="text-muted-foreground leading-relaxed">{mockMarket.description}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-gold-2 text-gold-2" : ""}`} />
                {isBookmarked ? "Saved" : "Save"}
              </Button>
              <a href={mockMarket.postUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <ExternalLink className="w-4 h-4" />
                  View Post
                </Button>
              </a>
            </div>
          </Card>

          {/* Market Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-gold-2" />
                <span className="text-sm text-muted-foreground">Total Pool</span>
              </div>
              <p className="text-2xl font-bold">${mockMarket.totalPool.toLocaleString()}</p>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-teal-1" />
                <span className="text-sm text-muted-foreground">Participants</span>
              </div>
              <p className="text-2xl font-bold">{mockMarket.participants}</p>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-rose-1" />
                <span className="text-sm text-muted-foreground">Time Left</span>
              </div>
              <p className="text-2xl font-bold">{timeRemaining}</p>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gold-2" />
                <span className="text-sm text-muted-foreground">Creator Fee</span>
              </div>
              <p className="text-2xl font-bold">{mockMarket.creatorFee}%</p>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-4">
              <MarketActivity marketId={mockMarket.id} />
            </TabsContent>

            <TabsContent value="chart" className="mt-4">
              <MarketChart marketId={mockMarket.id} />
            </TabsContent>

            <TabsContent value="info" className="mt-4">
              <Card className="p-6 bg-card border-border space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Market Creator</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full gold-gradient" />
                    <div>
                      <p className="font-medium">{mockMarket.creatorName}</p>
                      <p className="text-sm text-muted-foreground">{mockMarket.creator}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Resolution Source</h3>
                  <p className="text-muted-foreground">{mockMarket.resolutionSource}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Created</h3>
                  <p className="text-muted-foreground">{mockMarket.createdAt.toLocaleDateString()}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Ends</h3>
                  <p className="text-muted-foreground">{mockMarket.endsAt.toLocaleDateString()}</p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This is an experimental prediction market. Only bet what you can afford to lose. Markets are
                    resolved by the creator based on the stated resolution source.
                  </AlertDescription>
                </Alert>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Social Post Embed */}
          <SocialPostEmbed platform={mockMarket.platform} postUrl={mockMarket.postUrl} />
        </div>

        {/* Betting Panel Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <BettingPanel market={mockMarket} selectedOption={selectedOption} onSelectOption={setSelectedOption} />
          </div>
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
  return `${minutes}m`
}
