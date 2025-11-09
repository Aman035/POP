"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { TrendingUp, DollarSign } from "lucide-react"

interface LiquidityChartProps {
  options: string[]
  optionLiquidity: string[]
  totalLiquidity: string
  winningOption?: number
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

export const LiquidityChart: React.FC<LiquidityChartProps> = ({ options, optionLiquidity, totalLiquidity, winningOption }) => {
  // Parse liquidity values safely
  const parseLiquidity = (value: string | number): number => {
    const parsed = typeof value === 'string' ? parseFloat(value) : value
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed
  }

  const total = parseLiquidity(totalLiquidity)
  
  // Prepare chart data
  const chartData = options.map((option, index) => {
    const liquidity = parseLiquidity(optionLiquidity[index] || '0')
    const percentage = total > 0 ? (liquidity / total) * 100 : 0
    const isWinner = winningOption !== undefined && winningOption === index
    
    return {
      name: option,
      value: liquidity,
      percentage: percentage.toFixed(2),
      isWinner,
      color: COLORS[index % COLORS.length]
    }
  }).filter(item => item.value > 0 || total === 0) // Only show options with liquidity or if no liquidity yet

  // Custom label for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Don't show label if slice is too small
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold mb-1">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Liquidity: <span className="font-semibold text-foreground">${data.value.toFixed(2)}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Share: <span className="font-semibold text-foreground">{data.percentage}%</span>
          </p>
          {data.isWinner && (
            <p className="text-sm text-green-600 font-semibold mt-1">✓ Winner</p>
          )}
        </div>
      )
    }
    return null
  }

  if (total === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-lg">Liquidity Distribution</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <DollarSign className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No liquidity yet</p>
          <p className="text-sm text-muted-foreground mt-1">Be the first to place a bet!</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-lg">Liquidity Distribution</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total Liquidity</p>
          <p className="text-lg font-bold">${total.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isWinner ? '#10b981' : entry.color}
                    stroke={entry.isWinner ? '#059669' : '#fff'}
                    strokeWidth={entry.isWinner ? 3 : 2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tickFormatter={(value) => `$${value.toFixed(0)}`} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isWinner ? '#10b981' : entry.color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {chartData.map((item, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-3 p-2 rounded-lg ${
                item.isWinner ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-muted/50'
              }`}
            >
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.isWinner ? '#10b981' : item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{item.name}</span>
                  {item.isWinner && (
                    <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">Winner</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    ${item.value.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

