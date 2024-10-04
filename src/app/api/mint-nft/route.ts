import {
  createGenericFile,
  generateSigner,
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { create, fetchCollection } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";
import {
  irysUploader,
  // @ts-ignore "type definitions are missing"
} from "@metaplex-foundation/umi-uploader-irys";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

/* TODO:
-hash the text and save that to metadata
-set correct metadata 
-protect the route with a secret key or sth.
-validate the request body
-what's with batch uploads?
*/

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    const { name } = await req.json(); // what to include in request body

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

    // Validate required fields
    if (!name) {
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
        const imageFile = fs.readFileSync(
          path.join(process.cwd(), "public", "ctrlxicon.png")
        );

        const umiImageFile = createGenericFile(imageFile, "ctrl-x.png", {
          tags: [{ name: "Content-Type", value: "image/png" }],
        });

        // upload image to Arweave via Irys and get returned an uri
        // address where the file is located -> imageUri[0]
        const uri = await umi.uploader.upload([umiImageFile]).catch((err) => {
          throw new Error(err);
        });
        imageUri = "https://gateway.irys.xyz/" + uri[0].split("/").pop(); // https://arweave.net/id currently not working
      }

      // Generate Metadata
      const metadata = {
        name: "CTRL+X",
        description: name,
        image: imageUri,
        external_url: "https://example.com",
        attributes: [
          {
            trait_type: "trait1",
            value: "value1",
          },
          {
            trait_type: "trait2",
            value: "value2",
          },
        ],
        properties: {
          files: [
            {
              uri: imageUri,
              type: "image/png",
            },
          ],
          category: "image",
        },
      };

      // Upload Metadata
      const metadataUri = await umi.uploader.uploadJson(metadata);
      console.log({ metadataUri });

      // Generate the Asset
      const tx = await create(umi, {
        asset,
        collection,
        name: `${name} (Journalistic Content recorded through CTRL+X)`,
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
      // @ts-ignore
      console.log(error.message);
      return NextResponse.json({ error: "Mint failed" }, { status: 500 });
    }
  } else {
    // If not POST, return method not allowed
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }
}
