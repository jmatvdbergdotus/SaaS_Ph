import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../../../constants/theme";
import { CHANNEL_COLORS, type MessageThread } from "@sari-saas/core";

const mockThreads: MessageThread[] = [];

export default function ChatScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Mga Mensahe</Text>
      <FlatList
        data={mockThreads}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => <ThreadRow thread={item} />}
        ListEmptyComponent={<Text style={styles.empty}>Walang mensahe pa.</Text>}
      />
    </View>
  );
}

function ThreadRow({ thread }: { thread: MessageThread }) {
  const dot = CHANNEL_COLORS[thread.channel as keyof typeof CHANNEL_COLORS] ?? "#888";
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.8}>
      <View style={[styles.channelDot, { backgroundColor: dot }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.customerName}>{thread.customerName ?? "Unknown"}</Text>
        <Text style={styles.preview} numberOfLines={1}>{thread.lastMessage ?? ""}</Text>
      </View>
      {thread.unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{thread.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const { colors, fontSize } = theme;
const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: colors.slate, padding: 16 },
  title:        { fontSize: fontSize.xl, fontWeight: "700", marginBottom: 16, color: colors.navy },
  row:          { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderColor: colors.border },
  channelDot:   { width: 10, height: 10, borderRadius: 5 },
  customerName: { fontWeight: "600", fontSize: fontSize.base },
  preview:      { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  badge:        { backgroundColor: colors.navy, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText:    { color: colors.textInverse, fontSize: fontSize.xs, fontWeight: "700" },
  empty:        { color: colors.textSecondary, textAlign: "center", marginTop: 64 },
});
