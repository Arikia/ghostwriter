import React, { useState } from "react";
import styles from "./styles.module.css";
import classNames from "classnames";

export const Upload = ({
  setFileName,
  handleDoneUploading,
}: {
  setFileName: (fileName: string) => void;
  handleDoneUploading: (jsonData: any) => void;
}) => {
  const [dragging, setDragging] = useState(false);
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent default behavior (open file in new tab)
    setDragging(true); // Show that we're in the drag area
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false); // Remove drag indicator when leaving the area
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    processFile(file);
  };

  // TODO -> when no posts can be processed, show an error message and prevent proceeding in UI flow
  const processFile = async (file: File | null) => {
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      setFileName(file.name);

      reader.onload = (e) => {
        try {
          const fileContent = e.target?.result as string;
          const parsedData = JSON.parse(fileContent);

          const { users, posts: texts } = parsedData.db[0].data;
          // const user = users.find((user: any) => user.name.includes("rikia")); // hardcoded for now
          const user = users[0]; // hardcoded for now
          const name = user.name;
          const email = user.email;
          const posts = texts
            .filter(
              (text: any) => text.status === "published" && text.type === "post"
            )
            .map((post: any) => ({
              id: post.id,
              title: post.title,
              text: post.plaintext,
              published_at: post.published_at,
              published_where: "CTRL-X",
              cms: post.published_at,
            }));
          handleDoneUploading({ name, email, posts });
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };

      reader.readAsText(file);
    } else {
      console.error("Please upload a valid JSON file.");
    }
  };

  return (
    <>
      <div>
        <h3 style={{ textAlign: "center" }}>
          Upload your Ghost export json file here to create your Blockchain
          license
        </h3>

        <input
          className={styles.input}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
        />
      </div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={classNames(styles.dropArea, {
          [styles.dragging]: dragging,
        })}
      >
        <p>
          {dragging ? "Drop the file here..." : "Drag & drop a JSON file here"}
        </p>
      </div>
    </>
  );
};
