import React from "react";
import styles from "./styles.module.css";
import { MintedNFT } from "@/app/import/page";

export const NFTCard: React.FC<MintedNFT> = ({
  title,
  image,
  mint,
  explorer_link,
}) => {
  // Abbreviate the mint ID
  const abbreviatedMint = `${mint.slice(0, 4)}...${mint.slice(-4)}`;

  // Click handler to navigate to explorer link
  const handleClick = () => {
    window.open(explorer_link, "_blank");
  };

  return (
    <div className={styles.card} onClick={handleClick}>
      {/* Image in the upper two-thirds */}
      <div className={styles.imageContainer}>
        <img src={image} alt={title} className={styles.image} />
      </div>

      {/* Title and abbreviated mint ID */}
      <div className={styles.textContainer}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.mint}>{abbreviatedMint}</p>
      </div>
    </div>
  );
};
