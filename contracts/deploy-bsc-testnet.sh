#!/bin/bash

# BSC Testnet Deployment Script for MarketFactory
# Usage: ./deploy-bsc-testnet.sh

set -e

# Load .env file if it exists
if [ -f .env ]; then
    echo "📂 Loading environment variables from .env file..."
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        if [[ -n "$line" && ! "$line" =~ ^[[:space:]]*# ]]; then
            # Export the variable
            export "$line"
        fi
    done < .env
fi

# Configuration
COLLATERAL_BSC_TESTNET="${COLLATERAL_BSC_TESTNET:-0x64544969ed7EBf5f083679233325356EbE738930}"
CREATOR_OVERRIDE_WINDOW="${CREATOR_OVERRIDE_WINDOW:-21600}"
RPC_URL_BSC_TESTNET="${RPC_URL_BSC_TESTNET:-https://bnb-testnet.g.alchemy.com/v2/6Dhi7I5OA8qYGZ9DYZAgYKdQZJo6hh47}"

# Check if private key is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY is not set"
    echo ""
    echo "Please set it using one of these methods:"
    echo "  1. Create a .env file with: PRIVATE_KEY=0xYourPrivateKeyHere"
    echo "  2. Export it: export PRIVATE_KEY=0xYourPrivateKeyHere"
    echo "  3. Add it inline: --private-key 0xYourPrivateKeyHere"
    echo ""
    echo "See SETUP_PRIVATE_KEY.md for detailed instructions."
    exit 1
fi

echo "🚀 Deploying MarketFactory to BSC Testnet..."
echo "📋 Configuration:"
echo "   - Collateral Token: $COLLATERAL_BSC_TESTNET"
echo "   - Creator Override Window: $CREATOR_OVERRIDE_WINDOW seconds"
echo "   - RPC URL: $RPC_URL_BSC_TESTNET"
echo ""

# Export environment variables for the forge script
export COLLATERAL_BSC_TESTNET
export CREATOR_OVERRIDE_WINDOW

# Deploy without verification first
echo "📦 Deploying contract..."
forge script script/DeployMarketFactory.s.sol \
    --rpc-url "$RPC_URL_BSC_TESTNET" \
    --broadcast \
    --private-key "$PRIVATE_KEY" \
    -vvv

# Check if BSCScan API key is set for verification
if [ -n "$BSCSCAN_API_KEY" ]; then
    echo ""
    echo "🔍 Verifying contract on BSCScan..."
    # Get the deployed address from broadcast file
    DEPLOYED_ADDRESS=$(cat broadcast/DeployMarketFactory.s.sol/97/run-latest.json | grep -o '"contractAddress":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -n "$DEPLOYED_ADDRESS" ]; then
        forge verify-contract \
            $DEPLOYED_ADDRESS \
            src/MarketFactory.sol:MarketFactory \
            --chain-id 97 \
            --etherscan-api-key $BSCSCAN_API_KEY \
            --compiler-version 0.8.24 \
            --num-of-optimizations 200 \
            --constructor-args $(cast abi-encode "constructor((address,uint64),address)" "(address($COLLATERAL_BSC_TESTNET),uint64($CREATOR_OVERRIDE_WINDOW))" "0x0000000000000000000000000000000000000000")
        
        echo "✅ Contract verified at: https://testnet.bscscan.com/address/$DEPLOYED_ADDRESS"
    else
        echo "⚠️  Could not extract deployed address for verification"
    fi
else
    echo "⚠️  BSCSCAN_API_KEY not set. Skipping verification."
    echo "   To verify later, set BSCSCAN_API_KEY and run verification manually"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Update frontend/.env.local with the deployed contract address"
echo "   2. Update NEXT_PUBLIC_MARKET_FACTORY_ADDRESS"
echo "   3. Update NEXT_PUBLIC_COLLATERAL_TOKEN_ADDRESS=$COLLATERAL_BSC_TESTNET"

