import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../constants/theme";

export default function NotFoundScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Hindi makita ang page.</Text>
      <Link href="/" style={styles.link}>
        Bumalik sa home
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
    backgroundColor: theme.colors.slate,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
  },
  link: {
    minHeight: theme.spacing.touchMin,
    color: theme.colors.navy,
    fontWeight: "600",
    paddingVertical: 14,
  },
});
