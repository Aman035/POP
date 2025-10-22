import { parseAbi } from "viem";

export const MarketFactoryReadAbi = parseAbi([
  // Market discovery functions
  "function totalMarkets() view returns (uint256)",
  "function marketAt(uint256 i) view returns (address)",
  "function allMarkets() view returns (address[])",
  "function marketForIdentifier(uint256 id) view returns (address)",
]);
