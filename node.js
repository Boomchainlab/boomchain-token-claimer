require('dotenv').config();
const { ethers } = require('ethers');
const { Connection, PublicKey } = require('@solana/web3.js');

// Environment variables
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHEREUM_ADDRESS = process.env.ETHEREUM_ADDRESS;
const SOLANA_ADDRESS = process.env.SOLANA_ADDRESS;

// Ethereum (and EVM chains) provider setup
const ethProvider = new ethers.providers.AlchemyProvider('homestead', ALCHEMY_API_KEY);
const wallet = new ethers.Wallet(PRIVATE_KEY, ethProvider);

// Solana provider setup
const solanaConnection = new Connection(`https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);

// ERC20 minimal ABI
const tokenAbi = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function balanceOf(address owner) view returns (uint256)"
];

// Example Ethereum token contract address (replace accordingly)
const tokenContractAddress = process.env.ETHEREUM_TOKEN_CONTRACT;

// Initialize Ethereum token contract
const ethTokenContract = new ethers.Contract(tokenContractAddress, tokenAbi, ethProvider);

async function monitorEthereum() {
  console.log(`🚀 Starting Ethereum token monitoring for address: ${ETHEREUM_ADDRESS}`);

  ethTokenContract.on('Transfer', async (from, to, value) => {
    if (to.toLowerCase() === ETHEREUM_ADDRESS.toLowerCase()) {
      const amount = ethers.utils.formatUnits(value, 18);
      console.log(`✅ ETH Token Transfer Inbound: From ${from} Amount: ${amount}`);

      const balance = await ethTokenContract.balanceOf(ETHEREUM_ADDRESS);
      console.log(`💰 Updated ETH Token Balance: ${ethers.utils.formatUnits(balance, 18)}`);
    }
  });
}

async function monitorSolana() {
  console.log(`🚀 Starting Solana token monitoring for address: ${SOLANA_ADDRESS}`);

  // Poll for token accounts or use websockets via Solana SDK or 3rd-party service for SPL token transfers
  // Example: fetch token accounts and balances (simplified)

  const pubkey = new PublicKey(SOLANA_ADDRESS);
  const tokens = await solanaConnection.getParsedTokenAccountsByOwner(pubkey, { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") });
  
  tokens.value.forEach(({ pubkey, account }) => {
    const tokenAmount = account.data.parsed.info.tokenAmount.uiAmount;
    const mintAddress = account.data.parsed.info.mint;
    console.log(`💰 Solana Token: ${mintAddress} Balance: ${tokenAmount}`);
  });

  // Extend with event subscription via WebSockets or Alchemy-specific Solana API if supported
}

async function startMonitoring() {
  await monitorEthereum();
  await monitorSolana();

  // Extend for other networks: Polygon, Starknet, zkSync, etc.
}

startMonitoring().catch(console.error);
