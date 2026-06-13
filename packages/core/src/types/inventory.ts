export type StockStatus = "CRITICAL" | "RESTOCK_SOON" | "STABLE";

export interface InventoryItem {
  id: string;
  storeId: string;
  name: string;
  sku?: string;
  currentStock: number;
  restockThreshold: number;
  unitPrice?: number;
  status: StockStatus;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
}

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  orderId?: string;
  type: "SALE" | "RESTOCK" | "ADJUSTMENT" | "RESERVATION" | "RESERVATION_RELEASED";
  quantity: number;
  previousStock: number;
  newStock: number;
  createdAt: string;
}

export function computeStockStatus(current: number, threshold: number): StockStatus {
  if (current <= threshold) return "CRITICAL";
  if (current <= threshold * 2) return "RESTOCK_SOON";
  return "STABLE";
}
