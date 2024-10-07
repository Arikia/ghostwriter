import React, { useState } from "react";

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

  const processFile = async (file: File | null) => {
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      setFileName(file.name);

      reader.onload = (e) => {
        try {
          const fileContent = e.target?.result as string;
          const parsedData = JSON.parse(fileContent);

          const { users, posts: texts } = parsedData.db[0].data;
          const user = users.find((user: any) => user.name.includes("rikia")); // hardcoded for now
          const name = user.name;
          const email = user.email;
          const posts = texts
            .filter(
              (text: any) => text.status === "published" && text.type === "post"
            )
            .map((post: any) => ({
              title: post.title,
              text: post.plaintext,
              html: post.html,
              published_at: post.published_at,
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
      <h1 style={{ textAlign: "center", fontSize: "3em" }}>Import</h1>
      <h3 style={{ textAlign: "center" }}>
        Upload your Ghost export json file here to put it on blockchain
      </h3>

      <input
        style={{
          width: "fit-content",
          display: "inline-block",
          margin: "24px 0 ",
        }}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          width: "80%",
          maxWidth: "800px",
          minHeight: "600px",
          border: dragging ? "2px dashed green" : "2px dashed gray",
          padding: "20px",
          margin: "42px 0",
          textAlign: "center",
          backgroundColor: dragging ? "#f0fff0" : "#fafafa",
        }}
      >
        <p>
          {dragging ? "Drop the file here..." : "Drag & drop a JSON file here"}
        </p>
      </div>
    </>
  );
};