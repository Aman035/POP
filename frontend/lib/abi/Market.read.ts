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
  "function state() view returns (uint8)",            // 0 Trading, 1 Proposed, 2 Resolved
  "function platform() view returns (uint8)",        // 0 Twitter, 1 Farcaster, 2 Lens, 3 Other
  "function identifier() view returns (string)",     // Changed from uint256 to string
  "function totalStaked() view returns (uint256)",
  "function activeParticipantsCount() view returns (uint256)",
  "function getOptionCount() view returns (uint256)",
  "function getOptionPercentage(uint8) view returns (uint256)",
  "function calculateWinning(uint8,uint256) view returns (uint256)",
  "function optionLiquidity(uint8) view returns (uint256)",
  "function options(uint256) view returns (string)",
  "function outcome() view returns (uint8)",
  "function proposer() view returns (address)",
  "function resolver() view returns (address)",
  "function proposalTimestamp() view returns (uint256)",
  "function resolutionEvidence() view returns (string)",
  "function finalWinningPool() view returns (uint256)",
  "function resolvedPayoutPool() view returns (uint256)",
  "function creatorFeePaid() view returns (uint256)",
  "function userPositions(address,uint8) view returns (uint256)",
  "function userTotalPosition(address) view returns (uint256)",
  "function hasClaimed(address) view returns (bool)",
]);
