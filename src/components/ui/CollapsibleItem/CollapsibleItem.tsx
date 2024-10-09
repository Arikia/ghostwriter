import React, {
  useState,
  ReactNode,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import styles from "./styles.module.css"; // Assuming you're using CSS modules
import useSWR from "swr";
import { Encryption } from "@/app/utils/server/encrypt";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { Button } from "../Button";
import { COINGECKO_SOLANA_PRICE_URL } from "@/constants";
import { convertCentsToSOL } from "@/app/utils/client/convertCentsToSol";
import classNames from "classnames";

// Define the props for each item in the list
type CollapsibleItemProps = {
  title: string;
  published_where: string;
  published_at: string;
  payment: number;
  children: ReactNode;
  owner: string;
  encryption: Encryption;
  nftId: string;
  earned?: number;
};

enum TextPaymentStatus {
  PAID = "Paid",
  PAY_TO_READ = "Pay 0.02$",
  YOURS = "Yours",
  // FREE = "FREE" // Not implemented yet
}

// Fetcher function for SWR to get SOL price from CoinGecko API
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Component for each individual collapsible item
export const CollapsibleItem: React.FC<CollapsibleItemProps> = ({
  title,
  published_at,
  published_where,
  payment,
  children,
  owner,
  encryption,
  nftId,
  earned,
}) => {
  const { data = { solana: { usd: 120 } }, error } = useSWR(
    COINGECKO_SOLANA_PRICE_URL,
    fetcher
  );

  const { publicKey, sendTransaction } = useWallet();

  const userWalletAddress = publicKey ? publicKey.toBase58() : null;
  const isAuthor = () => {
    return owner == userWalletAddress;
  };
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null); // Reference to the content div
  const [plainText, setPlainText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          encrypted_text: encryption.encryptedText,
          encryption_iv: encryption.iv,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();
      setPlainText(result.plaintext);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [encryption]);

  const handlePayment = async (
    nftId: string,
    ownerAddress: string,
    cents: number
  ) => {
    try {
      if (!publicKey) {
        alert("Please connect your wallet.");
        return;
      }

      // Check if the article is already paid for
      const paidStatus = localStorage.getItem(nftId);
      if (paidStatus === "1") {
        alert("You have already paid for this article.");
        return;
      }

      const solPrice = data.solana.usd;
      const solAmount = convertCentsToSOL(2, solPrice);

      const connection = new Connection(
        "https://api.devnet.solana.com",
        "finalized"
      );
      const recipient = new PublicKey(ownerAddress); // NFT owner's public key
      const lamports = Math.ceil(solAmount * 1e9); // Convert SOL to lamports

      // // Create a transaction to transfer SOL
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports,
        })
      );

      // // Send transaction
      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction signature:", signature);

      // Update localStorage to mark the article as paid
      localStorage.setItem(nftId, "1");
      setShouldRefetch(true);

      alert("Payment successful!");
    } catch (error) {
      alert(`Payment failed:, ${error}`);
    }
  };

  // Use effect to fetch data when component mounts
  useEffect(() => {
    if (
      isExpanded &&
      (isAuthor() || localStorage.getItem(nftId) === "1" || shouldRefetch)
    ) {
      fetchData();
    }
  }, [isExpanded, isAuthor(), fetchData, shouldRefetch]);

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
    }
  }, [plainText]); // Depend on plainText to re-calculate height

  const getPaymentIndication = (): TextPaymentStatus => {
    if (isAuthor()) {
      return TextPaymentStatus.YOURS;
    } else if (localStorage.getItem(nftId) === "1") {
      return TextPaymentStatus.PAID;
    } else {
      return TextPaymentStatus.PAY_TO_READ;
    }
  };

  return (
    <div className={styles.collapsibleItem}>
      <div className={styles.row} onClick={toggleExpansion}>
        <div className={styles.publishedWhere}>{published_where}</div>
        <div className={styles.title}>{title}</div>
        <div className={styles.publishedAt}>{published_at}</div>
        <div
          className={classNames(styles.payment, {
            [styles.red]:
              getPaymentIndication() === TextPaymentStatus.PAY_TO_READ,
            [styles.blue]: getPaymentIndication() === TextPaymentStatus.YOURS,
            [styles.green]: getPaymentIndication() === TextPaymentStatus.PAID,
          })}
        >
          {earned ? `Earned: ${earned}$` : getPaymentIndication()}
        </div>
      </div>
      <div
        ref={contentRef}
        className={`${styles.collapsibleContent} ${
          isExpanded ? styles.expanded : ""
        }`}
        style={{
          maxHeight: isExpanded
            ? `${contentRef.current?.scrollHeight}px`
            : "0px",
        }}
      >
        <div className={styles.innerContent}>
          {children}
          <a
            href={`https://solana.fm/address/${nftId}?cluster=devnet-alpha`}
            target="_blank"
            rel="noreferrer"
            className={styles.solanaLink}
          >
            View details about this NFT on Solana FM Explorer
          </a>
          <p>
            {isAuthor() || localStorage.getItem(nftId) === "1" ? (
              plainText
            ) : (
              <Button onClick={() => handlePayment(nftId, owner, 2)}>
                Pay 0.02 USD in SOL to read
              </Button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
