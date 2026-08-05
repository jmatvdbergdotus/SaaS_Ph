"use client";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { formatPeso } from "@sari-saas/core";
import { loadDashboardStats, type DashboardStats } from "../../lib/dashboardData";
import { useSyncStore } from "../../store/syncStore";

export default function DashboardPage() {
  const router = useRouter();
  const { status, setStatus } = useSyncStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      setStatus("syncing");
      setError(null);

      try {
        const nextStats = await loadDashboardStats();

        if (nextStats.authState === "unauthenticated") {
          router.replace("/login");
          return;
        }

        if (nextStats.authState === "needs_onboarding") {
          router.replace("/onboarding");
          return;
        }

        setStats(nextStats);
        setStatus("synced");
      } catch (err) {
        setStatus("offline");
        setError(err instanceof Error ? err.message : "Could not load dashboard data.");
      }
    }

    loadStats();
  }, [router, setStatus]);

  const syncColor = status === "synced" ? "var(--color-success)"
    : status === "offline" ? "var(--color-critical)" : "var(--color-warning)";
  const syncLabel = status === "synced" ? "Synced" : status === "offline" ? "Offline" : "Syncing…";

  if (!stats && !error) {
    return (
      <main style={{ padding: 16 }}>
        <DashboardHeader syncColor={syncColor} syncLabel={syncLabel} />
        <p style={{ color: "var(--color-text-secondary)" }}>Loading your store dashboard...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 16 }}>
      {/* Header */}
      <DashboardHeader
        storeName={stats?.storeName}
        syncColor={syncColor}
        syncLabel={syncLabel}
      />

      {error ? (
        <div style={{
          background: "var(--color-surface)", border: "1px solid var(--color-critical)",
          borderRadius: 8, padding: 16, marginBottom: 16, color: "var(--color-critical)",
        }}>
          {error}
        </div>
      ) : null}

      {/* Daily Revenue */}
      <div style={{
        background: "var(--color-surface)", border: "1px solid var(--color-border)",
        borderRadius: 8, padding: 16, marginBottom: 16,
      }}>
        <p style={{ color: "var(--color-text-secondary)", fontSize: 12, marginBottom: 4 }}>
          KITA NGAYON
        </p>
        <p style={{ fontSize: 28, fontWeight: 700 }}>{formatPeso(stats?.todayRevenue ?? 0)}</p>
      </div>

      {/* Status Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <StatusCard
          label="Pending Payment"
          value={stats?.pendingPaymentCount ?? 0}
          color={(stats?.pendingPaymentCount ?? 0) > 0 ? "var(--color-warning)" : "var(--color-success)"}
          cta="Fix Now"
          href="/orders"
        />
        <StatusCard
          label="Low Stock Items"
          value={stats?.lowStockCount ?? 0}
          color={(stats?.lowStockCount ?? 0) > 0 ? "var(--color-warning)" : "var(--color-success)"}
          cta="View"
          href="/inventory"
        />
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <QuickAction label="Bagong Benta" emoji="🛒" />
        <QuickAction label="Scan Screenshot" emoji="📷" />
        <QuickAction label="Book Rider" emoji="🛵" />
        <QuickAction label="Channels" emoji="🔗" href="/channels" />
      </div>
    </main>
  );
}

function DashboardHeader({ storeName, syncColor, syncLabel }: {
  storeName?: string | null; syncColor: string; syncLabel: string;
}) {
  return (
    <header style={{
      background: "var(--color-navy)", color: "var(--color-text-inverse)",
      padding: "12px 16px", marginBottom: 16, borderRadius: 8,
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <span style={{ fontWeight: 700, fontSize: 18 }}>{storeName ?? "Sari-SaaS Hub"}</span>
      <span style={{ fontSize: 12, color: syncColor }}>⬤ {syncLabel}</span>
    </header>
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

function QuickAction({ label, emoji, href }: { label: string; emoji: string; href?: string }) {
  const style: CSSProperties = {
      flex: 1, minHeight: "var(--touch-button)", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 4,
      background: "var(--color-surface)", border: "1px solid var(--color-border)",
      borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
      fontFamily: "var(--font-system)", color: "var(--color-text-primary)", textDecoration: "none",
    };

  if (href) {
    return (
      <a href={href} style={style}>
        <span style={{ fontSize: 20 }}>{emoji}</span>
        {label}
      </a>
    );
  }

  return (
    <button style={style}>
      <span style={{ fontSize: 20 }}>{emoji}</span>
      {label}
    </button>
  );
}
