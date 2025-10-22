"use client"

import { useState, useEffect } from 'react';
import { MarketInfo } from '@/lib/types';

interface MarketsApiResponse {
  success: boolean;
  markets: MarketInfo[];
  count: number;
  contract: string;
  network: string;
  error?: string;
}

export const useMarketsApi = () => {
  const [markets, setMarkets] = useState<MarketInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 API Hook: Fetching markets from API...');
        
        const response = await fetch('/api/markets');
        const data: MarketsApiResponse = await response.json();
        
        console.log('🔍 API Hook: Response:', data);
        
        if (data.success) {
          setMarkets(data.markets);
          console.log(`✅ API Hook: Loaded ${data.markets.length} markets`);
        } else {
          setError(data.error || 'Failed to fetch markets');
          console.error('❌ API Hook: API returned error:', data.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch markets';
        setError(errorMessage);
        console.error('❌ API Hook: Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  return { markets, loading, error };
};
