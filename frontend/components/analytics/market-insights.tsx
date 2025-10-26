"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, Activity, PieChart, Globe } from "lucide-react"

interface MarketInsightsProps {
  totalMarkets: number
  resolvedMarkets: number
  categoryBreakdown: Record<string, number>
  platformBreakdown: Record<string, number>
}

export function MarketInsights({
  totalMarkets,
  resolvedMarkets,
  categoryBreakdown,
  platformBreakdown
}: MarketInsightsProps) {
  const resolutionRate = totalMarkets > 0 ? ((resolvedMarkets / totalMarkets) * 100).toFixed(1) : "0.0"
  const topCategory = Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a)[0]
  const topPlatform = Object.entries(platformBreakdown).sort(([, a], [, b]) => b - a)[0]

  const insights = [
    {
      icon: CheckCircle2,
      title: "Resolved Markets",
      value: resolvedMarkets.toLocaleString(),
      description: "Final outcomes recorded",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      icon: Activity,
      title: "Resolution Rate",
      value: `${resolutionRate}%`,
      description: "of total markets",
      color: "text-sky-500",
      bg: "bg-sky-500/10"
    },
    {
      icon: PieChart,
      title: "Top Category",
      value: topCategory?.[0] || "N/A",
      description: `${topCategory?.[1] || 0} markets`,
      color: "text-blue-600",
      bg: "bg-blue-600/10"
    },
    {
      icon: Globe,
      title: "Top Platform",
      value: topPlatform?.[0] || "N/A",
      description: `${topPlatform?.[1] || 0} markets`,
      color: "text-purple-600",
      bg: "bg-purple-600/10"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {insights.map((insight, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${insight.bg}`}>
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
