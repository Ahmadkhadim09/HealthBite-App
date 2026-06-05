import type { ActivityLevel, Gender } from "@/context/AppContext";

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

export const RESTAURANT_NAMES = [
  "The Green Table",
  "Nourish Kitchen",
  "VitalBowl",
  "Fresh & Lean",
  "The Wholesome Plate",
  "EatRight Bistro",
  "Clean Eats Co.",
  "The Fit Kitchen",
  "Balance Bar & Grill",
  "Nutrient House",
  "The Body Fuel Co.",
  "Pure Kitchen",
  "Elevate Eatery",
  "GreenWell",
  "The Macro Bar",
  "Harvest & Health",
  "Fuel & Go",
  "The Lean Pantry",
  "Zest Kitchen",
  "Vitality Bistro",
];

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary",
  light: "Light",
  moderate: "Moderate",
  active: "Active",
  veryActive: "Very Active",
};
