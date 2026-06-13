"use client";
import { useEffect } from "react";
import { useOrdersStore } from "../../store/ordersStore";
import { useSyncStore }   from "../../store/syncStore";
import { formatPeso }     from "@sari-saas/core";

export default function DashboardPage() {
  const { orders, loadOrders } = useOrdersStore();
  const { status }             = useSyncStore();

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const pendingCount  = orders.filter((o) => o.status === "PENDING_PAYMENT").length;
  const todayRevenue  = orders
    .filter((o) => o.status === "PAID" && o.createdAt.startsWith(new Date().toISOString().slice(0, 10)))
    .reduce((s, o) => s + o.totalAmount, 0);

  const syncColor = status === "synced" ? "var(--color-success)"
    : status === "offline" ? "var(--color-critical)" : "var(--color-warning)";
  const syncLabel = status === "synced" ? "Synced" : status === "offline" ? "Offline" : "Syncing…";

  return (
    <main style={{ padding: 16 }}>
      {/* Header */}
      <header style={{
        background: "var(--color-navy)", color: "var(--color-text-inverse)",
        padding: "12px 16px", marginBottom: 16, borderRadius: 8,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontWeight: 700, fontSize: 18 }}>Sari-SaaS Hub</span>
        <span style={{ fontSize: 12, color: syncColor }}>⬤ {syncLabel}</span>
      </header>

      {/* Daily Revenue */}
      <div style={{
        background: "var(--color-surface)", border: "1px solid var(--color-border)",
        borderRadius: 8, padding: 16, marginBottom: 16,
      }}>
        <p style={{ color: "var(--color-text-secondary)", fontSize: 12, marginBottom: 4 }}>
          KITA NGAYON
        </p>
        <p style={{ fontSize: 28, fontWeight: 700 }}>{formatPeso(todayRevenue)}</p>
      </div>

      {/* Status Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <StatusCard
          label="Pending Payment"
          value={pendingCount}
          color={pendingCount > 0 ? "var(--color-warning)" : "var(--color-success)"}
          cta="Fix Now"
          href="/dashboard/orders"
        />
        <StatusCard
          label="Low Stock Items"
          value={0}
          color="var(--color-neutral)"
          cta="View"
          href="/dashboard/inventory"
        />
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <QuickAction label="Bagong Benta" emoji="🛒" />
        <QuickAction label="Scan Screenshot" emoji="📷" />
        <QuickAction label="Book Rider" emoji="🛵" />
      </div>
    </main>
  );
}

function StatusCard({ label, value, color, cta, href }: {
  label: string; value: number; color: string; cta: string; href: string;
}) {
  return (
    <a href={href} style={{ textDecoration: "none" }}>
      <div style={{
        background: "var(--color-surface)", border: "1px solid var(--color-border)",
        borderRadius: 8, padding: 16,
      }}>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: 28, fontWeight: 700, color }}>{value}</p>
        <p style={{ fontSize: 13, color: "var(--color-navy)", marginTop: 8, fontWeight: 600 }}>
          {cta} →
        </p>
      </div>
    </a>
  );
}

function QuickAction({ label, emoji }: { label: string; emoji: string }) {
  return (
    <button style={{
      flex: 1, minHeight: "var(--touch-button)", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 4,
      background: "var(--color-surface)", border: "1px solid var(--color-border)",
      borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
      fontFamily: "var(--font-system)",
    }}>
      <span style={{ fontSize: 20 }}>{emoji}</span>
      {label}
    </button>
  );
}
