import { Day, DAYS, Meal, WorkoutLog } from '../types';

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function sumMacros(meals: Meal[]): Macros {
  return meals.reduce<Macros>(
    (t, m) => ({
      calories: t.calories + (m.calories ?? 0),
      protein: t.protein + (m.protein ?? 0),
      carbs: t.carbs + (m.carbs ?? 0),
      fat: t.fat + (m.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

/** Heaviest set per logged session for one exercise, oldest first. */
export function topSetHistory(logs: WorkoutLog[], exerciseName: string) {
  const key = exerciseName.trim().toLowerCase();
  return logs
    .flatMap((log) => {
      const weights = log.entries
        .filter((e) => e.exerciseName.trim().toLowerCase() === key)
        .flatMap((e) => e.sets.map((s) => s.weight));
      return weights.length ? [{ date: log.date, weight: Math.max(...weights) }] : [];
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function loggedExerciseNames(logs: WorkoutLog[]): string[] {
  const names = new Map<string, string>();
  for (const log of logs) {
    for (const e of log.entries) {
      const key = e.exerciseName.trim().toLowerCase();
      if (key && !names.has(key)) names.set(key, e.exerciseName.trim());
    }
  }
  return [...names.values()].sort((a, b) => a.localeCompare(b));
}

export function todayDay(date = new Date()): Day {
  // getDay(): 0 = Sunday
  return DAYS[(date.getDay() + 6) % 7];
}

export function isoDate(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
