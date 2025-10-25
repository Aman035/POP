import { NextResponse } from 'next/server';
import { createPublicClient, http, parseAbi } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { config } from "@/lib/config";

// === ABIs ===
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
  "function getOptionPercentage(uint8) view returns (uint256)",
]);

// === CLIENT ===
const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(config.network.rpcUrl),
});

// === helpers ===
const toNum = (x: bigint | number) => Number(x);

async function readMarketDetails(address: `0x${string}`) {
  const calls = [
    { address, abi: marketAbi, functionName: "question" as const },
    { address, abi: marketAbi, functionName: "description" as const },
    { address, abi: marketAbi, functionName: "category" as const },
    { address, abi: marketAbi, functionName: "platform" as const },
    { address, abi: marketAbi, functionName: "postUrl" as const },
    { address, abi: marketAbi, functionName: "creator" as const },
    { address, abi: marketAbi, functionName: "createdAt" as const },
    { address, abi: marketAbi, functionName: "endTime" as const },
    { address, abi: marketAbi, functionName: "status" as const },
    { address, abi: marketAbi, functionName: "totalStaked" as const },
    { address, abi: marketAbi, functionName: "activeParticipantsCount" as const },
    { address, abi: marketAbi, functionName: "getOptions" as const },
    { address, abi: marketAbi, functionName: "getOptionLiquidity" as const },
    { address, abi: marketAbi, functionName: "getOptionOdds" as const },
  ];

  // Use allowFailure: true to handle individual call failures gracefully
  const out = await client.multicall({ contracts: calls, allowFailure: true });

  // Pull results in the exact order we called them
  const question                 = out[0].result;
  const description              = out[1].result;
  const category                 = out[2].result;
  const platformNum              = out[3].result ? Number(out[3].result) : 0;
  const postUrl                  = out[4].result;
  const creator                  = out[5].result;
  const createdAt                = out[6].result ? toNum(out[6].result as bigint) : 0;
  const endTime                  = out[7].result ? toNum(out[7].result as bigint) : 0;
  const statusNum                = out[8].result ? Number(out[8].result) : 0;
  const totalStaked              = out[9].result;
  const activeParticipantsCount  = out[10].result;
  const options                  = out[11].result || [];
  const optionLiquidity          = out[12].result || [];
  const optionOdds               = out[13].result || [];

  // Calculate odds percentages
  const oddsPercentages = optionOdds.map((odds: bigint) => {
    const oddsNum = Number(odds);
    return oddsNum > 0 ? (oddsNum / 10000) : 0; // Assuming odds are in basis points
  });

  return {
    address: address,
    identifier: 0,
    creator: creator as string,
    options: options as string[],
    endTime: endTime,
    creatorFeeBps: 0,
    totalLiquidity: totalStaked ? (Number(totalStaked) / 1e6).toString() : "0",
    isResolved: statusNum === 1,
    winningOption: statusNum === 1 ? 0 : undefined, // Simplified
    question: question as string,
    description: description as string || "",
    category: category as string || "General",
    resolutionSource: "",
    platform: platformNum,
    postUrl: postUrl as string || "",
    createdAt: createdAt,
    minBet: 0,
    maxBetPerUser: 0,
    maxTotalStake: 0,
    optionLiquidity: (optionLiquidity as bigint[]).map(liq => (Number(liq) / 1e6).toString()),
    optionOdds: oddsPercentages,
    state: statusNum,
    status: statusNum,
    activeParticipantsCount: Number(activeParticipantsCount || 0),
    timeRemaining: endTime > 0 ? Math.max(0, endTime - Math.floor(Date.now() / 1000)) : 0,
  };
}

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    
    if (!address || !address.startsWith('0x')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid market address',
        market: null
      }, { status: 400 });
    }

    console.log(`🔍 API: Fetching market details for ${address}`);
    
    const marketData = await Promise.race([
      readMarketDetails(address as `0x${string}`),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Market read timeout')), config.api.timeout)
      )
    ]) as any;

    console.log(`✅ API: Successfully fetched market: ${marketData.question}`);
    
    return NextResponse.json({
      success: true,
      market: marketData,
      contract: config.contracts.marketFactory,
      network: config.network.name
    });

  } catch (error) {
    console.error('❌ API: Error fetching market details:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      market: null,
      contract: config.contracts.marketFactory,
      network: config.network.name
    }, { status: 500 });
  }
}
