import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
import { useApp, type ActivityLevel, type Gender, type Goal } from "@/context/AppContext";
import { GOAL_INFO } from "@/utils/calories";

const C = colors.light;

const ACTIVITY_OPTIONS: { key: ActivityLevel; label: string; desc: string }[] = [
  { key: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { key: "light", label: "Light", desc: "Exercise 1–3 days/week" },
  { key: "moderate", label: "Moderate", desc: "Exercise 3–5 days/week" },
  { key: "active", label: "Active", desc: "Hard exercise 6–7 days/week" },
  { key: "veryActive", label: "Very Active", desc: "Athlete or physical job" },
];

const GOALS: Goal[] = ["lose", "maintain", "gain"];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { saveProfile } = useApp();

  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  function validate() {
    const errs: Record<string, string> = {};
    const ageN = parseInt(age, 10);
    const weightN = parseFloat(weight);
    const heightN = parseFloat(height);
    if (!age || isNaN(ageN) || ageN < 10 || ageN > 100) errs.age = "Enter a valid age (10–100)";
    if (!weight || isNaN(weightN) || weightN < 20 || weightN > 300) errs.weight = "Valid weight in kg";
    if (!height || isNaN(heightN) || heightN < 100 || heightN > 250) errs.height = "Valid height in cm";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await saveProfile({
      age: parseInt(age, 10),
      weight: parseFloat(weight),
      height: parseFloat(height),
      gender,
      activityLevel,
      goal,
    });
    router.replace("/(tabs)/results");
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.headerBar, { paddingTop: topPad + 14 }]}>
        <Text style={styles.headerTitle}>Your Profile</Text>
        <Text style={styles.headerSub}>Tell us about yourself</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 28) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Basic info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BASIC INFO</Text>

          <View style={styles.row}>
            {[
              { key: "age", label: "AGE", placeholder: "25", unit: "yrs", value: age, setter: setAge },
              { key: "weight", label: "WEIGHT", placeholder: "70", unit: "kg", value: weight, setter: setWeight },
            ].map((f) => (
              <View key={f.key} style={[styles.inputGroup, { flex: 1, marginRight: f.key === "age" ? 8 : 0, marginLeft: f.key === "weight" ? 8 : 0 }]}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <View style={[styles.inputWrapper, focusedField === f.key && styles.inputFocused, !!errors[f.key] && styles.inputErrorBorder]}>
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={f.value}
                    onChangeText={(t) => { f.setter(t); setErrors({ ...errors, [f.key]: "" }); }}
                    keyboardType="decimal-pad"
                    maxLength={5}
                    onFocus={() => setFocusedField(f.key)}
                    onBlur={() => setFocusedField(null)}
                  />
                  <Text style={styles.unit}>{f.unit}</Text>
                </View>
                {!!errors[f.key] && <Text style={styles.errorText}>{errors[f.key]}</Text>}
              </View>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>HEIGHT</Text>
            <View style={[styles.inputWrapper, focusedField === "height" && styles.inputFocused, !!errors.height && styles.inputErrorBorder]}>
              <TextInput
                style={styles.input}
                placeholder="170"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={height}
                onChangeText={(t) => { setHeight(t); setErrors({ ...errors, height: "" }); }}
                keyboardType="decimal-pad"
                maxLength={5}
                onFocus={() => setFocusedField("height")}
                onBlur={() => setFocusedField(null)}
              />
              <Text style={styles.unit}>cm</Text>
            </View>
            {!!errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
          </View>
        </View>

        {/* Gender */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>GENDER</Text>
          <View style={styles.toggleRow}>
            {(["male", "female"] as Gender[]).map((g) => (
              <Pressable
                key={g}
                style={[styles.toggleBtn, gender === g && styles.toggleBtnActive]}
                onPress={async () => { setGender(g); await Haptics.selectionAsync(); }}
              >
                <Feather name="user" size={16} color={gender === g ? "#000" : "rgba(255,255,255,0.4)"} />
                <Text style={[styles.toggleText, gender === g && styles.toggleTextActive]}>
                  {g === "male" ? "Male" : "Female"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Goal */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR GOAL</Text>
          <View style={styles.goalGrid}>
            {GOALS.map((g) => {
              const info = GOAL_INFO[g];
              const isActive = goal === g;
              return (
                <Pressable
                  key={g}
                  style={[styles.goalCard, isActive && styles.goalCardActive]}
                  onPress={async () => { setGoal(g); await Haptics.selectionAsync(); }}
                >
                  {isActive && (
                    <View style={styles.goalCheck}>
                      <Feather name="check" size={10} color="#000" />
                    </View>
                  )}
                  <Text style={styles.goalEmoji}>{info.emoji}</Text>
                  <Text
                    style={[styles.goalLabel, isActive && styles.goalLabelActive]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {info.shortLabel}
                  </Text>
                  <View style={[styles.goalDelta, isActive && styles.goalDeltaActive]}>
                    <Text style={[styles.goalDeltaText, isActive && styles.goalDeltaTextActive]}>{info.delta}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACTIVITY LEVEL</Text>
          {ACTIVITY_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              style={[styles.activityOption, activityLevel === opt.key && styles.activityOptionActive]}
              onPress={async () => { setActivityLevel(opt.key); await Haptics.selectionAsync(); }}
            >
              <View style={[styles.radio, activityLevel === opt.key && styles.radioActive]}>
                {activityLevel === opt.key && <View style={styles.radioInner} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.activityLabel, activityLevel === opt.key && styles.activityLabelActive]}>
                  {opt.label}
                </Text>
                <Text style={styles.activityDesc}>{opt.desc}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [styles.submitBtn, pressed && styles.submitBtnPressed]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>Calculate My Calories</Text>
          <Feather name="arrow-right" size={18} color="#000" style={{ marginLeft: 8 }} />
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.background },
  headerBar: {
    backgroundColor: C.background, paddingHorizontal: 24, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)",
  },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.35)", marginTop: 3 },
  content: { padding: 20 },
  section: {
    backgroundColor: C.card, borderRadius: colors.radius, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  sectionLabel: {
    color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2, marginBottom: 14,
  },
  row: { flexDirection: "row" },
  inputGroup: { marginBottom: 14 },
  fieldLabel: {
    color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8, marginBottom: 7,
  },
  inputWrapper: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#1E1E1E",
    borderRadius: colors.radius - 2, borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)", paddingHorizontal: 14, height: 48,
  },
  inputFocused: { borderColor: "rgba(255,255,255,0.6)" },
  inputErrorBorder: { borderColor: C.destructive },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: "#fff" },
  unit: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.3)", marginLeft: 6 },
  errorText: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.destructive, marginTop: 4 },
  toggleRow: { flexDirection: "row", gap: 10 },
  toggleBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 13, borderRadius: colors.radius - 2,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#1E1E1E",
  },
  toggleBtnActive: { backgroundColor: "#fff", borderColor: "#fff" },
  toggleText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.4)" },
  toggleTextActive: { color: "#000" },

  goalGrid: { flexDirection: "row", gap: 10 },
  goalCard: {
    flex: 1, borderRadius: colors.radius - 2, padding: 12, alignItems: "center",
    backgroundColor: "#1E1E1E", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)",
    position: "relative",
  },
  goalCardActive: { backgroundColor: "#fff", borderColor: "#fff" },
  goalEmoji: { fontSize: 22, marginBottom: 6 },
  goalLabel: { fontSize: 13, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.7)", textAlign: "center", marginBottom: 8 },
  goalLabelActive: { color: "#000" },
  goalDelta: {
    backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 10,
  },
  goalDeltaActive: { backgroundColor: "rgba(0,0,0,0.1)" },
  goalDeltaText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.5)" },
  goalDeltaTextActive: { color: "#000" },
  goalCheck: {
    position: "absolute", top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9, backgroundColor: C.accent,
    alignItems: "center", justifyContent: "center",
  },

  activityOption: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, paddingHorizontal: 12,
    borderRadius: colors.radius - 2, borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.08)", backgroundColor: "#1E1E1E", marginBottom: 8,
  },
  activityOptionActive: { borderColor: "rgba(255,255,255,0.5)", backgroundColor: "#242424" },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  radioActive: { borderColor: "#fff" },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff" },
  activityLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.5)" },
  activityLabelActive: { color: "#fff" },
  activityDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.3)", marginTop: 1 },

  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff", borderRadius: colors.radius, height: 54, marginTop: 8,
  },
  submitBtnPressed: { opacity: 0.85 },
  submitText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#000" },
});
