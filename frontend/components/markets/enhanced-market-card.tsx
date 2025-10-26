"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Users, TrendingUp, Twitter, MessageCircle, Eye } from "lucide-react"
import Link from "next/link"

interface EnhancedMarketCardProps {
  address: string
  question: string
  description: string
  category: string
  platform: number
  creator: string
  createdAt: number
  endTime: number
  totalLiquidity: string
  activeParticipantsCount: number
  options: string[]
  isResolved: boolean
  timeRemaining: number
}

const PLATFORM_ICONS = {
  0: Twitter,
  1: MessageCircle, // Farcaster
  2: Eye, // Lens
  3: TrendingUp // Other
}

const PLATFORM_NAMES = {
  0: "Twitter",
  1: "Farcaster", 
  2: "Lens",
  3: "Other"
}

const CATEGORY_COLORS = {
  'sports': 'bg-green-100 text-green-800',
  'politics': 'bg-red-100 text-red-800',
  'finance': 'bg-blue-100 text-blue-800',
  'science': 'bg-purple-100 text-purple-800',
  'technology': 'bg-orange-100 text-orange-800',
  'entertainment': 'bg-pink-100 text-pink-800',
  'General': 'bg-gray-100 text-gray-800'
}

export function EnhancedMarketCard({
  address,
  question,
  description,
  category,
  platform,
  creator,
  createdAt,
  endTime,
  totalLiquidity,
  activeParticipantsCount,
  options,
  isResolved,
  timeRemaining
}: EnhancedMarketCardProps) {
  const PlatformIcon = PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS] || TrendingUp
  const platformName = PLATFORM_NAMES[platform as keyof typeof PLATFORM_NAMES] || "Other"
  
  const getTimeRemaining = () => {
    if (isResolved) return "Resolved"
    
    const days = Math.floor(timeRemaining / (24 * 60 * 60))
    const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((timeRemaining % (60 * 60)) / 60)
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getProgressPercentage = () => {
    const totalDuration = endTime - createdAt
    const elapsed = Date.now() / 1000 - createdAt
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
  }

  return (
    <Link href={`/app/markets/${address}`}>
      <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer border hover:border-gold-2/50">
        <div className="space-y-3">
          {/* Header with platform and category */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlatformIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{platformName}</span>
            </div>
            <Badge 
              className={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.General}
            >
              {category}
            </Badge>
          </div>

          {/* Question */}
          <div>
            <h3 className="font-semibold text-lg leading-tight mb-1">{question}</h3>
            {description && (
              <p className="text-sm text-muted-foreground overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{description}</p>
            )}
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-1">
            {options.slice(0, 3).map((option, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {option}
              </Badge>
            ))}
            {options.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{options.length - 3} more
              </Badge>
            )}
          </div>

          {/* Progress bar for time remaining */}
          {!isResolved && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Time Remaining</span>
                <span className="font-medium">{getTimeRemaining()}</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span>${parseFloat(totalLiquidity).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{activeParticipantsCount}</span>
              </div>
            </div>
            <div className="text-muted-foreground">
              by {creator.slice(0, 6)}...{creator.slice(-4)}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
