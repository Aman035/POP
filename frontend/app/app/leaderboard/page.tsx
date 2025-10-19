"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, DollarSign, Target, Crown, Medal, Award } from "lucide-react"

// Mock leaderboard data
const topBettors = [
  {
    rank: 1,
    address: "0x1234...5678",
    username: "CryptoKing",
    totalVolume: 45230,
    totalProfit: 12450,
    winRate: 68,
    marketsTraded: 156,
  },
  {
    rank: 2,
    address: "0xabcd...efgh",
    username: "PredictMaster",
    totalVolume: 38920,
    totalProfit: 9870,
    winRate: 64,
    marketsTraded: 142,
  },
  {
    rank: 3,
    address: "0x9876...5432",
    username: "OracleAI",
    totalVolume: 32100,
    totalProfit: 8230,
    winRate: 61,
    marketsTraded: 128,
  },
  {
    rank: 4,
    address: "0xdef0...1234",
    username: "MarketWhale",
    totalVolume: 28450,
    totalProfit: 6890,
    winRate: 59,
    marketsTraded: 115,
  },
  {
    rank: 5,
    address: "0xfeed...beef",
    username: "BetSmart",
    totalVolume: 24780,
    totalProfit: 5670,
    winRate: 57,
    marketsTraded: 98,
  },
  {
    rank: 6,
    address: "0xc0de...cafe",
    username: "TrendFollower",
    totalVolume: 21340,
    totalProfit: 4520,
    winRate: 55,
    marketsTraded: 87,
  },
  {
    rank: 7,
    address: "0x1111...2222",
    username: "DataDriven",
    totalVolume: 19230,
    totalProfit: 3890,
    winRate: 53,
    marketsTraded: 76,
  },
  {
    rank: 8,
    address: "0x3333...4444",
    username: "RiskTaker",
    totalVolume: 17560,
    totalProfit: 3120,
    winRate: 51,
    marketsTraded: 68,
  },
]

