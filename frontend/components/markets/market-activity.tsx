import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface ActivityItem {
  id: string
  user: string
  action: "bet" | "create" | "resolve"
  option?: string
  amount?: number
  timestamp: Date
}

const mockActivity: ActivityItem[] = [
  {
    id: "1",
    user: "0xabcd...1234",
    action: "bet",
    option: "Yes",
    amount: 50,
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "2",
    user: "0xdef0...5678",
    action: "bet",
    option: "No",
    amount: 25,
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: "3",
    user: "0x9876...abcd",
    action: "bet",
    option: "Yes",
    amount: 100,
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "4",
    user: "0x1111...2222",
    action: "bet",
    option: "Yes",
    amount: 75,
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: "5",
    user: "0x3333...4444",
    action: "bet",
    option: "No",
    amount: 30,
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
  },
]

export function MarketActivity({ marketId }: { marketId: string }) {
  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {mockActivity.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center">
                {activity.option === "Yes" ? (
                  <TrendingUp className="w-4 h-4 text-background" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-background" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">
                  <span className="text-muted-foreground">{activity.user}</span> bet on{" "}
                  <Badge variant="secondary" className="ml-1">
                    {activity.option}
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground">{getTimeAgo(activity.timestamp)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gold-2">${activity.amount}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString()
}
