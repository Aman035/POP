import { GraphQLClient } from 'graphql-request'

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
  'https://api.13.213.208.119.sslip.io' // Try local endpoint first

// Check if running on localhost
const isLocalhost =
  GRAPHQL_ENDPOINT.includes('localhost') ||
  GRAPHQL_ENDPOINT.includes('127.0.0.1') ||
  GRAPHQL_ENDPOINT.includes('api.13.213.208.119.sslip.io')

// Configure headers based on environment
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
}

// Add Hasura admin secret only for localhost environments
if (isLocalhost) {
  const adminSecret = process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET || 'testing'
  headers['x-hasura-admin-secret'] = adminSecret
}

// Debug logging
console.log('GraphQL Client Config:', {
  endpoint: GRAPHQL_ENDPOINT,
  isLocalhost,
  hasAdminSecret: !!headers['x-hasura-admin-secret'],
})

export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers,
})
export default graphqlClient
