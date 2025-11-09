# POP Prediction Markets - Envio HyperIndex

This directory contains the **Envio HyperIndex** implementation for the POP (Prediction on Polygon) prediction markets platform. HyperIndex is a next-generation blockchain indexing solution that provides real-time, high-performance data indexing for EVM-compatible chains.

## 🚀 What is Envio HyperIndex?

**Envio HyperIndex** is a revolutionary blockchain indexing platform that offers:

- **Real-time indexing** with sub-second latency
- **Multi-chain support** with unified data access
- **Type-safe development** with automatic code generation
- **High-performance queries** with GraphQL API
- **Developer-friendly** with modern tooling and excellent DX

Unlike traditional subgraphs, HyperIndex provides:
- ✅ **Better performance** - 10x faster than The Graph
- ✅ **Lower costs** - More efficient resource utilization
- ✅ **Real-time updates** - No sync delays
- ✅ **Type safety** - Full TypeScript support
- ✅ **Modern tooling** - Better developer experience

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Smart        │    │   Envio          │    │   Frontend      │
│   Contracts    │───▶│   HyperIndex     │───▶│   Application   │
│   (BSC Testnet)│    │   (Indexer)      │    │   (Next.js)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   GraphQL API    │
                       │   (Real-time)    │
                       └──────────────────┘
```

## 📊 Indexed Data Schema

Our HyperIndex tracks the following prediction market events:

### Market Factory Events
- **MarketCreated**: New prediction markets created by users
- **Market Parameters**: Betting options, resolution dates, creator fees
- **Market Metadata**: Titles, descriptions, categories, tags

### Market Events
- **BetPlaced**: Users placing bets on market outcomes
- **BetExited**: Users withdrawing bets before resolution
- **MarketResolved**: Final outcome determination
- **PayoutClaimed**: Winners claiming their rewards
- **ProposedResolution**: Community-driven resolution proposals

## 🛠️ Development Setup

### Prerequisites

Ensure you have the following installed:

- **Node.js v20** (required - no other versions supported)
- **pnpm** (package manager)
- **Docker Desktop** (for local development)

### Installation

```bash
# Install dependencies
pnpm install

# Generate types from schema and config
pnpm codegen

# Verify TypeScript compilation
pnpm tsc --noEmit
```

### Development Commands

```bash
# Start the indexer in development mode
pnpm dev

# Start the indexer in production mode
pnpm start

# Run tests
pnpm test

# Clean build artifacts
pnpm clean
```

## 🔧 Configuration

### Network Configuration (`config.yaml`)

```yaml
name: indexer
networks:
  - id: 97  # BSC Testnet
    start_block: 0
    contracts:
      - name: MarketFactory
        address:
          - 0x84bBEB5383A2da8AcA2008B3505fCb338AE850c4
        handler: src/EventHandlers.ts
        events:
          - event: MarketCreated(...)
      - name: Market
        handler: src/EventHandlers.ts
        events:
          - event: BetPlaced(...)
          - event: BetExited(...)
          - event: MarketResolved(...)
          - event: PayoutClaimed(...)
          - event: ProposedResolution(...)
```

### Key Configuration Features

- **`unordered_multichain_mode: true`**: Enables multi-chain indexing
- **`preload_handlers: true`**: Optimizes handler execution for better performance
- **Dynamic contract registration**: New markets are automatically registered

## 📝 Schema Definition

The GraphQL schema defines the data structure for our prediction markets:

```graphql
type Market_BetPlaced {
  id: ID!
  user: String!
  option: BigInt!
  amount: BigInt!
  newPool: BigInt!
}

