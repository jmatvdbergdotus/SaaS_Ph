import type { MessageChannel } from "../types/message";
import type { SalesChannel } from "../types/order";

export const CHANNEL_LABELS: Record<MessageChannel | SalesChannel, string> = {
  FACEBOOK:  "Facebook",
  TIKTOK:    "TikTok",
  INSTAGRAM: "Instagram",
  GCASH:     "GCash",
  MAYA:      "Maya",
  DIRECT:    "Direct",
  WALK_IN:   "Walk-in",
};

export const CHANNEL_COLORS: Record<MessageChannel, string> = {
  FACEBOOK:  "#1877F2",
  TIKTOK:    "#010101",
  INSTAGRAM: "#E1306C",
  GCASH:     "#0063D1",
  MAYA:      "#00C2A8",
};
