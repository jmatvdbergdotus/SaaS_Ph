import type { Message } from "@sari-saas/core";

export function normalizeInstagramMessage(payload: Record<string, unknown>): Partial<Message> {
  // TODO: map Instagram Graph API DM webhook to unified Message
  return {
    channel: "INSTAGRAM",
    direction: "INBOUND",
    body: String((payload as any)?.message ?? ""),
    createdAt: new Date().toISOString(),
  };
}
