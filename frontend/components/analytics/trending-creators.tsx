"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, User, Award } from "lucide-react"

interface Creator {
  address: string
  marketsCreated: number
  categories: string[]
  platforms: string[]
}

interface TrendingCreatorsProps {
  creators: Creator[]
}

export function TrendingCreators({ creators }: TrendingCreatorsProps) {
  if (!creators || creators.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Creators</h3>
        <div className="text-center py-8 text-muted-foreground">
          No creator data available
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-gold-2" />
        <h3 className="text-lg font-semibold">Top Creators</h3>
      </div>
      
      <div className="space-y-3">
        {creators.slice(0, 5).map((creator, index) => (
          <div key={creator.address} className="flex items-center justify-between p-3 rounded-lg bg-background border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold-2/20 flex items-center justify-center">
                <span className="text-sm font-bold text-gold-2">#{index + 1}</span>
              </div>
              <div>
                <p className="font-medium text-sm">
                  {creator.address.slice(0, 6)}...{creator.address.slice(-4)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {creator.marketsCreated} markets
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex gap-1 mb-1">
                {creator.categories.slice(0, 2).map((category) => (
                  <Badge key={category} variant="outline" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
              </div>
            </div>
        ))}
      </div>
    </Card>
  )
}
