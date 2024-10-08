"use client";
import React, { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import styles from "./styles.module.css";
import useSWR from "swr";
import { COLLECTION_PUBKEY, HELIUS_URL } from "@/constants";
import { fetcher } from "../utils/client/fetcher";
import { CollapsibleItem } from "@/components/ui/CollapsibleItem/CollapsibleItem";
import { getMetadataValue } from "../utils/client/getMetadataValue";
import { getRandomPrice } from "../utils/client/randomPrice";

const Briefcase = () => {
  const { publicKey } = useWallet();
  const userWalletAddress = publicKey ? publicKey.toBase58() : null;

  const { data: articles, error } = useSWR(
    [
      HELIUS_URL,
      {
        jsonrpc: "2.0",
        id: process.env.NEXT_PUBLIC_HELIUS_RPC_ID,
        method: "getAssetsByGroup",
        params: {
          groupKey: "collection",
          groupValue: COLLECTION_PUBKEY,
          page: 1,
          limit: 100,
        },
      },
    ],
    ([url, body]) => fetcher(url, body)
  );
  const myPosts = useMemo(() => {
    return articles?.items?.length > 0
      ? articles?.items
          .filter((x: any) => x.ownership.owner == userWalletAddress)
          .map((x: any) => ({ ...x, earned: getRandomPrice(0.12, 389.4) }))
      : [];
  }, [articles]);

  const totalEarned = useMemo(
    () =>
      myPosts?.length > 0
        ? myPosts.reduce(
            (acc: number, post: any) => acc + Number(post.earned),
            0
          )
        : 0,
    [myPosts]
  );

  if (!userWalletAddress) {
    return <div>Connect your wallet to view your briefcase</div>;
  }

  return (
    <div className={styles.root}>
      <h2 className={styles.title}>Briefcase</h2>
      <p>My NFTs</p>
      <p>Earned Total: {Math.floor(totalEarned * 100) / 100}$</p>
      <div className={styles.content}>
        {/* @ts-ignore */}
        {myPosts.map((post, index) => (
          <CollapsibleItem
            key={index}
            title={post.content.metadata.name}
            published_at={new Date(
              getMetadataValue(post.content.metadata, "published_at")
            ).toLocaleDateString("en-US", {})}
            published_where={getMetadataValue(
              post.content.metadata,
              "published_where"
            )}
            payment={2}
            owner={post.ownership.owner}
            encryption={{
              encryptedText: getMetadataValue(
                post.content.metadata,
                "encrypted_text"
              ),
              iv: getMetadataValue(post.content.metadata, "encryption_iv"),
            }}
            nftId={post.id}
            earned={post.earned}
          >
            <h4 className={styles.articleTitle}>
              {post.content.metadata.name}
            </h4>
            <h5 className={styles.subtitle}>
              {post.content.metadata.description}
            </h5>
            <p className={styles.author}>
              Written By: {getMetadataValue(post.content.metadata, "author")}
            </p>
          </CollapsibleItem>
        ))}
      </div>
    </div>
  );
};

export default Briefcase;
