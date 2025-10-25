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
  "function description() view returns (string)",
  "function category() view returns (string)",
  "function platform() view returns (uint8)",
  "function identifier() view returns (string)",
  "function creator() view returns (address)",
  "function createdAt() view returns (uint64)",
  "function endTime() view returns (uint64)",
  "function state() view returns (uint8)",
  "function totalStaked() view returns (uint256)",
  "function activeParticipantsCount() view returns (uint256)",
  "function getOptionCount() view returns (uint256)",
  "function options(uint256) view returns (string)",
  "function optionLiquidity(uint8) view returns (uint256)",
]);

// === CLIENT ===
const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(config.network.rpcUrl),
});

// === helpers ===
const toNum = (x: bigint | number) => Number(x);

async function readMarket(addr: `0x${string}`) {
  const calls = [
    { address: addr, abi: marketAbi, functionName: "question" as const },
    { address: addr, abi: marketAbi, functionName: "description" as const },
    { address: addr, abi: marketAbi, functionName: "category" as const },
    { address: addr, abi: marketAbi, functionName: "platform" as const },
    { address: addr, abi: marketAbi, functionName: "postUrl" as const },
    { address: addr, abi: marketAbi, functionName: "creator" as const },
    { address: addr, abi: marketAbi, functionName: "createdAt" as const },
    { address: addr, abi: marketAbi, functionName: "endTime" as const },
    { address: addr, abi: marketAbi, functionName: "status" as const },
    { address: addr, abi: marketAbi, functionName: "totalStaked" as const },
    { address: addr, abi: marketAbi, functionName: "activeParticipantsCount" as const },
    { address: addr, abi: marketAbi, functionName: "getOptions" as const },
  ];

  const out = await client.multicall({ contracts: calls, allowFailure: true });

  const question = out[0].result;
  const description = out[1].result;
  const category = out[2].result;
  const platformNum = out[3].result ? Number(out[3].result) : 0;
  const postUrl = out[4].result;
  const creator = out[5].result;
  const createdAt = out[6].result ? toNum(out[6].result as bigint) : 0;
  const endTime = out[7].result ? toNum(out[7].result as bigint) : 0;
  const statusNum = out[8].result ? Number(out[8].result) : 0;
  const totalStaked = out[9].result;
  const activeParticipantsCount = out[10].result;
  const options = out[11].result || [];

  return {
    address: addr,
    question: question as string,
    description: description as string || "",
    category: category as string || "General",
    platform: platformNum,
    postUrl: postUrl as string || "",
    creator: creator as string,
    createdAt: createdAt,
    endTime: endTime,
    status: statusNum,
    totalLiquidity: totalStaked ? (Number(totalStaked) / 1e6).toString() : "0",
    activeParticipantsCount: Number(activeParticipantsCount || 0),
    options: options as string[],
    isResolved: statusNum === 1,
    timeRemaining: endTime > 0 ? Math.max(0, endTime - Math.floor(Date.now() / 1000)) : 0,
  };
}

export async function GET() {
  try {
    console.log('🔍 API: Fetching trending markets...');
    
    // Get all market addresses
    const markets = await client.readContract({
      address: config.contracts.marketFactory as `0x${string}`,
      abi: factoryAbi,
      functionName: "allMarkets",
    }) as `0x${string}`[];

    console.log(`✅ API: Found ${markets.length} markets`);

    // Fetch each market data
    const marketDetails = [];
    for (const marketAddress of markets) {
      try {
        const data = await Promise.race([
          readMarket(marketAddress),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Market read timeout')), config.api.timeout)
          )
        ]) as any;
        
        marketDetails.push(data);
      } catch (error) {
        console.error(`❌ API: Failed to read market ${marketAddress}:`, error);
        // Continue with other markets even if one fails
      }
    }

    // Sort by liquidity (trending = highest liquidity)
    const trendingMarkets = marketDetails
      .sort((a, b) => parseFloat(b.totalLiquidity) - parseFloat(a.totalLiquidity))
      .slice(0, 6); // Return top 6 trending markets

    console.log(`🎉 API: Successfully processed ${trendingMarkets.length} trending markets`);
    
    return NextResponse.json({
      success: true,
      markets: trendingMarkets,
      count: trendingMarkets.length,
      contract: config.contracts.marketFactory,
      network: config.network.name
    });

  } catch (error) {
    console.error('❌ API: Error fetching trending markets:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      markets: [],
      count: 0,
      contract: config.contracts.marketFactory,
      network: config.network.name
    }, { status: 500 });
  }
}
