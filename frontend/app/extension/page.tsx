import { ExtensionPopup } from "@/components/extension/extension-popup"
import { MarketWidget } from "@/components/extension/market-widget"
import { InlineMarketCard } from "@/components/extension/inline-market-card"
import { Card } from "@/components/ui/card"

const mockMarket = {
  id: "1",
  question: "Will Bitcoin reach $100k by end of 2025?",
  options: [
    { id: "yes", label: "Yes", odds: 65 },
    { id: "no", label: "No", odds: 35 },
  ],
  totalPool: 2450,
  participants: 42,
  endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
}

export default function ExtensionDemoPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Extension UI Components</h1>
          <p className="text-muted-foreground">Preview of browser extension components for POP</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Extension Popup */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Extension Popup</h2>
            <Card className="p-4 bg-card border-border inline-block">
              <ExtensionPopup />
            </Card>
          </div>

          {/* Market Widgets */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Market Widget (Full)</h2>
              <MarketWidget market={mockMarket} />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Market Widget (Compact)</h2>
              <MarketWidget market={mockMarket} compact />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Inline Market Card</h2>
              <InlineMarketCard market={mockMarket} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
