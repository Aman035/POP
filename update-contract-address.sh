#!/bin/bash

# Script to update frontend files with new contract address after deployment
# Usage: ./update-contract-address.sh <NEW_CONTRACT_ADDRESS>

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Please provide the new contract address"
    echo "Usage: ./update-contract-address.sh <NEW_CONTRACT_ADDRESS>"
    exit 1
fi

NEW_ADDRESS=$1

echo "🔄 Updating frontend files with new contract address: $NEW_ADDRESS"

# Update frontend/constants/addresses.ts
echo "📝 Updating frontend/constants/addresses.ts..."
sed -i.bak "s/MARKET_FACTORY: \"0x[^\"]*\"/MARKET_FACTORY: \"$NEW_ADDRESS\"/g" frontend/constants/addresses.ts
sed -i.bak "s/MARKET_FACTORY_ADDRESS = \"0x[^\"]*\"/MARKET_FACTORY_ADDRESS = \"$NEW_ADDRESS\"/g" frontend/lib/contracts.ts

# Update contracts README
echo "📝 Updating contracts/README.md..."
sed -i.bak "s/| Arbitrum Sepolia | \`TBD\`/| Arbitrum Sepolia | \`$NEW_ADDRESS\`/g" contracts/README.md
sed -i.bak "s/- \*\*Contract Address\*\*: \`TBD\`/- \*\*Contract Address\*\*: \`$NEW_ADDRESS\`/g" contracts/README.md

# Update frontend CONTRACT_INTEGRATION.md
echo "📝 Updating frontend/CONTRACT_INTEGRATION.md..."
sed -i.bak "s/- \*\*Contract Address\*\*: \`0x[^\`]*\`/- \*\*Contract Address\*\*: \`$NEW_ADDRESS\`/g" frontend/CONTRACT_INTEGRATION.md

# Clean up backup files
rm -f frontend/constants/addresses.ts.bak
rm -f frontend/lib/contracts.ts.bak
rm -f contracts/README.md.bak
rm -f frontend/CONTRACT_INTEGRATION.md.bak

echo "✅ All files updated successfully!"
echo ""
echo "📋 Updated files:"
echo "  - frontend/constants/addresses.ts"
echo "  - frontend/lib/contracts.ts"
echo "  - contracts/README.md"
echo "  - frontend/CONTRACT_INTEGRATION.md"
echo ""
echo "🔗 New contract address: $NEW_ADDRESS"
echo "🌐 View on Arbiscan: https://sepolia.arbiscan.io/address/$NEW_ADDRESS"
echo ""
echo "🚀 Next steps:"
echo "1. Test the updated frontend"
echo "2. Verify contract functionality"
echo "3. Update any other references to the old address"
