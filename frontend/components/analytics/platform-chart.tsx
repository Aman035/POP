"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface PlatformData {
  platform: string
  count: number
  color: string
}

interface PlatformChartProps {
  data: PlatformData[]
}

const PLATFORM_COLORS = {
  'Twitter': '#1DA1F2',
  'Farcaster': '#8A63D2', 
  'Lens': '#00D4AA',
  'Other': '#6B7280'
}

export function PlatformChart({ data }: PlatformChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Platform Distribution</h3>
        <div className="text-center py-8 text-muted-foreground">
          No platform data available
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Platform Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="platform" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8">
              {data.map((entry, index) => (
                <Bar key={`bar-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
