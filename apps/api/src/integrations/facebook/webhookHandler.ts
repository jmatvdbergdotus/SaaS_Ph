import type { Message } from "@sari-saas/core";

export interface FacebookWebhookEntry {
  id: string;
  messaging?: Array<{
    sender: { id: string };
    recipient: { id: string };
    timestamp: number;
    message?: { text: string; mid: string };
  }>;
}

export function normalizeFacebookMessage(
  entry: FacebookWebhookEntry
): Partial<Message>[] {
  return (entry.messaging ?? [])
    .filter((e) => e.message?.text)
    .map((e) => ({
      channel: "FACEBOOK",
      direction: "INBOUND",
      senderId: e.sender.id,
      body: e.message!.text,
      createdAt: new Date(e.timestamp).toISOString(),
    }));
}
