"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Twitter, MessageSquare, LinkIcon } from "lucide-react"

interface StepOneProps {
  marketData: any
  updateMarketData: (updates: any) => void
}

export function StepOne({ marketData, updateMarketData }: StepOneProps) {
  const handleUrlChange = (url: string) => {
    updateMarketData({ pollUrl: url })

    // Auto-detect platform
    if (url.includes("twitter.com") || url.includes("x.com")) {
      updateMarketData({ platform: "twitter" })
    } else if (url.includes("warpcast.com") || url.includes("farcaster")) {
      updateMarketData({ platform: "farcaster" })
    } else {
      updateMarketData({ platform: null })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Paste Poll URL</h2>
        <p className="text-muted-foreground">
          Enter the URL of a Twitter or Farcaster poll to create a prediction market
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="poll-url">Poll URL</Label>
          <div className="relative mt-2">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="poll-url"
              type="url"
              placeholder="https://twitter.com/user/status/123456789"
              value={marketData.pollUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {marketData.platform && (
          <div className="p-4 rounded-lg bg-background border border-border">
            <div className="flex items-center gap-2 mb-2">
              {marketData.platform === "twitter" ? (
                <Twitter className="w-5 h-5 text-blue-400" />
              ) : (
                <MessageSquare className="w-5 h-5 text-purple-400" />
              )}
              <Badge variant="secondary">{marketData.platform === "twitter" ? "Twitter/X" : "Farcaster"}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Platform detected successfully</p>
          </div>
        )}
      </div>

      {/* Examples */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Example URLs:</p>
        <div className="space-y-2">
          <button
            onClick={() => handleUrlChange("https://twitter.com/example/status/123456789")}
            className="w-full p-3 rounded-lg bg-background border border-border hover:border-gold-2/50 transition-colors text-left text-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <Twitter className="w-4 h-4 text-blue-400" />
              <span className="font-medium">Twitter Poll</span>
            </div>
            <span className="text-muted-foreground">https://twitter.com/example/status/123456789</span>
          </button>
          <button
            onClick={() => handleUrlChange("https://warpcast.com/example/0x123456")}
            className="w-full p-3 rounded-lg bg-background border border-border hover:border-gold-2/50 transition-colors text-left text-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span className="font-medium">Farcaster Poll</span>
            </div>
            <span className="text-muted-foreground">https://warpcast.com/example/0x123456</span>
          </button>
        </div>
      </div>
    </div>
  )
}
