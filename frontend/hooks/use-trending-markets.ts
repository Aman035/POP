import { useState, useEffect } from 'react';

interface TrendingMarket {
  address: string;
  question: string;
  description: string;
  category: string;
  platform: number;
  postUrl: string;
  creator: string;
  createdAt: number;
  endTime: number;
  status: number;
  totalLiquidity: string;
  activeParticipantsCount: number;
  options: string[];
  isResolved: boolean;
  timeRemaining: number;
}

interface TrendingMarketsResponse {
  success: boolean;
  markets: TrendingMarket[];
  count: number;
  contract: string;
  network: string;
}

export function useTrendingMarkets() {
  const [markets, setMarkets] = useState<TrendingMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingMarkets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/trending');
        const data: TrendingMarketsResponse = await response.json();
        
        if (data.success) {
          setMarkets(data.markets);
        } else {
          setError('Failed to fetch trending markets');
        }
      } catch (err) {
        console.error('Error fetching trending markets:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingMarkets();
  }, []);

  return { markets, loading, error };
}
