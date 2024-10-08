import crypto from "crypto";

type Encryption = {
  iv: string;
  encryptedText: string;
};

// Encryption function using AES-256-CBC
const encryptText = (articleText: string): Encryption => {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error(
      "ENCRYPTION_KEY is not defined in the environment variables"
    );
  }

  const secretKey = process.env.ENCRYPTION_KEY;
  const iv = crypto.randomBytes(16); // Initialization vector (IV) for encryption

  // Create a Cipher instance with AES-256-CBC
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey, "hex"),
    iv
  );

  let encrypted = cipher.update(articleText, "utf-8", "hex");
  encrypted += cipher.final("hex");

  // Return the IV and encrypted text, both are needed for decryption
  return {
    iv: iv.toString("hex"),
    encryptedText: encrypted,
  };
};

// Decryption function using AES-256-CBC
const decryptText = (encryption: Encryption) => {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error(
      "ENCRYPTION_KEY is not defined in the environment variables"
    );
  }

  const secretKey = process.env.ENCRYPTION_KEY;
  // Create a Decipher instance
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey, "hex"),
    Buffer.from(encryption.iv, "hex")
  );

  let decrypted = decipher.update(encryption.encryptedText, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
};

export { encryptText, decryptText };
export type { Encryption };
