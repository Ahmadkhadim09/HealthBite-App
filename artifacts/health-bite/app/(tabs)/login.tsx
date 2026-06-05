import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  function validate() {
    let ok = true;
    if (!validateEmail(email)) { setEmailError("Enter a valid email address"); ok = false; }
    else setEmailError("");
    if (password.length < 6) { setPasswordError("Password must be at least 6 characters"); ok = false; }
    else setPasswordError("");
    return ok;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await login(email.trim());
      const profileVal = await AsyncStorage.getItem("userProfile");
      router.replace(profileVal ? "/(tabs)/results" : "/(tabs)/profile");
    } finally {
      setLoading(false);
    }
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Image/brand header */}
      <View style={[styles.headerArea, { paddingTop: topPad }]}>
        <LinearGradient
          colors={["#0d1f16", "#0a0a0a"]}
          style={StyleSheet.absoluteFill}
        />
        {/* Grid lines */}
        <View style={styles.gridPattern} />

        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.6)" />
        </Pressable>

        <View style={styles.headerContent}>
          <LinearGradient colors={["#1A9B63", "#2DB87A"]} style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </LinearGradient>
          <Text style={styles.appName}>Health Bite</Text>
        </View>

        {/* Fade to background */}
        <LinearGradient
          colors={["transparent", "#0A0A0A"]}
          style={styles.headerFade}
        />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.form,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 28) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        {/* Email */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>EMAIL</Text>
          <View style={[styles.inputWrapper, focusedField === "email" && styles.inputFocused, !!emailError && styles.inputErrorBorder]}>
            <Feather name="mail" size={16} color={focusedField === "email" ? "#fff" : "rgba(255,255,255,0.3)"} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="rgba(255,255,255,0.2)"
              value={email}
              onChangeText={(t) => { setEmail(t); setEmailError(""); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          </View>
          {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
        </View>

        {/* Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>PASSWORD</Text>
          <View style={[styles.inputWrapper, focusedField === "password" && styles.inputFocused, !!passwordError && styles.inputErrorBorder]}>
            <Feather name="lock" size={16} color={focusedField === "password" ? "#fff" : "rgba(255,255,255,0.3)"} style={styles.inputIcon} />
            <TextInput
              ref={passwordRef}
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.2)"
              value={password}
              onChangeText={(t) => { setPassword(t); setPasswordError(""); }}
              secureTextEntry
              returnKeyType="done"
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              onSubmitEditing={handleLogin}
            />
          </View>
          {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
        </View>

        {/* Sign In */}
        <Pressable
          style={({ pressed }) => [styles.signInBtn, pressed && styles.btnPressed]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.signInText}>Sign In</Text>}
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Create account */}
        <Pressable
          style={({ pressed }) => [styles.outlineBtn, pressed && styles.btnPressed]}
          onPress={() => router.replace("/(tabs)/signup")}
        >
          <Feather name="user-plus" size={16} color="rgba(255,255,255,0.7)" style={{ marginRight: 8 }} />
          <Text style={styles.outlineBtnText}>Create New Account</Text>
        </Pressable>

        <Text style={styles.hint}>Any valid email · 6+ character password</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.background },
  headerArea: {
    height: 200,
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
  },
  gridPattern: {
    position: "absolute",
    inset: 0,
    opacity: 0.06,
  } as any,
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
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: { fontSize: 26 },
  appName: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  headerFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  form: { padding: 24, paddingTop: 20 },
  title: { color: "#fff", fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 4, letterSpacing: -0.4 },
  subtitle: { color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 28 },
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
  signInBtn: {
    backgroundColor: "#fff",
    borderRadius: colors.radius,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  signInText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#000" },
  btnPressed: { opacity: 0.8 },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  dividerLabel: { color: "rgba(255,255,255,0.2)", fontSize: 12, fontFamily: "Inter_400Regular" },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: colors.radius,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    height: 54,
    backgroundColor: "#161616",
  },
  outlineBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.7)" },
  hint: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 22,
  },
});
