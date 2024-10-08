"use client";

import React, { ReactNode, useState } from "react";
import useSWR from "swr";
import { useWallet } from "@solana/wallet-adapter-react";

import { COLLECTION_PUBKEY, HELIUS_URL } from "@/constants";
import styles from "./page.module.css";

import { CollapsibleItem } from "@/components/ui/CollapsibleItem/CollapsibleItem";
import { fetcher } from "../utils/client/fetcher";
import { getMetadataValue } from "../utils/client/getMetadataValue";

/*
TODOS:
-put user_wallet in the metadata!
-make a check for either or (owner or user_wallet)

-convert 2 cents to sol
-how should the indicators be? YOURS / PAID / PAYING / FREE
-loading 

*/

interface Article {
  id: number;
  author_first_name: string;
  author_last_name: string;
  title: string;
  First_part: string;
  price: number;
}

// Component for the entire collapsible list
type CollapsibleListProps = {
  items: { title: string; content: ReactNode }[];
};

const Page: React.FC = () => {
  const { publicKey } = useWallet();
  const userWalletAddress = publicKey ? publicKey.toBase58() : null;
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [filters, setFilters] = useState({
    lastName: "",
    subject: "",
    price: "",
  });
  // Use SWR to fetch data
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

  console.log({ articles });

  // Apply filters
  const applyFilters = () => {};

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <div className={styles.filters}>
          <div className={styles.filter}>
            <label htmlFor="lastName">Author's last name</label>
            <input
              type="text"
              id="lastName"
              value={filters.lastName}
              onChange={(e) =>
                setFilters({ ...filters, lastName: e.target.value })
              }
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              value={filters.subject}
              onChange={(e) =>
                setFilters({ ...filters, subject: e.target.value })
              }
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="price">Max price</label>
            <input
              type="text"
              id="price"
              value={filters.price}
              onChange={(e) =>
                setFilters({ ...filters, price: e.target.value })
              }
            />
          </div>
          <button onClick={applyFilters} className={styles.button}>
            Apply Filters
          </button>
        </div>
      </div>
      <div className={styles.content}>
        {userWalletAddress ? (
          <div className={styles.collapsibleList}>
            <div className={styles.headerRow}>
              <div className={styles.x1}>Publication</div>
              <div className={styles.x2}>Title</div>
              <div className={styles.x3}>Published At</div>
              <div className={styles.x4}>Price</div>
            </div>

            {/* @ts-ignore */}
            {articles?.items
              ?.sort((a: any, b: any) => {
                const aPublishedAt = getMetadataValue(
                  a.content.metadata,
                  "published_at"
                );
                const bPublishedAt = getMetadataValue(
                  b.content.metadata,
                  "published_at"
                );

                // Convert the date strings to Date objects and compare them
                // @ts-ignore
                return new Date(bPublishedAt) - new Date(aPublishedAt);
              })
              // @ts-ignore
              .map((item, index) => (
                <CollapsibleItem
                  key={index}
                  title={item.content.metadata.name}
                  published_at={new Date(
                    getMetadataValue(item.content.metadata, "published_at")
                  ).toLocaleDateString("en-US", {})}
                  published_where={getMetadataValue(
                    item.content.metadata,
                    "published_where"
                  )}
                  payment={2}
                  owner={item.ownership.owner}
                  encryption={{
                    encryptedText: getMetadataValue(
                      item.content.metadata,
                      "encrypted_text"
                    ),
                    iv: getMetadataValue(
                      item.content.metadata,
                      "encryption_iv"
                    ),
                  }}
                  nftId={item.id}
                >
                  <h4 className={styles.articleTitle}>
                    {item.content.metadata.name}
                  </h4>
                  <h5 className={styles.subtitle}>
                    {item.content.metadata.description}
                  </h5>
                  <p className={styles.author}>
                    Written By:{" "}
                    {getMetadataValue(item.content.metadata, "author")}
                  </p>
                </CollapsibleItem>
              ))}
          </div>
        ) : (
          <div>Please Connect your Wallet</div>
        )}
      </div>
    </div>
  );
};

export default Page;
