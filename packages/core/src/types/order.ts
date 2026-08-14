export type OrderStatus =
  | "NEW"
  | "PENDING_PAYMENT"
  | "PAID"
  | "DISPATCHED"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "GCASH" | "MAYA" | "CASH" | "QR_PH" | "OTHER";
export type SalesChannel =
  | "FACEBOOK"
  | "TIKTOK"
  | "INSTAGRAM"
  | "WOOCOMMERCE"
  | "SHOPIFY"
  | "DIRECT"
  | "WALK_IN";

export interface OrderItem {
  id: string;
  inventoryItemId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  storeId: string;
  customerName?: string;
  customerContact?: string;
  channel: SalesChannel;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paymentVerifiedAt?: string;
  messageThreadId?: string;
  shipmentId?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
}

export interface CreateOrderInput {
  customerName?: string;
  customerContact?: string;
  channel: SalesChannel;
  items: Omit<OrderItem, "id" | "subtotal">[];
  paymentMethod?: PaymentMethod;
  notes?: string;
}
