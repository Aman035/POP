import { Card } from "@/components/ui/card"
import { History } from "lucide-react"

export default function HistoryPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">History</h1>
        <p className="text-muted-foreground">Your betting history and resolved markets</p>
      </div>

      <Card className="p-12 bg-card border-border text-center">
        <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No history yet</h3>
        <p className="text-muted-foreground">Your past bets and resolved markets will appear here</p>
      </Card>
    </div>
  )
}
