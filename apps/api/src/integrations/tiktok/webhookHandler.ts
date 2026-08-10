import type { Message } from "@sari-saas/core";

export function normalizeTikTokMessage(payload: Record<string, unknown>): Partial<Message> {
  // TODO: map TikTok Shop webhook shape to unified Message
  return {
    channel: "TIKTOK",
    direction: "INBOUND",
    body: String(payload.message ?? ""),
    createdAt: new Date().toISOString(),
  };
}
