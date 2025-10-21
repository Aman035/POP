#!/bin/bash

# POP MarketFactory Deployment Script
# This script deploys the MarketFactory contract using values from .env file

set -e

echo "🚀 Deploying POP MarketFactory..."

# Load environment variables from .env file
if [ -f .env ]; then
    echo "📋 Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ Error: .env file not found"
    echo "Please create a .env file with the required variables"
    exit 1
fi

# Check required environment variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set in .env file"
    exit 1
fi

if [ -z "$COLLATERAL" ]; then
    echo "❌ Error: COLLATERAL not set in .env file"
    exit 1
fi

if [ -z "$CREATOR_OVERRIDE_WINDOW" ]; then
    echo "❌ Error: CREATOR_OVERRIDE_WINDOW not set in .env file"
    exit 1
fi

if [ -z "$RPC_URL" ]; then
    echo "❌ Error: RPC_URL not set in .env file"
    exit 1
fi

# Check if Arbiscan API key is set (optional for verification)
if [ -z "$ARBISCAN_API_KEY" ]; then
    echo "⚠️  Warning: ARBISCAN_API_KEY not set. Contract will not be verified."
    VERIFY_FLAG=""
else
    echo "✅ Arbiscan API key found. Contract will be verified."
    VERIFY_FLAG="--verify"
fi

echo "📋 Deployment Configuration:"
echo "  Collateral: $COLLATERAL"
echo "  Override Window: $CREATOR_OVERRIDE_WINDOW seconds"
echo "  RPC URL: $RPC_URL"
echo ""

# Deploy the contract
echo "🔨 Deploying contract..."
forge script script/DeployArbitrumSepolia.s.sol \
    --rpc-url $RPC_URL \
    --broadcast \
    --private-key $PRIVATE_KEY \
    $VERIFY_FLAG \
    --etherscan-api-key $ARBISCAN_API_KEY

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📝 Next steps:"
echo "1. Update your frontend with the deployed contract address"
echo "2. Test the contract functionality"
echo "3. Deploy to mainnet when ready"
echo ""
echo "🔗 View on Arbiscan: https://sepolia.arbiscan.io/address/[CONTRACT_ADDRESS]"
