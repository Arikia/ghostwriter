import React, { useState, ReactNode, useRef } from "react";
import styles from "./styles.module.css"; // Assuming you're using CSS modules

// Define the props for each item in the list
type CollapsibleItemProps = {
  title: string;
  children: ReactNode;
};

// Component for each individual collapsible item
export const CollapsibleItem: React.FC<CollapsibleItemProps> = ({
  title,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null); // Reference to the content div

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.collapsibleItem}>
      <button className={styles.collapsibleButton} onClick={toggleExpansion}>
        {title}
      </button>
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
        <div className={styles.innerContent}>{children}</div>
      </div>
    </div>
  );
};
