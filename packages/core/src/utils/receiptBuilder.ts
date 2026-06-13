import type { Order } from "../types/order";
import type { Store } from "../types/merchant";
import { formatPeso } from "./formatCurrency";

// re-export from formatCurrency
export { formatPeso } from "./formatCurrency";

export interface ITAReceipt {
  receiptNumber: string;
  issuedAt: string;
  merchant: {
    name: string;
    address?: string;
    contactNumber: string;
    dtiRegistration?: string;
    birTin?: string;
  };
  transaction: {
    orderId: string;
    items: Array<{ name: string; qty: number; unitPrice: string; subtotal: string }>;
    totalAmount: string;
    paymentMethod?: string;
    paymentReference?: string;
  };
  consumerDisclosure: string;
}

export function buildITAReceipt(order: Order, store: Store): ITAReceipt {
  return {
    receiptNumber: `SS-${order.id.slice(0, 8).toUpperCase()}`,
    issuedAt: new Date().toISOString(),
    merchant: {
      name: store.name,
      address: store.address,
      contactNumber: store.contactNumber,
      dtiRegistration: store.dtiRegistrationNumber,
      birTin: store.birTin,
    },
    transaction: {
      orderId: order.id,
      items: order.items.map((i) => ({
        name: i.name,
        qty: i.quantity,
        unitPrice: formatPeso(i.unitPrice),
        subtotal: formatPeso(i.subtotal),
      })),
      totalAmount: formatPeso(order.totalAmount),
      paymentMethod: order.paymentMethod,
      paymentReference: order.paymentReference,
    },
    consumerDisclosure:
      "This receipt is issued in compliance with the Philippine Internet Transactions Act (RA 11967). " +
      "For concerns, contact the merchant or the DTI at 1-800-10-DTI-SAYS (1-800-10-384-7297).",
  };
}
