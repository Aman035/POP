# Contract Redeployment Instructions

## 🚀 Deploy with New USDC Address

### Step 1: Set Environment Variables

```bash
# Set your private key (replace with your actual private key)
export PRIVATE_KEY=your_private_key_here

# Optional: Set Arbiscan API key for verification
export ARBISCAN_API_KEY=your_arbiscan_api_key_here
```

### Step 2: Deploy the Contract

```bash
cd contracts
./deploy-new.sh
```

### Step 3: Copy the Deployed Address

After deployment, copy the contract address from the output and update the frontend files.

## 📋 What's Updated

- **USDC Address**: Now using `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` (testnet USDC)
- **Deployment Script**: Updated to use the new USDC address
- **Frontend**: Ready to be updated with new contract address

## 🔄 Next Steps After Deployment

1. Copy the deployed contract address
2. Update `frontend/constants/addresses.ts` with the new address
3. Update `frontend/lib/contracts.ts` with the new address
4. Test the contract functionality
5. Update README with new deployment information
