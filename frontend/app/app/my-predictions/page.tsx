import { Card } from '@/components/ui/card'
import { Target } from 'lucide-react'

export default function MyPredictionsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Predictions</h1>
        <p className="text-muted-foreground">
          Your predictions and betting activity
        </p>
      </div>

      <Card className="p-12 bg-card border-border text-center">
        <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No predictions yet</h3>
        <p className="text-muted-foreground">
          Your predictions and bets will appear here
        </p>
      </Card>
    </div>
  )
}
