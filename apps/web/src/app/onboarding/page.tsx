"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../lib/language";
import { supabase } from "../../lib/supabase";

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    async function checkProfile() {
      const { data: userResult, error: userError } = await supabase.auth.getUser();

      if (userError || !userResult.user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("store_id")
        .eq("id", userResult.user.id)
        .maybeSingle();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      if (profile?.store_id) {
        router.replace("/");
        return;
      }

      setLoading(false);
    }

    checkProfile();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { data: userResult, error: userError } = await supabase.auth.getUser();

    if (userError || !userResult.user) {
      setError(t("onboarding.loginAgain"));
      setSaving(false);
      return;
    }

    const { error: createStoreError } = await supabase.rpc("create_store_profile", {
      p_store_name: storeName.trim(),
      p_owner_name: ownerName.trim(),
      p_contact_number: contactNumber.trim(),
      p_address: address.trim() || undefined,
    });

    if (createStoreError) {
      setError(createStoreError.message);
      setSaving(false);
      return;
    }

    router.replace("/");
  }

  if (loading) {
    return (
      <main style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
        <p style={{ color: "var(--color-text-secondary)" }}>{t("onboarding.checking")}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{t("onboarding.title")}</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 24 }}>
        {t("onboarding.intro")}
      </p>

      <form onSubmit={handleSubmit}>
        <Field
          id="store-name"
          label={t("onboarding.storeName")}
          placeholder="Jane's Sari-Sari Store"
          value={storeName}
          onChange={setStoreName}
          maxLength={120}
          required
        />
        <Field
          id="owner-name"
          label={t("onboarding.ownerName")}
          placeholder="Jane"
          value={ownerName}
          onChange={setOwnerName}
          maxLength={120}
          required
        />
        <Field
          id="contact-number"
          label={t("onboarding.contactNumber")}
          placeholder="+639XXXXXXXXX"
          value={contactNumber}
          onChange={setContactNumber}
          maxLength={16}
          type="tel"
          required
        />
        <Field
          id="address"
          label={t("onboarding.address")}
          placeholder={t("onboarding.optional")}
          value={address}
          onChange={setAddress}
          maxLength={500}
        />

        <button
          type="submit"
          disabled={saving}
          style={{
            width: "100%",
            minHeight: "var(--touch-button)",
            padding: "0 16px",
            background: "var(--color-navy)",
            color: "var(--color-text-inverse)",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {saving ? t("common.saving") : t("onboarding.createStore")}
        </button>

        {error ? (
          <p style={{ color: "var(--color-critical)", marginTop: 16 }}>{error}</p>
        ) : null}
      </form>
    </main>
  );
}

function Field({
  id,
  label,
  placeholder,
  value,
  onChange,
  maxLength,
  type = "text",
  required = false,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  type?: "text" | "tel";
  required?: boolean;
}) {
  return (
    <label htmlFor={id} style={{ display: "block", marginBottom: 16, fontWeight: 600 }}>
      {label}
      <input
        id={id}
        type={type}
        inputMode={type === "tel" ? "tel" : "text"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        required={required}
        style={{
          width: "100%",
          padding: "12px 16px",
          fontSize: 16,
          borderRadius: 8,
          border: "1px solid var(--color-border)",
          marginTop: 8,
          fontFamily: "var(--font-system)",
        }}
      />
    </label>
  );
}
