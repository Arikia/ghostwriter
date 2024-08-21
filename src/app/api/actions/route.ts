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
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";
import { create, fetchCollection } from "@metaplex-foundation/mpl-core";
import {
  generateSigner,
  createSignerFromKeypair,
  signerIdentity,
  createNoopSigner,
  publicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base64 } from "@metaplex-foundation/umi/serializers";

export const GET = async (req: Request) => {
  const payload: ActionGetResponse = {
    icon: "https://raw.githubusercontent.com/julibi/image-uploads/main/unnamed.png",
    label: "License",
    description: "Mint your License NFT now",
    title: "License",
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

// change POST route to make it an action, follow nicks example
// call the endpoint with the right data (json with timestamp, publisher etc.)
// input GET requests blink with form input UI
// use the blink sdk to show the form
// move the button up

// confetti on success
// some developer readme
// double licenses (can also be done by you girls)
// handover? e.g. checkin with emily if she can run the code, if not, make a screenrecording
// screen recording

// register action endpoint (OPTIONAL)

export const POST = async (req: Request) => {
  const request = await req.json();

  let recipientAddress;
  try {
    recipientAddress = new PublicKey(request.account);
  } catch (error) {
    return new Response("Invalid account address", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  let transaction = await prepareTransaction(new PublicKey(recipientAddress));

  const serializedCreateAssetTxAsString = base64.deserialize(transaction)[0];
  const response: ActionPostResponse = {
    // transaction: serializedCreateAssetTxAsString,
    transaction: Buffer.from(transaction).toString("base64"),
  };

  return NextResponse.json(response, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

const prepareTransaction = async (recipientAddress: PublicKey) => {
  const umi = createUmi("https://api.devnet.solana.com", "confirmed");
  let keypair = umi.eddsa.createKeypairFromSecretKey(
    new Uint8Array(JSON.parse(process.env.DEV_WALLET_SECRET_KEY!))
  );

  const adminSigner = createSignerFromKeypair(umi, keypair);
  // umi.use(signerIdentity(adminSigner));
  umi.use(signerIdentity(createNoopSigner(publicKey(recipientAddress))));

  // Generate the Asset KeyPair
  const asset = generateSigner(umi);
  console.log("This is your asset address", asset.publicKey.toString());

  // Pass and Fetch the Collection
  const collection = await fetchCollection(
    umi,
    publicKey(process.env.COLLECTION_PUBKEY!)
  );
  console.log(collection);

  let tx = await create(umi, {
    asset,
    collection,
    name: "CTRL+X License",
    uri: "https://ctrlx.world",
    authority: adminSigner,
    // owner: publicKey(recipientAddress),
    // payer: adminSigner,
    // }).buildAndSign(umi);
  }).getInstructions();

  console.log({ tx });

  const blockhash = await umi.rpc.getLatestBlockhash();
  let createAssetTx = umi.transactions.create({
    version: 0,
    payer: publicKey(recipientAddress),
    instructions: tx,
    blockhash: blockhash.blockhash,
  });

  return umi.transactions.serialize(createAssetTx);
};
