import { Card } from "@/components/ui/card"
import { Twitter, MessageSquare, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SocialPostEmbedProps {
  platform: "twitter" | "farcaster"
  postUrl: string
}

export function SocialPostEmbed({ platform, postUrl }: SocialPostEmbedProps) {
  const PlatformIcon = platform === "twitter" ? Twitter : MessageSquare

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PlatformIcon className="w-5 h-5 text-gold-2" />
          <h3 className="font-semibold">Original Post</h3>
        </div>
        <a href={postUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            View on {platform === "twitter" ? "X" : "Farcaster"}
          </Button>
        </a>
      </div>

      {/* Mock embed - in real app this would be actual social media embed */}
      <div className="p-6 rounded-lg bg-background border border-border">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full gold-gradient" />
          <div>
            <p className="font-semibold">CryptoOracle</p>
            <p className="text-sm text-muted-foreground">@cryptooracle · 3d</p>
          </div>
        </div>
        <p className="text-foreground mb-4">
          Will Bitcoin reach $100k by end of 2025? 🚀
          <br />
          <br />
          What do you think? Drop your predictions below! 👇
        </p>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>💬 42</span>
          <span>🔄 128</span>
          <span>❤️ 256</span>
        </div>
      </div>
    </Card>
  )
}
