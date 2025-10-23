"use client"

import { useState, useEffect } from 'react';
import { MarketInfo } from '@/lib/types';

interface MarketApiResponse {
  success: boolean;
  market: MarketInfo | null;
  contract: string;
  network: string;
  error?: string;
}

export const useMarketApi = (address: string) => {
  const [market, setMarket] = useState<MarketInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      setError('No market address provided');
      return;
    }

    const fetchMarket = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔍 API Hook: Fetching market ${address}...`);
        
        const response = await fetch(`/api/markets/${address}`);
        const data: MarketApiResponse = await response.json();
        
        console.log('🔍 API Hook: Response:', data);
        
        if (data.success && data.market) {
          setMarket(data.market);
          console.log(`✅ API Hook: Loaded market: ${data.market.question}`);
        } else {
          setError(data.error || 'Failed to fetch market');
          console.error('❌ API Hook: API returned error:', data.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market';
        setError(errorMessage);
        console.error('❌ API Hook: Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarket();
  }, [address]);

  return { market, loading, error };
};
