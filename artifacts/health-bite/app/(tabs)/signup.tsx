import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const C = colors.light;

function validateEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useApp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  function validate() {
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Enter your full name";
    if (!validateEmail(email)) errs.email = "Enter a valid email address";
    if (password.length < 6) errs.password = "Password must be at least 6 characters";
    if (password !== confirm) errs.confirm = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSignUp() {
    if (!validate()) return;
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await login(email.trim());
      router.replace("/(tabs)/profile");
    } finally {
      setLoading(false);
    }
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const fields = [
    { key: "name", label: "FULL NAME", icon: "user" as const, placeholder: "John Doe", secure: false, ref: null, next: () => emailRef.current?.focus(), keyboard: "default" as const },
    { key: "email", label: "EMAIL", icon: "mail" as const, placeholder: "you@example.com", secure: false, ref: emailRef, next: () => passwordRef.current?.focus(), keyboard: "email-address" as const },
    { key: "password", label: "PASSWORD", icon: "lock" as const, placeholder: "Min 6 characters", secure: true, ref: passwordRef, next: () => confirmRef.current?.focus(), keyboard: "default" as const },
    { key: "confirm", label: "CONFIRM PASSWORD", icon: "check-circle" as const, placeholder: "Re-enter password", secure: true, ref: confirmRef, next: handleSignUp, keyboard: "default" as const },
  ];

  const values: Record<string, string> = { name, email, password, confirm };
  const setters: Record<string, (v: string) => void> = {
    name: setName, email: setEmail, password: setPassword, confirm: setConfirm,
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 14 }]}>
        <LinearGradient colors={["#0d1f16", "#0a0a0a"]} style={StyleSheet.absoluteFill} />
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.6)" />
        </Pressable>
        <View style={styles.headerContent}>
          <LinearGradient colors={["#1A9B63", "#2DB87A"]} style={styles.logoBox}>
            <Text style={{ fontSize: 22 }}>🌿</Text>
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSub}>Join Health Bite today</Text>
          </View>
        </View>
        <LinearGradient colors={["transparent", "#0A0A0A"]} style={styles.headerFade} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 32) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {fields.map((f) => (
          <View key={f.key} style={styles.fieldGroup}>
            <Text style={styles.label}>{f.label}</Text>
            <View style={[
              styles.inputWrapper,
              focusedField === f.key && styles.inputFocused,
              !!errors[f.key] && styles.inputErrorBorder,
            ]}>
              <Feather
                name={f.icon}
                size={16}
                color={focusedField === f.key ? "#fff" : "rgba(255,255,255,0.3)"}
                style={styles.inputIcon}
              />
              <TextInput
                ref={f.ref as any}
                style={styles.input}
                placeholder={f.placeholder}
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={values[f.key]}
                onChangeText={(t) => { setters[f.key]?.(t); setErrors({ ...errors, [f.key]: "" }); }}
                secureTextEntry={f.secure}
                keyboardType={f.keyboard}
                autoCapitalize={f.key === "name" ? "words" : "none"}
                autoCorrect={false}
                returnKeyType={f.key === "confirm" ? "done" : "next"}
                onFocus={() => setFocusedField(f.key)}
                onBlur={() => setFocusedField(null)}
                onSubmitEditing={f.next}
              />
            </View>
            {!!errors[f.key] && <Text style={styles.errorText}>{errors[f.key]}</Text>}
          </View>
        ))}

        <Pressable
          style={({ pressed }) => [styles.submitBtn, pressed && styles.btnPressed]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.submitText}>Create Account →</Text>}
        </Pressable>

        <Pressable style={styles.loginLink} onPress={() => router.replace("/(tabs)/login")}>
          <Text style={styles.loginLinkText}>
            Already have an account?{" "}
            <Text style={styles.loginLinkBold}>Sign In</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.background },
  header: {
    height: 160,
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
  },
  backBtn: {
    position: "absolute",
    left: 20,
    top: 0,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  headerSub: { color: "rgba(255,255,255,0.35)", fontSize: 13, fontFamily: "Inter_400Regular" },
  headerFade: { position: "absolute", bottom: 0, left: 0, right: 0, height: 40 },
  form: { padding: 24, paddingTop: 20 },
  fieldGroup: { marginBottom: 18 },
  label: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161616",
    borderRadius: colors.radius,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
    height: 52,
  },
  inputFocused: { borderColor: "rgba(255,255,255,0.7)" },
  inputErrorBorder: { borderColor: C.destructive },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: "#fff" },
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.destructive, marginTop: 5 },
  submitBtn: {
    backgroundColor: "#fff",
    borderRadius: colors.radius,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#000" },
  btnPressed: { opacity: 0.8 },
  loginLink: { marginTop: 22, alignItems: "center" },
  loginLinkText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.35)" },
  loginLinkBold: { fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.8)" },
});
