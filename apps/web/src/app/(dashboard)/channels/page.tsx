"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../lib/language";
import {
  loadChannelData,
  setRaketManualTracking,
  type ChannelIntegration,
  type ChannelProvider,
} from "../../../lib/channelsData";
import type { TranslationKey } from "../../../lib/i18n";

interface ChannelDefinition {
  name: string;
  providerLabelKey: TranslationKey;
  provider: ChannelProvider;
  descriptionKey: TranslationKey;
  requirementsKey: TranslationKey;
  actionLabelKey: TranslationKey;
}

const CHANNELS: ChannelDefinition[] = [
  {
    name: "Facebook",
    providerLabelKey: "channels.meta",
    provider: "FACEBOOK",
    descriptionKey: "channels.facebookDescription",
    requirementsKey: "channels.facebookRequirements",
    actionLabelKey: "channels.facebookAction",
  },
  {
    name: "Instagram",
    providerLabelKey: "channels.meta",
    provider: "INSTAGRAM",
    descriptionKey: "channels.instagramDescription",
    requirementsKey: "channels.instagramRequirements",
    actionLabelKey: "channels.instagramAction",
  },
  {
    name: "TikTok Shop",
    providerLabelKey: "channels.tiktok",
    provider: "TIKTOK_SHOP",
    descriptionKey: "channels.tiktokDescription",
    requirementsKey: "channels.tiktokRequirements",
    actionLabelKey: "channels.tiktokAction",
  },
  {
    name: "Raket.ph",
    providerLabelKey: "channels.manual",
    provider: "RAKET_PH",
    descriptionKey: "channels.raketDescription",
    requirementsKey: "channels.raketRequirements",
    actionLabelKey: "channels.raketAction",
  },
];

export default function ChannelsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<ChannelIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProvider, setSavingProvider] = useState<ChannelProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await loadChannelData();

        if (result.authState === "unauthenticated") {
          router.replace("/login");
          return;
        }

        if (result.authState === "needs_onboarding") {
          router.replace("/onboarding");
          return;
        }

        setStoreId(result.storeId);
        setIntegrations(result.integrations);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("channels.loadError"));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router, t]);

  async function toggleRaket(integration: ChannelIntegration | undefined) {
    if (!storeId) return;

    setSavingProvider("RAKET_PH");
    setError(null);

    try {
      const updated = await setRaketManualTracking(
        storeId,
        integration,
        integration?.status !== "MANUAL"
      );
      setIntegrations((current) => [
        ...current.filter((item) => item.provider !== "RAKET_PH"),
        updated,
      ]);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("channels.raketError"));
    } finally {
      setSavingProvider(null);
    }
  }

  return (
    <main style={{ padding: 16 }}>
      <header style={{ marginBottom: 20 }}>
        <Link href="/" style={{ color: "var(--color-navy)", fontWeight: 600, textDecoration: "none" }}>
          {t("common.backToDashboard")}
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
          {t("channels.title")}
        </h1>
        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
          {t("channels.intro")}
        </p>
      </header>

      {error ? (
        <p style={{ color: "var(--color-critical)", marginBottom: 16 }}>{error}</p>
      ) : null}

      {loading ? (
        <p style={{ color: "var(--color-text-secondary)" }}>{t("channels.loading")}</p>
      ) : (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {CHANNELS.map((channel) => {
            const integration = integrations.find((item) => item.provider === channel.provider);
            return (
              <ChannelCard
                key={channel.provider}
                channel={channel}
                integration={integration}
                saving={savingProvider === channel.provider}
                onRaketToggle={() => toggleRaket(integration)}
              />
            );
          })}
        </section>
      )}
    </main>
  );
}

function ChannelCard({ channel, integration, saving, onRaketToggle }: {
  channel: ChannelDefinition;
  integration: ChannelIntegration | undefined;
  saving: boolean;
  onRaketToggle: () => void;
}) {
  const { t } = useLanguage();
  const isRaket = channel.provider === "RAKET_PH";
  const isManual = integration?.status === "MANUAL";
  const status = getStatus(integration, isRaket, t);

  return (
    <article style={{
      background: "var(--color-surface)", border: "1px solid var(--color-border)",
      borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>
          {t(channel.providerLabelKey)}
        </p>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>{channel.name}</h2>
      </div>

      <p style={{ color: status.color, fontSize: 13, fontWeight: 700 }}>{status.label}</p>
      {integration?.externalAccountName ? <p>{integration.externalAccountName}</p> : null}
      <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
        {t(channel.descriptionKey)}
      </p>

      <div style={{
        background: "var(--color-slate)", border: "1px solid var(--color-border)",
        borderRadius: 8, padding: 12, color: "var(--color-text-secondary)",
        fontSize: 13, lineHeight: 1.45,
      }}>
        {t(channel.requirementsKey)}
      </div>

      <button
        type="button"
        disabled={!isRaket || saving}
        onClick={isRaket ? onRaketToggle : undefined}
        title={isRaket ? undefined : t("channels.oauthUnavailable")}
        style={{
          marginTop: "auto", minHeight: "var(--touch-button)", border: "none", borderRadius: 8,
          background: !isRaket ? "var(--color-border)" : "var(--color-navy)",
          color: !isRaket ? "var(--color-text-secondary)" : "var(--color-text-inverse)",
          fontWeight: 700, fontFamily: "var(--font-system)",
          cursor: !isRaket || saving ? "not-allowed" : "pointer",
        }}
      >
        {saving
          ? t("common.saving")
          : isRaket && isManual
            ? t("channels.raketDisable")
            : t(channel.actionLabelKey)}
      </button>
    </article>
  );
}

function getStatus(
  integration: ChannelIntegration | undefined,
  isRaket: boolean,
  t: (key: TranslationKey) => string
) {
  switch (integration?.status) {
    case "CONNECTED":
      return { label: t("channels.status.connected"), color: "var(--color-success)" };
    case "MANUAL":
      return { label: t("channels.status.manual"), color: "var(--color-success)" };
    case "PENDING":
      return { label: t("channels.status.pending"), color: "var(--color-warning)" };
    case "ERROR":
      return { label: t("channels.status.error"), color: "var(--color-critical)" };
    default:
      return {
        label: isRaket ? t("channels.status.manualOff") : t("channels.status.connectionNeeded"),
        color: "var(--color-warning)",
      };
  }
}
