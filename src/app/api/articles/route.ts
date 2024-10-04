import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET() {
  // Resolve the path to the JSON file
  const filePath = path.join(process.cwd(), "public", "data", "articles.json");

  try {
    // Read the file synchronously
    const fileContents = fs.readFileSync(filePath, "utf8");
    // Parse and return the JSON data
    return NextResponse.json(JSON.parse(fileContents));
  } catch (error) {
    console.error("Error reading or parsing JSON file:", error);
    return NextResponse.json(
      { error: "Failed to load articles" },
      { status: 500 }
    );
  }
}
