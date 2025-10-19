import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Clock, DollarSign, Users, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AppHomePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <Card className="p-6 gold-gradient">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-background mb-2">Welcome to POP</h1>
            <p className="text-background/80">Start predicting on social media polls and earn rewards</p>
          </div>
          <Link href="/app/create">
            <Button size="lg" variant="outline" className="bg-background text-foreground hover:bg-background/90">
              Create Market
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold-2/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-gold-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Markets</p>
              <p className="text-2xl font-bold">1,234</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-1/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-teal-1" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">24h Volume</p>
              <p className="text-2xl font-bold">$45.2K</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-1/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-rose-1" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">8,901</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold-2/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-gold-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Resolution</p>
              <p className="text-2xl font-bold">2.3h</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Markets */}
        <Card className="lg:col-span-2 p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Trending Markets</h2>
            <Link href="/app/markets">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-background border border-border hover:border-gold-2/50 transition-colors cursor-pointer"
              >
                <p className="font-medium mb-2">Will Bitcoin reach $100k by end of 2025?</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Pool: $2,450</span>
                  <span>Ends in 2d 5h</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-sm">
                <p className="text-foreground">
                  <span className="font-semibold">User{i}</span> bet <span className="text-gold-2">$50</span>
                </p>
                <p className="text-muted-foreground text-xs">2 minutes ago</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
