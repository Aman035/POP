# Deploy MarketFactory to BSC Testnet

## Quick Deploy Command

```bash
cd contracts

# Set your private key (replace with your actual private key)
export PRIVATE_KEY=your_private_key_here

# Optional: Set BSCScan API key for verification
export BSCSCAN_API_KEY=your_bscscan_api_key_here

# Deploy
COLLATERAL_BSC_TESTNET=0x64544969ed7EBf5f083679233325356EbE738930 \
CREATOR_OVERRIDE_WINDOW=21600 \
forge script script/DeployMarketFactory.s.sol \
    --rpc-url https://bnb-testnet.g.alchemy.com/v2/6Dhi7I5OA8qYGZ9DYZAgYKdQZJo6hh47 \
    --broadcast \
    --private-key $PRIVATE_KEY \
    --verify \
    --verifier-url https://api-testnet.bscscan.com/api \
    --etherscan-api-key $BSCSCAN_API_KEY
```

## After Deployment

1. Copy the deployed contract address from the output
2. Update `frontend/.env.local`:
   ```
   NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=0x84bBEB5383A2da8AcA2008B3505fCb338AE850c4
   NEXT_PUBLIC_COLLATERAL_TOKEN_ADDRESS=0x64544969ed7EBf5f083679233325356EbE738930
   ```

## Configuration

- **MarketFactory Address**: `0x84bBEB5383A2da8AcA2008B3505fCb338AE850c4`
- **Collateral Token (USDC)**: `0x64544969ed7EBf5f083679233325356EbE738930`
- **Creator Override Window**: 21600 seconds (6 hours)
- **Network**: BSC Testnet (Chain ID: 97)
- **RPC URL**: `https://bnb-testnet.g.alchemy.com/v2/6Dhi7I5OA8qYGZ9DYZAgYKdQZJo6hh47`
- **Block Explorer**: [BSCScan Testnet](https://testnet.bscscan.com/address/0x84bBEB5383A2da8AcA2008B3505fCb338AE850c4)
- **Estimated Gas**: ~0.004 BNB

