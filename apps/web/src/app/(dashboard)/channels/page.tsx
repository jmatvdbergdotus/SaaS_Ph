"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BackToDashboard } from "../../../components/BackToDashboard";
import { useLanguage } from "../../../lib/language";
import {
  beginChannelConnection,
  disconnectChannel,
  loadAvailableChannelAccounts,
  loadChannelData,
  loadProviderAvailability,
  selectChannelAccount,
  type ChannelAccount,
  type ChannelIntegration,
  type ChannelProvider,
  type ProviderAvailabilityMap,
} from "../../../lib/channelsData";
import type { TranslationKey } from "../../../lib/i18n";

interface ChannelDefinition {
  name: string;
  providerLabelKey: TranslationKey;
  provider: ChannelProvider;
  descriptionKey: TranslationKey;
  requirementsKey: TranslationKey;
  actionLabelKey: TranslationKey;
  setupNeededKey?: TranslationKey;
  storeAddressLabelKey?: TranslationKey;
  storeAddressPlaceholderKey?: TranslationKey;
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
    name: "WooCommerce",
    providerLabelKey: "channels.ecommerce",
    provider: "WOOCOMMERCE",
    descriptionKey: "channels.woocommerceDescription",
    requirementsKey: "channels.woocommerceRequirements",
    actionLabelKey: "channels.woocommerceAction",
    setupNeededKey: "channels.woocommerceSetupNeeded",
    storeAddressLabelKey: "channels.woocommerceAddress",
    storeAddressPlaceholderKey: "channels.woocommercePlaceholder",
  },
  {
    name: "Shopify",
    providerLabelKey: "channels.ecommerce",
    provider: "SHOPIFY",
    descriptionKey: "channels.shopifyDescription",
    requirementsKey: "channels.shopifyRequirements",
    actionLabelKey: "channels.shopifyAction",
    setupNeededKey: "channels.shopifySetupNeeded",
    storeAddressLabelKey: "channels.shopifyAddress",
    storeAddressPlaceholderKey: "channels.shopifyPlaceholder",
  },
];

const DEFAULT_AVAILABILITY: ProviderAvailabilityMap = {
  FACEBOOK: { configured: false, mode: "OAUTH" },
  INSTAGRAM: { configured: false, mode: "OAUTH" },
  TIKTOK_SHOP: { configured: false, mode: "OAUTH" },
  WOOCOMMERCE: { configured: false, mode: "STORE_AUTH" },
  SHOPIFY: { configured: false, mode: "STORE_AUTH" },
};

