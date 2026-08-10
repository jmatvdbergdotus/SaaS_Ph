import { View, Text, FlatList, StyleSheet } from "react-native";
import { theme } from "../../../constants/theme";
import { computeStockStatus, type InventoryItem } from "@sari-saas/core";

const STATUS_COLORS: Record<string, string> = {
  CRITICAL:     theme.colors.critical,
  RESTOCK_SOON: theme.colors.warning,
  STABLE:       theme.colors.success,
};

const mockItems: InventoryItem[] = [];

export default function InventoryScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Imbentaryo</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.col, styles.headerText]}>PANGALAN</Text>
        <Text style={[styles.colSmall, styles.headerText]}>STOCK</Text>
        <Text style={[styles.colSmall, styles.headerText]}>STATUS</Text>
      </View>
      <FlatList
        data={mockItems}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          const s = computeStockStatus(item.currentStock, item.restockThreshold);
          return (
            <View style={styles.row}>
              <Text style={[styles.col, styles.itemName]}>{item.name}</Text>
              <Text style={styles.colSmall}>{item.currentStock}</Text>
              <Text style={[styles.colSmall, { color: STATUS_COLORS[s], fontWeight: "600" }]}>
                {s.replace("_", " ")}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>Walang aytem pa.</Text>}
      />
    </View>
  );
}

const { colors, fontSize } = theme;
const styles = StyleSheet.create({
  screen:     { flex: 1, backgroundColor: colors.slate, padding: 16 },
  title:      { fontSize: fontSize.xl, fontWeight: "700", marginBottom: 16, color: colors.navy },
  tableHeader:{ flexDirection: "row", borderBottomWidth: 1, borderColor: colors.border, paddingBottom: 8, marginBottom: 4 },
  headerText: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: "600" },
  row:        { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border },
  col:        { flex: 2 },
  colSmall:   { flex: 1 },
  itemName:   { fontWeight: "500" },
  empty:      { color: colors.textSecondary, textAlign: "center", marginTop: 64 },
});
