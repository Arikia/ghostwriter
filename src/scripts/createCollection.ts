require("dotenv").config();
const {
  generateSigner,
  createSignerFromKeypair,
  signerIdentity,
} = require("@metaplex-foundation/umi");
const { createUmi } = require("@metaplex-foundation/umi-bundle-defaults");
const { base58 } = require("@metaplex-foundation/umi/serializers");
const { createCollection } = require("@metaplex-foundation/mpl-core");

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

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secretKey));
const adminSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(adminSigner));

(async () => {
  // Generate the Collection KeyPair
  const collection = generateSigner(umi);
  console.log(
    "This is your collection address",
    collection.publicKey.toString()
  );

  // Generate the collection
  let tx = await createCollection(umi, {
    collection,
    name: "CTRL+X Hackathon Version",
    uri: "https://ctrlx.world",
    plugins: [
      {
        type: "PermanentFreezeDelegate",
        frozen: true,
        authority: { type: "None" },
      },
    ],
  }).sendAndConfirm(umi);

  // Deserialize the Signature from the Transaction
  console.log(
    "Collection Created: https://solana.fm/tx/" +
      base58.deserialize(tx.signature)[0] +
      "?cluster=devnet-alpha"
  );
})();
