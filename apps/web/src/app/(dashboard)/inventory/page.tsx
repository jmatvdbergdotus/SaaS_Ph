"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "../../../lib/indexeddb";
import { computeStockStatus, type InventoryItem } from "@sari-saas/core";
import { useLanguage } from "../../../lib/language";

const STATUS_COLORS: Record<string, string> = {
  CRITICAL: "var(--color-critical)",
  RESTOCK_SOON: "var(--color-warning)",
  STABLE: "var(--color-success)",
};

export default function InventoryPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    db.inventory.toArray().then(setItems);
  }, []);

  return (
    <main style={{ padding: 16 }}>
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          minHeight: "var(--touch-min)",
          marginBottom: 12,
          color: "var(--color-navy)",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        {t("common.backToDashboard")}
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>{t("inventory.title")}</h1>
        <button style={{
          background: "var(--color-navy)", color: "white", border: "none",
          borderRadius: 8, padding: "8px 16px", fontWeight: 600,
          minHeight: "var(--touch-min)", cursor: "pointer", fontFamily: "var(--font-system)",
        }}>
          {t("inventory.add")}
        </button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
            <th style={{ padding: "8px 4px", fontSize: 12, color: "var(--color-text-secondary)" }}>{t("inventory.name")}</th>
            <th style={{ padding: "8px 4px", fontSize: 12, color: "var(--color-text-secondary)" }}>{t("inventory.stock")}</th>
            <th style={{ padding: "8px 4px", fontSize: 12, color: "var(--color-text-secondary)" }}>{t("inventory.status")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const s = computeStockStatus(item.currentStock, item.restockThreshold);
            const color = STATUS_COLORS[s];
            const statusLabel = s === "CRITICAL" ? t("inventory.critical")
              : s === "RESTOCK_SOON" ? t("inventory.restockSoon") : t("inventory.stable");
            return (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "12px 4px", fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: "12px 4px" }}>{item.currentStock}</td>
                <td style={{ padding: "12px 4px", color, fontWeight: 600, fontSize: 13 }}>
                  {statusLabel}
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr><td colSpan={3} style={{ padding: 32, textAlign: "center", color: "var(--color-text-secondary)" }}>
              {t("inventory.empty")}
            </td></tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
