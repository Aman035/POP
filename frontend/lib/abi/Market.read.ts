import { parseAbi } from "viem";

export const MarketReadAbi = parseAbi([
  "function question() view returns (string)",
  "function description() view returns (string)",
  "function category() view returns (string)",
  "function resolutionSource() view returns (string)",
  "function creator() view returns (address)",
  "function createdAt() view returns (uint64)",
  "function endTime() view returns (uint64)",
  "function creatorFeeBps() view returns (uint96)",
  "function status() view returns (uint8)",          // 0 Active, 1 Resolved, 2 Cancelled
  "function platform() view returns (uint8)",        // 0 Default, 1 Twitter, 2 Farcaster, 3 Lens, 4 Other
  "function postUrl() view returns (string)",
  "function totalStaked() view returns (uint256)",
  "function activeParticipantsCount() view returns (uint256)",
  "function optionCount() view returns (uint256)",
  "function getOptions() view returns (string[])",
]);
