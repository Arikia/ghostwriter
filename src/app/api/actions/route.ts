// THIS IS WHERE OUR SOLANA ACTIONS FOR BLINKS WILL GO

import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  MEMO_PROGRAM_ID,
} from "@solana/actions";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
} from "@metaplex-foundation/js";
import { Connection, Keypair } from "@solana/web3.js";
import { NextResponse } from "next/server";

// Set up your Solana connection
const connection = new Connection("https://api.devnet.solana.com"); // or use devnet/testnet

// Load our dev wallet
const secretKey = Uint8Array.from(JSON.parse(process.env.SOLANA_SECRET_KEY!));
const wallet = Keypair.fromSecretKey(secretKey);

// Set up Metaplex
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(wallet))
  .use(bundlrStorage()); // For storing metadata on Arweave

export const GET = async (req: Request) => {
  const payload: ActionGetResponse = {
    icon: new URL("/", new URL(req.url).origin).toString(),
    label: "Donate",
    description: "Send a memo to the Solana network",
    title: "Donate Solana to me",
    links: {
      actions: [
        {
          label: "Donate 0.1 SOL",
          href: "/api/actions/purchase-tshirt?amount=small",
        },
        {
          label: "Donate 1 SOL",
          href: "/api/actions/purchase-tshirt?amount=big",
        },
      ],
    },
  };
  return NextResponse.json(payload, {
    // The line headers: ACTIONS_CORS_HEADERS is used to include CORS headers in the response, allowing cross-origin requests from other domains, because blinks are embedded everywhere, so the requests can be fired from anyhwere
    headers: ACTIONS_CORS_HEADERS,
  });
};

// The OPTIONS HTTP method is used to describe the communication options for the target resource. This is often used in the context of CORS (Cross-Origin Resource Sharing) preflight requests. Browsers send an OPTIONS request before certain types of HTTP requests (like POST, PUT, or DELETE) to determine if the actual request is safe to send.
// Since OPTIONS requests usually don't need complex logic and are just about responding with proper headers, reusing the GET handler can simplify the code.
// If the GET handler is already handling the necessary CORS headers, using it for OPTIONS ensures that preflight requests get those headers without duplicating code.
export const OPTIONS = GET;

export async function POST(request: Request) {
  try {
    const { recipientAddress, nftData } = await request.json();

    // Step 1: Create the mint for the NFT (SPL token with 0 decimals)
    const mint = await createMint(
      connection,
      wallet,
      wallet.publicKey,
      null,
      0 // Decimals: 0 for NFTs
    );

    // Step 2: Upload the metadata to Arweave (or IPFS)
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: nftData.name,
      symbol: nftData.symbol,
      description: nftData.description,
      image: nftData.image, // URL to the image (either upload first or reference)
      attributes: nftData.attributes || [],
    });

    // Step 3: Use Metaplex to create the NFT with the uploaded metadata
    const { nft } = await metaplex.nfts().create({
      mint,
      uri,
      name: nftData.name,
      sellerFeeBasisPoints: 500, // e.g., 5% royalties
      updateAuthority: wallet.publicKey,
    });

    // Respond with success
    return NextResponse.json({
      success: true,
      mintAddress: mint.toBase58(),
      metadataUri: uri,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
