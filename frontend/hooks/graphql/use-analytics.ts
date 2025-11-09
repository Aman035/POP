import { useState, useCallback, useEffect, useRef } from 'react'
import { getAllMarkets, MarketCreated } from '@/lib/graphql-queries'
import { resolvePlatformMetadata, getPlatformLabel, getPlatformColor } from '@/lib/platform'

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
}

interface AnalyticsData {
  categoryData: CategoryData[]
  platformData: PlatformData[]
  topCreators: Creator[]
}

export function useAnalytics() {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [platformData, setPlatformData] = useState<PlatformData[]>([])
  const [topCreators, setTopCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']

  // Stable query function for analytics
  const queryFn = useCallback(async (): Promise<AnalyticsData> => {
    console.log('🔍 Analytics: Fetching analytics data...')
    
    const allMarkets = await getAllMarkets()
    console.log('🔍 Analytics: Raw markets for analytics:', allMarkets.length)
    
    // Calculate category breakdown
    const categoryBreakdown: Record<string, number> = {}
    const platformBreakdown: Record<string, { count: number, color: string }> = {}
    const creatorBreakdown: Record<string, { markets: number, categories: Set<string>, platforms: Set<string> }> = {}
    
    allMarkets.forEach((market: MarketCreated) => {
      const category = market.metadata_2 || 'General'
      const platform = resolvePlatformMetadata(market.metadata_3)
      const platformName = getPlatformLabel(platform)
      const creator = market.creator
      
      // Category breakdown
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1
      
      // Platform breakdown
      if (!platformBreakdown[platformName]) {
        platformBreakdown[platformName] = { count: 0, color: getPlatformColor(platform) }
      }
      platformBreakdown[platformName].count += 1
      
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
      .map(([platform, data]) => ({
        platform,
        count: data.count,
        color: data.color
      }))
      .sort((a, b) => b.count - a.count)
    
    // Format creator data
    const creatorsData: Creator[] = Object.entries(creatorBreakdown)
      .map(([address, data]) => ({
        address,
        marketsCreated: data.markets,
        categories: Array.from(data.categories),
        platforms: Array.from(data.platforms)
      }))
      .sort((a, b) => b.marketsCreated - a.marketsCreated)
    
    console.log('✅ Analytics: Calculated analytics data')
    
    return {
      categoryData: categoryChartData,
      platformData: platformChartData,
      topCreators: creatorsData
    }
  }, [])

  // Fetch analytics data
  const retryCountRef = useRef(0)
  useEffect(() => {
    let isMounted = true
    const maxRetries = 3
    const retryDelay = 1000

    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await queryFn()
        
        if (isMounted) {
          setCategoryData(data.categoryData)
          setPlatformData(data.platformData)
          setTopCreators(data.topCreators)
          setLoading(false)
          retryCountRef.current = 0 // Reset on success
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred')
        console.error('❌ Analytics: Error fetching analytics:', error)
        
        if (isMounted) {
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++
            setTimeout(() => {
              if (isMounted) {
                fetchAnalytics()
              }
            }, retryDelay)
          } else {
            setError(error.message)
            setLoading(false)
            retryCountRef.current = 0 // Reset for next attempt
          }
        }
      }
    }

    fetchAnalytics()

    return () => {
      isMounted = false
    }
  }, [queryFn])

  return {
    categoryData,
    platformData,
    topCreators,
    loading,
    error
  }
}
