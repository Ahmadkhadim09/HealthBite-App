import { Feather } from "@expo/vector-icons";
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

const C = colors.light;

type LocationStatus = "idle" | "requesting" | "granted" | "denied";

interface TheMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

interface OverpassElement {
  id: number;
  lat: number;
  lon: number;
  tags?: { name?: string; cuisine?: string; [key: string]: string | undefined };
}

export interface MealCard {
  id: string;
  restaurant: string;
  mealName: string;
  thumbnail: string;
  calories: number;
  rating: number;
  isNearby?: boolean;
}

async function fetchTheMealDB(category: string): Promise<MealCard[]> {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`,
  );
  if (!res.ok) throw new Error("Failed to fetch meals");
  const json = (await res.json()) as { meals: TheMeal[] | null };
  const meals = json.meals ?? [];
  return meals.slice(0, 12).map((m, i) => ({
    id: m.idMeal,
    restaurant: RESTAURANT_NAMES[i % RESTAURANT_NAMES.length] ?? "Local Bistro",
    mealName: m.strMeal,
    thumbnail: m.strMealThumb,
    calories: getCaloriesForMeal(m.idMeal, category),
    rating: getRatingForMeal(m.idMeal),
    isNearby: false,
  }));
}

async function fetchNearbyRestaurants(
  lat: number,
  lon: number,
  tdee: number,
): Promise<MealCard[]> {
  const query = `[out:json][timeout:25];node["amenity"="restaurant"](around:3000,${lat},${lon});out body 15;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Overpass error");
  const json = (await res.json()) as { elements: OverpassElement[] };
  const elements = json.elements ?? [];
  if (elements.length === 0) return [];

  const mealTarget = Math.round(tdee / 3);

  return elements.slice(0, 12).map((el, i) => {
    const cuisine = el.tags?.cuisine ?? "default";
    const mealName = getMealNameForCuisine(cuisine, el.id);
    const calVariance = (el.id % 201) - 100;
    return {
      id: String(el.id),
      restaurant: el.tags?.name ?? `Restaurant ${i + 1}`,
      mealName,
      thumbnail: FOOD_THUMBNAILS[i % FOOD_THUMBNAILS.length] ?? FOOD_THUMBNAILS[0]!,
      calories: Math.max(200, mealTarget + calVariance),
      rating: parseFloat((3.5 + (el.id % 15) / 10).toFixed(1)),
      isNearby: true,
    };
  });
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Feather
          key={i}
          name="star"
          size={12}
          color={i < full ? "#F59E0B" : C.border}
        />
      ))}
    </View>
  );
}

