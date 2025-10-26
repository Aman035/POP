import { useState, useEffect, useCallback, useRef } from 'react'

interface StableGraphQLOptions {
  dependencies?: any[]
  enabled?: boolean
  retryCount?: number
  retryDelay?: number
  maxDepth?: number
  autoRefresh?: boolean
  refreshInterval?: number
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  onRetry?: (attempt: number, error: Error) => void
}

interface StableGraphQLResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  retryCount: number
}

export function useGraphQLWithFallback<T>(
  queryFn: () => Promise<T>,
  fallbackFn: () => Promise<T>,
  options: StableGraphQLOptions = {}
): StableGraphQLResult<T> {
  const {
    dependencies = [],
    enabled = true,
    retryCount = 3,
    retryDelay = 1000,
    maxDepth = 3,
    autoRefresh = true,
    refreshInterval = 120000, // 2 minutes default
    onSuccess,
    onError,
    onRetry
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [currentRetryCount, setCurrentRetryCount] = useState(0)
  const [depth, setDepth] = useState(0)
  
  // Refs to prevent stale closures and infinite loops
  const isMountedRef = useRef(true)
  const lastDataRef = useRef<T | null>(null)
  const lastDependenciesRef = useRef<any[]>([])
  const isFetchingRef = useRef(false)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastFetchTimeRef = useRef<number>(0)

  // Check if data has actually changed
  const hasDataChanged = useCallback((newData: T | null) => {
    if (!lastDataRef.current && !newData) return false
    if (!lastDataRef.current || !newData) return true
    
    // Deep comparison for objects
    try {
      return JSON.stringify(lastDataRef.current) !== JSON.stringify(newData)
    } catch {
      // If JSON.stringify fails, assume data changed
      return true
    }
  }, [])

  // Check if dependencies have changed
  const haveDependenciesChanged = useCallback((newDeps: any[]) => {
    if (lastDependenciesRef.current.length !== newDeps.length) return true
    
    return lastDependenciesRef.current.some((dep, index) => {
      try {
        return JSON.stringify(dep) !== JSON.stringify(newDeps[index])
      } catch {
        return dep !== newDeps[index]
      }
    })
  }, [])

  // Main fetch function with retry logic
  const fetchData = useCallback(async (isRetry = false) => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log('🔄 GraphQL: Fetch already in progress, skipping...')
      return
    }

    // Check max depth to prevent infinite loops
    if (depth >= maxDepth) {
      console.error('❌ GraphQL: Max depth reached, stopping fetch')
      setError(new Error('Maximum fetch depth reached'))
      return
    }

    // Check if component is still mounted
    if (!isMountedRef.current) {
      console.log('🔄 GraphQL: Component unmounted, stopping fetch')
      return
    }

    isFetchingRef.current = true
    setLoading(true)
    setError(null)

    try {
      console.log(`🔍 GraphQL: Fetching data (attempt ${currentRetryCount + 1}/${retryCount + 1})`)
      
      let result: T
      
      try {
        // Try primary query function first
        result = await queryFn()
        console.log('✅ GraphQL: Primary query successful')
      } catch (primaryError) {
        console.log('⚠️ GraphQL: Primary query failed, trying fallback...')
        
        // Try fallback function
        result = await fallbackFn()
        console.log('✅ GraphQL: Fallback query successful')
      }

      // Check if data has actually changed (but always update if no previous data)
      if (lastDataRef.current && !hasDataChanged(result)) {
        console.log('🔄 GraphQL: Data unchanged, skipping update')
        console.log('🔍 GraphQL: Previous data:', lastDataRef.current)
        console.log('🔍 GraphQL: New data:', result)
        setLoading(false) // CRITICAL: Set loading to false even when data is unchanged
        isFetchingRef.current = false
        return
      }
      
      console.log('🔄 GraphQL: Data changed or first load, updating...')

      // Update data only if it has changed
      setData(result)
      lastDataRef.current = result
      setCurrentRetryCount(0) // Reset retry count on success
      setDepth(0) // Reset depth on success
      lastFetchTimeRef.current = Date.now() // Track last successful fetch
      setLoading(false) // CRITICAL: Set loading to false when data is successfully fetched
      
      onSuccess?.(result)
      console.log('✅ GraphQL: Data updated successfully')

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred')
      console.error('❌ GraphQL: Fetch error:', error.message)
      
      setError(error)
      onError?.(error)

      // Retry logic
      if (currentRetryCount < retryCount && isMountedRef.current) {
        const nextRetryCount = currentRetryCount + 1
        console.log(`🔄 GraphQL: Retrying in ${retryDelay}ms (attempt ${nextRetryCount}/${retryCount})`)
        
        onRetry?.(nextRetryCount, error)
        
        // Clear any existing timeout
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current)
        }
        
        // Set retry timeout
        retryTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setCurrentRetryCount(nextRetryCount)
            setDepth(prev => prev + 1)
            fetchData(true)
          }
        }, retryDelay)
      } else {
        console.error('❌ GraphQL: Max retries reached or component unmounted')
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
        isFetchingRef.current = false
      }
    }
  }, [
    queryFn,
    fallbackFn,
    currentRetryCount,
    retryCount,
    retryDelay,
    depth,
    maxDepth,
    hasDataChanged,
    onSuccess,
    onError,
    onRetry
  ])

  // Effect to handle dependency changes and initial fetch
  useEffect(() => {
    if (!enabled) {
      console.log('🔄 GraphQL: Hook disabled, skipping fetch')
      return
    }

    // Always fetch on initial load (when lastDependenciesRef is empty)
    if (lastDependenciesRef.current.length === 0) {
      console.log('🔄 GraphQL: Initial load, fetching data...')
      console.log('🔍 GraphQL: Initial dependencies:', dependencies)
      lastDependenciesRef.current = [...dependencies]
      fetchData()
      return
    }

    // Check if dependencies have changed
    if (!haveDependenciesChanged(dependencies)) {
      console.log('🔄 GraphQL: Dependencies unchanged, skipping fetch')
      console.log('🔍 GraphQL: Current dependencies:', dependencies)
      console.log('🔍 GraphQL: Last dependencies:', lastDependenciesRef.current)
      return
    }

    console.log('🔄 GraphQL: Dependencies changed, fetching data...')
    console.log('🔍 GraphQL: New dependencies:', dependencies)
    console.log('🔍 GraphQL: Previous dependencies:', lastDependenciesRef.current)
    lastDependenciesRef.current = [...dependencies]
    fetchData()
  }, [enabled, dependencies, fetchData, haveDependenciesChanged])

  // Force data update when we have data but it's not being displayed
  useEffect(() => {
    if (data && !loading && !error) {
      console.log('🔄 GraphQL: Data available, ensuring UI update')
      // Only force update if we haven't done it recently to prevent loops
      const now = Date.now()
      if (now - lastFetchTimeRef.current > 1000) { // Only if more than 1 second has passed
        setData({ ...data } as T)
      }
    }
  }, [data, loading, error])

  // Manual refetch function
  const refetch = useCallback(async () => {
    console.log('🔄 GraphQL: Manual refetch requested')
    
    // Clear any pending retries
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
    
    // Reset retry count and depth for manual refetch
    setCurrentRetryCount(0)
    setDepth(0)
    
    await fetchData()
  }, [fetchData])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !enabled || !data) return

    const startAutoRefresh = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }

      refreshIntervalRef.current = setInterval(() => {
        if (isMountedRef.current && !isFetchingRef.current) {
          console.log('🔄 GraphQL: Auto-refresh triggered')
          fetchData()
        }
      }, refreshInterval)
    }

    startAutoRefresh()

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [autoRefresh, enabled, data, refreshInterval, fetchData])

  // Page visibility change handler - refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled && data) {
        const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current
        // Only refresh if it's been more than 30 seconds since last fetch
        if (timeSinceLastFetch > 30000) {
          console.log('🔄 GraphQL: Page became visible, refreshing data')
          fetchData()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [enabled, data, fetchData])

  // Fallback mechanism to ensure data is fetched
  useEffect(() => {
    if (enabled && !loading && !data && !error) {
      console.log('🔄 GraphQL: Fallback fetch - no data, loading, or error detected')
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current && !data && !loading) {
          console.log('🔄 GraphQL: Fallback timeout triggered, forcing fetch')
          fetchData()
        }
      }, 1000) // Wait 1 second before fallback

      return () => clearTimeout(timeoutId)
    }
  }, [enabled, loading, data, error, fetchData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [])

  return {
    data,
    loading,
    error,
    refetch,
    retryCount: currentRetryCount
  }
}
