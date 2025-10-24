/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  Market,
  Market_BetExited,
  Market_BetPlaced,
  Market_MarketResolved,
  Market_ParticipantCountUpdated,
  Market_PayoutClaimed,
  Market_ProposedResolution,
  MarketFactory,
  MarketFactory_MarketCreated,
} from 'generated'

Market.BetExited.handler(async ({ event, context }) => {
  const entity: Market_BetExited = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    option: event.params.option,
    amount: event.params.amount,
    newPool: event.params.newPool,
  }

  context.Market_BetExited.set(entity)
})

Market.BetPlaced.handler(async ({ event, context }) => {
  const entity: Market_BetPlaced = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    option: event.params.option,
    amount: event.params.amount,
    newPool: event.params.newPool,
  }

  context.Market_BetPlaced.set(entity)
})

Market.MarketResolved.handler(async ({ event, context }) => {
  const entity: Market_MarketResolved = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    resolver: event.params.resolver,
    option: event.params.option,
    creatorFee: event.params.creatorFee,
  }

  context.Market_MarketResolved.set(entity)
})

Market.ParticipantCountUpdated.handler(async ({ event, context }) => {
  const entity: Market_ParticipantCountUpdated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    newCount: event.params.newCount,
  }

  context.Market_ParticipantCountUpdated.set(entity)
})

Market.PayoutClaimed.handler(async ({ event, context }) => {
  const entity: Market_PayoutClaimed = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    amount: event.params.amount,
  }

  context.Market_PayoutClaimed.set(entity)
})

Market.ProposedResolution.handler(async ({ event, context }) => {
  const entity: Market_ProposedResolution = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    proposer: event.params.proposer,
    option: event.params.option,
    evidenceURI: event.params.evidenceURI,
  }

  context.Market_ProposedResolution.set(entity)
})

MarketFactory.MarketCreated.handler(async ({ event, context }) => {
  const entity: MarketFactory_MarketCreated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    creator: event.params.creator,
    market: event.params.market,
    params_0: event.params.params[0],
    params_1: event.params.params[1],
    params_2: event.params.params[2],
    params_3: event.params.params[3],
    params_4: event.params.params[4],
    metadata_0: event.params.metadata[0],
    metadata_1: event.params.metadata[1],
    metadata_2: event.params.metadata[2],
    metadata_3: event.params.metadata[3],
    metadata_4: event.params.metadata[4],
    metadata_5: event.params.metadata[5],
  }

  context.MarketFactory_MarketCreated.set(entity)
})

MarketFactory.MarketCreated.contractRegister(({ event, context }) => {
  // Register the new NFT contract using its address from the event
  context.addMarket(event.params.market)

  context.log.info(`Registered new Market at ${event.params.market}`)
})
