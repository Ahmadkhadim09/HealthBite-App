import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
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
  getRatingForMeal,
  RESTAURANT_NAMES,
} from "@/utils/calories";

const C = colors.light;

interface TheMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

interface MealCard {
  id: string;
  restaurant: string;
  mealName: string;
  thumbnail: string;
  calories: number;
  rating: number;
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<Feather key={i} name="star" size={13} color="#F59E0B" />);
    } else if (i === full && half) {
      stars.push(<Feather key={i} name="star" size={13} color="#F59E0B" />);
    } else {
      stars.push(<Feather key={i} name="star" size={13} color={C.border} />);
    }
  }
  return <View style={{ flexDirection: "row", gap: 2 }}>{stars}</View>;
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
        <Text style={styles.restaurantName} numberOfLines={1}>
          {item.restaurant}
        </Text>
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

  const { data, isLoading, isError, refetch } = useQuery<MealCard[]>({
    queryKey: ["meals", category],
    queryFn: async () => {
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
      }));
    },
    staleTime: 1000 * 60 * 10,
  });

  async function handleLogout() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await logout();
    router.replace("/(tabs)/");
  }

  function handleEditProfile() {
    router.push("/(tabs)/profile");
  }

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const ListHeader = (
    <View>
      <View style={[styles.topBar, { paddingTop: topPad + 14 }]}>
        <Pressable onPress={handleEditProfile} style={styles.iconBtn}>
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
        <View style={styles.categoryBadge}>
          <Feather name="tag" size={12} color={C.primary} />
          <Text style={styles.categoryText}>{category} meals recommended</Text>
        </View>
      </View>

      <Text style={styles.sectionHeading}>Recommended Restaurants</Text>
    </View>
  );

  return (
    <View style={[styles.flex, { backgroundColor: C.background }]}>
      {isLoading ? (
        <View style={[styles.center, { paddingTop: topPad }]}>
          {ListHeader}
          <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 40 }} />
          <Text style={styles.loadingText}>Finding restaurants for you...</Text>
        </View>
      ) : isError ? (
        <View style={[styles.center, { paddingTop: topPad }]}>
          {ListHeader}
          <Feather name="wifi-off" size={40} color={C.mutedForeground} style={{ marginTop: 40 }} />
          <Text style={styles.errorText}>Could not load meals</Text>
          <Pressable style={styles.retryBtn} onPress={() => void refetch()}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
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
          refreshing={isLoading}
          scrollEnabled={!!(data && data.length > 0)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", width: "100%" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: C.background,
  },
  topBarTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: C.foreground,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  tdeeCard: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: C.primary,
    borderRadius: colors.radius + 4,
    padding: 24,
    alignItems: "center",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  tdeeLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tdeeNumber: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    lineHeight: 64,
    letterSpacing: -1,
  },
  tdeeUnit: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    marginBottom: 14,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  sectionHeading: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: C.foreground,
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  listContent: { paddingHorizontal: 20 },
  card: {
    backgroundColor: C.card,
    borderRadius: colors.radius,
    marginBottom: 14,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  thumbnail: {
    width: 96,
    height: 100,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  restaurantName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: C.primary,
    marginBottom: 3,
  },
  mealName: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: C.foreground,
    lineHeight: 20,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  caloriePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  calorieText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: C.primary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  ratingNum: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: C.mutedForeground,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.mutedForeground,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: C.foreground,
    marginTop: 14,
    marginBottom: 10,
  },
  retryBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: colors.radius,
  },
  retryText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
});
