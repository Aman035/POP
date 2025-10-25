import { parseAbi } from "viem";

export const MarketFactoryReadAbi = parseAbi([
  // Market discovery functions
  "function totalMarkets() view returns (uint256)",
  "function marketAt(uint256 i) view returns (address)",
  "function allMarkets() view returns (address[])",
  "function marketForIdentifier(string id) view returns (address)", // Changed from uint256 to string
  "function collateral() view returns (address)",
  "function creatorOverrideWindow() view returns (uint64)",
  "function owner() view returns (address)",
]);
