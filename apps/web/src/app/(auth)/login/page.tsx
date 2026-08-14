"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../../../lib/language";
import { supabase } from "../../../lib/supabase";
import styles from "./login.module.css";

export default function LoginPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("reason");
    setSessionExpired(reason === "inactive");
  }, []);

  async function handleRequestMagicLink(event: React.FormEvent) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    setLoading(true);
    setSent(false);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      setSubmittedEmail(normalizedEmail);
      setSent(true);
    } catch {
      setError(t("login.unexpectedError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel} aria-labelledby="brand-heading">
        <div className={styles.brandLockup}>
          <span className={styles.logoMark} aria-hidden="true">S</span>
          <span>Sari-SaaS Hub</span>
        </div>

        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{t("login.eyebrow")}</p>
          <h1 id="brand-heading">{t("login.heroTitle")}</h1>
          <p className={styles.heroDescription}>{t("login.heroDescription")}</p>

          <ul className={styles.featureList}>
            <Feature>{t("login.featureSales")}</Feature>
            <Feature>{t("login.featureStock")}</Feature>
            <Feature>{t("login.featureChannels")}</Feature>
          </ul>
        </div>

        <p className={styles.brandFooter}>Simple tools. Secure data. Better selling.</p>
      </section>

      <section className={styles.formPanel} aria-labelledby="login-heading">
        <div className={styles.loginCard}>
          <p className={styles.secureLabel}>
            <span aria-hidden="true">&#10003;</span>
            {t("login.secureSignIn")}
          </p>
          <h2 id="login-heading">{t("login.welcome")}</h2>
          <p className={styles.intro}>{t("login.intro")}</p>

          {sessionExpired ? (
            <div className={`${styles.feedback} ${styles.error}`} role="alert">
              <span className={styles.feedbackIcon} aria-hidden="true">!</span>
              <span>{t("login.sessionExpired")}</span>
            </div>
          ) : null}

          <form onSubmit={handleRequestMagicLink} aria-busy={loading}>
            <label htmlFor="email" className={styles.label}>
              {t("login.email")}
            </label>
            <div className={styles.inputWrap}>
              <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.mailIcon}>
                <path d="M4 6h16v12H4z" />
                <path d="m4 7 8 6 8-6" />
              </svg>
              <input
                id="email"
                type="email"
                placeholder={t("login.emailPlaceholder")}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setSent(false);
                  setError(null);
                }}
                autoComplete="email"
                inputMode="email"
                maxLength={254}
                aria-describedby="login-help login-feedback"
                required
                className={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? t("login.sending") : sent ? t("login.sendAgain") : t("login.sendLink")}
              {!loading ? <span aria-hidden="true">&rarr;</span> : null}
            </button>

            <div id="login-feedback" aria-live="polite">
              {sent ? (
                <div className={`${styles.feedback} ${styles.success}`} role="status">
                  <span className={styles.feedbackIcon} aria-hidden="true">&#10003;</span>
                  <div>
                    <strong>{t("login.checkEmail")}</strong>
                    <span>{t("login.sentTo")} {submittedEmail}.</span>
                    <span>{t("login.linkExpiry")}</span>
                  </div>
                </div>
              ) : null}
              {error ? (
                <div className={`${styles.feedback} ${styles.error}`} role="alert">
                  <span className={styles.feedbackIcon} aria-hidden="true">!</span>
                  <span>{error}</span>
                </div>
              ) : null}
            </div>

            <p id="login-help" className={styles.securityNote}>
              <span className={styles.securityDot} aria-hidden="true">&#9679;</span>
              <span>
                {t("login.noPassword")} {t("login.linkExpiry")}
              </span>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li>
      <span aria-hidden="true">&#10003;</span>
      {children}
    </li>
  );
}
