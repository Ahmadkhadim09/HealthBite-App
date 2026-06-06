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

const C = colors.light;

const CUISINES = ["Pakistani", "Indian", "Chinese", "Italian", "American", "Arabic", "Fast Food", "BBQ", "Seafood", "Other"];
const PRICE_RANGES = ["$", "$$", "$$$", "$$$$"];

export interface RegisteredRestaurant {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  city: string;
  phone: string;
  website: string;
  description: string;
  priceRange: string;
  hours: string;
  registeredAt: string;
}

export const REGISTERED_KEY = "registeredRestaurants";

export default function RestaurantRegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [priceRange, setPriceRange] = useState("$$");
  const [hours, setHours] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const addressRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const websiteRef = useRef<TextInput>(null);
  const hoursRef = useRef<TextInput>(null);

  function validate() {
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Restaurant name is required";
    if (!cuisine) errs.cuisine = "Select a cuisine type";
    if (address.trim().length < 5) errs.address = "Enter a valid address";
    if (city.trim().length < 2) errs.city = "Enter your city";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const existing = await AsyncStorage.getItem(REGISTERED_KEY);
      const list: RegisteredRestaurant[] = existing ? JSON.parse(existing) : [];
      const newEntry: RegisteredRestaurant = {
        id: `reg_${Date.now()}`,
        name: name.trim(),
        cuisine,
        address: address.trim(),
        city: city.trim(),
        phone: phone.trim(),
        website: website.trim(),
        description: description.trim(),
        priceRange,
        hours: hours.trim(),
        registeredAt: new Date().toISOString(),
      };
      list.unshift(newEntry);
      await AsyncStorage.setItem(REGISTERED_KEY, JSON.stringify(list));
      setSuccess(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } finally {
      setLoading(false);
    }
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 28);

  if (success) {
    return (
      <View style={[styles.flex, styles.successScreen]}>
        <View style={styles.successIcon}>
          <LinearGradient colors={["#1A9B63", "#2DB87A"]} style={styles.successGradient}>
            <Feather name="check" size={36} color="#fff" />
          </LinearGradient>
        </View>
        <Text style={styles.successTitle}>Restaurant Registered!</Text>
        <Text style={styles.successSub}>
          <Text style={{ color: "#fff", fontFamily: "Inter_700Bold" }}>{name}</Text>
          {" "}is now listed and will appear in calorie-matched results for users near {city}.
        </Text>
        <Pressable
          style={styles.successBtn}
          onPress={() => router.replace("/(tabs)/results")}
        >
          <Text style={styles.successBtnText}>View in Results →</Text>
        </Pressable>
        <Pressable style={styles.successSecondary} onPress={() => {
          setName(""); setCuisine(""); setAddress(""); setCity(""); setPhone("");
          setWebsite(""); setDescription(""); setHours(""); setSuccess(false);
        }}>
          <Text style={styles.successSecondaryText}>Register Another</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 14 }]}>
        <LinearGradient colors={["#0d1f16", "#0a0a0a"]} style={StyleSheet.absoluteFill} />
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.6)" />
        </Pressable>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Feather name="map-pin" size={22} color={C.accent} />
          </View>
          <View>
            <Text style={styles.headerTitle}>List Your Restaurant</Text>
            <Text style={styles.headerSub}>Reach calorie-conscious customers near you</Text>
          </View>
        </View>
        <LinearGradient colors={["transparent", "#0A0A0A"]} style={styles.headerFade} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.form, { paddingBottom: botPad }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Required info */}
        <Text style={styles.sectionLabel}>RESTAURANT INFO</Text>
        <View style={styles.card}>
          {/* Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>RESTAURANT NAME *</Text>
            <View style={[styles.inputWrapper, focusedField === "name" && styles.inputFocused, !!errors.name && styles.inputErrorBorder]}>
              <Feather name="home" size={15} color={focusedField === "name" ? "#fff" : "rgba(255,255,255,0.3)"} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Lahori Karahi House"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={name}
                onChangeText={(t) => { setName(t); setErrors({ ...errors, name: "" }); }}
                returnKeyType="next"
                onSubmitEditing={() => addressRef.current?.focus()}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Cuisine */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>CUISINE TYPE *</Text>
            <View style={styles.chipsWrap}>
              {CUISINES.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.chip, cuisine === c && styles.chipActive]}
                  onPress={async () => { setCuisine(c); setErrors({ ...errors, cuisine: "" }); await Haptics.selectionAsync(); }}
                >
                  <Text style={[styles.chipText, cuisine === c && styles.chipTextActive]}>{c}</Text>
                </Pressable>
              ))}
            </View>
            {!!errors.cuisine && <Text style={styles.errorText}>{errors.cuisine}</Text>}
          </View>

          {/* Address */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>STREET ADDRESS *</Text>
            <View style={[styles.inputWrapper, focusedField === "address" && styles.inputFocused, !!errors.address && styles.inputErrorBorder]}>
              <Feather name="map-pin" size={15} color={focusedField === "address" ? "#fff" : "rgba(255,255,255,0.3)"} style={styles.inputIcon} />
              <TextInput
                ref={addressRef}
                style={styles.input}
                placeholder="Street address"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={address}
                onChangeText={(t) => { setAddress(t); setErrors({ ...errors, address: "" }); }}
                returnKeyType="next"
                onSubmitEditing={() => cityRef.current?.focus()}
                onFocus={() => setFocusedField("address")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {!!errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          {/* City */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>CITY *</Text>
            <View style={[styles.inputWrapper, focusedField === "city" && styles.inputFocused, !!errors.city && styles.inputErrorBorder]}>
              <Feather name="globe" size={15} color={focusedField === "city" ? "#fff" : "rgba(255,255,255,0.3)"} style={styles.inputIcon} />
              <TextInput
                ref={cityRef}
                style={styles.input}
                placeholder="e.g. Lahore"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={city}
                onChangeText={(t) => { setCity(t); setErrors({ ...errors, city: "" }); }}
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                onFocus={() => setFocusedField("city")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {!!errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
          </View>
        </View>

        {/* Contact */}
        <Text style={styles.sectionLabel}>CONTACT & LINKS</Text>
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
            <View style={[styles.inputWrapper, focusedField === "phone" && styles.inputFocused]}>
              <Feather name="phone" size={15} color={focusedField === "phone" ? "#fff" : "rgba(255,255,255,0.3)"} style={styles.inputIcon} />
              <TextInput
                ref={phoneRef}
                style={styles.input}
                placeholder="+92 300 0000000"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => websiteRef.current?.focus()}
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>WEBSITE / SOCIAL LINK</Text>
            <View style={[styles.inputWrapper, focusedField === "website" && styles.inputFocused]}>
              <Feather name="link" size={15} color={focusedField === "website" ? "#fff" : "rgba(255,255,255,0.3)"} style={styles.inputIcon} />
              <TextInput
                ref={websiteRef}
                style={styles.input}
                placeholder="https://yourrestaurant.com"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={website}
                onChangeText={setWebsite}
                keyboardType="url"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => hoursRef.current?.focus()}
                onFocus={() => setFocusedField("website")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>
        </View>

        {/* Extra details */}
        <Text style={styles.sectionLabel}>EXTRA DETAILS</Text>
        <View style={styles.card}>
          {/* Price range */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PRICE RANGE</Text>
            <View style={styles.priceRow}>
              {PRICE_RANGES.map((p) => (
                <Pressable
                  key={p}
                  style={[styles.priceBtn, priceRange === p && styles.priceBtnActive]}
                  onPress={async () => { setPriceRange(p); await Haptics.selectionAsync(); }}
                >
                  <Text style={[styles.priceBtnText, priceRange === p && styles.priceBtnTextActive]}>{p}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Hours */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>OPENING HOURS</Text>
            <View style={[styles.inputWrapper, focusedField === "hours" && styles.inputFocused]}>
              <Feather name="clock" size={15} color={focusedField === "hours" ? "#fff" : "rgba(255,255,255,0.3)"} style={styles.inputIcon} />
              <TextInput
                ref={hoursRef}
                style={styles.input}
                placeholder="e.g. Mon–Sat 11am–11pm"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={hours}
                onChangeText={setHours}
                returnKeyType="next"
                onFocus={() => setFocusedField("hours")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>SHORT DESCRIPTION</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper, focusedField === "desc" && styles.inputFocused]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell customers what makes your restaurant special…"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                onFocus={() => setFocusedField("desc")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>
        </View>

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [styles.submitBtn, pressed && styles.submitBtnPressed]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <>
                <Feather name="check-circle" size={18} color="#000" style={{ marginRight: 8 }} />
                <Text style={styles.submitText}>Register Restaurant</Text>
              </>}
        </Pressable>

        <Text style={styles.footNote}>
          Your restaurant will appear in Health Bite recommendations for users in your city.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.background },
  header: { height: 160, position: "relative", overflow: "hidden", flexShrink: 0 },
  backBtn: {
    position: "absolute", left: 20, top: 0, zIndex: 10,
    width: 40, height: 40, alignItems: "center", justifyContent: "center",
  },
  headerContent: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14 },
  headerIcon: {
    width: 50, height: 50, borderRadius: 16, backgroundColor: "rgba(45,184,122,0.15)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(45,184,122,0.3)",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  headerFade: { position: "absolute", bottom: 0, left: 0, right: 0, height: 40 },

  form: { padding: 20 },
  sectionLabel: {
    color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2, marginBottom: 10, marginTop: 6,
  },
  card: {
    backgroundColor: C.card, borderRadius: colors.radius, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8, marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1E1E1E", borderRadius: colors.radius - 2,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14, height: 48,
  },
  inputFocused: { borderColor: "rgba(255,255,255,0.6)" },
  inputErrorBorder: { borderColor: C.destructive },
  textAreaWrapper: { height: "auto" as any, paddingVertical: 12, alignItems: "flex-start" },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: "#fff" },
  textArea: { height: 70, textAlignVertical: "top" },
  errorText: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.destructive, marginTop: 4 },

  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#1E1E1E",
  },
  chipActive: { backgroundColor: "#fff", borderColor: "#fff" },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.5)" },
  chipTextActive: { color: "#000", fontFamily: "Inter_700Bold" },

  priceRow: { flexDirection: "row", gap: 10 },
  priceBtn: {
    flex: 1, height: 44, alignItems: "center", justifyContent: "center",
    borderRadius: colors.radius - 2, borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#1E1E1E",
  },
  priceBtnActive: { backgroundColor: "#fff", borderColor: "#fff" },
  priceBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.4)" },
  priceBtnTextActive: { color: "#000" },

  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff", borderRadius: colors.radius, height: 54, marginTop: 8,
  },
  submitBtnPressed: { opacity: 0.85 },
  submitText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#000" },
  footNote: {
    textAlign: "center", color: "rgba(255,255,255,0.2)",
    fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 16,
  },

  successScreen: { alignItems: "center", justifyContent: "center", padding: 32 },
  successIcon: { marginBottom: 24, shadowColor: C.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 24 },
  successGradient: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 12 },
  successSub: {
    fontSize: 15, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)",
    textAlign: "center", lineHeight: 22, marginBottom: 32,
  },
  successBtn: {
    backgroundColor: "#fff", borderRadius: colors.radius, height: 54,
    paddingHorizontal: 40, alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  successBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#000" },
  successSecondary: { paddingVertical: 12 },
  successSecondaryText: { fontSize: 14, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.35)" },
});
