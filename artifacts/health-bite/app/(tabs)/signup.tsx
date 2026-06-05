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

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
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

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#1A9B63", "#2DB87A", "#4ED49A"]}
        style={[styles.header, { paddingTop: topPad + 20 }]}
      >
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
        <View style={styles.logoCircle}>
          <Feather name="user-plus" size={30} color="#fff" />
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Health Bite today</Text>
      </LinearGradient>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.form,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 28) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Field
          label="Full Name"
          icon="user"
          placeholder="John Doe"
          value={name}
          onChangeText={(t) => { setName(t); setErrors({ ...errors, name: "" }); }}
          error={errors.name}
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          autoCapitalize="words"
        />
        <Field
          ref={emailRef}
          label="Email"
          icon="mail"
          placeholder="you@example.com"
          value={email}
          onChangeText={(t) => { setEmail(t); setErrors({ ...errors, email: "" }); }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <Field
          ref={passwordRef}
          label="Password"
          icon="lock"
          placeholder="Min 6 characters"
          value={password}
          onChangeText={(t) => { setPassword(t); setErrors({ ...errors, password: "" }); }}
          error={errors.password}
          secureTextEntry
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <Field
          ref={confirmRef}
          label="Confirm Password"
          icon="check-circle"
          placeholder="Re-enter password"
          value={confirm}
          onChangeText={(t) => { setConfirm(t); setErrors({ ...errors, confirm: "" }); }}
          error={errors.confirm}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleSignUp}
        />

        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Create Account</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.loginLink}
          onPress={() => router.back()}
        >
          <Text style={styles.loginLinkText}>
            Already have an account?{" "}
            <Text style={styles.loginLinkBold}>Sign In</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface FieldProps {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: React.ComponentProps<typeof TextInput>["keyboardType"];
  autoCapitalize?: React.ComponentProps<typeof TextInput>["autoCapitalize"];
  returnKeyType?: React.ComponentProps<typeof TextInput>["returnKeyType"];
  onSubmitEditing?: () => void;
}

const Field = React.forwardRef<TextInput, FieldProps>(function Field(
  { label, icon, placeholder, value, onChangeText, error, secureTextEntry, keyboardType, autoCapitalize, returnKeyType, onSubmitEditing },
  ref,
) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <Feather name={icon} size={18} color={C.mutedForeground} style={styles.inputIcon} />
        <TextInput
          ref={ref}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={C.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? "none"}
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
        />
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.background },
  header: {
    paddingBottom: 36,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    left: 20,
    top: 0,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.82)",
    marginTop: 5,
    textAlign: "center",
  },
  form: { padding: 24, paddingTop: 28 },
  fieldGroup: { marginBottom: 18 },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: C.foreground,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: colors.radius,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputError: { borderColor: C.destructive },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: C.foreground,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: C.destructive,
    marginTop: 5,
  },
  btn: {
    backgroundColor: C.primary,
    borderRadius: colors.radius,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  btnPressed: { opacity: 0.85 },
  btnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  loginLink: { marginTop: 22, alignItems: "center" },
  loginLinkText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.mutedForeground,
  },
  loginLinkBold: {
    fontFamily: "Inter_700Bold",
    color: C.primary,
  },
});
