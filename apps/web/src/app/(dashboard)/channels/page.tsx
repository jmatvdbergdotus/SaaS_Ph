"use client";

const CHANNELS = [
  {
    name: "Facebook",
    provider: "Meta",
    status: "Connection needed",
    statusColor: "var(--color-warning)",
    description: "Connect a Facebook Page to import messages, comments, and commerce activity.",
    requirements: "Requires a Meta Developer App, Page permissions, and webhook setup.",
    actionLabel: "Connect Facebook",
    actionDisabled: true,
  },
  {
    name: "Instagram",
    provider: "Meta",
    status: "Connection needed",
    statusColor: "var(--color-warning)",
    description: "Connect an Instagram business account linked to a Facebook Page.",
    requirements: "Requires Instagram Graph API access through Meta.",
    actionLabel: "Connect Instagram",
    actionDisabled: true,
  },
  {
    name: "TikTok Shop",
    provider: "TikTok",
    status: "Connection needed",
    statusColor: "var(--color-warning)",
    description: "Connect TikTok Shop to sync shop orders and customer activity.",
    requirements: "Requires TikTok Shop API/OAuth access for the seller account.",
    actionLabel: "Connect TikTok",
    actionDisabled: true,
  },
  {
    name: "Raket.ph",
    provider: "Manual",
    status: "Manual tracking available soon",
    statusColor: "var(--color-neutral)",
    description: "Track Raket.ph as an order source while an official API integration is confirmed.",
    requirements: "Can start as manual order tagging; API/webhook support still needs verification.",
    actionLabel: "Set Up Manual Tracking",
    actionDisabled: true,
  },
];

export default function ChannelsPage() {
  return (
    <main style={{ padding: 16 }}>
      <header style={{ marginBottom: 20 }}>
        <a href="/" style={{ color: "var(--color-navy)", fontWeight: 600, textDecoration: "none" }}>
          Back to dashboard
        </a>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>
          Sales Channels
        </h1>
        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
          Connect the places where you sell so Sari-SaaS can pull orders, messages, and activity into
          one dashboard. These connection buttons are prepared as the UI entry point; the OAuth/API
          backend is the next build step.
        </p>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {CHANNELS.map((channel) => (
          <ChannelCard key={channel.name} channel={channel} />
        ))}
      </section>
    </main>
  );
}

function ChannelCard({ channel }: { channel: (typeof CHANNELS)[number] }) {
  return (
    <article style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 12,
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      <div>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>
          {channel.provider}
        </p>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>{channel.name}</h2>
      </div>

      <p style={{ color: channel.statusColor, fontSize: 13, fontWeight: 700 }}>
        {channel.status}
      </p>

      <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
        {channel.description}
      </p>

      <div style={{
        background: "var(--color-slate)",
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: 12,
        color: "var(--color-text-secondary)",
        fontSize: 13,
        lineHeight: 1.45,
      }}>
        {channel.requirements}
      </div>

      <button
        type="button"
        disabled={channel.actionDisabled}
        title="This connection needs backend OAuth/API work next."
        style={{
          marginTop: "auto",
          minHeight: "var(--touch-button)",
          border: "none",
          borderRadius: 8,
          background: channel.actionDisabled ? "var(--color-border)" : "var(--color-navy)",
          color: channel.actionDisabled ? "var(--color-text-secondary)" : "var(--color-text-inverse)",
          fontWeight: 700,
          fontFamily: "var(--font-system)",
          cursor: channel.actionDisabled ? "not-allowed" : "pointer",
        }}
      >
        {channel.actionLabel}
      </button>
    </article>
  );
}
