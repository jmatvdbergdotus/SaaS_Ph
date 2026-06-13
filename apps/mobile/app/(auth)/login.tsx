import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { theme } from "../../constants/theme";

export default function LoginScreen() {
  const [phone, setPhone]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequestOtp() {
    if (!phone.match(/^\+639\d{9}$/)) {
      Alert.alert("Invalid number", "Please enter a valid PH mobile number (+639XXXXXXXXX)");
      return;
    }
    setLoading(true);
    // TODO: call API POST /auth/otp/request
    setLoading(false);
    router.push({ pathname: "/auth/verify", params: { phone } });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sari-SaaS Hub</Text>
      <Text style={styles.subtitle}>Mag-login gamit ang iyong mobile number.</Text>
      <TextInput
        style={styles.input}
        placeholder="+639XXXXXXXXX"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        autoComplete="tel"
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRequestOtp}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {loading ? "Nagpapadala..." : "Humiling ng OTP"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 24, justifyContent: "center",
    backgroundColor: theme.colors.slate,
  },
  title: {
    fontSize: theme.fontSize.h1, fontWeight: "700",
    color: theme.colors.navy, marginBottom: 8,
  },
  subtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary, marginBottom: 32,
  },
  input: {
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md, padding: 14,
    fontSize: theme.fontSize.base, backgroundColor: theme.colors.surfaceWhite,
    marginBottom: 16,
  },
  button: {
    backgroundColor: theme.colors.navy, borderRadius: theme.borderRadius.md,
    minHeight: theme.spacing.touchButton, alignItems: "center", justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color: theme.colors.textInverse, fontSize: theme.fontSize.base, fontWeight: "600",
  },
});
