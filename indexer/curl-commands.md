# GraphQL cURL Commands for Testing

This file contains ready-to-use cURL commands to test your GraphQL queries. Your GraphQL server is running on `http://localhost:8080` with password `testing`.

## Table of Contents

1. [Basic Queries](#basic-queries)
2. [User-Specific Queries](#user-specific-queries)
3. [Market-Specific Queries](#market-specific-queries)
4. [Analytics Queries](#analytics-queries)
5. [Complex Queries](#complex-queries)
6. [WebSocket Subscriptions](#websocket-subscriptions)

---

## Basic Queries

### Get All Created Markets

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetAllMarkets { MarketFactory_MarketCreated { id creator market params_0 params_1 params_2 params_3 params_4 metadata_0 metadata_1 metadata_2 metadata_3 metadata_4 metadata_5 } }"
  }'
```

### Get Recent Markets (Last 10)

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetRecentMarkets { MarketFactory_MarketCreated(order_by: { id: desc }, limit: 10) { id creator market params_2 params_1 metadata_0 metadata_1 metadata_2 } }"
  }'
```

### Get All Betting Activity

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetAllBettingActivity { Market_BetPlaced { id user option amount newPool } Market_BetExited { id user option amount newPool } }"
  }'
```

### Get Recent Betting Activity

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetRecentBettingActivity { Market_BetPlaced(order_by: { id: desc }, limit: 20) { id user option amount newPool } }"
  }'
```

### Get All Market Resolutions

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetAllMarketResolutions { Market_MarketResolved { id resolver option creatorFee } }"
  }'
```

### Get Proposed Resolutions

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetProposedResolutions { Market_ProposedResolution { id proposer option evidenceURI } }"
  }'
```

### Get Participant Count Updates

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetParticipantCountUpdates { Market_ParticipantCountUpdated(order_by: { id: desc }, limit: 50) { id newCount } }"
  }'
```

---

## User-Specific Queries

### Get Markets by Creator (Replace USER_ADDRESS)

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetMarketsByCreator($creator: String!) { MarketFactory_MarketCreated(where: { creator: { _eq: $creator } }) { id creator market params_0 params_1 params_2 metadata_0 metadata_1 metadata_2 metadata_5 } }",
    "variables": {
      "creator": "0x1234567890123456789012345678901234567890"
    }
  }'
```

### Get Bets by User (Replace USER_ADDRESS)

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetBetsByUser($user: String!) { Market_BetPlaced(where: { user: { _eq: $user } }) { id user option amount newPool } Market_BetExited(where: { user: { _eq: $user } }) { id user option amount newPool } }",
    "variables": {
      "user": "0x1234567890123456789012345678901234567890"
    }
  }'
```

### Get User's Payout History (Replace USER_ADDRESS)

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetUserPayouts($user: String!) { Market_PayoutClaimed(where: { user: { _eq: $user } }, order_by: { id: desc }) { id user amount } }",
    "variables": {
      "user": "0x1234567890123456789012345678901234567890"
    }
  }'
```

### Get Resolutions by Resolver (Replace RESOLVER_ADDRESS)

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetResolutionsByResolver($resolver: String!) { Market_MarketResolved(where: { resolver: { _eq: $resolver } }) { id resolver option creatorFee } }",
    "variables": {
      "resolver": "0x1234567890123456789012345678901234567890"
    }
  }'
```

---

## Market-Specific Queries

### Get Bets by Option (Replace OPTION_NUMBER)

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetBetsByOption($option: BigInt!) { Market_BetPlaced(where: { option: { _eq: $option } }) { id user option amount newPool } }",
    "variables": {
      "option": "1"
    }
  }'
```

