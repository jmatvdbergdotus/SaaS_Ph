import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { config } from "../config";

const VERSION = "v1";

function getEncryptionKey(): Buffer {
  const encoded = config.INTEGRATION_TOKEN_ENCRYPTION_KEY;
  if (!encoded) {
    throw new Error("Integration credential encryption is not configured");
  }

  const key = /^[a-f\d]{64}$/i.test(encoded)
    ? Buffer.from(encoded, "hex")
    : Buffer.from(encoded, "base64");

  if (key.length !== 32) {
    throw new Error("INTEGRATION_TOKEN_ENCRYPTION_KEY must contain exactly 32 bytes");
  }

  return key;
}

export function encryptCredentials(value: unknown, context: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  cipher.setAAD(Buffer.from(context, "utf8"));

  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [VERSION, iv, tag, ciphertext]
    .map((part) => typeof part === "string" ? part : part.toString("base64url"))
    .join(".");
}

export function decryptCredentials<T>(encrypted: string, context: string): T {
  const [version, ivValue, tagValue, ciphertextValue] = encrypted.split(".");
  if (version !== VERSION || !ivValue || !tagValue || !ciphertextValue) {
    throw new Error("Stored integration credentials are invalid");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivValue, "base64url")
  );
  decipher.setAAD(Buffer.from(context, "utf8"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");

  return JSON.parse(plaintext) as T;
}
