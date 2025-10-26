import { GraphQLClient } from 'graphql-request'

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
  'http://localhost:8080/v1/graphql' // Try local endpoint first

export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
    'x-hasura-admin-secret': 'testing', // Add admin secret for Hasura
  },
  // Remove invalid properties
})

export default graphqlClient
