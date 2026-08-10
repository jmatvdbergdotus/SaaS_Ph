import { createHmac, timingSafeEqual } from "crypto";

export function verifyXenditSignature(
  _rawBody: string,
  token: string,
  webhookToken: string
): boolean {
  // Xendit passes x-callback-token header; compare directly (not HMAC)
  return safeEqual(token, webhookToken);
}

export function verifyMayaSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const hmac = createHmac("sha512", secret).update(rawBody).digest("hex");
  return safeEqual(signature, hmac);
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
