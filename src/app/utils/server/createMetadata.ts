import { Encryption } from "./encrypt";

type CreateMetadataArgs = {
  title: string;
  imageUri: string;
  author: string;
  published_at: string;
  published_where: string;
  encryption: Encryption;
  cms?: string;
};
const createMetadata = ({
  title,
  imageUri,
  author,
  published_at,
  published_where,
  encryption,
  cms,
}: CreateMetadataArgs) => ({
  name: "CTRL+X",
  description: title + "(Journalistic Content recorded through CTRL+X)",
  image: imageUri,
  external_url: "https://ctrlx.world",
  attributes: [
    {
      trait_type: "author",
      value: author,
    },
    {
      trait_type: "title",
      value: title,
    },
    {
      trait_type: "published_at",
      value: published_at,
    },
    {
      trait_type: "published_where",
      value: published_where,
    },
    {
      trait_type: "encrypted_text",
      value: encryption.encryptedText,
    },
    {
      trait_type: "encryption_iv",
      value: encryption.iv,
    },
    {
      trait_type: "cms",
      value: cms,
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
});

export { createMetadata };
