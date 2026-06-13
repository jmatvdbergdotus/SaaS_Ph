"use client";
import { useState } from "react";

export default function LoginPage() {
  const [phone, setPhone]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO: call POST /auth/otp/request
    console.warn("OTP requested for", phone);
    setLoading(false);
  }

  return (
    <main style={{ padding: 24, maxWidth: 400, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Sari-SaaS Hub</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 24 }}>
        Mag-login gamit ang iyong mobile number.
      </p>
      <form onSubmit={handleRequestOtp}>
        <label htmlFor="phone" style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Mobile Number
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="+639XXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          style={{
            width: "100%", padding: "12px 16px", fontSize: 16, borderRadius: 8,
            border: "1px solid var(--color-border)", marginBottom: 16,
            fontFamily: "var(--font-system)",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", minHeight: "var(--touch-button)", padding: "0 16px",
            background: "var(--color-navy)", color: "var(--color-text-inverse)",
            border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {loading ? "Nagpapadala..." : "Humiling ng OTP"}
        </button>
      </form>
    </main>
  );
}
