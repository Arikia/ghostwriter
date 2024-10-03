import {
  generateSigner,
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { create, fetchCollection } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { config } from "dotenv";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Keypair } from "@solana/web3.js";

// Load environment variables from .env file
config();

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    const { uri, name } = await req.json();

    // JUST FOR JULES
    // const secretKey = new Uint8Array(
    //   process.env
    //     .DEV_WALLET_SECRET_KEY!.replace("[", "")
    //     .replace("]", "")
    //     .split(",")
    //     .map(Number)
    // ); // Parse the secret key
    // const keypair = Keypair.fromSecretKey(secretKey); // Create the Keypair
    // const ourPublicKey = keypair.publicKey.toString(); // Get the public key
    // console.log("Public Key:", ourPublicKey);

    // Validate required fields
    if (!uri || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!process.env.COLLECTION_PUBKEY) {
      return NextResponse.json(
        {
          error:
            "Collection public key is not defined in the environment variables",
        },
        { status: 500 }
      );
    }

    try {
      // Setup Umi
      const umi = createUmi("https://api.devnet.solana.com", "finalized");

      // Parse the DEV_WALLET_SECRET_KEY from the environment variable
      const secretKeyString = process.env.DEV_WALLET_SECRET_KEY;
      if (!secretKeyString) {
        throw new Error(
          "DEV_WALLET_SECRET_KEY is not defined in the environment variables"
        );
      }

      // Parse the string into an array of numbers and then convert it into a Uint8Array
      const secretKeyArray = JSON.parse(secretKeyString) as number[];
      const secretKey = new Uint8Array(secretKeyArray);

      let keypair = umi.eddsa.createKeypairFromSecretKey(
        new Uint8Array(secretKey)
      );
      const adminSigner = createSignerFromKeypair(umi, keypair);
      umi.use(signerIdentity(adminSigner));

      // Generate the Asset KeyPair
      const asset = generateSigner(umi);
      console.log("This is your asset address", asset.publicKey.toString());

      // Pass and Fetch the Collection
      const collection = await fetchCollection(
        umi,
        publicKey(process.env.COLLECTION_PUBKEY)
      );
      console.log(collection);

      // Generate the Asset
      const tx = await create(umi, {
        asset,
        collection,
        name: `${name} (Journalistic Content recorded through CTRL+X)`,
        uri,
      }).sendAndConfirm(umi);

      // Deserialize the Signature from the Transaction
      return NextResponse.json(
        {
          message: `Asset Created: https://solana.fm/tx/${
            base58.deserialize(tx.signature)[0]
          }?cluster=devnet-alpha`,
        },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json({ error: "Mint failed" }, { status: 500 });
    }
  } else {
    // If not POST, return method not allowed
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
}