const topCreators = [
  {
    rank: 1,
    address: "0x5555...6666",
    username: "MarketMaker",
    marketsCreated: 45,
    totalVolume: 125000,
    feesEarned: 3750,
    avgParticipants: 67,
  },
  {
    rank: 2,
    address: "0x7777...8888",
    username: "PollPro",
    marketsCreated: 38,
    totalVolume: 98000,
    feesEarned: 2940,
    avgParticipants: 54,
  },
  {
    rank: 3,
    address: "0x9999...aaaa",
    username: "QuestionMaster",
    marketsCreated: 32,
    totalVolume: 76000,
    feesEarned: 2280,
    avgParticipants: 48,
  },
  {
    rank: 4,
    address: "0xbbbb...cccc",
    username: "TrendSetter",
    marketsCreated: 28,
    totalVolume: 62000,
    feesEarned: 1860,
    avgParticipants: 42,
  },
  {
    rank: 5,
    address: "0xdddd...eeee",
    username: "ContentKing",
    marketsCreated: 24,
    totalVolume: 51000,
    feesEarned: 1530,
    avgParticipants: 38,
  },
]

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<"all" | "month" | "week">("all")

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-gold-1" />
    if (rank === 2) return <Medal className="w-5 h-5 text-ink-2" />
    if (rank === 3) return <Award className="w-5 h-5 text-gold-4" />
    return <span className="text-muted-foreground font-semibold">#{rank}</span>
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">Top performers on the platform</p>
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center gap-2">
          <Badge
            variant={timeframe === "all" ? "default" : "outline"}
            className={`cursor-pointer ${timeframe === "all" ? "gold-gradient text-background" : ""}`}
            onClick={() => setTimeframe("all")}
          >
            All Time
          </Badge>
          <Badge
            variant={timeframe === "month" ? "default" : "outline"}
            className={`cursor-pointer ${timeframe === "month" ? "gold-gradient text-background" : ""}`}
            onClick={() => setTimeframe("month")}
          >
            This Month
          </Badge>
          <Badge
            variant={timeframe === "week" ? "default" : "outline"}
            className={`cursor-pointer ${timeframe === "week" ? "gold-gradient text-background" : ""}`}
            onClick={() => setTimeframe("week")}
          >
            This Week
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bettors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bettors">Top Bettors</TabsTrigger>
          <TabsTrigger value="creators">Top Creators</TabsTrigger>
        </TabsList>

        {/* Top Bettors */}
        <TabsContent value="bettors" className="mt-6 space-y-4">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {topBettors.slice(0, 3).map((bettor) => (
              <Card
                key={bettor.rank}
                className={`p-6 text-center ${
                  bettor.rank === 1
                    ? "gold-gradient text-background md:order-2"
                    : bettor.rank === 2
                      ? "bg-card border-border md:order-1"
                      : "bg-card border-border md:order-3"
                }`}
              >
                <div className="flex justify-center mb-3">{getRankIcon(bettor.rank)}</div>
                <div
                  className={`w-16 h-16 rounded-full ${bettor.rank === 1 ? "bg-background/20" : "gold-gradient"} flex items-center justify-center mx-auto mb-3`}
                >
                  <span className={`text-2xl font-bold ${bettor.rank === 1 ? "text-background" : "text-background"}`}>
                    {bettor.username.charAt(0)}
                  </span>
                </div>
                <h3 className={`font-bold mb-1 ${bettor.rank === 1 ? "text-background" : ""}`}>{bettor.username}</h3>
                <p className={`text-sm mb-3 ${bettor.rank === 1 ? "text-background/80" : "text-muted-foreground"}`}>
                  {bettor.address}
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className={bettor.rank === 1 ? "text-background/80" : "text-muted-foreground"}>
                      Total Profit
                    </span>
                    <span className={`font-bold ${bettor.rank === 1 ? "text-background" : "text-gold-2"}`}>
                      ${bettor.totalProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={bettor.rank === 1 ? "text-background/80" : "text-muted-foreground"}>Win Rate</span>
                    <span className={`font-bold ${bettor.rank === 1 ? "text-background" : ""}`}>{bettor.winRate}%</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Rest of Leaderboard */}
          <Card className="p-6 bg-card border-border">
            <div className="space-y-3">
              {topBettors.slice(3).map((bettor) => (
                <div
                  key={bettor.rank}
                  className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-gold-2/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-8 text-center">{getRankIcon(bettor.rank)}</div>
                    <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center">
                      <span className="text-lg font-bold text-background">{bettor.username.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{bettor.username}</p>
                      <p className="text-sm text-muted-foreground">{bettor.address}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-6 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Volume</p>
                      <p className="font-semibold">${(bettor.totalVolume / 1000).toFixed(1)}k</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Profit</p>
                      <p className="font-semibold text-gold-2">${(bettor.totalProfit / 1000).toFixed(1)}k</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
                      <p className="font-semibold">{bettor.winRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Markets</p>
                      <p className="font-semibold">{bettor.marketsTraded}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Top Creators */}
        <TabsContent value="creators" className="mt-6 space-y-4">
          <Card className="p-6 bg-card border-border">
            <div className="space-y-3">
              {topCreators.map((creator) => (
                <div
                  key={creator.rank}
                  className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-gold-2/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-8 text-center">{getRankIcon(creator.rank)}</div>
                    <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center">
                      <span className="text-lg font-bold text-background">{creator.username.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{creator.username}</p>
                      <p className="text-sm text-muted-foreground">{creator.address}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-6 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Markets</p>
                      <p className="font-semibold">{creator.marketsCreated}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Volume</p>
                      <p className="font-semibold">${(creator.totalVolume / 1000).toFixed(0)}k</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Fees Earned</p>
                      <p className="font-semibold text-gold-2">${(creator.feesEarned / 1000).toFixed(1)}k</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Avg Users</p>
                      <p className="font-semibold">{creator.avgParticipants}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-gold-2" />
            <div>
              <p className="text-sm text-muted-foreground">Total Bettors</p>
              <p className="text-2xl font-bold">8,901</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-teal-1" />
            <div>
              <p className="text-sm text-muted-foreground">Total Volume</p>
              <p className="text-2xl font-bold">$2.4M</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-gold-2" />
            <div>
              <p className="text-sm text-muted-foreground">Fees Paid</p>
              <p className="text-2xl font-bold">$48K</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-rose-1" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Win Rate</p>
              <p className="text-2xl font-bold">54%</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
