// Token decimals utility
// Fetches the actual decimals from the ERC20 token contract

import { createPublicClient, http, parseAbi } from 'viem'
import { config } from './config'
import { defineChain } from 'viem'

// BSC Testnet chain definition
const bscTestnet = defineChain({
  id: 97,
  name: 'BSC Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: {
      http: [config.network.rpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: 'BscScan',
      url: 'https://testnet.bscscan.com',
    },
  },
  testnet: true,
})

const ERC20_ABI = parseAbi([
  'function decimals() view returns (uint8)',
])

const client = createPublicClient({
  chain: bscTestnet,
  transport: http(config.network.rpcUrl),
})

// Cache for token decimals
const decimalsCache = new Map<string, number>()

/**
 * Get the decimals for a token address
 * @param tokenAddress The ERC20 token address
 * @returns The number of decimals (defaults to 18 if fetch fails)
 */
export async function getTokenDecimals(tokenAddress: string): Promise<number> {
  // Check cache first
  if (decimalsCache.has(tokenAddress)) {
    return decimalsCache.get(tokenAddress)!
  }

  try {
    const decimals = await client.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'decimals',
    })

    const decimalsNum = Number(decimals)
    decimalsCache.set(tokenAddress, decimalsNum)
    return decimalsNum
  } catch (error) {
    console.error(`Failed to fetch decimals for token ${tokenAddress}:`, error)
    // Default to 18 for BEP-20 tokens
    const defaultDecimals = 18
    decimalsCache.set(tokenAddress, defaultDecimals)
    return defaultDecimals
  }
}

/**
 * Get the decimals for the collateral token (USDC)
 * This is the main function to use for USDC operations
 */
export async function getUSDCDecimals(): Promise<number> {
  return getTokenDecimals(config.contracts.collateralToken)
}

// Export a constant for the USDC address
export const USDC_ADDRESS = config.contracts.collateralToken

