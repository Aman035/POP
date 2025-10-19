"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  PlusCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  ActivityIcon,
} from "lucide-react"

// Mock activity data
const allActivity = [
  {
    id: "1",
    type: "bet" as const,
    user: "0xabcd...1234",
    username: "CryptoKing",
    market: "Will Bitcoin reach $100k by end of 2025?",
    marketId: "1",
    option: "Yes",
    amount: 50,
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: "2",
    type: "create" as const,
    user: "0xdef0...5678",
    username: "MarketMaker",
    market: "Will the next iPhone have USB-C?",
    marketId: "2",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "3",
    type: "bet" as const,
    user: "0x9876...abcd",
    username: "PredictMaster",
    market: "Will AI replace software engineers by 2030?",
    marketId: "3",
    option: "No",
    amount: 100,
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: "4",
    type: "resolve" as const,
    user: "0x1111...2222",
    username: "OracleAI",
    market: "Will SpaceX launch Starship in Q1 2025?",
    marketId: "4",
    outcome: "Yes",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: "5",
    type: "bet" as const,
    user: "0x3333...4444",
    username: "BetSmart",
    market: "Will the S&P 500 hit 6000 this year?",
    marketId: "5",
    option: "Yes",
    amount: 75,
    timestamp: new Date(Date.now() - 20 * 60 * 1000),
  },
  {
    id: "6",
    type: "create" as const,
    user: "0x5555...6666",
    username: "PollPro",
    market: "Will there be a new COVID variant by summer?",
    marketId: "6",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "7",
    type: "bet" as const,
    user: "0x7777...8888",
    username: "TrendFollower",
    market: "Will Bitcoin reach $100k by end of 2025?",
    marketId: "1",
    option: "No",
    amount: 25,
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: "8",
    type: "resolve" as const,
    user: "0x9999...aaaa",
    username: "QuestionMaster",
    market: "Will Ethereum merge happen in 2024?",
    marketId: "7",
    outcome: "No",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
  },
]

export default function ActivityPage() {
  const [filter, setFilter] = useState<"all" | "bets" | "creates" | "resolves">("all")

  const filteredActivity = allActivity.filter((activity) => {
    if (filter === "all") return true
    if (filter === "bets") return activity.type === "bet"
    if (filter === "creates") return activity.type === "create"
    if (filter === "resolves") return activity.type === "resolve"
    return true
  })

  const getActivityIcon = (type: string, option?: string, outcome?: string) => {
    if (type === "bet") {
      return option === "Yes" ? (
        <TrendingUp className="w-5 h-5 text-teal-1" />
      ) : (
        <TrendingDown className="w-5 h-5 text-rose-1" />
      )
    }
    if (type === "create") return <PlusCircle className="w-5 h-5 text-gold-2" />
    if (type === "resolve") {
      return outcome === "Yes" ? (
        <CheckCircle className="w-5 h-5 text-teal-1" />
      ) : (
        <XCircle className="w-5 h-5 text-rose-1" />
      )
    }
    return <ActivityIcon className="w-5 h-5 text-muted-foreground" />
  }

  const getActivityText = (activity: any) => {
    if (activity.type === "bet") {
      return (
        <>
          <span className="font-semibold">{activity.username}</span> bet{" "}
          <span className="text-gold-2 font-semibold">${activity.amount}</span> on{" "}
          <Badge variant="secondary" className="mx-1">
            {activity.option}
          </Badge>
        </>
      )
    }
    if (activity.type === "create") {
      return (
        <>
          <span className="font-semibold">{activity.username}</span> created a new market
        </>
      )
    }
    if (activity.type === "resolve") {
      return (
        <>
          <span className="font-semibold">{activity.username}</span> resolved market to{" "}
          <Badge variant="secondary" className="mx-1">
            {activity.outcome}
          </Badge>
        </>
      )
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Activity Feed</h1>
        <p className="text-muted-foreground">Real-time activity across all markets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-gold-2" />
            <div>
              <p className="text-sm text-muted-foreground">24h Volume</p>
              <p className="text-2xl font-bold">$45.2K</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-teal-1" />
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold">1,234</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <ActivityIcon className="w-8 h-8 text-rose-1" />
            <div>
              <p className="text-sm text-muted-foreground">24h Transactions</p>
              <p className="text-2xl font-bold">892</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "gold-gradient text-background" : "bg-transparent"}
          >
            All Activity
          </Button>
          <Button
            variant={filter === "bets" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("bets")}
            className={filter === "bets" ? "gold-gradient text-background" : "bg-transparent"}
          >
            Bets
          </Button>
          <Button
            variant={filter === "creates" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("creates")}
            className={filter === "creates" ? "gold-gradient text-background" : "bg-transparent"}
          >
            New Markets
          </Button>
          <Button
            variant={filter === "resolves" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("resolves")}
            className={filter === "resolves" ? "gold-gradient text-background" : "bg-transparent"}
          >
            Resolutions
          </Button>
        </div>
      </Card>

      {/* Activity Feed */}
      <Card className="p-6 bg-card border-border">
        <div className="space-y-4">
          {filteredActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-background border border-border hover:border-gold-2/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center flex-shrink-0">
                {getActivityIcon(activity.type, activity.option, activity.outcome)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm mb-1">{getActivityText(activity)}</p>
                <p className="text-sm text-muted-foreground mb-2 truncate">{activity.market}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{activity.user}</span>
                  <span>•</span>
                  <span>{getTimeAgo(activity.timestamp)}</span>
                </div>
              </div>

              <Button variant="ghost" size="sm" className="flex-shrink-0">
                View
              </Button>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-6">
          <Button variant="outline" className="bg-transparent">
            Load More Activity
          </Button>
        </div>
      </Card>
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString()
}
