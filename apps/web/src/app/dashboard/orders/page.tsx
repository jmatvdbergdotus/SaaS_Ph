"use client";
import { useEffect } from "react";
import { useOrdersStore } from "../../../store/ordersStore";
import { formatPeso, formatDateTimePH, getElapsedLabel } from "@sari-saas/core";
import type { Order } from "@sari-saas/core";

const STATUS_FILTERS = ["ALL", "PENDING_PAYMENT", "PAID", "DISPATCHED", "COMPLETED"] as const;

const STATUS_COLORS: Record<string, string> = {
  NEW:              "var(--color-neutral)",
  PENDING_PAYMENT:  "var(--color-warning)",
  PAID:             "var(--color-success)",
  DISPATCHED:       "#2563EB",
  COMPLETED:        "var(--color-neutral)",
  CANCELLED:        "var(--color-critical)",
};

export default function OrdersPage() {
  const { orders, loadOrders } = useOrdersStore();

  useEffect(() => { loadOrders(); }, [loadOrders]);

  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Mga Orders</h1>
      {orders.length === 0 ? (
        <p style={{ color: "var(--color-text-secondary)", textAlign: "center", marginTop: 48 }}>
          Wala pang orders. Mag-add ng bagong benta para magsimula.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </main>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <a href={"/dashboard/orders/" + order.id} style={{ textDecoration: "none" }}>
      <div style={{
        background: "var(--color-surface)", border: "1px solid var(--color-border)",
        borderRadius: 8, padding: 16,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontWeight: 600 }}>{order.customerName ?? "Walk-in Customer"}</p>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
              {order.channel} · {getElapsedLabel(order.createdAt)}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontWeight: 700, fontSize: 16 }}>{formatPeso(order.totalAmount)}</p>
            <span style={{
              fontSize: 11, fontWeight: 600, color: STATUS_COLORS[order.status] ?? "var(--color-neutral)",
            }}>
              {order.status.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