export default function ChannelsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [integrations, setIntegrations] = useState<ChannelIntegration[]>([]);
  const [availability, setAvailability] = useState(DEFAULT_AVAILABILITY);
  const [accounts, setAccounts] = useState<Partial<Record<ChannelProvider, ChannelAccount[]>>>({});
  const [selectedAccounts, setSelectedAccounts] = useState<Partial<Record<ChannelProvider, string>>>({});
  const [storeAddresses, setStoreAddresses] = useState<Partial<Record<ChannelProvider, string>>>({});
  const [loading, setLoading] = useState(true);
  const [savingProvider, setSavingProvider] = useState<ChannelProvider | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const result = await loadChannelData();
        if (!active) return;

        if (result.authState === "unauthenticated") {
          router.replace("/login");
          return;
        }
        if (result.authState === "needs_onboarding") {
          router.replace("/onboarding");
          return;
        }

        setIntegrations(result.integrations);

        try {
          const providerAvailability = await loadProviderAvailability();
          if (!active) return;
          setAvailability(providerAvailability);

          const pendingProviders = result.integrations
            .filter((integration) => integration.status === "PENDING")
            .map((integration) => integration.provider)
            .filter((provider) => isSocialProvider(provider) && providerAvailability[provider].configured);

          const accountResults = await Promise.all(pendingProviders.map(async (provider) => ({
            provider,
            accounts: await loadAvailableChannelAccounts(provider).catch(() => []),
          })));
          if (!active) return;

          const nextAccounts: Partial<Record<ChannelProvider, ChannelAccount[]>> = {};
          const nextSelections: Partial<Record<ChannelProvider, string>> = {};
          accountResults.forEach(({ provider, accounts: providerAccounts }) => {
            nextAccounts[provider] = providerAccounts;
            if (providerAccounts[0]) nextSelections[provider] = providerAccounts[0].id;
          });
          setAccounts(nextAccounts);
          setSelectedAccounts(nextSelections);
        } catch {
          setError(t("channels.serviceUnavailable"));
        }

        const callbackResult = new URLSearchParams(window.location.search).get("result");
        if (callbackResult) setNotice(callbackMessage(callbackResult, t));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("channels.loadError"));
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [router, t]);

  async function handleChannelAction(
    provider: ChannelProvider,
    integration: ChannelIntegration | undefined
  ) {
    setSavingProvider(provider);
    setError(null);
    setNotice(null);

    try {
      if (integration?.status === "CONNECTED") {
        if (!window.confirm(t("channels.disconnectConfirm"))) return;
        await disconnectChannel(provider);
        replaceIntegration({ ...integration, status: "DISCONNECTED", externalAccountName: null });
        setNotice(t("channels.disconnected"));
        return;
      }

      const accountId = selectedAccounts[provider];
      if (integration?.status === "PENDING" && accounts[provider]?.length && accountId) {
        await selectChannelAccount(provider, accountId);
        const selected = accounts[provider]?.find((account) => account.id === accountId);
        replaceIntegration({
          ...integration,
          status: "CONNECTED",
          externalAccountName: selected?.name ?? null,
          connectedAt: new Date().toISOString(),
          errorMessage: null,
        });
        setAccounts((current) => ({ ...current, [provider]: [] }));
        setNotice(t("channels.connected"));
        return;
      }

      const authorizationUrl = await beginChannelConnection(provider, storeAddresses[provider]);
      window.location.assign(authorizationUrl);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("channels.connectionError"));
    } finally {
      setSavingProvider(null);
    }
  }

  function replaceIntegration(updated: ChannelIntegration) {
    setIntegrations((current) => [
      ...current.filter((item) => item.provider !== updated.provider),
      updated,
    ]);
  }

  return (
    <main style={{ padding: 16 }}>
      <header style={{ marginBottom: 20 }}>
        <BackToDashboard />
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          {t("channels.title")}
        </h1>
        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
          {t("channels.intro")}
        </p>
      </header>

      {notice ? <MessageBox color="var(--color-success)">{notice}</MessageBox> : null}
      {error ? <MessageBox color="var(--color-critical)">{error}</MessageBox> : null}

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
                configured={availability[channel.provider].configured}
                accounts={accounts[channel.provider] ?? []}
                selectedAccountId={selectedAccounts[channel.provider] ?? ""}
                storeAddress={storeAddresses[channel.provider] ?? ""}
                saving={savingProvider === channel.provider}
                onSelectedAccountChange={(accountId) => setSelectedAccounts((current) => ({
                  ...current,
                  [channel.provider]: accountId,
                }))}
                onStoreAddressChange={(value) => setStoreAddresses((current) => ({
                  ...current,
                  [channel.provider]: value,
                }))}
                onAction={() => handleChannelAction(channel.provider, integration)}
              />
            );
          })}
        </section>
      )}
    </main>
  );
}

