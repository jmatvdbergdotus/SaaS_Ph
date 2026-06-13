export const colors = {
  // Brand
  navy:          "#0F172A",
  slate:         "#F8FAFC",
  // Status
  critical:      "#DC2626",
  warning:       "#D97706",
  success:       "#16A34A",
  neutral:       "#64748B",
  // Borders & surfaces
  border:        "#E2E8F0",
  surfaceWhite:  "#FFFFFF",
  // Text
  textPrimary:   "#0F172A",
  textSecondary: "#64748B",
  textInverse:   "#F8FAFC",
} as const;

export type ColorToken = keyof typeof colors;