### Get Active Markets (Replace TIMESTAMP)

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetActiveMarkets { MarketFactory_MarketCreated(where: { params_1: { _gt: \"1640995200\" } }, order_by: { params_1: asc }) { id creator market params_2 params_1 metadata_0 metadata_1 metadata_2 } }"
  }'
```

---

## Analytics Queries

### Get Market Statistics

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetMarketStats { totalMarkets: MarketFactory_MarketCreated_aggregate { aggregate { count } } totalBets: Market_BetPlaced_aggregate { aggregate { count } } totalVolume: Market_BetPlaced_aggregate { aggregate { sum { amount } } } totalPayouts: Market_PayoutClaimed_aggregate { aggregate { sum { amount } } } }"
  }'
```

### Get Top Users by Volume

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetTopUsersByVolume { Market_BetPlaced_aggregate(group_by: [\"user\"], order_by: { sum: { amount: desc } }, limit: 10) { user aggregate { sum { amount } count } } }"
  }'
```

### Get Market Activity Over Time

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetMarketActivityOverTime { MarketFactory_MarketCreated_aggregate(group_by: [\"id\"], order_by: { id: asc }) { id aggregate { count } } }"
  }'
```

---

## Complex Queries

### Get User's Complete Activity (Replace USER_ADDRESS)

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetUserActivity($user: String!) { marketsCreated: MarketFactory_MarketCreated(where: { creator: { _eq: $user } }) { id market params_2 metadata_0 } betsPlaced: Market_BetPlaced(where: { user: { _eq: $user } }) { id option amount newPool } betsExited: Market_BetExited(where: { user: { _eq: $user } }) { id option amount newPool } payoutsClaimed: Market_PayoutClaimed(where: { user: { _eq: $user } }) { id amount } resolutions: Market_MarketResolved(where: { resolver: { _eq: $user } }) { id option creatorFee } }",
    "variables": {
      "user": "0x1234567890123456789012345678901234567890"
    }
  }'
```

### Get User Portfolio Summary (Replace USER_ADDRESS)

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetUserPortfolio($user: String!) { marketsCreated: MarketFactory_MarketCreated_aggregate(where: { creator: { _eq: $user } }) { aggregate { count } } betVolume: Market_BetPlaced_aggregate(where: { user: { _eq: $user } }) { aggregate { sum { amount } count } } totalPayouts: Market_PayoutClaimed_aggregate(where: { user: { _eq: $user } }) { aggregate { sum { amount } count } } resolutions: Market_MarketResolved_aggregate(where: { resolver: { _eq: $user } }) { aggregate { count } } }",
    "variables": {
      "user": "0x1234567890123456789012345678901234567890"
    }
  }'
```

### Get Market Performance Metrics (Replace MARKET_ADDRESS)

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetMarketPerformance($marketAddress: String!) { totalVolume: Market_BetPlaced_aggregate { aggregate { sum { amount } } } uniqueParticipants: Market_BetPlaced_aggregate(group_by: [\"user\"]) { user } resolution: Market_MarketResolved { id resolver option creatorFee } }",
    "variables": {
      "marketAddress": "0x1234567890123456789012345678901234567890"
    }
  }'
```

### Get User's Betting History with Pagination (Replace USER_ADDRESS, LIMIT, OFFSET)

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetUserBettingHistory($user: String!, $limit: Int!, $offset: Int!) { Market_BetPlaced(where: { user: { _eq: $user } }, order_by: { id: desc }, limit: $limit, offset: $offset) { id user option amount newPool } }",
    "variables": {
      "user": "0x1234567890123456789012345678901234567890",
      "limit": 10,
      "offset": 0
    }
  }'
```

---

## WebSocket Subscriptions

### Subscribe to New Markets (WebSocket)

```bash
# First, establish WebSocket connection
wscat -c ws://localhost:8080/v1/graphql -H "x-hasura-admin-secret: testing"

# Then send this message:
{
  "id": "1",
  "type": "start",
  "payload": {
    "query": "subscription SubscribeToNewMarkets { MarketFactory_MarketCreated { id creator market params_2 metadata_0 metadata_1 } }"
  }
}
```

### Subscribe to Betting Activity (WebSocket)

```bash
# WebSocket connection
wscat -c ws://localhost:8080/v1/graphql -H "x-hasura-admin-secret: testing"

# Send this message:
{
  "id": "2",
  "type": "start",
  "payload": {
    "query": "subscription SubscribeToBettingActivity { Market_BetPlaced { id user option amount newPool } }"
  }
}
```

### Subscribe to Market Resolutions (WebSocket)

```bash
# WebSocket connection
wscat -c ws://localhost:8080/v1/graphql -H "x-hasura-admin-secret: testing"

# Send this message:
{
  "id": "3",
  "type": "start",
  "payload": {
    "query": "subscription SubscribeToMarketResolutions { Market_MarketResolved { id resolver option creatorFee } }"
  }
}
```

---

## Quick Test Commands

### Test Basic Connectivity

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{"query": "query { __schema { types { name } } }"}'
```

### Test with Pretty Output

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query GetAllMarkets { MarketFactory_MarketCreated { id creator market params_2 metadata_0 } }"
  }' | jq '.'
```

### Test Error Handling

```bash
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: testing" \
  -d '{
    "query": "query { NonExistentTable { id } }"
  }'
```

---

## Usage Tips

1. **Replace Placeholder Addresses**: Replace `0x1234567890123456789012345678901234567890` with actual user/market addresses
2. **Install jq for Pretty Output**: `brew install jq` (macOS) or `apt-get install jq` (Ubuntu)
3. **Install wscat for WebSocket**: `npm install -g wscat`
4. **Check Server Status**: Make sure Docker containers are running with `docker ps`
5. **GraphQL Playground**: Visit `http://localhost:8080` for interactive testing
6. **Error Debugging**: Add `"extensions": { "tracing": true }` to see query execution details

---

## Example Response Format

```json
{
  "data": {
    "MarketFactory_MarketCreated": [
      {
        "id": "421614_12345_1",
        "creator": "0x1234567890123456789012345678901234567890",
        "market": "0xabcdef1234567890123456789012345678901234",
        "params_2": "Will Bitcoin reach $100k by end of 2024?",
        "metadata_0": "Bitcoin Price Prediction",
        "metadata_1": "Predicting Bitcoin's price movement"
      }
    ]
  }
}
```

---

## Troubleshooting

### Common Issues:

1. **Connection Refused**: Check if Docker containers are running
2. **Authentication Error**: Verify admin secret is `testing`
3. **Empty Results**: Database might be empty - run the indexer first
4. **Invalid Query**: Check GraphQL syntax in playground first

### Debug Commands:

```bash
# Check container status
docker ps

# Check container logs
docker logs generated-graphql-engine-1
docker logs generated-envio-postgres-1

# Test basic connectivity
curl http://localhost:8080/healthz
```
