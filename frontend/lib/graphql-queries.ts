import { gql } from 'graphql-request'
import { getAddress } from 'viem'
import { graphqlClient } from '@/lib/graphql-client'

export interface MarketCreated {
  id: string
  creator: string
  market: string
  params_0: string
  params_1: string
  params_2: string
  params_3: string
  params_4: string
  metadata_0: string
  metadata_1: string
  metadata_2: string
  metadata_3: string
  metadata_4: string
  metadata_5: string[]
}

export interface MarketsByCreatorResponse {
  MarketFactory_MarketCreated: MarketCreated[]
}

export interface AllMarketsResponse {
  MarketFactory_MarketCreated: MarketCreated[]
}

export interface MarketByAddressResponse {
  MarketFactory_MarketCreated: MarketCreated[]
}

// Query to get all markets
const GET_ALL_MARKETS = gql`
  query GetAllMarkets($limit: Int, $offset: Int) {
    MarketFactory_MarketCreated(
      order_by: { id: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      creator
      market
      params_0
      params_1
      params_2
      params_3
      params_4
      metadata_0
      metadata_1
      metadata_2
      metadata_3
      metadata_4
      metadata_5
    }
  }
`

// Query to get markets by creator
const GET_MARKETS_BY_CREATOR = gql`
  query GetMarketsByCreator($creator: String!) {
    MarketFactory_MarketCreated(
      where: { creator: { _eq: $creator } }
      order_by: { id: desc }
    ) {
      id
      creator
      market
      params_0
      params_1
      params_2
      params_3
      params_4
      metadata_0
      metadata_1
      metadata_2
      metadata_3
      metadata_4
      metadata_5
    }
  }
`

// Query to get a specific market by its address
const GET_MARKET_BY_ADDRESS = gql`
  query GetMarketByAddress($marketAddress: String!) {
    MarketFactory_MarketCreated(where: { market: { _eq: $marketAddress } }) {
      id
      creator
      market
      params_0
      params_1
      params_2
      params_3
      params_4
      metadata_0
      metadata_1
      metadata_2
      metadata_3
      metadata_4
      metadata_5
    }
  }
`

// Function to get all markets
export async function getAllMarkets(
  limit?: number,
  offset?: number
): Promise<MarketCreated[]> {
  try {
    console.log('🔍 GraphQL: Fetching all markets with limit:', limit, 'offset:', offset)
    const response = await graphqlClient.request<AllMarketsResponse>(
      GET_ALL_MARKETS,
      { limit, offset }
    )
    console.log('✅ GraphQL: Successfully fetched markets:', response.MarketFactory_MarketCreated.length)
    return response.MarketFactory_MarketCreated
  } catch (error) {
    console.error('❌ GraphQL: Error fetching all markets:', error)
    // Return empty array instead of throwing to prevent app crashes
    return []
  }
}

// Function to get markets by creator
export async function getMarketsByCreator(
  creatorAddress: string
): Promise<MarketCreated[]> {
  try {
    // Use viem's getAddress to ensure proper checksumming
    const checksummedAddress = getAddress(creatorAddress)
    console.log('🔍 GraphQL: Fetching markets by creator:', checksummedAddress)
    const response = await graphqlClient.request<MarketsByCreatorResponse>(
      GET_MARKETS_BY_CREATOR,
      { creator: checksummedAddress }
    )
    console.log('✅ GraphQL: Markets by creator response:', response)
    return response.MarketFactory_MarketCreated
  } catch (error) {
    console.error('❌ GraphQL: Error fetching markets by creator:', error)
    // Return empty array instead of throwing to prevent app crashes
    return []
  }
}

// Function to get a specific market by address
export async function getMarketByAddress(
  marketAddress: string
): Promise<MarketCreated | null> {
  try {
    // Use viem's getAddress to ensure proper checksumming
    const checksummedAddress = getAddress(marketAddress)
    console.log('🔍 GraphQL: Fetching market by address:', checksummedAddress)
    const response = await graphqlClient.request<MarketByAddressResponse>(
      GET_MARKET_BY_ADDRESS,
      { marketAddress: checksummedAddress }
    )
    console.log('✅ GraphQL: Market by address response:', response)
    return response.MarketFactory_MarketCreated[0] || null
  } catch (error) {
    console.error('❌ GraphQL: Error fetching market by address:', error)
    // Return null instead of throwing to prevent app crashes
    return null
  }
}
