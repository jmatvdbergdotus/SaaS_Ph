"use client";

import { useLanguage } from "../lib/language";
import type { Language } from "../lib/i18n";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 16px 0" }}>
      <label
        htmlFor="app-language"
        style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}
      >
        {t("language.label")}
        <select
          id="app-language"
          value={language}
          onChange={(event) => setLanguage(event.target.value as Language)}
          style={{
            minHeight: 40,
            padding: "0 32px 0 12px",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            background: "var(--color-surface)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-system)",
            fontWeight: 600,
          }}
        >
          <option value="en">{t("language.english")}</option>
          <option value="tl">{t("language.tagalog")}</option>
        </select>
      </label>
    </div>
  );
}
