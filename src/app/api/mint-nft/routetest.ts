let zlib: any;

if (typeof window === "undefined") {
  // Import zlib only in the Node.js (server-side) environment, best working workaround I found so far
  // should actually be fixable with fallbacks like browserify-zlib in next.config webpack config, but somehow that did not work...
  zlib = require("zlib");
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  Connection,
  Transaction,
  TransactionInstruction,
  PublicKey,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";
import { create, fetchCollection } from "@metaplex-foundation/mpl-core";
import {
  generateSigner,
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
  Keypair,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base58 } from "@metaplex-foundation/umi/serializers";
import {
  irysUploader,
  // @ts-ignore "type definitions are missing"
} from "@metaplex-foundation/umi-uploader-irys";

import { encryptText } from "@/app/utils/server/encrypt";
import { createMetadata } from "@/app/utils/server/createMetadata";
import { uploadNFTImageToArweave } from "@/app/utils/server/uploadToArweave";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

/* TODO:
-protect the route with a secret key or sth.
-validate the request body
-what's with batch uploads?
*/

// const secretKey = new Uint8Array(
//   process.env
//     .DEV_WALLET_SECRET_KEY!.replace("[", "")
//     .replace("]", "")
//     .split(",")
//     .map(Number)
// );
// const keypair = Keypair.fromSecretKey(secretKey); // Create the Keypair
// const ourPublicKey = keypair.publicKey.toString(); // Get the public key
// console.log("Public Key:", ourPublicKey);

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    const { author, title, text, published_at, published_where, user_wallet } =
      await req.json(); // what to include in request body

    // Validate required fields
    if (
      !author ||
      !title ||
      !text ||
      !published_at ||
      !published_where ||
      !user_wallet
    ) {
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

    if (!process.env.DEV_WALLET_SECRET_KEY) {
      throw new Error(
        "DEV_WALLET_SECRET_KEY is not defined in the environment variables"
      );
    }

    if (!zlib) {
      return NextResponse.json(
        { error: "Compression library not available" },
        { status: 500 }
      );
    }

    try {
      // Create Signer from Wallet Secret Key & Establish Connection
      const secretKeyArray = JSON.parse(
        process.env.DEV_WALLET_SECRET_KEY
      ) as number[];
      const secretKey = new Uint8Array(secretKeyArray);
      const umi = createUmi("https://api.devnet.solana.com", "finalized");
      let keypair = umi.eddsa.createKeypairFromSecretKey(
        new Uint8Array(secretKey)
      );
      const adminSigner = createSignerFromKeypair(umi, keypair);
      umi.use(signerIdentity(adminSigner)).use(irysUploader());

      // Generate the Asset KeyPair
      const asset = generateSigner(umi);
      const assetPublicKey = new PublicKey(asset.publicKey);
      console.log("This is your asset address", assetPublicKey);

      // Pass and Fetch the Collection
      const collection = await fetchCollection(
        umi,
        publicKey(process.env.COLLECTION_PUBKEY)
      );
      const collectionPublicKey = new PublicKey(process.env.COLLECTION_PUBKEY);

      // Upload ctrl-x icon to arweave
      let imageUri = process.env.NFT_IMAGE_AW_URL;
      if (!imageUri) {
        imageUri = await uploadNFTImageToArweave(umi);
      }

      // Compress & Encrypt the text
      // for decompressing: zlib.inflateSync(Buffer.from(compressedText, "base64")).toString();
      const compressedText = zlib.deflateSync(text).toString("base64");
      const encryption = encryptText(compressedText);

      // Generate Metadata
      const metadata = createMetadata({
        title,
        imageUri,
        author,
        published_at,
        published_where,
        encryption,
      });

      // Upload Metadata
      const metadataUri = await umi.uploader.uploadJson(metadata);
      console.log({ metadataUri });

      // Generate the Asset
      // const tx = await create(umi, {
      //   asset,
      //   collection,
      //   name: title,
      //   uri: metadataUri,
      // }).sendAndConfirm(umi);

      // Deserialize the Signature from the Transaction
      // return NextResponse.json(
      //   {
      //     message: `Asset Created: https://solana.fm/tx/${
      //       base58.deserialize(tx.signature)[0]
      //     }?cluster=devnet-alpha`,
      //   },
      //   { status: 200 }
      // );

      const tx = new Transaction().add(
        new TransactionInstruction({
          keys: [
            { pubkey: assetPublicKey, isSigner: true, isWritable: true },
            { pubkey: collectionPublicKey, isSigner: false, isWritable: false },
            {
              pubkey: new PublicKey(user_wallet),
              isSigner: false,
              isWritable: true,
            },
          ],
          programId: collectionPublicKey, // NFT minting program
          data: Buffer.from(metadataUri), // Attach the metadata URI to the transaction
        })
      );

      // Determine that the user pays for transaction
      tx.feePayer = new PublicKey(user_wallet);

      // Extract the blockhash
      const blockhashInfo = await umi.rpc.getLatestBlockhash();
      const recentBlockhash = blockhashInfo.blockhash;
      tx.recentBlockhash = recentBlockhash;

      // Return the unsigned transaction to the client
      return NextResponse.json({
        transaction: tx
          .serialize({ requireAllSignatures: false })
          .toString("base64"),
        recentBlockhash,
      });
    } catch (error) {
      console.log({ error });
      return NextResponse.json({ error: "Mint failed" }, { status: 500 });
    }
  } else {
    // If not POST, return method not allowed
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
}
