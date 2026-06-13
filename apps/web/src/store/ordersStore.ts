"use client";
import { create } from "zustand";
import type { Order, CreateOrderInput } from "@sari-saas/core";
import { db } from "../lib/indexeddb";

interface OrdersState {
  orders: Order[];
  isLoading: boolean;
  loadOrders: () => Promise<void>;
  addOrder: (input: CreateOrderInput) => Promise<Order>;
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<void>;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  isLoading: false,

  loadOrders: async () => {
    set({ isLoading: true });
    const orders = await db.orders.orderBy("createdAt").reverse().toArray();
    set({ orders, isLoading: false });
  },

  addOrder: async (input) => {
    const order: Order = {
      id: crypto.randomUUID(),
      storeId: "local",
      ...input,
      items: input.items.map((i) => ({
        ...i,
        id: crypto.randomUUID(),
        subtotal: i.quantity * i.unitPrice,
      })),
      totalAmount: input.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
      status: "PENDING_PAYMENT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.orders.add(order);
    set((s) => ({ orders: [order, ...s.orders] }));
    return order;
  },

  updateOrderStatus: async (id, status) => {
    await db.orders.update(id, { status, updatedAt: new Date().toISOString() });
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    }));
  },
}));
