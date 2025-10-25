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
  "function identifier() view returns (string)",     // Changed from postUrl to identifier
  "function creator() view returns (address)",
  "function createdAt() view returns (uint64)",
  "function endTime() view returns (uint64)",
  "function state() view returns (uint8)",            // Changed from status to state
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
const platformLabel = (n: number) =>
  (["twitter", "farcaster", "lens", "other"][n]) ?? "other";

const stateLabel = (n: number) =>
  (["trading", "proposed", "resolved"][n]) ?? "trading";

const toNum = (x: bigint | number) => Number(x);

async function readMarket(addr: `0x${string}`) {
  const calls = [
    { address: addr, abi: marketAbi, functionName: "question" as const },
    { address: addr, abi: marketAbi, functionName: "description" as const },
    { address: addr, abi: marketAbi, functionName: "category" as const },
    { address: addr, abi: marketAbi, functionName: "platform" as const },
    { address: addr, abi: marketAbi, functionName: "identifier" as const },
    { address: addr, abi: marketAbi, functionName: "creator" as const },
    { address: addr, abi: marketAbi, functionName: "createdAt" as const },
    { address: addr, abi: marketAbi, functionName: "endTime" as const },
    { address: addr, abi: marketAbi, functionName: "state" as const },
    { address: addr, abi: marketAbi, functionName: "totalStaked" as const },
    { address: addr, abi: marketAbi, functionName: "activeParticipantsCount" as const },
    { address: addr, abi: marketAbi, functionName: "getOptionCount" as const },
  ];

  // Use allowFailure: true to handle individual call failures gracefully
  const out = await client.multicall({ contracts: calls, allowFailure: true });

  // Pull results in the exact order we called them
  const question                 = out[0].result;
  const description              = out[1].result;
  const category                 = out[2].result;
  const platformNum              = out[3].result ? Number(out[3].result) : 0;
  const identifier               = out[4].result;
  const creator                  = out[5].result;
  const createdAt                = out[6].result ? toNum(out[6].result as bigint) : 0;
  const endTime                  = out[7].result ? toNum(out[7].result as bigint) : 0;
  const stateNum                 = out[8].result ? Number(out[8].result) : 0;
  const totalStaked              = out[9].result;
  const activeParticipantsCount  = out[10].result;
  const optionCount              = out[11].result ? Number(out[11].result) : 0;

  return {
    address: addr,
    identifier: identifier as string,
    creator: creator as string,
    options: [], // Will be populated separately by fetching individual options
    endTime: endTime,
    creatorFeeBps: 0, // Not available in read ABI
    totalLiquidity: totalStaked ? (Number(totalStaked) / 1e6).toString() : "0", // Convert from wei to USDC (6 decimals)
    isResolved: stateNum === 2, // 2 = resolved
    winningOption: undefined, // Not available in read ABI
    question: question as string,
    description: description as string || "",
    category: category as string || "General",
    resolutionSource: "", // Not available in read ABI
    platform: platformNum,
    createdAt: createdAt,
    optionLiquidity: [], // Will be populated separately
    state: stateNum as any,
    status: stateNum === 2 ? 1 : 0, // Convert state to status: 2=resolved -> 1, others -> 0 (active)
    activeParticipantsCount: Number(activeParticipantsCount || 0),
  };
}

export async function GET() {
  try {
    console.log('🔍 API: Fetching markets from contract...');
    
    // Get all market addresses
    const markets = await client.readContract({
      address: config.contracts.marketFactory as `0x${string}`,
      abi: factoryAbi,
      functionName: "allMarkets",
    }) as `0x${string}`[];

    console.log(`✅ API: Found ${markets.length} markets`);

    // Fetch each market data with timeout and retry logic
    const marketDetails = [];
    for (const marketAddress of markets) {
      try {
        const data = await Promise.race([
          readMarket(marketAddress),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Market read timeout')), config.api.timeout)
          )
        ]) as any;
        
        console.log(`✅ API: Processed market ${marketAddress}:`, data.question);
        marketDetails.push(data);
      } catch (error) {
        console.error(`❌ API: Failed to read market ${marketAddress}:`, error);
        // Continue with other markets even if one fails
      }
    }

    console.log(`🎉 API: Successfully processed ${marketDetails.length} markets`);
    
    return NextResponse.json({
      success: true,
      markets: marketDetails,
      count: marketDetails.length,
      contract: config.contracts.marketFactory,
      network: config.network.name
    });

  } catch (error) {
    console.error('❌ API: Error fetching markets:', error);
    
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
