import { Card } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

export default function MyMarketsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Markets</h1>
        <p className="text-muted-foreground">Markets created by your address</p>
      </div>

      <Card className="p-12 bg-card border-border text-center">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No markets created yet</h3>
        <p className="text-muted-foreground">
          Markets you create will appear here
        </p>
      </Card>
    </div>
  )
}
