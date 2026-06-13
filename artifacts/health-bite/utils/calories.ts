import type { ActivityLevel, Gender, Goal } from "@/context/AppContext";

export function calculateTDEE(
  age: number,
  weight: number,
  height: number,
  gender: Gender,
  activityLevel: ActivityLevel,
): number {
  let bmr: number;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
  };
  return Math.round(bmr * multipliers[activityLevel]);
}

export function calculateAdjustedCalories(tdee: number, goal: Goal): number {
  if (goal === "lose") return Math.max(1200, tdee - 500);
  if (goal === "gain") return tdee + 300;
  return tdee;
}

export function calculateBMI(weight: number, height: number): number {
  const heightM = height / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(1));
}

export type BMICategory = "underweight" | "normal" | "overweight" | "obese";

export function getBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  return "obese";
}

export const BMI_INFO: Record<
  BMICategory,
  { label: string; color: string; tip: string; range: string }
> = {
  underweight: {
    label: "Underweight",
    color: "#60A5FA",
    tip: "Consider increasing calorie intake with nutrient-dense foods.",
    range: "< 18.5",
  },
  normal: {
    label: "Normal Weight",
    color: "#2DB87A",
    tip: "Great! Maintain your balanced diet and active lifestyle.",
    range: "18.5 – 24.9",
  },
  overweight: {
    label: "Overweight",
    color: "#F59E0B",
    tip: "A moderate calorie deficit and regular exercise can help.",
    range: "25 – 29.9",
  },
  obese: {
    label: "Obese",
    color: "#EF4444",
    tip: "Consult a healthcare professional for a personalised plan.",
    range: "≥ 30",
  },
};

export const GOAL_INFO: Record<Goal, { label: string; shortLabel: string; desc: string; delta: string; emoji: string }> = {
  lose: { label: "Lose Weight", shortLabel: "Lose", desc: "Calorie deficit", delta: "−500 kcal/day", emoji: "📉" },
  maintain: { label: "Maintain", shortLabel: "Maintain", desc: "Stay at TDEE", delta: "±0 kcal/day", emoji: "⚖️" },
  gain: { label: "Gain Muscle", shortLabel: "Gain", desc: "Calorie surplus", delta: "+300 kcal/day", emoji: "💪" },
};

export function getMealCategory(tdee: number): string {
  if (tdee < 1600) return "Vegan";
  if (tdee < 1900) return "Vegetarian";
  if (tdee < 2200) return "Seafood";
  if (tdee < 2500) return "Chicken";
  if (tdee < 2800) return "Pasta";
  return "Beef";
}

export function getCaloriesForMeal(idMeal: string, category: string): number {
  const id = parseInt(idMeal, 10) || 0;
  const ranges: Record<string, [number, number]> = {
    Vegan: [240, 410],
    Vegetarian: [290, 470],
    Seafood: [330, 510],
    Chicken: [370, 550],
    Pasta: [460, 670],
    Beef: [540, 810],
  };
  const [min, max] = ranges[category] ?? [340, 590];
  return min + (id % (max - min));
}

export function getRatingForMeal(idMeal: string): number {
  const id = parseInt(idMeal, 10) || 0;
  return parseFloat((3.6 + (id % 14) / 10).toFixed(1));
}

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary",
  light: "Light",
  moderate: "Moderate",
  active: "Active",
  veryActive: "Very Active",
};

export const RESTAURANT_NAMES = [
  "The Green Table", "Nourish Kitchen", "VitalBowl", "Fresh & Lean",
  "The Wholesome Plate", "EatRight Bistro", "Clean Eats Co.", "The Fit Kitchen",
  "Balance Bar & Grill", "Nutrient House", "The Body Fuel Co.", "Pure Kitchen",
  "Elevate Eatery", "GreenWell", "The Macro Bar", "Harvest & Health",
  "Fuel & Go", "The Lean Pantry", "Zest Kitchen", "Vitality Bistro",
];

const CUISINE_MEALS: Record<string, string[]> = {
  pizza: ["Margherita Pizza", "Pepperoni Pizza", "BBQ Chicken Pizza", "Veggie Supreme"],
  burger: ["Classic Beef Burger", "Crispy Chicken Burger", "Double Smash Burger", "Mushroom Swiss Burger"],
  kebab: ["Chicken Shish Kebab", "Seekh Kebab Platter", "Mixed Grill", "Lamb Tikka Kebab"],
  chinese: ["Chicken Fried Rice", "Chow Mein Noodles", "Sweet & Sour Chicken", "Kung Pao Chicken"],
  indian: ["Butter Chicken", "Chicken Biryani", "Dal Makhani", "Palak Paneer"],
  italian: ["Pasta Carbonara", "Risotto al Funghi", "Spaghetti Bolognese", "Penne Arrabiata"],
  japanese: ["Chicken Ramen", "Teriyaki Chicken Bowl", "Salmon Sushi Roll", "Gyoza Platter"],
  thai: ["Pad Thai", "Green Curry Chicken", "Tom Kha Soup", "Mango Sticky Rice"],
  mexican: ["Chicken Tacos", "Beef Burrito", "Guacamole & Chips", "Quesadilla"],
  seafood: ["Grilled Salmon", "Garlic Butter Shrimp", "Fish & Chips", "Tuna Steak"],
  sandwich: ["Chicken Club Sandwich", "BLT Wrap", "Grilled Veggie Panini", "Turkey Sub"],
  steak: ["Grilled Ribeye Steak", "Sirloin with Veggies", "T-Bone Steak", "Pepper Sauce Fillet"],
  sushi: ["Salmon Nigiri", "Dragon Roll", "Tuna Sashimi", "Spicy Tuna Roll"],
  default: ["Chef's Daily Special", "House Signature Dish", "Grilled Platter", "Seasonal Bowl"],
};

export function getMealNameForCuisine(cuisine: string, id: number): string {
  const key = cuisine.toLowerCase().split(";")[0]?.trim() ?? "default";
  const meals = CUISINE_MEALS[key] ?? CUISINE_MEALS.default ?? ["Chef's Special"];
  return meals[id % meals.length] ?? "Chef's Special";
}

export const FOOD_THUMBNAILS = [
  "https://www.themealdb.com/images/media/meals/t8mn9g1560460231.jpg",
  "https://www.themealdb.com/images/media/meals/sywswr1511383814.jpg",
  "https://www.themealdb.com/images/media/meals/xrysxr1483568462.jpg",
  "https://www.themealdb.com/images/media/meals/wruvqy1487348994.jpg",
  "https://www.themealdb.com/images/media/meals/g4yxqq1561563038.jpg",
  "https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg",
  "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
  "https://www.themealdb.com/images/media/meals/ssxwan1515872093.jpg",
  "https://www.themealdb.com/images/media/meals/sytuqu1511553755.jpg",
  "https://www.themealdb.com/images/media/meals/wrssvt1511556563.jpg",
  "https://www.themealdb.com/images/media/meals/utxqpt1511639216.jpg",
  "https://www.themealdb.com/images/media/meals/1548772327.jpg",
];
