type MealType = "BREAKFAST" | "LUNCH" | "DINNER";

const mealTimes: Record<MealType, string> = {
  BREAKFAST: "08:00:00",
  LUNCH: "13:00:00",
  DINNER: "20:00:00"
};

export function skipCutoffAt(date: string, mealType: MealType, cutoffMinutes: number): Date {
  const mealTime = new Date(`${date}T${mealTimes[mealType]}+05:30`);
  return new Date(mealTime.getTime() - cutoffMinutes * 60 * 1000);
}

export function canSkip(date: string, mealType: MealType, cutoffMinutes: number, now = new Date()): boolean {
  return now.getTime() < skipCutoffAt(date, mealType, cutoffMinutes).getTime();
}
