"use client";

import React, { useState } from "react";
import useSWR from "swr";

import { COLLECTION_PUBKEY, HELIUS_URL } from "@/constants";

import styles from "./page.module.css";

interface Article {
  id: number;
  author_first_name: string;
  author_last_name: string;
  title: string;
  First_part: string;
  price: number;
}

// Define the fetcher function for SWR
const fetcher = async (url: string, body: any) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch");
  }

  const data = await response.json();
  return data.result;
};

const Page: React.FC = () => {
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
          limit: 1000,
        },
      },
    ],
    ([url, body]) => fetcher(url, body)
  );

  console.log({ articles });

  // Apply filters
  const applyFilters = () => {
    let filtered = articles;

    if (filters.lastName) {
      filtered = filtered.filter((article) =>
        article.author_last_name
          .toLowerCase()
          .includes(filters.lastName.toLowerCase())
      );
    }

    if (filters.subject) {
      filtered = filtered.filter((article) =>
        article.title.toLowerCase().includes(filters.subject.toLowerCase())
      );
    }

    if (filters.price) {
      const maxPrice = parseFloat(filters.price);
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter((article) => article.price <= maxPrice);
      }
    }

    setFilteredArticles(filtered);
  };

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
      <div className={styles.content}></div>
    </div>
  );
};

export default Page;
