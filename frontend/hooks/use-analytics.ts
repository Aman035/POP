import { useState, useEffect } from 'react'
import { getAllMarkets, MarketCreated } from '@/lib/graphql-queries'
import { Platform } from '@/lib/types'

interface CategoryData {
  name: string
  value: number
  color: string
}

interface PlatformData {
  platform: string
  count: number
  color: string
}

interface Creator {
  address: string
  marketsCreated: number
  categories: string[]
  platforms: string[]
  successRate: number
}

export function useAnalytics() {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [platformData, setPlatformData] = useState<PlatformData[]>([])
  const [topCreators, setTopCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
  const PLATFORM_COLORS = {
    'Twitter': '#1DA1F2',
    'Farcaster': '#8A63D2', 
    'Lens': '#00D4AA',
    'Other': '#6B7280'
  }

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 Analytics: Fetching analytics data...')
        
        const allMarkets = await getAllMarkets()
        console.log('🔍 Analytics: Raw markets for analytics:', allMarkets.length)
        
        // Calculate category breakdown
        const categoryBreakdown: Record<string, number> = {}
        const platformBreakdown: Record<string, number> = {}
        const creatorBreakdown: Record<string, { markets: number, categories: Set<string>, platforms: Set<string> }> = {}
        
        allMarkets.forEach((market: MarketCreated) => {
          const category = market.metadata_2 || 'General'
          const platform = parseInt(market.metadata_3) || Platform.Other
          const platformName = ['Twitter', 'Farcaster', 'Lens', 'Other'][platform] || 'Other'
          const creator = market.creator
          
          // Category breakdown
          categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1
          
          // Platform breakdown
          platformBreakdown[platformName] = (platformBreakdown[platformName] || 0) + 1
          
          // Creator breakdown
          if (!creatorBreakdown[creator]) {
            creatorBreakdown[creator] = {
              markets: 0,
              categories: new Set(),
              platforms: new Set()
            }
          }
          creatorBreakdown[creator].markets += 1
          creatorBreakdown[creator].categories.add(category)
          creatorBreakdown[creator].platforms.add(platformName)
        })
        
        // Format category data for charts
        const categoryChartData: CategoryData[] = Object.entries(categoryBreakdown)
          .map(([name, value], index) => ({
            name,
            value,
            color: COLORS[index % COLORS.length]
          }))
          .sort((a, b) => b.value - a.value)
        
        // Format platform data for charts
        const platformChartData: PlatformData[] = Object.entries(platformBreakdown)
          .map(([platform, count]) => ({
            platform,
            count,
            color: PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS] || PLATFORM_COLORS.Other
          }))
          .sort((a, b) => b.count - a.count)
        
        // Format creator data
        const creatorsData: Creator[] = Object.entries(creatorBreakdown)
          .map(([address, data]) => ({
            address,
            marketsCreated: data.markets,
            categories: Array.from(data.categories),
            platforms: Array.from(data.platforms),
            successRate: 75 // Placeholder - would need more data to calculate actual success rate
          }))
          .sort((a, b) => b.marketsCreated - a.marketsCreated)
        
        setCategoryData(categoryChartData)
        setPlatformData(platformChartData)
        setTopCreators(creatorsData)
        
        console.log('✅ Analytics: Calculated analytics data')
        
      } catch (err) {
        console.error('❌ Analytics: Error fetching analytics:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  return {
    categoryData,
    platformData,
    topCreators,
    loading,
    error
  }
}
