const PH_TIMEZONE = "Asia/Manila";

export function formatDatePH(isoString: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: PH_TIMEZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoString));
}

export function formatTimePH(isoString: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: PH_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(isoString));
}

export function formatDateTimePH(isoString: string): string {
  return `${formatDatePH(isoString)}, ${formatTimePH(isoString)}`;
}

export function getElapsedLabel(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
