"use client";
import { useEffect } from "react";
import { useOrdersStore } from "../../../store/ordersStore";
import { formatPeso } from "@sari-saas/core";
import type { Order, OrderStatus } from "@sari-saas/core";
import { BackToDashboard } from "../../../components/BackToDashboard";
import { useLanguage } from "../../../lib/language";
import type { TranslationKey } from "../../../lib/i18n";

const STATUS_COLORS: Record<string, string> = {
  NEW:              "var(--color-neutral)",
  PENDING_PAYMENT:  "var(--color-warning)",
  PAID:             "var(--color-success)",
  DISPATCHED:       "#2563EB",
  COMPLETED:        "var(--color-neutral)",
  CANCELLED:        "var(--color-critical)",
};

const STATUS_LABELS: Record<OrderStatus, TranslationKey> = {
  NEW: "orders.status.new",
  PENDING_PAYMENT: "orders.status.pendingPayment",
  PAID: "orders.status.paid",
  DISPATCHED: "orders.status.dispatched",
  COMPLETED: "orders.status.completed",
  CANCELLED: "orders.status.cancelled",
};

export default function OrdersPage() {
  const { language, t } = useLanguage();
  const { orders, loadOrders } = useOrdersStore();

  useEffect(() => { loadOrders(); }, [loadOrders]);

  return (
    <main style={{ padding: 16 }}>
      <BackToDashboard />
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{t("orders.title")}</h1>
      {orders.length === 0 ? (
        <p style={{ color: "var(--color-text-secondary)", textAlign: "center", marginTop: 48 }}>
          {t("orders.empty")}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} language={language} />
          ))}
        </div>
      )}
    </main>
  );
}

function OrderCard({ order, language }: { order: Order; language: "en" | "tl" }) {
  const { t } = useLanguage();

  return (
    <a href={"/orders/" + order.id} style={{ textDecoration: "none" }}>
      <div style={{
        background: "var(--color-surface)", border: "1px solid var(--color-border)",
        borderRadius: 8, padding: 16,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontWeight: 600 }}>{order.customerName ?? t("orders.walkIn")}</p>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
              {order.channel} · {getElapsedLabel(order.createdAt, language, t("orders.justNow"), t("orders.ago"))}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontWeight: 700, fontSize: 16 }}>{formatPeso(order.totalAmount)}</p>
            <span style={{
              fontSize: 11, fontWeight: 600, color: STATUS_COLORS[order.status] ?? "var(--color-neutral)",
            }}>
              {t(STATUS_LABELS[order.status])}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

function getElapsedLabel(isoString: string, language: "en" | "tl", justNow: string, ago: string) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return justNow;
  if (minutes < 60) return language === "tl" ? `${minutes} minuto ${ago}` : `${minutes}m ${ago}`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return language === "tl" ? `${hours} oras ${ago}` : `${hours}h ${ago}`;

  const days = Math.floor(hours / 24);
  return language === "tl" ? `${days} araw ${ago}` : `${days}d ${ago}`;
}
