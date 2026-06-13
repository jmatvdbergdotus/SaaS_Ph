import { create } from "zustand";
import type { Order, CreateOrderInput } from "@sari-saas/core";

interface OrdersState {
  orders: Order[];
  addOrder: (input: CreateOrderInput) => Order;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],

  addOrder: (input) => {
    const order: Order = {
      id: Math.random().toString(36).slice(2),
      storeId: "local",
      ...input,
      items: input.items.map((i) => ({
        ...i,
        id: Math.random().toString(36).slice(2),
        subtotal: i.quantity * i.unitPrice,
      })),
      totalAmount: input.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
      status: "PENDING_PAYMENT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({ orders: [order, ...s.orders] }));
    return order;
  },

  updateOrderStatus: (id, status) => {
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
      ),
    }));
  },
}));
