import Dexie, { type Table } from "dexie";
import type { Order, InventoryItem, Message, SyncEvent } from "@sari-saas/core";

export class SariSaasDB extends Dexie {
  orders!:    Table<Order,         string>;
  inventory!: Table<InventoryItem, string>;
  messages!:  Table<Message,       string>;
  syncQueue!: Table<SyncEvent,     string>;

  constructor() {
    super("sari-saas");
    this.version(1).stores({
      orders:    "id, storeId, status, channel, createdAt",
      inventory: "id, storeId, name",
      messages:  "id, threadId, storeId, channel, isRead, createdAt",
      syncQueue: "id, storeId, synced, type",
    });
  }
}

export const db = new SariSaasDB();
