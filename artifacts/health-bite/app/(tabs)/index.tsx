import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "@/constants/colors";

const C = colors.light;
const ICONS = ["🥗", "🍱", "🥩", "🥦", "🍣", "🥑", "🍗", "🫐", "🥕", "🍎"];

function FloatingIcon({
  icon,
  anim,
  left,
  bottom,
  size,
  delay,
}: {
  icon: string;
  anim: Animated.Value;
  left: string;
  bottom: number;
  size: number;
  delay: number;
}) {
  const opacity = anim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 0.22, 0.22, 0],
  });
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -280],
  });
  return (
    <Animated.Text
      style={{
        position: "absolute",
        bottom,
        left: left as any,
        fontSize: size,
        opacity,
        transform: [{ translateY }],
      }}
    >
      {icon}
    </Animated.Text>
  );
}

export default function LandingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const floatAnims = useRef(ICONS.map(() => new Animated.Value(0))).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    void checkAutoLogin();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
    ]).start();

    floatAnims.forEach((anim, i) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(i * 700),
          Animated.timing(anim, {
            toValue: 1,
            duration: 4000 + i * 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      );
      loop.start();
    });
  }, []);

  async function checkAutoLogin() {
    try {
      const [loginVal, profileVal] = await Promise.all([
        AsyncStorage.getItem("isLoggedIn"),
        AsyncStorage.getItem("userProfile"),
      ]);
      if (loginVal === "true") {
        router.replace(profileVal ? "/(tabs)/results" : "/(tabs)/profile");
      }
    } catch {
      // ignore, stay on landing
    }
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={["#0d1f16", "#080808", "#050505"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Glow circles */}
      <View style={[styles.glowCircle, { top: -60, left: -80, width: 280, height: 280 }]} />
      <View style={[styles.glowCircle, { bottom: 80, right: -80, width: 220, height: 220, opacity: 0.07 }]} />

      {/* Floating food icons */}
      {ICONS.map((icon, i) => (
        <FloatingIcon
          key={i}
          icon={icon}
          anim={floatAnims[i]!}
          left={`${(i * 31 + 5) % 85}%`}
          bottom={-20}
          size={i % 3 === 0 ? 30 : 22}
          delay={i * 700}
        />
      ))}

      {/* Grid pattern overlay */}
      <View style={styles.gridOverlay} />

      {/* Top bar — Login + Sign Up */}
      <Animated.View style={[styles.topBar, { paddingTop: topPad + 14, opacity: fadeAnim }]}>
        <Text style={styles.topBrand}>Health Bite</Text>
        <View style={styles.topBtns}>
          <Pressable
            style={styles.topLoginBtn}
            onPress={async () => {
              await Haptics.selectionAsync();
              router.push("/(tabs)/login");
            }}
          >
            <Text style={styles.topLoginText}>Login</Text>
          </Pressable>
          <Pressable
            style={styles.topSignUpBtn}
            onPress={async () => {
              await Haptics.selectionAsync();
              router.push("/(tabs)/signup");
            }}
          >
            <Text style={styles.topSignUpText}>Sign Up</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* Hero */}
      <Animated.View style={[styles.hero, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.logoBox, { transform: [{ scale: logoScale }] }]}>
          <LinearGradient colors={["#1A9B63", "#2DB87A"]} style={styles.logoGradient}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.heroTitle}>Eat Smart.{"\n"}Feel Great.</Text>
        <Text style={styles.heroSub}>
          Personalized calorie goals matched to{"\n"}real restaurants near you
        </Text>

        {/* Feature pills */}
        <View style={styles.pillsRow}>
          {["📍 Location-based", "🔥 Calorie-smart", "⭐ Rated meals"].map((f) => (
            <View key={f} style={styles.pill}>
              <Text style={styles.pillText}>{f}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Bottom CTA */}
      <Animated.View style={[styles.bottomArea, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 28), opacity: fadeAnim }]}>
        <Pressable
          style={({ pressed }) => [styles.ctaBtn, pressed && styles.ctaBtnPressed]}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/(tabs)/signup");
          }}
        >
          <Text style={styles.ctaBtnText}>Get Started →</Text>
        </Pressable>
        <Text style={styles.ctaHint}>Free · No credit card required</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808" },
  glowCircle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "#2DB87A",
    opacity: 0.12,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
    backgroundColor: "transparent",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingBottom: 12,
  },
  topBrand: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
  topBtns: { flexDirection: "row", gap: 8 },
  topLoginBtn: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  topLoginText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  topSignUpBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  topSignUpText: { color: "#000", fontSize: 13, fontFamily: "Inter_700Bold" },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  logoBox: {
    width: 84,
    height: 84,
    borderRadius: 26,
    marginBottom: 28,
    shadowColor: "#2DB87A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  logoGradient: {
    width: 84,
    height: 84,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: { fontSize: 38 },
  heroTitle: {
    color: "#fff",
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: -1,
    lineHeight: 46,
    marginBottom: 14,
  },
  heroSub: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  pill: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "Inter_500Medium" },
  bottomArea: { paddingHorizontal: 24 },
  ctaBtn: {
    backgroundColor: "#fff",
    borderRadius: colors.radius,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  ctaBtnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  ctaBtnText: { color: "#000", fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.2 },
  ctaHint: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
