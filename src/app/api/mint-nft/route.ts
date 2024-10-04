import zlib from "zlib";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { create, fetchCollection } from "@metaplex-foundation/mpl-core";
import {
  generateSigner,
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base58 } from "@metaplex-foundation/umi/serializers";
import {
  irysUploader,
  // @ts-ignore "type definitions are missing"
} from "@metaplex-foundation/umi-uploader-irys";

import { encryptText } from "../../utils/encrypt";
import { createMetadata } from "@/app/utils/createMetadata";
import { uploadNFTImageToArweave } from "@/app/utils/uploadToArweave";

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
    const { author, title, text, published_at, published_where } =
      await req.json(); // what to include in request body

    // Validate required fields
    if (!author || !title || !text || !published_at || !published_where) {
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

    try {
      // Create Signer from Wallet Secret Key
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
      console.log("This is your asset address", asset.publicKey.toString());

      // Pass and Fetch the Collection
      const collection = await fetchCollection(
        umi,
        publicKey(process.env.COLLECTION_PUBKEY)
      );

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
      const tx = await create(umi, {
        asset,
        collection,
        name: title,
        uri: metadataUri,
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
      console.log({ error });
      return NextResponse.json({ error: "Mint failed" }, { status: 500 });
    }
  } else {
    // If not POST, return method not allowed
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
}
