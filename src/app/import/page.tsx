"use client";

import React from "react";
import { useState } from "react";

const Page = () => {
  const [jsonData, setJsonData] = useState(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();

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
    <div>
      <h1>Import</h1>
      <input type="file" accept=".json" onChange={handleFileUpload} />
      {jsonData && <pre>{JSON.stringify(jsonData, null, 2)}</pre>}
    </div>
  );
};

export default Page;
