import React, { useState } from "react";
import styles from "./styles.module.css";

type RowItem = {
  id: string;
  title: string;
  text: string;
  published_at: string;
  published_where: string;
};

export const CheckTable = ({
  data,
  disabled,
  selectedPostIds,
  onCheckboxChange,
  onSelectAll,
}: {
  data: RowItem[];
  disabled: boolean;
  selectedPostIds: string[];
  onCheckboxChange: (id: string) => void;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  console.log({ data });
  // Check if all rows are selected
  const isAllSelected =
    data.length > 0 && selectedPostIds.length === data.length;

  return (
    <div className={styles.root}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.tableCell}></th>
            <th className={styles.tableCell}>Publication</th>
            <th className={styles.tableCell}>Title</th>
            <th className={styles.tableCell}>Text</th>
            <th className={styles.tableCell}>Published At</th>
          </tr>
          <tr>
            <td>
              <input
                type="checkbox"
                checked={isAllSelected}
                disabled={disabled}
                onChange={onSelectAll}
              />
              Select All
            </td>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td className={styles.tableCell}>
                <input
                  type="checkbox"
                  checked={selectedPostIds.includes(item.id)}
                  disabled={disabled}
                  onChange={() => onCheckboxChange(item.id)}
                />
              </td>
              <td className={styles.tableCell}>{item.published_where}</td>
              <td className={styles.tableCell}>
                {item.title.length > 16
                  ? item.title.slice(0, 16) + "..."
                  : item.title}
              </td>

              <td className={styles.tableCell}>
                {item.text.length > 40
                  ? item.text.slice(0, 40) + "..."
                  : item.text}
              </td>
              <td className={styles.tableCell}>
                {new Date(item.published_at).toLocaleDateString("en-US", {})}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
