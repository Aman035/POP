#!/bin/bash

# POP MarketFactory Deployment Script with New USDC
# This script deploys the MarketFactory contract with the new testnet USDC address

set -e

echo "🚀 Deploying POP MarketFactory with new USDC address..."
echo "📋 Using USDC: 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"

# Load environment variables from .env file
if [ -f .env ]; then
    echo "📋 Loading environment variables from .env file..."
    set -a
    source .env
    set +a
else
    echo "❌ Error: .env file not found"
    exit 1
fi

# Check if private key is provided
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set in .env file"
    exit 1
fi

echo "📋 Deployment Configuration:"
echo "  Collateral: 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d (Testnet USDC)"
echo "  Override Window: 21600 seconds (6 hours)"
echo "  RPC URL: https://sepolia-rollup.arbitrum.io/rpc"
echo ""

# Deploy the contract
echo "🔨 Deploying contract..."
forge script script/DeployArbitrumSepolia.s.sol \
    --rpc-url https://sepolia-rollup.arbitrum.io/rpc \
    --broadcast \
    --private-key $PRIVATE_KEY

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the deployed contract address from the output above"
echo "2. Update frontend/constants/addresses.ts with the new address"
echo "3. Update frontend ABIs and types"
echo "4. Test the contract functionality"
echo ""
echo "🔗 View on Arbiscan: https://sepolia.arbiscan.io/address/[CONTRACT_ADDRESS]"
