'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Home,
  TrendingUp,
  PlusCircle,
  Trophy,
  Activity,
  Target,
  ChevronLeft,
  ChevronRight,
  Zap,
  FolderOpen,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/app', label: 'Home', icon: Home },
  { href: '/app/markets', label: 'Markets', icon: TrendingUp },
  { href: '/app/create', label: 'Create', icon: PlusCircle },
  { href: '/app/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/app/activity', label: 'Activity', icon: Activity },
  { href: '/app/my-predictions', label: 'My Predictions', icon: Target },
  { href: '/app/my-markets', label: 'My Markets', icon: FolderOpen },
  { href: '/app/nexus', label: 'Cross-Chain', icon: Zap },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'border-r border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 sticky top-[73px] h-[calc(100vh-73px)]',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isActive && 'gold-gradient text-background font-semibold',
                    isCollapsed && 'justify-center'
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-border/50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  )
}
