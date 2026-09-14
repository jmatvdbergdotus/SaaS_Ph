"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { computeStockStatus } from "@sari-saas/core";
import type { Tables } from "@sari-saas/db/types/database";
import { supabase } from "../../../lib/supabase";
import { BackToDashboard } from "../../../components/BackToDashboard";
import { useLanguage } from "../../../lib/language";
import styles from "./inventory.module.css";

type Item = Tables<"inventory">;
type Movement = Tables<"stock_movements">;
type Kind = "DETAILS" | "RESTOCK" | "ADJUSTMENT";

export default function InventoryPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const label = (en: string, tl: string) => language === "tl" ? tl : en;
  const [items, setItems] = useState<Item[]>([]);
  const [store, setStore] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editor, setEditor] = useState<{ item: Item | null; kind: Kind } | null>(null);
  const [history, setHistory] = useState<{ name: string; rows: Movement[] } | null>(null);
  const [search, setSearch] = useState("");

  async function refresh(storeId: string) {
    const result = await supabase.from("inventory").select("*").eq("store_id", storeId).order("name");
    if (result.error) throw result.error;
    setItems(result.data ?? []);
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const user = await supabase.auth.getUser();
        if (!active) return;
        if (!user.data.user) { router.replace("/login"); return; }
        const profile = await supabase.from("users").select("store_id").eq("id", user.data.user.id).single();
        if (profile.error) throw profile.error;
        if (!profile.data.store_id) { router.replace("/onboarding"); return; }
        if (!active) return;
        setStore(profile.data.store_id);
        await refresh(profile.data.store_id);
      } catch { if (active) setError("Unable to load inventory. Please reload and try again."); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [router]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!store || !editor || busy) return;
    const fields = new FormData(event.currentTarget);
    const item = editor.item;
    const details = editor.kind === "DETAILS";
    setBusy(true); setError(""); setNotice("");
    try {
      const result = await supabase.rpc("save_inventory_item", {
        p_store_id: store, p_item_id: item?.id ?? null,
        p_name: details ? String(fields.get("name")).trim() : item!.name,
        p_sku: details ? String(fields.get("sku")).trim() : item?.sku ?? "",
        p_price: details ? Number(fields.get("price")) : item?.unit_price ?? 0,
        p_threshold: details ? Number(fields.get("threshold")) : item!.restock_threshold,
        p_stock: Number(fields.get("stock") ?? 0), p_kind: editor.kind,
        p_note: String(fields.get("note") ?? ""), p_expected_updated_at: item?.updated_at ?? null,
      });
      if (result.error) throw result.error;
      setEditor(null); setHistory(null);
      setNotice(label("Saved successfully.", "Matagumpay na na-save."));
      await refresh(store);
    } catch (failure) {
      setError(failure && typeof failure === "object" && "message" in failure
        ? String(failure.message) : label("Could not save. Try again.", "Hindi na-save. Subukang muli."));
    } finally { setBusy(false); }
  }

  async function showHistory(item: Item) {
    setBusy(true); setError("");
    try {
      const result = await supabase.from("stock_movements").select("*")
        .eq("inventory_item_id", item.id).order("created_at", { ascending: false }).limit(50);
      if (result.error) throw result.error;
      setHistory({ name: item.name, rows: result.data ?? [] });
    } catch { setError(label("Could not load stock history.", "Hindi makuha ang kasaysayan ng stock.")); }
    finally { setBusy(false); }
  }

  return <main className={styles.page}>
    <BackToDashboard />
    <header className={styles.header}><h1>{t("inventory.title")}</h1>
      <button disabled={!store || busy || loading} onClick={() => { setEditor({ item: null, kind: "DETAILS" }); setNotice(""); }}>{t("inventory.add")}</button>
    </header>
    <p>{label("Changes are saved online. Stock adjustments are recorded in history.", "Online sine-save ang mga pagbabago. Naitatala ang mga pagbabago sa stock.")}</p>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {notice && <p role="status">{notice}</p>}
    {editor && <form className={styles.panel} onSubmit={save} key={`${editor.item?.id}-${editor.kind}`}>
      <h2>{editor.item?.name ?? t("inventory.add")}</h2>
      <fieldset disabled={busy}>
        {editor.kind === "DETAILS" && <>
          <label>{t("inventory.name")}<input name="name" required maxLength={160} defaultValue={editor.item?.name} /></label>
          <label>SKU<input name="sku" maxLength={80} defaultValue={editor.item?.sku ?? ""} /></label>
          <label>{label("Price (PHP)", "Presyo (PHP)")}<input name="price" type="number" required min="0" max="9999999999.99" step="0.01" defaultValue={editor.item?.unit_price ?? 0} /></label>
          <label>{label("Restock threshold", "Antas para mag-restock")}<input name="threshold" type="number" required min="0" max="2147483647" step="1" defaultValue={editor.item?.restock_threshold ?? 5} /></label>
        </>}
        {(!editor.item || editor.kind !== "DETAILS") && <>
          <label>{editor.kind === "RESTOCK" ? label("Quantity to add", "Dami na idadagdag") : label("Stock quantity", "Dami ng stock")}
            <input name="stock" type="number" min={editor.kind === "RESTOCK" ? 1 : 0} max="2147483647" step="1" required defaultValue={editor.kind === "ADJUSTMENT" ? editor.item?.current_stock : editor.kind === "RESTOCK" ? 1 : 0} /></label>
          <label>{label("Reason / note", "Dahilan / tala")}<input name="note" maxLength={500} required={!!editor.item} /></label>
        </>}
        <div className={styles.actions}><button type="submit">{busy ? label("Saving...", "Sine-save...") : label("Save", "I-save")}</button>
          <button type="button" onClick={() => setEditor(null)}>{label("Cancel", "Kanselahin")}</button></div>
      </fieldset>
    </form>}
    <label>{label("Search products", "Maghanap ng produkto")}<input value={search} onChange={e => setSearch(e.target.value)} type="search" /></label>
    {loading ? <p role="status">{label("Loading...", "Naglo-load...")}</p> : <div className={styles.list}>
      {items.filter(item => `${item.name} ${item.sku ?? ""}`.toLowerCase().includes(search.toLowerCase())).map(item => {
        const status = computeStockStatus(item.current_stock, item.restock_threshold);
        return <article className={styles.panel} key={item.id}>
          <h2>{item.name}</h2><p>{item.sku || "-"} · PHP {Number(item.unit_price ?? 0).toFixed(2)}</p>
          <p><strong>{t("inventory.stock")}: {item.current_stock}</strong> · {t(status === "CRITICAL" ? "inventory.critical" : status === "RESTOCK_SOON" ? "inventory.restockSoon" : "inventory.stable")}</p>
          <div className={styles.actions}>
            <button disabled={busy} onClick={() => setEditor({ item, kind: "DETAILS" })}>{label("Edit", "Baguhin")}</button>
            <button disabled={busy} onClick={() => setEditor({ item, kind: "RESTOCK" })}>{label("Restock", "Magdagdag ng stock")}</button>
            <button disabled={busy} onClick={() => setEditor({ item, kind: "ADJUSTMENT" })}>{label("Adjust stock", "Itama ang stock")}</button>
            <button disabled={busy} onClick={() => void showHistory(item)}>{label("History", "Kasaysayan")}</button>
          </div>
        </article>;
      })}
      {!items.length && <p>{t("inventory.empty")}</p>}
    </div>}
    {history && <section className={styles.panel} aria-label={label("Stock history", "Kasaysayan ng stock")}>
      <h2>{history.name}: {label("Latest 50 stock changes", "Huling 50 pagbabago sa stock")}</h2>
      {!history.rows.length && <p>{label("No stock changes recorded.", "Wala pang naitalang pagbabago.")}</p>}
      <ul>{history.rows.map(row => <li key={row.id}>{new Date(row.created_at).toLocaleString()} · {row.type} · {row.previous_stock} → {row.new_stock} ({row.quantity > 0 ? "+" : ""}{row.quantity}){row.note && <p>{row.note}</p>}</li>)}</ul>
      <button onClick={() => setHistory(null)}>{label("Close", "Isara")}</button>
    </section>}
  </main>;
}
