"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRequestMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      setMessage("Check your email for the login link.");
    }

    setLoading(false);
  }

  return (
    <main style={{ padding: 24, maxWidth: 400, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Sari-SaaS Hub</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 24 }}>
        Mag-login gamit ang iyong email. Padadalhan ka namin ng secure login link.
      </p>
      <form onSubmit={handleRequestMagicLink}>
        <label htmlFor="email" style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          {loading ? "Nagpapadala..." : "Send Magic Link"}
        </button>
        {message ? (
          <p style={{ color: "var(--color-success)", marginTop: 16 }}>{message}</p>
        ) : null}
        {error ? (
          <p style={{ color: "var(--color-critical)", marginTop: 16 }}>{error}</p>
        ) : null}
      </form>
    </main>
  );
}
