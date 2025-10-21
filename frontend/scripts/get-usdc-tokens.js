// Script to get USDC tokens from 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
// Run this in your browser console or as a Node.js script

const USDC_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";
const ARBITRUM_SEPOLIA_RPC = "https://sepolia-rollup.arbitrum.io/rpc";

// ABI for common ERC20 functions and potential faucet functions
const USDC_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function faucet() external",
  "function mint(address to, uint256 amount) external",
  "function claim() external",
  "function getTokens() external",
  "function drip() external",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)"
];

async function getUSDCTokens() {
  try {
    // Check if MetaMask is available
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not detected. Please install MetaMask.');
    }

    // Connect to Arbitrum Sepolia
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Get user address
    const address = await signer.getAddress();
    console.log('Connected address:', address);

    // Create contract instance
    const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);

    // Check current balance
    const balance = await usdcContract.balanceOf(address);
    const formattedBalance = ethers.formatUnits(balance, 6);
    console.log('Current USDC balance:', formattedBalance);

    if (parseFloat(formattedBalance) > 0) {
      console.log('You already have USDC tokens!');
      return;
    }

    // Try different faucet methods
    const faucetMethods = [
      'faucet',
      'mint', 
      'claim',
      'getTokens',
      'drip'
    ];

    console.log('Trying to get USDC tokens...');

    for (const method of faucetMethods) {
      try {
        console.log(`Trying method: ${method}`);
        
        if (method === 'mint') {
          // Mint function might need amount parameter
          const tx = await usdcContract.mint(address, ethers.parseUnits("100", 6));
          await tx.wait();
        } else {
          const tx = await usdcContract[method]();
          await tx.wait();
        }
        
        console.log(`✅ Successfully called ${method}!`);
        
        // Check new balance
        const newBalance = await usdcContract.balanceOf(address);
        const newFormattedBalance = ethers.formatUnits(newBalance, 6);
        console.log('New USDC balance:', newFormattedBalance);
        
        return;
        
      } catch (error) {
        console.log(`❌ Method ${method} failed:`, error.message);
      }
    }

    console.log('❌ No working faucet method found. Try external faucets:');
    console.log('1. https://developer.interlace.money/docs/usdc-on-testing-networks');
    console.log('2. https://faucet.quicknode.com/arbitrum/sepolia');
    console.log('3. Bridge USDC from Ethereum Sepolia');

  } catch (error) {
    console.error('Error getting USDC tokens:', error);
  }
}

// Usage instructions
console.log(`
🚀 USDC Token Acquisition Script
================================

To get USDC tokens from ${USDC_ADDRESS}:

1. Make sure you're connected to Arbitrum Sepolia (Chain ID: 421614)
2. Make sure you have some ETH for gas fees
3. Run: getUSDCTokens()

If the built-in faucet doesn't work, try these external options:
- Interlace Faucet: https://developer.interlace.money/docs/usdc-on-testing-networks
- QuickNode Faucet: https://faucet.quicknode.com/arbitrum/sepolia
- Bridge from Ethereum Sepolia: https://bridge.arbitrum.io/

Token Details:
- Address: ${USDC_ADDRESS}
- Network: Arbitrum Sepolia
- Decimals: 6
- Symbol: USDC
`);

// Export the function for use
window.getUSDCTokens = getUSDCTokens;
