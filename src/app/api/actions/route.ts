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
  irysStorage,
} from "@metaplex-foundation/js";
import { Connection, Keypair } from "@solana/web3.js";
import { NextResponse } from "next/server";

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

// NFT image https://raw.githubusercontent.com/julibi/image-uploads/main/unnamed.png

// change POST route to make it an action, follow nicks example
// call the endpoint with the right data (json with timestamp, publisher etc.)
// input GET requests blink with form input UI
// move the button up

// some developer readme
// double licenses (can also be done by you girls)
// handover? e.g. checkin with emily if she can run the code, if not, make a screenrecording
// screen recording

// register action endpoint (OPTIONAL)

export async function POST(request: Request) {
  try {
    const { recipientAddress, nftData } = await request.json();
    // Set up your Solana connection
    const connection = new Connection("https://api.devnet.solana.com"); // or use devnet/testnet

    // Load our dev wallet
    const secretKey = Uint8Array.from(
      JSON.parse(process.env.DEV_WALLET_SECRET_KEY!)
    );
    const wallet = Keypair.fromSecretKey(secretKey);

    // Set up Metaplex
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(wallet))
      .use(
        irysStorage({
          address: "https://devnet.irys.xyz",
          providerUrl: "https://api.devnet.solana.com",
          timeout: 60000,
        })
      );

    console.log("------------", { connection, secretKey, wallet, metaplex });

    // // Step 1: Create the mint for the NFT (SPL token with 0 decimals)
    const mint = await createMint(
      connection,
      wallet,
      wallet.publicKey,
      null,
      0 // Decimals: 0 for NFTs
    );

    console.log({ mint });

    // this is what is stored off chain
    // Step 2: Upload the metadata to Arweave (or IPFS)
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: nftData.name,
      symbol: nftData.symbol,
      description: nftData.description,
      image: nftData.image, // URL to the image (either upload first or reference)
      attributes: nftData.attributes || [], // here goes all our license related data! (e.g. "license": "CC BY-SA 4.0")
    });

    // this is what is stored on chain
    // Step 3: Use Metaplex to create the NFT with the uploaded metadata
    const { nft } = await metaplex.nfts().create({
      uri,
      name: nftData.name,
      sellerFeeBasisPoints: 500, // e.g., 5% royalties
      updateAuthority: wallet,
    });

    // Respond with success
    return NextResponse.json({
      success: true,
      mintAddress: mint.toBase58(),
      metadataUri: uri,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(errorMessage);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
