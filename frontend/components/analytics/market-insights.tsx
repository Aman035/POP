"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Users, Clock, Target, Award, Zap } from "lucide-react"

interface MarketInsightsProps {
  totalMarkets: number
  activeMarkets: number
  resolvedMarkets: number
  categoryBreakdown: Record<string, number>
  platformBreakdown: Record<string, number>
  avgResolutionTime: number
}

export function MarketInsights({
  totalMarkets,
  activeMarkets,
  resolvedMarkets,
  categoryBreakdown,
  platformBreakdown,
  avgResolutionTime
}: MarketInsightsProps) {
  const resolutionRate = totalMarkets > 0 ? (resolvedMarkets / totalMarkets * 100).toFixed(1) : '0'
  const topCategory = Object.entries(categoryBreakdown).sort(([,a], [,b]) => b - a)[0]
  const topPlatform = Object.entries(platformBreakdown).sort(([,a], [,b]) => b - a)[0]

  const insights = [
    {
      icon: Target,
      title: "Resolution Rate",
      value: `${resolutionRate}%`,
      description: "Markets successfully resolved",
      color: "text-green-600"
    },
    {
      icon: TrendingUp,
      title: "Top Category",
      value: topCategory?.[0] || "N/A",
      description: `${topCategory?.[1] || 0} markets`,
      color: "text-blue-600"
    },
    {
      icon: Users,
      title: "Top Platform",
      value: topPlatform?.[0] || "N/A", 
      description: `${topPlatform?.[1] || 0} markets`,
      color: "text-purple-600"
    },
    {
      icon: Clock,
      title: "Avg Resolution",
      value: `${avgResolutionTime.toFixed(1)}h`,
      description: "Time to resolution",
      color: "text-orange-600"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {insights.map((insight, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center`}>
              <insight.icon className={`w-5 h-5 ${insight.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{insight.title}</p>
              <p className="text-xl font-bold">{insight.value}</p>
              <p className="text-xs text-muted-foreground">{insight.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
