let zlib: any;

if (typeof window === "undefined") {
  // Import zlib only in the Node.js (server-side) environment, best working workaround I found so far
  // should actually be fixable with fallbacks like browserify-zlib in next.config webpack config, but somehow that did not work...
  zlib = require("zlib");
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { Keypair, PublicKey } from "@solana/web3.js";

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

import { encryptText } from "@/app/utils/server/encrypt";
import { createMetadata } from "@/app/utils/server/createMetadata";
import { uploadNFTImageToArweave } from "@/app/utils/server/uploadToArweave";
import { COLLECTION_PUBKEY, NFT_IMAGE_AW_URL } from "@/constants";

/* TODO:
-protect the route with a secret key or sth.
-validate the request body
-other api security considerations...
*/

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    const secretKey = new Uint8Array(
      process.env
        .DEV_WALLET_SECRET_KEY!.replace("[", "")
        .replace("]", "")
        .split(",")
        .map(Number)
    );
    const keypair = Keypair.fromSecretKey(secretKey); // Create the Keypair
    const ourPublicKey = keypair.publicKey.toString(); // Get the public key
    console.log("*********Public Key:", ourPublicKey);

    const { author, posts, published_where, user_wallet, cms } =
      await req.json(); // what to include in request body

    // Validate required fields
    if (!author || !posts.length || !published_where || !user_wallet) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!COLLECTION_PUBKEY) {
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

      // Pass and Fetch the Collection
      const collection = await fetchCollection(
        umi,
        publicKey(COLLECTION_PUBKEY)
      );

      // Upload ctrl-x icon to arweave
      let imageUri = NFT_IMAGE_AW_URL;
      if (!imageUri) {
        imageUri = await uploadNFTImageToArweave(umi);
      }

      // Prepare to store transaction signatures
      const transactionResults = [];

      // Loop through the posts and mint NFTs
      for (const post of posts) {
        // Generate the Asset KeyPair
        const asset = generateSigner(umi);
        const assetPublicKey = new PublicKey(asset.publicKey);
        console.log("This is your asset address", assetPublicKey);
        // Compress & Encrypt the text
        // for decompressing: zlib.inflateSync(Buffer.from(compressedText, "base64")).toString();
        const compressedText = zlib.deflateSync(post.text).toString("base64");
        const encryption = encryptText(compressedText);

        // Generate Metadata
        const metadata = createMetadata({
          title: post.title,
          imageUri,
          author,
          published_at: post.published_at,
          published_where,
          encryption,
          cms,
        });
        console.log({ metadata });

        // Upload Metadata
        const metadataUri = await umi.uploader.uploadJson(metadata);
        console.log({ metadataUri });

        // Generate the Asset
        const tx = await create(umi, {
          asset,
          collection,
          name: post.title,
          uri: "https://devnet.irys.xyz/" + metadataUri.split("/").pop(),
          owner: publicKey(user_wallet),
        }).sendAndConfirm(umi);

        // save the transaction signature
        transactionResults.push({
          nft: assetPublicKey,
          txString: base58.deserialize(tx.signature)[0],
          title: post.title,
        });
      }

      // Deserialize the Signature from the Transaction
      return NextResponse.json(
        {
          transactionResults,
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
