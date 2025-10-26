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

export interface BetPlaced {
  id: string
  user: string
  option: string
  amount: string
  newPool: string
}

export interface BetExited {
  id: string
  user: string
  option: string
  amount: string
  newPool: string
}

export interface ProposedResolution {
  id: string
  proposer: string
  option: string
  evidenceURI: string
}

export interface MarketResolved {
  id: string
  resolver: string
  option: string
  creatorFee: string
}

export interface ParticipantCountUpdated {
  id: string
  newCount: string
}

export interface MarketBetsResponse {
  Market_BetPlaced: BetPlaced[]
  Market_BetExited: BetExited[]
  Market_ProposedResolution: ProposedResolution[]
  Market_MarketResolved: MarketResolved[]
  Market_ParticipantCountUpdated: ParticipantCountUpdated[]
}

export interface AllMarketBetsResponse {
  Market_BetPlaced: BetPlaced[]
  Market_BetExited: BetExited[]
  Market_ProposedResolution: ProposedResolution[]
  Market_MarketResolved: MarketResolved[]
  Market_ParticipantCountUpdated: ParticipantCountUpdated[]
}

export interface MarketsWithEventsResponse {
  MarketFactory_MarketCreated: MarketCreated[]
  Market_BetPlaced: BetPlaced[]
  Market_BetExited: BetExited[]
  Market_ProposedResolution: ProposedResolution[]
  Market_MarketResolved: MarketResolved[]
  Market_ParticipantCountUpdated: ParticipantCountUpdated[]
}

// Query to get all markets with bet data
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

// Query to get bet events for a specific market
const GET_MARKET_BETS = gql`
  query GetMarketBets($marketAddress: String!) {
    Market_BetPlaced(
      order_by: { id: desc }
    ) {
      id
      user
      option
      amount
      newPool
    }
    Market_BetExited(
      order_by: { id: desc }
    ) {
      id
      user
      option
      amount
      newPool
    }
    Market_ProposedResolution(
      order_by: { id: desc }
    ) {
      id
      proposer
      option
      evidenceURI
    }
    Market_MarketResolved(
      order_by: { id: desc }
    ) {
      id
      resolver
      option
      creatorFee
    }
    Market_ParticipantCountUpdated(
      order_by: { id: desc }
    ) {
      id
      newCount
    }
  }
`

// Query to get all bet events for all markets
const GET_ALL_MARKET_BETS = gql`
  query GetAllMarketBets {
    Market_BetPlaced(
      order_by: { id: desc }
    ) {
      id
      user
      option
      amount
      newPool
    }
    Market_BetExited(
      order_by: { id: desc }
    ) {
      id
      user
      option
      amount
      newPool
    }
    Market_ProposedResolution(
      order_by: { id: desc }
    ) {
      id
      proposer
      option
      evidenceURI
    }
    Market_MarketResolved(
      order_by: { id: desc }
    ) {
      id
      resolver
      option
      creatorFee
    }
    Market_ParticipantCountUpdated(
      order_by: { id: desc }
    ) {
      id
      newCount
    }
  }
`

// Query to get comprehensive market data with events
const GET_MARKETS_WITH_EVENTS = gql`
  query GetMarketsWithEvents {
    MarketFactory_MarketCreated(
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
    Market_BetPlaced(
      order_by: { id: desc }
    ) {
      id
      user
      option
      amount
      newPool
    }
    Market_BetExited(
      order_by: { id: desc }
    ) {
      id
      user
      option
      amount
      newPool
    }
    Market_ProposedResolution(
      order_by: { id: desc }
    ) {
      id
      proposer
      option
      evidenceURI
    }
    Market_MarketResolved(
      order_by: { id: desc }
    ) {
      id
      resolver
      option
      creatorFee
    }
    Market_ParticipantCountUpdated(
      order_by: { id: desc }
    ) {
      id
      newCount
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
    
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('GraphQL request timeout')), 10000)
    })
    
    const requestPromise = graphqlClient.request<MarketByAddressResponse>(
      GET_MARKET_BY_ADDRESS,
      { marketAddress: checksummedAddress }
    )
    
    const response = await Promise.race([requestPromise, timeoutPromise])
    console.log('✅ GraphQL: Market by address response:', response)
    return response.MarketFactory_MarketCreated[0] || null
  } catch (error) {
    console.error('❌ GraphQL: Error fetching market by address:', error)
    
    // Check if it's a network error
    if (error instanceof Error && (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('timeout')
    )) {
      console.log('⚠️ GraphQL: Network error detected, GraphQL endpoint may be unavailable')
    }
    
    // Return null instead of throwing to prevent app crashes
    return null
  }
}

// Function to get bet events for a specific market
export async function getMarketBets(
  marketAddress: string
): Promise<MarketBetsResponse> {
  try {
    const checksummedAddress = getAddress(marketAddress)
    console.log('🔍 GraphQL: Fetching bet events for market:', checksummedAddress)
    
    const response = await graphqlClient.request<MarketBetsResponse>(
      GET_MARKET_BETS,
      { marketAddress: checksummedAddress }
    )
    
    console.log('✅ GraphQL: Market bet events response:', response)
    return response
  } catch (error) {
    console.error('❌ GraphQL: Error fetching market bet events:', error)
    return {
      Market_BetPlaced: [],
      Market_BetExited: [],
      Market_ProposedResolution: [],
      Market_MarketResolved: [],
      Market_ParticipantCountUpdated: []
    }
  }
}

// Function to get all bet events for all markets
export async function getAllMarketBets(): Promise<AllMarketBetsResponse> {
  try {
    console.log('🔍 GraphQL: Fetching all bet events...')
    
    const response = await graphqlClient.request<AllMarketBetsResponse>(
      GET_ALL_MARKET_BETS
    )
    
    console.log('✅ GraphQL: All market bet events response:', response)
    return response
  } catch (error) {
    console.error('❌ GraphQL: Error fetching all market bet events:', error)
    return {
      Market_BetPlaced: [],
      Market_BetExited: [],
      Market_ProposedResolution: [],
      Market_MarketResolved: [],
      Market_ParticipantCountUpdated: []
    }
  }
}

// Function to get markets with all events
export async function getMarketsWithEvents(): Promise<MarketsWithEventsResponse> {
  try {
    console.log('🔍 GraphQL: Fetching markets with events...')
    
    const response = await graphqlClient.request<MarketsWithEventsResponse>(
      GET_MARKETS_WITH_EVENTS
    )
    
    console.log('✅ GraphQL: Markets with events response:', response)
    return response
  } catch (error) {
    console.error('❌ GraphQL: Error fetching markets with events:', error)
    return {
      MarketFactory_MarketCreated: [],
      Market_BetPlaced: [],
      Market_BetExited: [],
      Market_ProposedResolution: [],
      Market_MarketResolved: [],
      Market_ParticipantCountUpdated: []
    }
  }
}
