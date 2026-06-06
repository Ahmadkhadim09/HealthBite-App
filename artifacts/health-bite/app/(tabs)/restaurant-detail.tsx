import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "@/constants/colors";

const C = colors.light;

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(Number(rating));
  return (
    <View style={{ flexDirection: "row", gap: 3 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Feather key={i} name="star" size={14} color={i < full ? "#F59E0B" : "rgba(255,255,255,0.15)"} />
      ))}
    </View>
  );
}


export default function RestaurantDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    restaurant: string;
    mealName: string;
    thumbnail: string;
    calories: string;
    rating: string;
    isNearby: string;
    isRegistered: string;
    phone: string;
    website: string;
    address: string;
    city: string;
    cuisine: string;
    description: string;
    priceRange: string;
    hours: string;
    lat: string;
    lon: string;
  }>();

  const rating = parseFloat(params.rating ?? "4");
  const calories = parseInt(params.calories ?? "500", 10);
  const isRegistered = params.isRegistered === "true";
  const isNearby = params.isNearby === "true";

  const hasPhone = !!params.phone;
  const hasWebsite = !!params.website;
  const hasCoords = !!params.lat && !!params.lon;

  async function openWebsite() {
    if (!hasWebsite) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let url = params.website!;
    if (!url.startsWith("http")) url = `https://${url}`;
    await Linking.openURL(url);
  }

  async function callPhone() {
    if (!hasPhone) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Linking.openURL(`tel:${params.phone}`);
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 28);

  return (
    <View style={styles.flex}>
      {/* Hero image */}
      <View style={styles.heroArea}>
        <Image
          source={{ uri: params.thumbnail }}
          style={StyleSheet.absoluteFill as any}
          contentFit="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.0)", "#0A0A0A"]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Back button */}
        <Pressable
          style={[styles.backBtn, { top: topPad + 10 }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>

        {/* Badges */}
        <View style={styles.heroBadges}>
          {isRegistered && (
            <View style={styles.partnerBadge}>
              <Feather name="shield" size={11} color={C.accent} />
              <Text style={styles.partnerText}>Partner</Text>
            </View>
          )}
          {isNearby && (
            <View style={styles.nearbyBadge}>
              <Feather name="map-pin" size={11} color="#fff" />
              <Text style={styles.nearbyText}>Nearby</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingBottom: botPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant name & meta */}
        <View style={styles.nameRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.restaurantName}>{params.restaurant}</Text>
            {params.cuisine ? (
              <Text style={styles.cuisineLabel}>{params.cuisine}</Text>
            ) : null}
          </View>
          {params.priceRange ? (
            <View style={styles.pricePill}>
              <Text style={styles.priceText}>{params.priceRange}</Text>
            </View>
          ) : null}
        </View>

        {/* Rating row */}
        <View style={styles.ratingRow}>
          <StarRating rating={rating} />
          <Text style={styles.ratingNum}>{rating.toFixed(1)}</Text>
          {params.hours ? (
            <>
              <View style={styles.dot} />
              <Feather name="clock" size={13} color="rgba(255,255,255,0.3)" />
              <Text style={styles.hoursText}>{params.hours}</Text>
            </>
          ) : null}
        </View>

        {/* Calorie card */}
        <View style={styles.calorieCard}>
          <View style={styles.calorieLeft}>
            <Feather name="zap" size={18} color={C.accent} />
            <View>
              <Text style={styles.calorieNum}>{calories} kcal</Text>
              <Text style={styles.calorieDesc}>Estimated per meal</Text>
            </View>
          </View>
          <View style={styles.mealPill}>
            <Text style={styles.mealPillText} numberOfLines={2}>{params.mealName}</Text>
          </View>
        </View>

        {/* Description */}
        {params.description ? (
          <View style={styles.descCard}>
            <Text style={styles.descTitle}>About</Text>
            <Text style={styles.descText}>{params.description}</Text>
          </View>
        ) : null}

        {/* Address info */}
        {(params.address || params.city) ? (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Feather name="map-pin" size={15} color={C.accent} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                {[params.address, params.city].filter(Boolean).join(", ")}
              </Text>
            </View>
            {hasPhone && (
              <View style={styles.infoRow}>
                <Feather name="phone" size={15} color={C.accent} style={styles.infoIcon} />
                <Text style={styles.infoText}>{params.phone}</Text>
              </View>
            )}
            {hasWebsite && (
              <View style={styles.infoRow}>
                <Feather name="link" size={15} color={C.accent} style={styles.infoIcon} />
                <Text style={styles.infoText} numberOfLines={1}>{params.website}</Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Website CTA */}
        {hasWebsite ? (
          <Pressable
            style={({ pressed }) => [styles.websiteBtn, pressed && styles.websiteBtnPressed]}
            onPress={openWebsite}
          >
            <View style={styles.websiteBtnInner}>
              <View style={styles.websiteBtnIcon}>
                <Feather name="globe" size={20} color="#000" />
              </View>
              <View style={styles.websiteBtnText}>
                <Text style={styles.websiteBtnLabel}>Visit Website</Text>
                <Text style={styles.websiteBtnUrl} numberOfLines={1}>
                  {params.website!.replace(/^https?:\/\//, "")}
                </Text>
              </View>
            </View>
            <Feather name="arrow-up-right" size={18} color="rgba(0,0,0,0.5)" />
          </Pressable>
        ) : (
          <View style={styles.noWebsiteBox}>
            <Feather name="globe" size={16} color="rgba(255,255,255,0.15)" />
            <Text style={styles.noWebsiteText}>No website listed for this restaurant</Text>
          </View>
        )}

        {/* Call button (secondary) */}
        {hasPhone && (
          <Pressable
            style={({ pressed }) => [styles.callBtn, pressed && styles.callBtnPressed]}
            onPress={callPhone}
          >
            <Feather name="phone" size={16} color={C.accent} />
            <Text style={styles.callBtnText}>{params.phone}</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.background },
  heroArea: { height: 260, position: "relative" },
  backBtn: {
    position: "absolute", left: 18, zIndex: 10,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center",
  },
  heroBadges: {
    position: "absolute", bottom: 16, left: 18, flexDirection: "row", gap: 8,
  },
  partnerBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(45,184,122,0.2)", borderWidth: 1, borderColor: C.accent,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  partnerText: { fontSize: 11, fontFamily: "Inter_700Bold", color: C.accent },
  nearbyBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  nearbyText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },

  content: { padding: 20 },
  nameRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  restaurantName: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.4, lineHeight: 32 },
  cuisineLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.accent, marginTop: 3 },
  pricePill: {
    backgroundColor: "#1C1C1C", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", marginLeft: 12, marginTop: 4,
  },
  priceText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },

  ratingRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 18 },
  ratingNum: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.5)" },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)" },
  hoursText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.35)" },

  calorieCard: {
    backgroundColor: "rgba(45,184,122,0.1)", borderRadius: colors.radius,
    borderWidth: 1, borderColor: "rgba(45,184,122,0.25)",
    padding: 16, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 14,
  },
  calorieLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  calorieNum: { fontSize: 20, fontFamily: "Inter_700Bold", color: C.accent },
  calorieDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.35)", marginTop: 2 },
  mealPill: { flex: 1, maxWidth: 140, marginLeft: 12 },
  mealPillText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.7)", textAlign: "right" },

  descCard: {
    backgroundColor: C.card, borderRadius: colors.radius,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    padding: 16, marginBottom: 14,
  },
  descTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.4)", marginBottom: 8 },
  descText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", lineHeight: 21 },

  infoCard: {
    backgroundColor: C.card, borderRadius: colors.radius,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    padding: 16, marginBottom: 20, gap: 12,
  },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoIcon: { marginRight: 12, width: 20 },
  infoText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)" },

  websiteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", borderRadius: colors.radius + 2,
    padding: 16, marginBottom: 12,
    shadowColor: "#fff", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 6,
  },
  websiteBtnPressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  websiteBtnInner: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  websiteBtnIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.08)", alignItems: "center", justifyContent: "center",
  },
  websiteBtnText: { flex: 1 },
  websiteBtnLabel: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#000" },
  websiteBtnUrl: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(0,0,0,0.4)", marginTop: 2 },

  noWebsiteBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#161616", borderRadius: colors.radius,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  noWebsiteText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.25)" },

  callBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "rgba(45,184,122,0.08)",
    borderWidth: 1.5, borderColor: "rgba(45,184,122,0.25)",
    borderRadius: colors.radius, height: 50,
  },
  callBtnPressed: { opacity: 0.8 },
  callBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.accent },
});
