import { colors, spacing } from "@sari-saas/core";

export const theme = {
  colors,
  spacing,
  fontFamily: "System",
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
  fontSize: {
    xs:   12,
    sm:   14,
    base: 16,
    lg:   18,
    xl:   20,
    xxl:  24,
    h1:   28,
  },
} as const;
