import { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../../constants/theme";
import { formatPeso } from "@sari-saas/core";

export default function DashboardScreen() {
  return (
    <View style={styles.screen}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sari-SaaS Hub</Text>
        <View style={styles.syncDot} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Daily Revenue */}
        <View style={styles.revenueCard}>
          <Text style={styles.revenueLabel}>KITA NGAYON</Text>
          <Text style={styles.revenueValue}>{formatPeso(0)}</Text>
        </View>

        {/* Status Cards */}
        <View style={styles.cardRow}>
          <StatusCard label="Pending Payment" value={0} color={theme.colors.warning} cta="Fix Now" />
          <StatusCard label="Low Stock Items" value={0} color={theme.colors.neutral}  cta="View" />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <QuickActionBtn emoji="🛒" label="Bagong Benta" />
          <QuickActionBtn emoji="📷" label="Scan Screenshot" />
          <QuickActionBtn emoji="🛵" label="Book Rider" />
        </View>
      </ScrollView>
    </View>
  );
}

function StatusCard({ label, value, color, cta }: { label: string; value: number; color: string; cta: string }) {
  return (
    <TouchableOpacity style={styles.statusCard} activeOpacity={0.8}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={[styles.statusValue, { color }]}>{value}</Text>
      <Text style={styles.statusCta}>{cta} →</Text>
    </TouchableOpacity>
  );
}

function QuickActionBtn({ emoji, label }: { emoji: string; label: string }) {
  return (
    <TouchableOpacity style={styles.quickBtn} activeOpacity={0.8}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const { colors, spacing, borderRadius, fontSize } = theme;
const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: colors.slate },
  header:       { backgroundColor: colors.navy, padding: 16, paddingTop: 52, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle:  { color: colors.textInverse, fontSize: fontSize.lg, fontWeight: "700" },
  syncDot:      { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success },
  scroll:       { padding: 16, gap: 12 },
  revenueCard:  { backgroundColor: colors.surfaceWhite, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: 16 },
  revenueLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 4, fontWeight: "600" },
  revenueValue: { fontSize: 32, fontWeight: "700", color: colors.navy },
  cardRow:      { flexDirection: "row", gap: 12 },
  statusCard:   { flex: 1, backgroundColor: colors.surfaceWhite, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: 16 },
  statusLabel:  { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 4 },
  statusValue:  { fontSize: 28, fontWeight: "700" },
  statusCta:    { fontSize: 12, color: colors.navy, marginTop: 8, fontWeight: "600" },
  quickActionsRow: { flexDirection: "row", gap: 12 },
  quickBtn:     { flex: 1, minHeight: spacing.touchButton, backgroundColor: colors.surfaceWhite, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, alignItems: "center", justifyContent: "center", gap: 4 },
  quickLabel:   { fontSize: fontSize.xs, fontWeight: "600", textAlign: "center" },
});
