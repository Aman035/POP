import { useState, useEffect } from 'react'
import { getAllMarkets, MarketCreated } from '@/lib/graphql-queries'
import { Platform } from '@/lib/types'

interface MarketStats {
  totalMarkets: number
  activeMarkets: number
  resolvedMarkets: number
  cancelledMarkets: number
  totalLiquidity: string
  totalParticipants: number
  avgResolutionTime: number
  categoryBreakdown: Record<string, number>
  platformBreakdown: Record<string, number>
  uniqueCategories: number
  uniquePlatforms: number
}

export function useMarketStatsGraphQL() {
  const [stats, setStats] = useState<MarketStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMarketStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 GraphQL Hook: Fetching market stats from GraphQL...')
        
        // Get all markets from GraphQL
        const allMarkets = await getAllMarkets()
        
        console.log('🔍 GraphQL Hook: Raw markets for stats:', allMarkets.length)
        
        // Calculate stats from GraphQL data
        const totalMarkets = allMarkets.length
        
        // Since GraphQL doesn't have real-time status, we'll estimate based on endTime
        const now = Date.now() / 1000
        const activeMarkets = allMarkets.filter(market => {
          const endTime = parseInt(market.params_3) || 0 // params_3 is endTime
          return endTime > now
        }).length
        
        const resolvedMarkets = allMarkets.filter(market => {
          const endTime = parseInt(market.params_3) || 0 // params_3 is endTime
          return endTime <= now
        }).length
        
        // Calculate category breakdown
        const categoryBreakdown: Record<string, number> = {}
        const platformBreakdown: Record<string, number> = {}
        
        allMarkets.forEach((market: MarketCreated) => {
          const category = market.metadata_2 || 'General'
          const platform = parseInt(market.metadata_3) || Platform.Other
          const platformName = ['Twitter', 'Farcaster', 'Lens', 'Other'][platform] || 'Other'
          
          categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1
          platformBreakdown[platformName] = (platformBreakdown[platformName] || 0) + 1
        })
        
        const uniqueCategories = Object.keys(categoryBreakdown).length
        const uniquePlatforms = Object.keys(platformBreakdown).length
        
        // Calculate average resolution time (estimate based on endTime - createdAt)
        const marketsWithTime = allMarkets.filter(market => {
          const createdAt = parseInt(market.params_1) || 0 // params_1 is createdAt
          const endTime = parseInt(market.params_3) || 0 // params_3 is endTime
          return endTime > createdAt
        })
        
        const avgResolutionTime = marketsWithTime.length > 0 
          ? marketsWithTime.reduce((sum, market) => {
              const createdAt = parseInt(market.params_1) || 0 // params_1 is createdAt
              const endTime = parseInt(market.params_3) || 0 // params_3 is endTime
              return sum + (endTime - createdAt) / 3600 // Convert to hours
            }, 0) / marketsWithTime.length
          : 0
        
        const calculatedStats: MarketStats = {
          totalMarkets,
          activeMarkets,
          resolvedMarkets,
          cancelledMarkets: 0, // Not available in GraphQL data
          totalLiquidity: '0', // Not available in GraphQL data
          totalParticipants: 0, // Not available in GraphQL data
          avgResolutionTime,
          categoryBreakdown,
          platformBreakdown,
          uniqueCategories,
          uniquePlatforms,
        }
        
        setStats(calculatedStats)
        console.log('✅ GraphQL Hook: Calculated stats:', calculatedStats)
        
      } catch (err) {
        console.error('❌ GraphQL Hook: Error fetching market stats:', err)
        
        // Try fallback to API if GraphQL fails
        try {
          console.log('🔄 GraphQL Hook: Attempting fallback to API for stats...')
          const response = await fetch('/api/stats')
          const data = await response.json()
          
          if (data.success && data.stats) {
            console.log('✅ GraphQL Hook: API fallback for stats successful')
            setStats(data.stats)
            setError(null)
          } else {
            throw new Error('API fallback also failed')
          }
        } catch (fallbackErr) {
          console.error('❌ GraphQL Hook: API fallback for stats also failed:', fallbackErr)
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market statistics'
          setError(errorMessage)
          
          // Set default stats on error to prevent UI issues
          setStats({
            totalMarkets: 0,
            activeMarkets: 0,
            resolvedMarkets: 0,
            cancelledMarkets: 0,
            totalLiquidity: '0',
            totalParticipants: 0,
            avgResolutionTime: 0,
            categoryBreakdown: {},
            platformBreakdown: {},
            uniqueCategories: 0,
            uniquePlatforms: 0,
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchMarketStats()
  }, [])

  return { stats, loading, error }
}