type MarketFactory_MarketCreated {
  id: ID!
  creator: String!
  market: String!
  params_0: String!      # Token address
  params_1: BigInt!      # End time
  params_2: String!      # Question
  params_3: BigInt!      # Creator fee
  params_4: BigInt!      # Resolution time
  metadata_0: String!    # Title
  metadata_1: String!    # Description
  metadata_2: String!    # Category
  metadata_3: BigInt!    # Image ID
  metadata_4: String!    # Resolution criteria
  metadata_5: [String!]! # Tags
}
```

## 🎯 Event Handlers

Our indexer implements comprehensive event handlers for all prediction market activities:

### Market Creation Handler
```typescript
MarketFactory.MarketCreated.handler(async ({ event, context }) => {
  const entity: MarketFactory_MarketCreated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    creator: event.params.creator,
    market: event.params.market,
    // ... other fields
  }
  
  context.MarketFactory_MarketCreated.set(entity)
})
```

### Dynamic Contract Registration
```typescript
MarketFactory.MarketCreated.contractRegister(({ event, context }) => {
  // Automatically register new market contracts
  context.addMarket(event.params.market)
  context.log.info(`Registered new Market at ${event.params.market}`)
})
```

## 🚀 Key Features

### 1. Real-time Indexing
- **Sub-second latency** for new events
- **Automatic contract discovery** for new markets
- **Multi-chain support** across different networks

### 2. Type Safety
- **Auto-generated types** from schema and config
- **Full TypeScript support** with strict type checking
- **IntelliSense support** for better development experience

### 3. Performance Optimizations
- **Preload handlers** for faster execution
- **Efficient data structures** for large-scale indexing
- **Optimized queries** with GraphQL

### 4. Developer Experience
- **Hot reloading** during development
- **Comprehensive logging** for debugging
- **Easy deployment** with Docker support

## 🔍 Querying Data

Once the indexer is running, you can query data using GraphQL:

```graphql
# Get all markets created
query GetMarkets {
  MarketFactory_MarketCreateds {
    id
    creator
    market
    params_0  # Token address
    params_1  # End time
    metadata_0 # Title
    metadata_1 # Description
  }
}

# Get betting activity for a specific market
query GetBettingActivity($marketAddress: String!) {
  Market_BetPlaceds(where: { market: $marketAddress }) {
    id
    user
    option
    amount
    newPool
  }
}
```

## 🐳 Docker Deployment

The indexer can be deployed using Docker:

```bash
# Build the Docker image
docker build -t pop-indexer .

# Run the indexer
docker run -p 8080:8080 pop-indexer
```

## 📈 Monitoring & Analytics

### Health Checks
- **GraphQL Playground**: http://localhost:8080
- **Health endpoint**: `/health`
- **Metrics endpoint**: `/metrics`

### Logging
- **Structured logging** with different levels
- **Event tracking** for debugging
- **Performance metrics** for optimization

## 🔧 Troubleshooting

### Common Issues

1. **TypeScript compilation errors**
   ```bash
   pnpm tsc --noEmit
   ```

2. **Schema generation issues**
   ```bash
   pnpm codegen
   ```

3. **Docker issues**
   ```bash
   docker system prune -a
   ```

### Development Tips

- Always run `pnpm codegen` after schema changes
- Use `pnpm tsc --noEmit` to check for TypeScript errors
- Enable `TUI_OFF=true pnpm dev` for production-like testing

## 🌐 Network Support

Currently indexing:
- **BSC Testnet** (Testnet) - Chain ID: 97
- **Future**: Mainnet deployment planned

## 📚 Resources

- [Envio Documentation](https://docs.envio.dev)
- [HyperIndex Complete Guide](https://docs.envio.dev/docs/HyperIndex-LLM/hyperindex-complete)
- [Example Indexers](https://github.com/enviodev)
- [GraphQL Playground](http://localhost:8080) (when running)

## 🤝 Contributing

1. Make changes to `schema.graphql` or `config.yaml`
2. Run `pnpm codegen` to generate types
3. Update event handlers in `src/EventHandlers.ts`
4. Test with `pnpm tsc --noEmit`
5. Run `pnpm dev` to test locally

## 📄 License

This project is part of the POP (Prediction on Polygon) platform and follows the same licensing terms.

---

**Built with ❤️ using Envio HyperIndex for the POP prediction markets platform**