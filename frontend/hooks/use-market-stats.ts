import { useState, useEffect } from 'react';

interface MarketStats {
  totalMarkets: number;
  activeMarkets: number;
  resolvedMarkets: number;
  cancelledMarkets: number;
  totalLiquidity: string;
  totalParticipants: number;
  avgResolutionTime: number;
  categoryBreakdown: Record<string, number>;
  platformBreakdown: Record<string, number>;
  uniqueCategories: number;
  uniquePlatforms: number;
}

interface MarketStatsResponse {
  success: boolean;
  stats: MarketStats;
  contract: string;
  network: string;
  lastUpdated: string;
}

export function useMarketStats() {
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/stats');
        const data: MarketStatsResponse = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        } else {
          setError('Failed to fetch market statistics');
        }
      } catch (err) {
        console.error('Error fetching market stats:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketStats();
  }, []);

  return { stats, loading, error };
}
