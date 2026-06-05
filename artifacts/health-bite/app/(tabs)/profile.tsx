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
import { useApp, type ActivityLevel, type Gender } from "@/context/AppContext";

const C = colors.light;

const ACTIVITY_OPTIONS: { key: ActivityLevel; label: string; desc: string }[] = [
  { key: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { key: "light", label: "Light", desc: "Exercise 1–3 days/week" },
  { key: "moderate", label: "Moderate", desc: "Exercise 3–5 days/week" },
  { key: "active", label: "Active", desc: "Hard exercise 6–7 days/week" },
  { key: "veryActive", label: "Very Active", desc: "Athlete or physical job" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { saveProfile } = useApp();

  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    const ageN = parseInt(age, 10);
    const weightN = parseFloat(weight);
    const heightN = parseFloat(height);

    if (!age || isNaN(ageN) || ageN < 10 || ageN > 100) {
      errs.age = "Enter a valid age (10–100)";
    }
    if (!weight || isNaN(weightN) || weightN < 20 || weightN > 300) {
      errs.weight = "Enter a valid weight in kg (20–300)";
    }
    if (!height || isNaN(heightN) || heightN < 100 || heightN > 250) {
      errs.height = "Enter a valid height in cm (100–250)";
    }
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
    });
    router.replace("/(tabs)/results");
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.headerBar, { paddingTop: topPad + 12 }]}>
        <Text style={styles.headerTitle}>Your Profile</Text>
        <Text style={styles.headerSub}>Tell us about yourself</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 28) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Info</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Age</Text>
              <View style={[styles.inputWrapper, errors.age ? styles.inputError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="25"
                  placeholderTextColor={C.mutedForeground}
                  value={age}
                  onChangeText={(t) => { setAge(t); setErrors({ ...errors, age: "" }); }}
                  keyboardType="number-pad"
                  returnKeyType="next"
                  maxLength={3}
                />
                <Text style={styles.unit}>yrs</Text>
              </View>
              {!!errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Weight</Text>
              <View style={[styles.inputWrapper, errors.weight ? styles.inputError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="70"
                  placeholderTextColor={C.mutedForeground}
                  value={weight}
                  onChangeText={(t) => { setWeight(t); setErrors({ ...errors, weight: "" }); }}
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                  maxLength={5}
                />
                <Text style={styles.unit}>kg</Text>
              </View>
              {!!errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Height</Text>
            <View style={[styles.inputWrapper, errors.height ? styles.inputError : null]}>
              <TextInput
                style={styles.input}
                placeholder="170"
                placeholderTextColor={C.mutedForeground}
                value={height}
                onChangeText={(t) => { setHeight(t); setErrors({ ...errors, height: "" }); }}
                keyboardType="decimal-pad"
                returnKeyType="done"
                maxLength={5}
              />
              <Text style={styles.unit}>cm</Text>
            </View>
            {!!errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gender</Text>
          <View style={styles.toggleRow}>
            {(["male", "female"] as Gender[]).map((g) => (
              <Pressable
                key={g}
                style={[styles.toggleBtn, gender === g && styles.toggleBtnActive]}
                onPress={async () => {
                  setGender(g);
                  await Haptics.selectionAsync();
                }}
              >
                <Feather
                  name={g === "male" ? "user" : "user"}
                  size={18}
                  color={gender === g ? "#fff" : C.mutedForeground}
                />
                <Text style={[styles.toggleText, gender === g && styles.toggleTextActive]}>
                  {g === "male" ? "Male" : "Female"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Level</Text>
          {ACTIVITY_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              style={[
                styles.activityOption,
                activityLevel === opt.key && styles.activityOptionActive,
              ]}
              onPress={async () => {
                setActivityLevel(opt.key);
                await Haptics.selectionAsync();
              }}
            >
              <View style={styles.activityDot}>
                {activityLevel === opt.key && (
                  <View style={styles.activityDotInner} />
                )}
              </View>
              <View style={styles.activityTextGroup}>
                <Text
                  style={[
                    styles.activityLabel,
                    activityLevel === opt.key && styles.activityLabelActive,
                  ]}
                >
                  {opt.label}
                </Text>
                <Text style={styles.activityDesc}>{opt.desc}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.submitBtn, pressed && styles.submitBtnPressed]}
          onPress={handleSubmit}
        >
          <LinearGradient
            colors={["#1A9B63", "#2DB87A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            <Text style={styles.submitText}>Calculate My Calories</Text>
            <Feather name="arrow-right" size={18} color="#fff" style={{ marginLeft: 8 }} />
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.background },
  headerBar: {
    backgroundColor: C.background,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: C.foreground,
  },
  headerSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.mutedForeground,
    marginTop: 3,
  },
  content: { padding: 20 },
  section: {
    backgroundColor: C.card,
    borderRadius: colors.radius,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: C.mutedForeground,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  row: { flexDirection: "row" },
  inputGroup: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: C.foreground,
    marginBottom: 7,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.background,
    borderRadius: colors.radius - 2,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    height: 48,
  },
  inputError: { borderColor: C.destructive },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: C.foreground,
  },
  unit: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: C.mutedForeground,
    marginLeft: 6,
  },
  errorText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: C.destructive,
    marginTop: 4,
  },
  toggleRow: { flexDirection: "row", gap: 10 },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: colors.radius - 2,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.background,
  },
  toggleBtnActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  toggleText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: C.mutedForeground,
  },
  toggleTextActive: { color: "#fff" },
  activityOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: colors.radius - 2,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.background,
    marginBottom: 8,
  },
  activityOptionActive: {
    borderColor: C.primary,
    backgroundColor: "#EBF8F2",
  },
  activityDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.primary,
  },
  activityTextGroup: { flex: 1 },
  activityLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: C.foreground,
  },
  activityLabelActive: { color: C.primary },
  activityDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: C.mutedForeground,
    marginTop: 1,
  },
  submitBtn: { marginTop: 8, borderRadius: colors.radius, overflow: "hidden" },
  submitBtnPressed: { opacity: 0.88 },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 0.2,
  },
});
