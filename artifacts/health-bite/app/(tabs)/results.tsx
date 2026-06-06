import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import {
  calculateTDEE,
  getCaloriesForMeal,
  getMealCategory,
  getMealNameForCuisine,
  getRatingForMeal,
  FOOD_THUMBNAILS,
  RESTAURANT_NAMES,
} from "@/utils/calories";
import { type RegisteredRestaurant, REGISTERED_KEY } from "./restaurant-register";

const C = colors.light;

type LocationStatus = "idle" | "requesting" | "granted" | "denied";

interface TheMeal { idMeal: string; strMeal: string; strMealThumb: string; }
interface OverpassElement {
  id: number; lat: number; lon: number;
  tags?: { name?: string; cuisine?: string; [key: string]: string | undefined };
}
export interface MealCard {
  id: string; restaurant: string; mealName: string; thumbnail: string;
  calories: number; rating: number;
  isNearby?: boolean; isRegistered?: boolean;
  phone?: string; website?: string;
  address?: string; city?: string;
  cuisine?: string; description?: string;
  priceRange?: string; hours?: string;
  lat?: number; lon?: number;
}

async function fetchTheMealDB(category: string): Promise<MealCard[]> {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
  if (!res.ok) throw new Error("Failed to fetch meals");
  const json = (await res.json()) as { meals: TheMeal[] | null };
  return (json.meals ?? []).slice(0, 12).map((m, i) => ({
    id: m.idMeal,
    restaurant: RESTAURANT_NAMES[i % RESTAURANT_NAMES.length] ?? "Local Bistro",
    mealName: m.strMeal,
    thumbnail: m.strMealThumb,
    calories: getCaloriesForMeal(m.idMeal, category),
    rating: getRatingForMeal(m.idMeal),
  }));
}

async function fetchNearbyRestaurants(lat: number, lon: number, tdee: number): Promise<MealCard[]> {
  const query = `[out:json][timeout:25];node["amenity"="restaurant"](around:3000,${lat},${lon});out body 15;`;
  const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Overpass error");
  const json = (await res.json()) as { elements: OverpassElement[] };
  const elements = json.elements ?? [];
  if (elements.length === 0) return [];
  const mealTarget = Math.round(tdee / 3);
  return elements.slice(0, 12).map((el, i) => {
    const cuisine = el.tags?.cuisine ?? "default";
    return {
      id: String(el.id),
      restaurant: el.tags?.name ?? `Restaurant ${i + 1}`,
      mealName: getMealNameForCuisine(cuisine, el.id),
      thumbnail: FOOD_THUMBNAILS[i % FOOD_THUMBNAILS.length] ?? FOOD_THUMBNAILS[0]!,
      calories: Math.max(200, mealTarget + ((el.id % 201) - 100)),
      rating: parseFloat((3.5 + (el.id % 15) / 10).toFixed(1)),
      isNearby: true,
      cuisine: el.tags?.cuisine,
      lat: el.lat,
      lon: el.lon,
    };
  });
}

async function loadRegisteredRestaurants(tdee: number): Promise<MealCard[]> {
  try {
    const raw = await AsyncStorage.getItem(REGISTERED_KEY);
    if (!raw) return [];
    const list: RegisteredRestaurant[] = JSON.parse(raw);
    const mealTarget = Math.round(tdee / 3);
    return list.map((r, i) => ({
      id: r.id,
      restaurant: r.name,
      mealName: `${r.cuisine} Specialty`,
      thumbnail: FOOD_THUMBNAILS[i % FOOD_THUMBNAILS.length] ?? FOOD_THUMBNAILS[0]!,
      calories: mealTarget + ((i * 47) % 200) - 100,
      rating: 4.2 + (i % 5) * 0.1,
      isRegistered: true,
      phone: r.phone,
      website: r.website,
      address: r.address,
      city: r.city,
      cuisine: r.cuisine,
      description: r.description,
      priceRange: r.priceRange,
      hours: r.hours,
    }));
  } catch {
    return [];
  }
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Feather key={i} name="star" size={11} color={i < full ? "#F59E0B" : "rgba(255,255,255,0.15)"} />
      ))}
    </View>
  );
}

