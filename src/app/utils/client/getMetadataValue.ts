export const getMetadataValue = (metadata: any, key: string) =>
  metadata?.attributes?.find((x: any) => x.trait_type === key)?.value;
