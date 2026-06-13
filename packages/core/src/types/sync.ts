export type SyncEventType =
  | "ORDER_CREATED" | "ORDER_UPDATED" | "PAYMENT_MARKED"
  | "INVENTORY_UPDATED" | "MESSAGE_SENT";

export interface SyncEvent {
  id: string;
  storeId: string;
  type: SyncEventType;
  entityId: string;
  payload: Record<string, unknown>;
  localTimestamp: string;
  synced: boolean;
  attempts: number;
  lastAttemptAt?: string;
  error?: string;
}
