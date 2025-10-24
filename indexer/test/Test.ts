import assert from "assert";
import { 
  TestHelpers,
  Market_BetExited
} from "generated";
const { MockDb, Market } = TestHelpers;

describe("Market contract BetExited event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for Market contract BetExited event
  const event = Market.BetExited.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("Market_BetExited is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await Market.BetExited.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualMarketBetExited = mockDbUpdated.entities.Market_BetExited.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedMarketBetExited: Market_BetExited = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      user: event.params.user,
      option: event.params.option,
      amount: event.params.amount,
      newPool: event.params.newPool,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualMarketBetExited, expectedMarketBetExited, "Actual MarketBetExited should be the same as the expectedMarketBetExited");
  });
});
