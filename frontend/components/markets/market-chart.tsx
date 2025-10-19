"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

// Mock chart data
const mockChartData = [
  { time: "Day 1", yes: 50, no: 50 },
  { time: "Day 2", yes: 55, no: 45 },
  { time: "Day 3", yes: 60, no: 40 },
  { time: "Day 4", yes: 62, no: 38 },
  { time: "Day 5", yes: 65, no: 35 },
]

export function MarketChart({ marketId }: { marketId: string }) {
  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="font-semibold mb-4">Odds History</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 178, 56, 0.1)" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#171923",
                border: "1px solid rgba(255, 178, 56, 0.15)",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="yes" stroke="#22d3ee" strokeWidth={2} name="Yes %" />
            <Line type="monotone" dataKey="no" stroke="#fb7185" strokeWidth={2} name="No %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
