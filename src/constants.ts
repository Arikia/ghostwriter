const RPC = "https://api.devnet.solana.com";
const COLLECTION_PUBKEY = "7dvTzUDjzUrCNMx6vTLPbfaWQNpi5oZxSwhgq3PX44hU";
const NFT_IMAGE_GH_URL =
  "https://raw.githubusercontent.com/julibi/image-uploads/main/unnamed.png";
const NFT_IMAGE_AW_URL =
  "https://devnet.irys.xyz/D6UumRpJTxu5N4zihuwaDxZDsJkBUE8iAp7d8ZD8nf6f";
const HELIUS_URL = `https://devnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_RPC_API_KEY}`;
const COINGECKO_SOLANA_PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";

export {
  RPC,
  COLLECTION_PUBKEY,
  NFT_IMAGE_AW_URL,
  NFT_IMAGE_GH_URL,
  HELIUS_URL,
  COINGECKO_SOLANA_PRICE_URL,
};
