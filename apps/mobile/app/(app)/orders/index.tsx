import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { theme } from "../../../constants/theme";
import { formatPeso, getElapsedLabel, type Order } from "@sari-saas/core";

// Placeholder — replace with store data
const mockOrders: Order[] = [];

export default function OrdersScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Mga Orders</Text>
      <FlatList
        data={mockOrders}
        keyExtractor={(o) => o.id}
        renderItem={({ item }) => <OrderCard order={item} />}
        contentContainerStyle={mockOrders.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={<Text style={styles.empty}>Wala pang orders.</Text>}
      />
    </View>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: "/(app)/orders/[id]", params: { id: order.id } })}
      activeOpacity={0.8}
    >
      <Text style={styles.customerName}>{order.customerName ?? "Walk-in"}</Text>
      <Text style={styles.meta}>{order.channel} · {getElapsedLabel(order.createdAt)}</Text>
      <Text style={styles.amount}>{formatPeso(order.totalAmount)}</Text>
    </TouchableOpacity>
  );
}

const { colors, borderRadius, fontSize } = theme;
const styles = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: colors.slate, padding: 16 },
  title:          { fontSize: fontSize.xl, fontWeight: "700", marginBottom: 16, color: colors.navy },
  card:           { backgroundColor: colors.surfaceWhite, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: 16, marginBottom: 8 },
  customerName:   { fontWeight: "600", fontSize: fontSize.base },
  meta:           { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  amount:         { fontSize: fontSize.lg, fontWeight: "700", marginTop: 8 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty:          { color: colors.textSecondary, textAlign: "center", marginTop: 64 },
});