function RestaurantCard({ item }: { item: MealCard }) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.thumbnail}
        contentFit="cover"
        transition={300}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {item.restaurant}
          </Text>
          {item.isNearby && (
            <View style={styles.nearbyBadge}>
              <Feather name="map-pin" size={10} color={C.primary} />
              <Text style={styles.nearbyText}>Nearby</Text>
            </View>
          )}
        </View>
        <Text style={styles.mealName} numberOfLines={2}>
          {item.mealName}
        </Text>
        <View style={styles.cardFooter}>
          <View style={styles.caloriePill}>
            <Feather name="zap" size={11} color={C.primary} />
            <Text style={styles.calorieText}>{item.calories} kcal</Text>
          </View>
          <View style={styles.ratingRow}>
            <StarRating rating={item.rating} />
            <Text style={styles.ratingNum}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userProfile, logout } = useApp();

  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [cityName, setCityName] = useState<string>("");

  const tdee = useMemo(() => {
    if (!userProfile) return 2000;
    return calculateTDEE(
      userProfile.age,
      userProfile.weight,
      userProfile.height,
      userProfile.gender,
      userProfile.activityLevel,
    );
  }, [userProfile]);

  const category = useMemo(() => getMealCategory(tdee), [tdee]);

  const queryKey = coords
    ? ["restaurants-nearby", coords.lat.toFixed(3), coords.lon.toFixed(3)]
    : ["meals", category];

  const { data, isLoading, isError, refetch } = useQuery<MealCard[]>({
    queryKey,
    queryFn: async () => {
      if (coords) {
        const nearby = await fetchNearbyRestaurants(coords.lat, coords.lon, tdee);
        if (nearby.length > 0) return nearby;
        return fetchTheMealDB(category);
      }
      return fetchTheMealDB(category);
    },
    staleTime: 1000 * 60 * 10,
  });

  async function requestLocation() {
    setLocationStatus("requesting");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationStatus("denied");
      return;
    }

    setLocationStatus("granted");
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = loc.coords;

    try {
      const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geo) {
        setCityName(geo.city ?? geo.region ?? geo.country ?? "your area");
      }
    } catch {
      setCityName("your area");
    }

    setCoords({ lat: latitude, lon: longitude });
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
          <View style={styles.locationBannerLeft}>
            <Feather name="map-pin" size={18} color={C.primary} />
            <View>
              <Text style={styles.locationBannerTitle}>Use Your Location</Text>
              <Text style={styles.locationBannerSub}>
                Find real restaurants near you (Lahore, London & more)
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.locationBtn}
            onPress={requestLocation}
          >
            <Text style={styles.locationBtnText}>Enable</Text>
          </Pressable>
        </>
      )}

      {locationStatus === "requesting" && (
        <View style={styles.locationBannerLeft}>
          <ActivityIndicator size="small" color={C.primary} />
          <Text style={styles.locationBannerTitle}>Getting your location…</Text>
        </View>
      )}

      {locationStatus === "granted" && (
        <View style={styles.locationBannerLeft}>
          <Feather name="check-circle" size={18} color="#fff" />
          <View>
            <Text style={[styles.locationBannerTitle, { color: "#fff" }]}>
              {cityName ? `Showing restaurants near ${cityName}` : "Location found!"}
            </Text>
            <Text style={[styles.locationBannerSub, { color: "rgba(255,255,255,0.8)" }]}>
              Real restaurants near your location
            </Text>
          </View>
        </View>
      )}

      {locationStatus === "denied" && (
        <View style={styles.locationBannerLeft}>
          <Feather name="alert-circle" size={18} color={C.destructive} />
          <View>
            <Text style={[styles.locationBannerTitle, { color: C.destructive }]}>
              Location Access Denied
            </Text>
            <Text style={styles.locationBannerSub}>
              Showing general recommendations instead
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const ListHeader = (
    <View>
      <View style={[styles.topBar, { paddingTop: topPad + 14 }]}>
        <Pressable onPress={() => router.push("/(tabs)/profile")} style={styles.iconBtn}>
          <Feather name="sliders" size={20} color={C.foreground} />
        </Pressable>
        <Text style={styles.topBarTitle}>Health Bite</Text>
        <Pressable onPress={handleLogout} style={styles.iconBtn}>
          <Feather name="log-out" size={20} color={C.foreground} />
        </Pressable>
      </View>

      <View style={styles.tdeeCard}>
        <Text style={styles.tdeeLabel}>Daily Calorie Goal</Text>
        <Text style={styles.tdeeNumber}>{tdee.toLocaleString()}</Text>
        <Text style={styles.tdeeUnit}>kcal / day</Text>
        <View style={styles.tdeeMetaRow}>
          <View style={styles.tdeeMeta}>
            <Feather name="tag" size={12} color="rgba(255,255,255,0.75)" />
            <Text style={styles.tdeeMetaText}>{category}</Text>
          </View>
          <View style={styles.tdeeMeta}>
            <Feather name="coffee" size={12} color="rgba(255,255,255,0.75)" />
            <Text style={styles.tdeeMetaText}>{Math.round(tdee / 3)} kcal / meal</Text>
          </View>
        </View>
      </View>

      {locationBanner}

      <Text style={styles.sectionHeading}>
        {locationStatus === "granted" && cityName
          ? `Restaurants near ${cityName}`
          : "Recommended Restaurants"}
      </Text>
    </View>
  );

  return (
    <View style={[styles.flex, { backgroundColor: C.background }]}>
      {isLoading ? (
        <View style={styles.flex}>
          {ListHeader}
          <View style={styles.center}>
            <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 32 }} />
            <Text style={styles.loadingText}>
              {locationStatus === "granted"
                ? "Finding nearby restaurants…"
                : "Loading recommendations…"}
            </Text>
          </View>
        </View>
      ) : isError ? (
        <View style={styles.flex}>
          {ListHeader}
          <View style={styles.center}>
            <Feather name="wifi-off" size={40} color={C.mutedForeground} style={{ marginTop: 32 }} />
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
          renderItem={({ item }) => <RestaurantCard item={item} />}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: C.background,
  },
  topBarTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: C.foreground },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.card, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: C.border,
  },
  tdeeCard: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: C.primary, borderRadius: colors.radius + 4,
    padding: 24, alignItems: "center",
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 14, elevation: 8,
  },
  tdeeLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.8)", letterSpacing: 0.5, marginBottom: 6 },
  tdeeNumber: { fontSize: 56, fontFamily: "Inter_700Bold", color: "#fff", lineHeight: 64, letterSpacing: -1 },
  tdeeUnit: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)", marginBottom: 14 },
  tdeeMetaRow: { flexDirection: "row", gap: 16 },
  tdeeMeta: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  tdeeMetaText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },

  locationBanner: {
    marginHorizontal: 20, marginBottom: 10,
    backgroundColor: C.card, borderRadius: colors.radius,
    padding: 14, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
    borderWidth: 1.5, borderColor: C.border,
  },
  locationBannerDenied: { borderColor: "#FCA5A5", backgroundColor: "#FFF5F5" },
  locationBannerGranted: { borderColor: C.primary, backgroundColor: C.primary },
  locationBannerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  locationBannerTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.foreground },
  locationBannerSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.mutedForeground, marginTop: 1 },
  locationBtn: {
    backgroundColor: C.primary, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, marginLeft: 8,
  },
  locationBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },

  sectionHeading: {
    fontSize: 20, fontFamily: "Inter_700Bold", color: C.foreground,
    marginTop: 10, marginBottom: 12, paddingHorizontal: 20,
  },
  listContent: { paddingHorizontal: 20 },
  card: {
    backgroundColor: C.card, borderRadius: colors.radius, marginBottom: 14,
    flexDirection: "row", overflow: "hidden",
    borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  thumbnail: { width: 96, height: 104 },
  cardContent: { flex: 1, padding: 12, justifyContent: "space-between" },
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 3 },
  restaurantName: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: C.primary, flex: 1 },
  nearbyBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: C.secondary, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10,
  },
  nearbyText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: C.primary },
  mealName: {
    fontSize: 14, fontFamily: "Inter_700Bold", color: C.foreground, lineHeight: 20, flex: 1,
  },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  caloriePill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: C.secondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  calorieText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: C.primary },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  ratingNum: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: C.mutedForeground },

  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular", color: C.mutedForeground, marginTop: 12 },
  errorText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: C.foreground, marginTop: 14, marginBottom: 10 },
  retryBtn: { backgroundColor: C.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: colors.radius },
  retryText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
});
