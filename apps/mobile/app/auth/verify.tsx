import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { theme } from "../../constants/theme";

export default function VerifyScreen() {
  const { phone }         = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    setLoading(true);
    // TODO: call API POST /auth/otp/verify → store JWT → router.replace("/(app)")
    setLoading(false);
    router.replace("/(app)");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>I-enter ang OTP</Text>
      <Text style={styles.subtitle}>Nagpadala kami ng 6-digit code sa {phone}</Text>
      <TextInput
        style={styles.input}
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{loading ? "Nagve-verify..." : "I-verify"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: theme.colors.slate },
  title:     { fontSize: theme.fontSize.xl, fontWeight: "700", color: theme.colors.navy, marginBottom: 8 },
  subtitle:  { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginBottom: 32 },
  input:     {
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md,
    padding: 14, fontSize: 28, fontWeight: "700", textAlign: "center",
    backgroundColor: theme.colors.surfaceWhite, marginBottom: 16, letterSpacing: 8,
  },
  button:         { backgroundColor: theme.colors.navy, borderRadius: theme.borderRadius.md, minHeight: theme.spacing.touchButton, alignItems: "center", justifyContent: "center" },
  buttonDisabled: { opacity: 0.5 },
  buttonText:     { color: theme.colors.textInverse, fontSize: theme.fontSize.base, fontWeight: "600" },
});
