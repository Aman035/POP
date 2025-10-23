const { createPublicClient, http, parseAbi } = require("viem");
const { arbitrumSepolia } = require("viem/chains");

// === 1. CONFIGURATION ===
const FACTORY_ADDRESS = "0x84bBEB5383A2da8AcA2008B3505fCb338AE850c4";

// Use Alchemy RPC from environment or fallback to public RPC
const RPC_URL = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || 
                process.env.ALCHEMY_RPC_URL || 
                "https://sepolia-rollup.arbitrum.io/rpc";

console.log("Using RPC URL:", RPC_URL);

// === 2. ABI SNIPPETS ===
const factoryAbi = parseAbi([
  "function allMarkets() view returns (address[])",
  "function totalMarkets() view returns (uint256)",
  "function collateral() view returns (address)",
]);

const marketAbi = parseAbi([
  "function question() view returns (string)",
  "function description() view returns (string)",
  "function category() view returns (string)",
  "function platform() view returns (uint8)",
  "function postUrl() view returns (string)",
  "function creator() view returns (address)",
  "function createdAt() view returns (uint64)",
  "function endTime() view returns (uint64)",
  "function status() view returns (uint8)",
  "function totalStaked() view returns (uint256)",
  "function activeParticipantsCount() view returns (uint256)",
  "function getOptions() view returns (string[])"
]);

// === 3. INIT CLIENT ===
const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(RPC_URL),
});

function mapPlatform(p) {
  return ["Default", "Twitter", "Farcaster", "Lens", "Other"][p] ?? "Unknown";
}

function mapStatus(s) {
  return s === 1 ? "Resolved" : s === 2 ? "Cancelled" : "Active";
}

// === 4. MAIN ===
async function main() {
  console.log("🔍 Testing contract connectivity...");
  console.log("Factory Address:", FACTORY_ADDRESS);
  console.log("RPC URL:", RPC_URL);
  console.log("Chain: Arbitrum Sepolia (421614)");
  console.log("");

  try {
    // Test basic contract connectivity
    console.log("1. Testing basic contract calls...");
    
    const [totalMarkets, collateral] = await Promise.all([
      client.readContract({
        address: FACTORY_ADDRESS,
        abi: factoryAbi,
        functionName: "totalMarkets",
      }).catch(err => {
        console.log("❌ totalMarkets() failed:", err.message);
        return null;
      }),
      client.readContract({
        address: FACTORY_ADDRESS,
        abi: factoryAbi,
        functionName: "collateral",
      }).catch(err => {
        console.log("❌ collateral() failed:", err.message);
        return null;
      })
    ]);

    console.log("✅ totalMarkets():", totalMarkets?.toString() || "Failed");
    console.log("✅ collateral():", collateral || "Failed");
    console.log("");

    // Test allMarkets function
    console.log("2. Testing allMarkets() function...");
    const allMarkets = await client.readContract({
      address: FACTORY_ADDRESS,
      abi: factoryAbi,
      functionName: "allMarkets",
    }).catch(err => {
      console.log("❌ allMarkets() failed:", err.message);
      return null;
    });

    if (!allMarkets) {
      console.log("❌ Could not fetch markets. Contract may not be deployed or accessible.");
      return;
    }

    if (!allMarkets.length) {
      console.log("⚠️  No markets found yet.");
      console.log("This is normal if no markets have been created.");
      return;
    }

    console.log(`✅ Found ${allMarkets.length} markets:`, allMarkets);
    console.log("");

    // Test individual market data
    console.log("3. Testing individual market data...");
    for (let i = 0; i < Math.min(allMarkets.length, 3); i++) { // Test first 3 markets
      const market = allMarkets[i];
      console.log(`\n📊 Testing Market ${i + 1}: ${market}`);
      
      try {
        const calls = [
          { address: market, abi: marketAbi, functionName: "question" },
          { address: market, abi: marketAbi, functionName: "description" },
          { address: market, abi: marketAbi, functionName: "category" },
          { address: market, abi: marketAbi, functionName: "platform" },
          { address: market, abi: marketAbi, functionName: "postUrl" },
          { address: market, abi: marketAbi, functionName: "creator" },
          { address: market, abi: marketAbi, functionName: "createdAt" },
          { address: market, abi: marketAbi, functionName: "endTime" },
          { address: market, abi: marketAbi, functionName: "status" },
          { address: market, abi: marketAbi, functionName: "totalStaked" },
          { address: market, abi: marketAbi, functionName: "activeParticipantsCount" },
          { address: market, abi: marketAbi, functionName: "getOptions" },
        ];

        const result = await client.multicall({ contracts: calls, allowFailure: false });

        const [
          question,
          description,
          category,
          platform,
          postUrl,
          creator,
          createdAt,
          endTime,
          status,
          totalStaked,
          participants,
          options,
        ] = result.map(r => r.result);

        console.log("✅ Question:", question);
        console.log("✅ Description:", description);
        console.log("✅ Category:", category);
        console.log("✅ Platform:", mapPlatform(Number(platform)));
        console.log("✅ Post URL:", postUrl);
        console.log("✅ Creator:", creator);
        console.log("✅ Created At:", new Date(Number(createdAt) * 1000).toLocaleString());
        console.log("✅ Ends At:", new Date(Number(endTime) * 1000).toLocaleString());
        console.log("✅ Status:", mapStatus(Number(status)));
        console.log("✅ Options:", options);
        console.log("✅ Total Staked:", totalStaked.toString());
        console.log("✅ Participants:", participants.toString());
        
      } catch (err) {
        console.log("❌ Failed to fetch market data:", err.message);
      }
    }

    console.log("\n🎉 Contract test completed successfully!");
    
  } catch (error) {
    console.log("❌ Contract test failed:", error.message);
    console.log("This could mean:");
    console.log("- Contract is not deployed at this address");
    console.log("- Wrong network (should be Arbitrum Sepolia)");
    console.log("- RPC URL is incorrect or blocked");
    console.log("- Contract ABI is incorrect");
  }
}

main().catch(console.error);
