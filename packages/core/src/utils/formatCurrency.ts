/**
 * Format a number as Philippine Peso.
 * Example: formatPeso(1250) => "₱1,250.00"
 */
export function formatPeso(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a compact peso amount for tight UI spaces.
 * Example: formatPesoCompact(1250) => "₱1.25k"
 */
export function formatPesoCompact(amount: number): string {
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₱${(amount / 1_000).toFixed(1)}k`;
  return `₱${amount.toFixed(0)}`;
}
