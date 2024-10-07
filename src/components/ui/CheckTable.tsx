import React, { useState } from "react";

type RowItem = {
  id: number;
  title: string;
  text: string;
  published_at: string;
};

export const CheckTable = ({
  data,
  disabled,
}: {
  data: RowItem[];
  disabled: boolean;
}) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Handler for when a checkbox is clicked
  const handleCheckboxChange = (id: number) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(id)) {
        // Deselect the row
        return prevSelectedRows.filter((rowId) => rowId !== id);
      } else {
        // Select the row
        return [...prevSelectedRows, id];
      }
    });
  };

  // Handler for 'Select All' checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = data.map((item) => item.id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  // Check if all rows are selected
  const isAllSelected = data.length > 0 && selectedRows.length === data.length;

  return (
    <div
      style={{
        maxHeight: "500px",
        overflowY: "auto",
        margin: "24px 0",
      }}
    >
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black" }}></th>
            <th style={{ border: "1px solid black" }}>Title</th>
            <th style={{ border: "1px solid black" }}>Text</th>
            <th style={{ border: "1px solid black" }}>Published At</th>
          </tr>
          <tr>
            <td>
              <input
                type="checkbox"
                checked={isAllSelected}
                disabled={disabled}
                onChange={handleSelectAll}
              />
              Select All
            </td>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td style={{ border: "1px solid black" }}>
                <input
                  type="checkbox"
                  checked={selectedRows.includes(item.id)}
                  disabled={disabled}
                  onChange={() => handleCheckboxChange(item.id)}
                />
              </td>
              <td style={{ border: "1px solid black" }}>
                {item.text.length > 16
                  ? item.text.slice(0, 16) + "..."
                  : item.text}
              </td>

              <td style={{ border: "1px solid black" }}>
                {item.text.length > 40
                  ? item.text.slice(0, 40) + "..."
                  : item.text}
              </td>
              <td style={{ border: "1px solid black" }}>
                {new Date(item.published_at).toLocaleDateString("en-US", {})}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
