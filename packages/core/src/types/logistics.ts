export type CourierProvider = "LALAMOVE" | "GRABEXPRESS" | "JNT" | "NINJAVAN";
export type DeliveryType = "SAME_DAY" | "NEXT_DAY" | "PROVINCIAL" | "INTER_ISLAND";
export type ShipmentStatus =
  | "PENDING" | "BOOKED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "FAILED";

export interface CourierQuote {
  provider: CourierProvider;
  vehicleType?: string;
  estimatedMinutes?: number;
  price: number;
  currency: "PHP";
  serviceType: DeliveryType;
}

export interface Shipment {
  id: string;
  orderId: string;
  provider: CourierProvider;
  trackingNumber: string;
  waybillUrl?: string;
  status: ShipmentStatus;
  price: number;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}
