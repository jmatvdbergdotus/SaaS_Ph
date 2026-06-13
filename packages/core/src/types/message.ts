export type MessageChannel = "FACEBOOK" | "TIKTOK" | "INSTAGRAM" | "GCASH" | "MAYA";
export type MessageDirection = "INBOUND" | "OUTBOUND";

export interface Message {
  id: string;
  threadId: string;
  storeId: string;
  channel: MessageChannel;
  direction: MessageDirection;
  senderName?: string;
  senderId?: string;
  body: string;
  attachments?: MessageAttachment[];
  isRead: boolean;
  linkedOrderId?: string;
  createdAt: string;
  syncedAt?: string;
}

export interface MessageAttachment {
  type: "IMAGE" | "FILE" | "PAYMENT_SCREENSHOT";
  url: string;
  localPath?: string;
}

export interface MessageThread {
  id: string;
  storeId: string;
  channel: MessageChannel;
  customerName?: string;
  customerId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  linkedOrderId?: string;
}
