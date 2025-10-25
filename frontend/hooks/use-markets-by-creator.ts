import { useState, useEffect } from 'react'
import { getMarketsByCreator, MarketCreated } from '@/lib/graphql-queries'

export function useMarketsByCreator(address: string | undefined) {
  const [markets, setMarkets] = useState<MarketCreated[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      setMarkets([])
      setLoading(false)
      setError(null)
      return
    }

    const fetchMarkets = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getMarketsByCreator(address)
        setMarkets(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setMarkets([])
      } finally {
        setLoading(false)
      }
    }

    fetchMarkets()
  }, [address])

  return { markets, loading, error }
}