function ChannelCard({
  channel,
  integration,
  configured,
  accounts,
  selectedAccountId,
  storeAddress,
  saving,
  onSelectedAccountChange,
  onStoreAddressChange,
  onAction,
}: {
  channel: ChannelDefinition;
  integration: ChannelIntegration | undefined;
  configured: boolean;
  accounts: ChannelAccount[];
  selectedAccountId: string;
  storeAddress: string;
  saving: boolean;
  onSelectedAccountChange: (accountId: string) => void;
  onStoreAddressChange: (value: string) => void;
  onAction: () => void;
}) {
  const { t } = useLanguage();
  const usesStoreAuthorization = channel.provider === "WOOCOMMERCE" || channel.provider === "SHOPIFY";
  const hasAccountSelection = integration?.status === "PENDING" && accounts.length > 0;
  const status = getStatus(integration, t);

  let actionLabel = t(channel.actionLabelKey);
  if (saving) actionLabel = t("common.saving");
  else if (integration?.status === "CONNECTED") actionLabel = t("channels.disconnect");
  else if (hasAccountSelection) actionLabel = t("channels.confirmAccount");
  else if (integration?.status === "ERROR") actionLabel = t("channels.reconnect");

  const needsStoreAddress = usesStoreAuthorization && integration?.status !== "CONNECTED";
  const disabled = saving
    || !configured
    || (hasAccountSelection && !selectedAccountId)
    || (needsStoreAddress && !storeAddress.trim());

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
        {!configured
          ? t(channel.setupNeededKey ?? "channels.serverSetupNeeded")
          : t(channel.requirementsKey)}
      </div>

      {needsStoreAddress && channel.storeAddressLabelKey && channel.storeAddressPlaceholderKey ? (
        <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700 }}>
          {t(channel.storeAddressLabelKey)}
          <input
            type="text"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={storeAddress}
            placeholder={t(channel.storeAddressPlaceholderKey)}
            onChange={(event) => onStoreAddressChange(event.target.value)}
            style={{ minHeight: 44, border: "1px solid var(--color-border)", borderRadius: 8, padding: "0 10px" }}
          />
        </label>
      ) : null}

      {hasAccountSelection ? (
        <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700 }}>
          {t("channels.chooseAccount")}
          <select
            value={selectedAccountId}
            onChange={(event) => onSelectedAccountChange(event.target.value)}
            style={{ minHeight: 44, border: "1px solid var(--color-border)", borderRadius: 8, padding: "0 10px" }}
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
        </label>
      ) : null}

      {integration?.status === "ERROR" && integration.errorMessage ? (
        <p style={{ color: "var(--color-critical)", fontSize: 13 }}>{integration.errorMessage}</p>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        onClick={onAction}
        title={!configured ? t(channel.setupNeededKey ?? "channels.serverSetupNeeded") : undefined}
        style={{
          marginTop: "auto", minHeight: "var(--touch-button)", border: "none", borderRadius: 8,
          background: disabled ? "var(--color-border)" : "var(--color-navy)",
          color: disabled ? "var(--color-text-secondary)" : "var(--color-text-inverse)",
          fontWeight: 700, fontFamily: "var(--font-system)",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {actionLabel}
      </button>
    </article>
  );
}

function MessageBox({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div style={{
      border: `1px solid ${color}`, borderRadius: 8, padding: 12,
      color, background: "var(--color-surface)", marginBottom: 16,
    }}>
      {children}
    </div>
  );
}

function callbackMessage(result: string, t: (key: TranslationKey) => string): string {
  switch (result) {
    case "connected": return t("channels.connected");
    case "pending": return t("channels.pendingCompletion");
    case "select_account": return t("channels.selectAccountNotice");
    case "cancelled": return t("channels.cancelled");
    case "invalid_state":
    case "invalid_callback": return t("channels.invalidCallback");
    default: return t("channels.connectionError");
  }
}

function getStatus(
  integration: ChannelIntegration | undefined,
  t: (key: TranslationKey) => string
) {
  switch (integration?.status) {
    case "CONNECTED":
      return { label: t("channels.status.connected"), color: "var(--color-success)" };
    case "PENDING":
      return { label: t("channels.status.pending"), color: "var(--color-warning)" };
    case "ERROR":
      return { label: t("channels.status.error"), color: "var(--color-critical)" };
    default:
      return { label: t("channels.status.connectionNeeded"), color: "var(--color-warning)" };
  }
}

function isSocialProvider(provider: ChannelProvider): boolean {
  return provider === "FACEBOOK" || provider === "INSTAGRAM" || provider === "TIKTOK_SHOP";
}
