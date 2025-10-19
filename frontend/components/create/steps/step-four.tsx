import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Twitter, MessageSquare, Calendar, DollarSign, FileText } from "lucide-react"
import { format } from "date-fns"

interface StepFourProps {
  marketData: any
}

export function StepFour({ marketData }: StepFourProps) {
  const PlatformIcon = marketData.platform === "twitter" ? Twitter : MessageSquare

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-background" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Review Your Market</h2>
        <p className="text-muted-foreground">Double-check everything before creating your market</p>
      </div>

      <div className="space-y-4">
        {/* Platform */}
        <Card className="p-4 bg-background border-border">
          <div className="flex items-center gap-3">
            <PlatformIcon className="w-5 h-5 text-gold-2" />
            <div>
              <p className="text-sm text-muted-foreground">Platform</p>
              <p className="font-medium">{marketData.platform === "twitter" ? "Twitter/X" : "Farcaster"}</p>
            </div>
          </div>
        </Card>

        {/* Question */}
        <Card className="p-4 bg-background border-border">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-gold-2 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Question</p>
              <p className="font-medium mb-2">{marketData.question}</p>
              <p className="text-sm text-muted-foreground">{marketData.description}</p>
            </div>
          </div>
        </Card>

        {/* Options */}
        <Card className="p-4 bg-background border-border">
          <p className="text-sm text-muted-foreground mb-3">Options</p>
          <div className="space-y-2">
            {marketData.options.map((option: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="secondary">{option || `Option ${index + 1}`}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Parameters */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-background border-border">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gold-2" />
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">{marketData.endDate ? format(marketData.endDate, "PPP") : "Not set"}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-background border-border">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gold-2" />
              <div>
                <p className="text-sm text-muted-foreground">Creator Fee</p>
                <p className="font-medium">{marketData.creatorFee}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Resolution Source */}
        <Card className="p-4 bg-background border-border">
          <p className="text-sm text-muted-foreground mb-2">Resolution Source</p>
          <p className="text-sm">{marketData.resolutionSource}</p>
        </Card>
      </div>
    </div>
  )
}