function RestaurantCard({ item, onPress }: { item: MealCard; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} contentFit="cover" transition={300} />
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={styles.restaurantName} numberOfLines={1}>{item.restaurant}</Text>
          <View style={styles.badges}>
            {item.isRegistered && (
              <View style={styles.partnerBadge}>
                <Feather name="shield" size={9} color={C.accent} />
                <Text style={styles.partnerText}>Partner</Text>
              </View>
            )}
            {item.isNearby && !item.isRegistered && (
              <View style={styles.nearbyBadge}>
                <Feather name="map-pin" size={9} color={C.accent} />
                <Text style={styles.nearbyText}>Nearby</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.mealName} numberOfLines={2}>{item.mealName}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.caloriePill}>
            <Feather name="zap" size={10} color={C.accent} />
            <Text style={styles.calorieText}>{item.calories} kcal</Text>
          </View>
          <View style={styles.ratingRow}>
            <StarRating rating={item.rating} />
            <Text style={styles.ratingNum}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.chevron}>
        <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.2)" />
      </View>
    </Pressable>
  );
}

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userProfile, logout } = useApp();
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [cityName, setCityName] = useState("");

  const tdee = useMemo(() => {
    if (!userProfile) return 2000;
    return calculateTDEE(
      userProfile.age, userProfile.weight, userProfile.height,
      userProfile.gender, userProfile.activityLevel,
    );
  }, [userProfile]);

  const category = useMemo(() => getMealCategory(tdee), [tdee]);

  const queryKey = coords
    ? ["restaurants-nearby", coords.lat.toFixed(3), coords.lon.toFixed(3)]
    : ["meals", category];

  const { data, isLoading, isError, refetch } = useQuery<MealCard[]>({
    queryKey,
    queryFn: async () => {
      const [registered, api] = await Promise.all([
        loadRegisteredRestaurants(tdee),
        coords
          ? fetchNearbyRestaurants(coords.lat, coords.lon, tdee).then((r) => r.length > 0 ? r : fetchTheMealDB(category))
          : fetchTheMealDB(category),
      ]);
      return [...registered, ...api];
    },
    staleTime: 1000 * 60 * 10,
  });

  async function requestLocation() {
    setLocationStatus("requesting");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") { setLocationStatus("denied"); return; }
    setLocationStatus("granted");
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude, longitude } = loc.coords;
    try {
      const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geo) setCityName(geo.city ?? geo.region ?? geo.country ?? "your area");
    } catch { setCityName("your area"); }
    setCoords({ lat: latitude, lon: longitude });
  }

  function openDetail(item: MealCard) {
    void Haptics.selectionAsync();
    router.push({
      pathname: "/(tabs)/restaurant-detail",
      params: {
        id: item.id,
        restaurant: item.restaurant,
        mealName: item.mealName,
        thumbnail: item.thumbnail,
        calories: String(item.calories),
        rating: String(item.rating),
        isNearby: item.isNearby ? "true" : "false",
        isRegistered: item.isRegistered ? "true" : "false",
        phone: item.phone ?? "",
        website: item.website ?? "",
        address: item.address ?? "",
        city: item.city ?? cityName,
        cuisine: item.cuisine ?? "",
        description: item.description ?? "",
        priceRange: item.priceRange ?? "",
        hours: item.hours ?? "",
        lat: item.lat ? String(item.lat) : "",
        lon: item.lon ? String(item.lon) : "",
      },
    });
  }

  async function handleLogout() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await logout();
    router.replace("/(tabs)/");
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const locationBanner = (
    <View style={[
      styles.locationBanner,
      locationStatus === "denied" && styles.locationBannerDenied,
      locationStatus === "granted" && styles.locationBannerGranted,
    ]}>
      {locationStatus === "idle" && (
        <>
          <View style={styles.locationLeft}>
            <Feather name="map-pin" size={16} color={C.accent} />
            <View>
              <Text style={styles.locationTitle}>Use Your Location</Text>
              <Text style={styles.locationSub}>Find real restaurants near you</Text>
            </View>
          </View>
          <Pressable style={styles.locationBtn} onPress={requestLocation}>
            <Text style={styles.locationBtnText}>Enable</Text>
          </Pressable>
        </>
      )}
      {locationStatus === "requesting" && (
        <View style={styles.locationLeft}>
          <ActivityIndicator size="small" color={C.accent} />
          <Text style={styles.locationTitle}>Getting your location…</Text>
        </View>
      )}
      {locationStatus === "granted" && (
        <View style={styles.locationLeft}>
          <Feather name="check-circle" size={16} color="#fff" />
          <View>
            <Text style={[styles.locationTitle, { color: "#fff" }]}>
              {cityName ? `Near ${cityName}` : "Location found!"}
            </Text>
            <Text style={[styles.locationSub, { color: "rgba(255,255,255,0.65)" }]}>Real restaurants nearby</Text>
          </View>
        </View>
      )}
      {locationStatus === "denied" && (
        <View style={styles.locationLeft}>
          <Feather name="alert-circle" size={16} color={C.destructive} />
          <View>
            <Text style={[styles.locationTitle, { color: C.destructive }]}>Location Denied</Text>
            <Text style={styles.locationSub}>Showing general recommendations</Text>
          </View>
        </View>
      )}
    </View>
  );

  const ListHeader = (
    <View>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: topPad + 14 }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.push("/(tabs)/profile")}>
          <Feather name="sliders" size={18} color="rgba(255,255,255,0.7)" />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarEmoji}>🌿</Text>
          <Text style={styles.topBarTitle}>Health Bite</Text>
        </View>
        <Pressable style={styles.iconBtn} onPress={handleLogout}>
          <Feather name="log-out" size={18} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>

      {/* TDEE card */}
      <View style={styles.tdeeCard}>
        <View style={styles.tdeeTopRow}>
          <Text style={styles.tdeeLabel}>Daily Calorie Goal</Text>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{category}</Text>
          </View>
        </View>
        <Text style={styles.tdeeNumber}>{tdee.toLocaleString()}</Text>
        <Text style={styles.tdeeUnit}>kcal / day</Text>
        <View style={styles.tdeeMetaRow}>
          <View style={styles.tdeeMeta}>
            <Feather name="coffee" size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.tdeeMetaText}>{Math.round(tdee / 3)} kcal per meal</Text>
          </View>
          <View style={styles.tdeeMeta}>
            <Feather name="activity" size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.tdeeMetaText}>{userProfile?.activityLevel ?? "moderate"}</Text>
          </View>
        </View>
      </View>

      {locationBanner}

      {/* Register restaurant banner */}
      <Pressable
        style={styles.registerBanner}
        onPress={() => router.push("/(tabs)/restaurant-register")}
      >
        <View style={styles.registerLeft}>
          <View style={styles.registerIcon}>
            <Feather name="plus-circle" size={18} color={C.accent} />
          </View>
          <View>
            <Text style={styles.registerTitle}>Own a restaurant?</Text>
            <Text style={styles.registerSub}>List your restaurant — reach health-conscious customers</Text>
          </View>
        </View>
        <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.2)" />
      </Pressable>

      <Text style={styles.sectionHeading}>
        {locationStatus === "granted" && cityName ? `Restaurants near ${cityName}` : "Recommended Restaurants"}
      </Text>
    </View>
  );

  return (
    <View style={[styles.flex, { backgroundColor: C.background }]}>
      {isLoading ? (
        <View style={styles.flex}>
          {ListHeader}
          <View style={styles.center}>
            <ActivityIndicator size="large" color={C.accent} style={{ marginTop: 32 }} />
            <Text style={styles.loadingText}>
              {locationStatus === "granted" ? "Finding nearby restaurants…" : "Loading recommendations…"}
            </Text>
          </View>
        </View>
      ) : isError ? (
        <View style={styles.flex}>
          {ListHeader}
          <View style={styles.center}>
            <Feather name="wifi-off" size={40} color="rgba(255,255,255,0.2)" style={{ marginTop: 32 }} />
            <Text style={styles.errorText}>Could not load restaurants</Text>
            <Pressable style={styles.retryBtn} onPress={() => void refetch()}>
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RestaurantCard item={item} onPress={() => openDetail(item)} />
          )}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={[styles.listContent, { paddingBottom: botPad + 20 }]}
          showsVerticalScrollIndicator={false}
          onRefresh={() => void refetch()}
          refreshing={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: "center", paddingHorizontal: 24 },

  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16, backgroundColor: C.background,
  },
  topBarCenter: { flexDirection: "row", alignItems: "center", gap: 6 },
  topBarEmoji: { fontSize: 16 },
  topBarTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#1C1C1C", alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },

  tdeeCard: {
    marginHorizontal: 20, marginBottom: 14,
    backgroundColor: C.accent, borderRadius: colors.radius + 4, padding: 22,
    shadowColor: C.accent, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  tdeeTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  tdeeLabel: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: "Inter_500Medium" },
  categoryChip: { backgroundColor: "rgba(0,0,0,0.2)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  categoryChipText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  tdeeNumber: { fontSize: 52, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -1, lineHeight: 60 },
  tdeeUnit: { color: "rgba(255,255,255,0.65)", fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 14 },
  tdeeMetaRow: { flexDirection: "row", gap: 10 },
  tdeeMeta: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(0,0,0,0.15)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  tdeeMetaText: { color: "rgba(255,255,255,0.85)", fontSize: 11, fontFamily: "Inter_600SemiBold" },

  locationBanner: {
    marginHorizontal: 20, marginBottom: 10,
    backgroundColor: "#161616", borderRadius: colors.radius, padding: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  locationBannerDenied: { borderColor: "rgba(239,68,68,0.3)", backgroundColor: "#1a1010" },
  locationBannerGranted: { borderColor: C.accent, backgroundColor: C.accent },
  locationLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  locationTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  locationSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.35)", marginTop: 1 },
  locationBtn: { backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  locationBtnText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },

  registerBanner: {
    marginHorizontal: 20, marginBottom: 14,
    backgroundColor: "rgba(45,184,122,0.07)",
    borderRadius: colors.radius, padding: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1, borderColor: "rgba(45,184,122,0.2)",
  },
  registerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  registerIcon: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "rgba(45,184,122,0.12)", alignItems: "center", justifyContent: "center",
  },
  registerTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  registerSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.35)", marginTop: 2 },

  sectionHeading: {
    fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff",
    marginTop: 4, marginBottom: 12, paddingHorizontal: 20,
  },
  listContent: { paddingHorizontal: 20 },

  card: {
    backgroundColor: "#141414", borderRadius: colors.radius, marginBottom: 12,
    flexDirection: "row", overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
  },
  cardPressed: { opacity: 0.75 },
  thumbnail: { width: 90, height: 96 },
  cardContent: { flex: 1, padding: 12, justifyContent: "space-between" },
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 3 },
  restaurantName: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: C.accent, flex: 1 },
  badges: { flexDirection: "row", gap: 5 },
  partnerBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(45,184,122,0.15)", borderWidth: 1, borderColor: "rgba(45,184,122,0.3)",
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10,
  },
  partnerText: { fontSize: 10, fontFamily: "Inter_700Bold", color: C.accent },
  nearbyBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(45,184,122,0.12)", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10,
  },
  nearbyText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: C.accent },
  mealName: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff", lineHeight: 19, flex: 1 },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 7 },
  caloriePill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(45,184,122,0.12)", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20,
  },
  calorieText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: C.accent },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  ratingNum: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.4)" },
  chevron: { paddingRight: 12 },

  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.3)", marginTop: 12 },
  errorText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff", marginTop: 14, marginBottom: 10 },
  retryBtn: { backgroundColor: "#fff", paddingHorizontal: 24, paddingVertical: 12, borderRadius: colors.radius },
  retryText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#000" },
});
