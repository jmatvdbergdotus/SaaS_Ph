"use client";
import { useEffect, useState } from "react";
import { db } from "../../../lib/indexeddb";
import { computeStockStatus, type InventoryItem } from "@sari-saas/core";

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  CRITICAL:     { color: "var(--color-critical)", label: "Critical" },
  RESTOCK_SOON: { color: "var(--color-warning)",  label: "Restock Soon" },
  STABLE:       { color: "var(--color-success)",  label: "Stable" },
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    db.inventory.toArray().then(setItems);
  }, []);

  return (
    <main style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Imbentaryo</h1>
        <button style={{
          background: "var(--color-navy)", color: "white", border: "none",
          borderRadius: 8, padding: "8px 16px", fontWeight: 600,
          minHeight: "var(--touch-min)", cursor: "pointer", fontFamily: "var(--font-system)",
        }}>
          + Dagdag
        </button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
            <th style={{ padding: "8px 4px", fontSize: 12, color: "var(--color-text-secondary)" }}>PANGALAN</th>
            <th style={{ padding: "8px 4px", fontSize: 12, color: "var(--color-text-secondary)" }}>STOCK</th>
            <th style={{ padding: "8px 4px", fontSize: 12, color: "var(--color-text-secondary)" }}>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const s = computeStockStatus(item.currentStock, item.restockThreshold);
            const style = STATUS_STYLE[s];
            return (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "12px 4px", fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: "12px 4px" }}>{item.currentStock}</td>
                <td style={{ padding: "12px 4px", color: style.color, fontWeight: 600, fontSize: 13 }}>
                  {style.label}
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr><td colSpan={3} style={{ padding: 32, textAlign: "center", color: "var(--color-text-secondary)" }}>
              Walang aytem pa. Mag-add ng unang produkto mo.
            </td></tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
