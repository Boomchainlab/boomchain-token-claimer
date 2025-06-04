require('dotenv').config();
const { ethers } = require('ethers');

// Load Alchemy API keys and private key from .env
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Map of network names to Alchemy URLs (extend as needed)
const ALCHEMY_ENDPOINTS = {
  ethereum: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  polygon: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  optimism: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  arbitrum: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  base: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  // Add more networks as you scale
};

// Select network here (customize as needed)
const NETWORK = 'ethereum';

// Provider and wallet setup
const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_ENDPOINTS[NETWORK]);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Replace with your token contract and claim contract addresses per network
const tokenContractAddress = process.env.TOKEN_CONTRACT_ADDRESS;
const claimContractAddress = process.env.CLAIM_CONTRACT_ADDRESS;

// Minimal ERC-20 ABI to detect transfers and check balances
const tokenAbi = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function balanceOf(address owner) view returns (uint256)"
];

// ABI for your claim contract (customize accordingly)
const claimAbi = [
  "function claim() public"
];

const tokenContract = new ethers.Contract(tokenContractAddress, tokenAbi, provider);
const claimContract = new ethers.Contract(claimContractAddress, claimAbi, wallet);

async function listenForTransfers() {
  console.log(`🚀 Listening for incoming token transfers on ${NETWORK}...`);
  
  tokenContract.on('Transfer', async (from, to, value, event) => {
    if (to.toLowerCase() === wallet.address.toLowerCase()) {
      console.log(`✅ Incoming transfer detected from ${from}, amount: ${ethers.utils.formatUnits(value, 18)}`);

      // Optional: Check balance before claiming
      const balance = await tokenContract.balanceOf(wallet.address);
      console.log(`💰 Current token balance: ${ethers.utils.formatUnits(balance, 18)}`);

      // Trigger claim
      try {
        console.log('⏳ Initiating claim transaction...');
        const tx = await claimContract.claim();
        console.log(`📝 Claim tx sent: ${tx.hash}`);
        await tx.wait();
        console.log('🎉 Claim transaction confirmed!');
      } catch (error) {
        console.error('❌ Claim transaction failed:', error);
      }
    }
  });
}

listenForTransfers().catch(console.error);
