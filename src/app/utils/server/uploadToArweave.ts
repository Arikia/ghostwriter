import fs from "fs";
import path from "path";
import { Umi } from "@metaplex-foundation/umi";
import { createGenericFile } from "@metaplex-foundation/umi";

const uploadNFTImageToArweave = async (umi: Umi) => {
  try {
    // Upload ctrl-x icon to arweave
    const imageFile = fs.readFileSync(
      path.join(process.cwd(), "public", "ctrlxicon.png")
    );

    const umiImageFile = createGenericFile(imageFile, "ctrl-x.png", {
      tags: [{ name: "Content-Type", value: "image/png" }],
    });

    const uri = await umi.uploader.upload([umiImageFile]);
    const imageUri = "https://gateway.irys.xyz/" + uri[0].split("/").pop(); // https://arweave.net/id currently not working
    return imageUri;
  } catch (err) {
    throw new Error(err as unknown as string);
  }
};

export { uploadNFTImageToArweave };
