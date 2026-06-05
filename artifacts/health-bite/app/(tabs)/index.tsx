import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
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
  const [checking, setChecking] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    void checkAutoLogin();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  async function checkAutoLogin() {
    try {
      const [loginVal, profileVal] = await Promise.all([
        AsyncStorage.getItem("isLoggedIn"),
        AsyncStorage.getItem("userProfile"),
      ]);
      if (loginVal === "true") {
        router.replace(profileVal ? "/(tabs)/results" : "/(tabs)/profile");
        return;
      }
    } catch {
      // ignore
    } finally {
      setChecking(false);
    }
  }

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

  if (checking) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 20);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#1A9B63", "#2DB87A", "#4ED49A"]}
        style={[styles.header, { paddingTop: topPad }]}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: "center" }}>
          <View style={styles.logoCircle}>
            <Feather name="activity" size={36} color="#fff" />
          </View>
          <Text style={styles.appName}>Health Bite</Text>
          <Text style={styles.tagline}>Your personal nutrition guide</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.formContainer,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.subText}>Sign in to continue your journey</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
              <Feather name="mail" size={18} color={C.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={C.mutedForeground}
                value={email}
                onChangeText={(t) => { setEmail(t); setEmailError(""); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
            {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrapper, passwordError ? styles.inputError : null]}>
              <Feather name="lock" size={18} color={C.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={C.mutedForeground}
                value={password}
                onChangeText={(t) => { setPassword(t); setPasswordError(""); }}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>
            {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
          </View>

          <Pressable
            style={({ pressed }) => [styles.loginBtn, pressed && styles.loginBtnPressed]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Sign In</Text>}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={({ pressed }) => [styles.signUpBtn, pressed && styles.signUpBtnPressed]}
            onPress={() => router.push("/(tabs)/signup")}
          >
            <Feather name="user-plus" size={18} color={C.primary} style={{ marginRight: 8 }} />
            <Text style={styles.signUpBtnText}>Create New Account</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.background },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.background },
  header: { paddingBottom: 40, paddingHorizontal: 32, alignItems: "center" },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  appName: { fontSize: 34, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center", letterSpacing: -0.5 },
  tagline: { fontSize: 15, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)", textAlign: "center", marginTop: 6 },
  formContainer: { padding: 24, paddingTop: 32 },
  welcomeText: { fontSize: 26, fontFamily: "Inter_700Bold", color: C.foreground, marginBottom: 4 },
  subText: { fontSize: 15, fontFamily: "Inter_400Regular", color: C.mutedForeground, marginBottom: 28 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.foreground, marginBottom: 8, letterSpacing: 0.3 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderRadius: colors.radius,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, height: 52,
  },
  inputError: { borderColor: C.destructive },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: C.foreground },
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.destructive, marginTop: 5 },
  loginBtn: {
    backgroundColor: C.primary, borderRadius: colors.radius,
    height: 54, alignItems: "center", justifyContent: "center",
    marginTop: 8,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  loginBtnPressed: { opacity: 0.85 },
  loginBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.3 },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 20, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.mutedForeground },
  signUpBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: colors.radius, borderWidth: 1.5, borderColor: C.primary,
    height: 54, backgroundColor: C.card,
  },
  signUpBtnPressed: { opacity: 0.8 },
  signUpBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.primary },
});
