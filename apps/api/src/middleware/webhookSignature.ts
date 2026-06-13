import { createHmac, timingSafeEqual } from "crypto";

export function verifyXenditSignature(
  rawBody: string,
  token: string,
  webhookToken: string
): boolean {
  // Xendit passes x-callback-token header; compare directly (not HMAC)
  return timingSafeEqual(Buffer.from(token), Buffer.from(webhookToken));
}

export function verifyMayaSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const hmac = createHmac("sha512", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
  } catch {
    return false;
  }
}
