"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function OnboardingPage() {
  const router = useRouter();
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
      setError("Please log in again before creating your store.");
      setSaving(false);
      return;
    }

    const authUser = userResult.user;
    const email = authUser.email ?? null;

    const { error: profileError } = await supabase.from("users").upsert({
      id: authUser.id,
      email,
      last_login_at: new Date().toISOString(),
    });

    if (profileError) {
      setError(profileError.message);
      setSaving(false);
      return;
    }

    const { data: store, error: storeError } = await supabase
      .from("stores")
      .insert({
        owner_id: authUser.id,
        name: storeName,
        owner_name: ownerName,
        contact_number: contactNumber,
        address: address || null,
      })
      .select("id")
      .single();

    if (storeError) {
      setError(storeError.message);
      setSaving(false);
      return;
    }

    const { error: updateProfileError } = await supabase
      .from("users")
      .update({ store_id: store.id })
      .eq("id", authUser.id);

    if (updateProfileError) {
      setError(updateProfileError.message);
      setSaving(false);
      return;
    }

    router.replace("/");
  }

  if (loading) {
    return (
      <main style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
        <p style={{ color: "var(--color-text-secondary)" }}>Checking your account...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Set up your store</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 24 }}>
        Tell us a little about your sari-sari store so we can secure your dashboard data.
      </p>

      <form onSubmit={handleSubmit}>
        <Field
          id="store-name"
          label="Store Name"
          placeholder="Jane's Sari-Sari Store"
          value={storeName}
          onChange={setStoreName}
          required
        />
        <Field
          id="owner-name"
          label="Owner Name"
          placeholder="Jane"
          value={ownerName}
          onChange={setOwnerName}
          required
        />
        <Field
          id="contact-number"
          label="Contact Number"
          placeholder="+639XXXXXXXXX"
          value={contactNumber}
          onChange={setContactNumber}
          required
        />
        <Field
          id="address"
          label="Address"
          placeholder="Optional"
          value={address}
          onChange={setAddress}
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
          {saving ? "Saving..." : "Create Store"}
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
  required = false,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label htmlFor={id} style={{ display: "block", marginBottom: 16, fontWeight: 600 }}>
      {label}
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
