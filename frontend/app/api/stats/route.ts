import { NextResponse } from 'next/server';
import { createPublicClient, http, parseAbi } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { config } from "@/lib/config";

// === ABIs ===
const factoryAbi = parseAbi([
  "function allMarkets() view returns (address[])",
]);

const marketAbi = parseAbi([
  "function question() view returns (string)",
  "function category() view returns (string)",
  "function platform() view returns (uint8)",
  "function createdAt() view returns (uint64)",
  "function endTime() view returns (uint64)",
  "function status() view returns (uint8)",
  "function totalStaked() view returns (uint256)",
  "function activeParticipantsCount() view returns (uint256)",
]);

// === CLIENT ===
const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(config.network.rpcUrl),
});

// === helpers ===
const toNum = (x: bigint | number) => Number(x);

async function readMarketStats(addr: `0x${string}`) {
  const calls = [
    { address: addr, abi: marketAbi, functionName: "question" as const },
    { address: addr, abi: marketAbi, functionName: "category" as const },
    { address: addr, abi: marketAbi, functionName: "platform" as const },
    { address: addr, abi: marketAbi, functionName: "createdAt" as const },
    { address: addr, abi: marketAbi, functionName: "endTime" as const },
    { address: addr, abi: marketAbi, functionName: "status" as const },
    { address: addr, abi: marketAbi, functionName: "totalStaked" as const },
    { address: addr, abi: marketAbi, functionName: "activeParticipantsCount" as const },
  ];

  const out = await client.multicall({ contracts: calls, allowFailure: true });

  const question = out[0].result;
  const category = out[1].result;
  const platformNum = out[2].result ? Number(out[2].result) : 0;
  const createdAt = out[3].result ? toNum(out[3].result as bigint) : 0;
  const endTime = out[4].result ? toNum(out[4].result as bigint) : 0;
  const statusNum = out[5].result ? Number(out[5].result) : 0;
  const totalStaked = out[6].result;
  const activeParticipantsCount = out[7].result;

  return {
    address: addr,
    question: question as string,
    category: category as string || "General",
    platform: platformNum,
    createdAt: createdAt,
    endTime: endTime,
    status: statusNum,
    totalLiquidity: totalStaked ? (Number(totalStaked) / 1e6) : 0,
    activeParticipantsCount: Number(activeParticipantsCount || 0),
    isResolved: statusNum === 1,
    isCancelled: statusNum === 2,
    isActive: statusNum === 0,
  };
}

export async function GET() {
  try {
    console.log('🔍 API: Fetching market statistics...');
    
    // Get all market addresses
    const markets = await client.readContract({
      address: config.contracts.marketFactory as `0x${string}`,
      abi: factoryAbi,
      functionName: "allMarkets",
    }) as `0x${string}`[];

    console.log(`✅ API: Found ${markets.length} markets`);

    // Fetch each market stats
    const marketStats = [];
    for (const marketAddress of markets) {
      try {
        const data = await Promise.race([
          readMarketStats(marketAddress),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Market read timeout')), config.api.timeout)
          )
        ]) as any;
        
        marketStats.push(data);
      } catch (error) {
        console.error(`❌ API: Failed to read market stats ${marketAddress}:`, error);
        // Continue with other markets even if one fails
      }
    }

    // Calculate aggregated statistics
    const totalLiquidity = marketStats.reduce((sum, market) => sum + market.totalLiquidity, 0);
    const activeMarkets = marketStats.filter(market => market.isActive).length;
    const resolvedMarkets = marketStats.filter(market => market.isResolved).length;
    const cancelledMarkets = marketStats.filter(market => market.isCancelled).length;
    const totalMarkets = marketStats.length;
    
    // Category breakdown
    const categoryCounts = marketStats.reduce((acc, market) => {
      acc[market.category] = (acc[market.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Platform breakdown
    const platformCounts = marketStats.reduce((acc, market) => {
      const platformName = ["default", "twitter", "farcaster", "lens", "other"][market.platform] || "other";
      acc[platformName] = (acc[platformName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Total participants across all markets
    const totalParticipants = marketStats.reduce((sum, market) => sum + market.activeParticipantsCount, 0);
    
    // Average resolution time (for resolved markets)
    const resolvedWithTimes = marketStats.filter(market => market.isResolved && market.createdAt && market.endTime);
    const avgResolutionTime = resolvedWithTimes.length > 0 
      ? resolvedWithTimes.reduce((sum, market) => sum + (market.endTime - market.createdAt), 0) / resolvedWithTimes.length
      : 0;

    const stats = {
      totalMarkets,
      activeMarkets,
      resolvedMarkets,
      cancelledMarkets,
      totalLiquidity: totalLiquidity.toFixed(2),
      totalParticipants,
      avgResolutionTime: Math.round(avgResolutionTime / 3600 * 100) / 100, // Convert to hours
      categoryBreakdown: categoryCounts,
      platformBreakdown: platformCounts,
      uniqueCategories: Object.keys(categoryCounts).length,
      uniquePlatforms: Object.keys(platformCounts).length,
    };

    console.log(`🎉 API: Successfully calculated stats for ${marketStats.length} markets`);
    
    return NextResponse.json({
      success: true,
      stats,
      contract: config.contracts.marketFactory,
      network: config.network.name,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API: Error fetching market statistics:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stats: null,
      contract: config.contracts.marketFactory,
      network: config.network.name
    }, { status: 500 });
  }
}
