let zlib: any;

if (typeof window === "undefined") {
  // Import zlib only in the Node.js (server-side) environment, best working workaround I found so far
  // should actually be fixable with fallbacks like browserify-zlib in next.config webpack config, but somehow that did not work...
  zlib = require("zlib");
}

import { NextRequest, NextResponse } from "next/server";

import { decryptText } from "@/app/utils/server/encrypt";

// Route post route to decompress and decrypt text

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    const { encrypted_text, encryption_iv } = await req.json(); // what to include in request body

    try {
      const compressedText = decryptText({
        encryptedText: encrypted_text,
        iv: encryption_iv,
      });
      const plaintext = zlib
        .inflateSync(Buffer.from(compressedText, "base64"))
        .toString();
      return NextResponse.json({ plaintext });
    } catch (error) {
      console.error("Error reading or parsing JSON file:", error);
      return NextResponse.json(
        { error: "Failed to decrypt text" },
        { status: 500 }
      );
    }
  }
}
