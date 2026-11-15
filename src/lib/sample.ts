import { AppData, Exercise, Meal, MealSlot } from '../types';
import { newId } from '../storage';

const ex = (name: string, sets: number, reps: number, weight?: number): Exercise => ({
  id: newId(), name, sets, reps, weight,
});

const meal = (name: string, slot: MealSlot, calories: number, protein: number, carbs: number, fat: number): Meal => ({
  id: newId(), name, slot, calories, protein, carbs, fat,
});

const push = () => [ex('Bench press', 3, 8, 135), ex('Overhead press', 3, 8, 75), ex('Tricep pushdown', 3, 12, 40)];
const pull = () => [ex('Deadlift', 3, 5, 185), ex('Barbell row', 3, 8, 115), ex('Bicep curl', 3, 12, 25)];
const legs = () => [ex('Back squat', 3, 5, 155), ex('Romanian deadlift', 3, 8, 135), ex('Calf raise', 3, 15, 90)];

const PLAN = {
  Mon: ['Push', push], Tue: ['Pull', pull], Wed: ['Legs', legs],
  Thu: ['Push', push], Fri: ['Pull', pull], Sat: ['Legs', legs],
} as const;

const dayMeals = () => [
  meal('Oatmeal with berries', 'breakfast', 350, 12, 60, 7),
  meal('Chicken & rice bowl', 'lunch', 600, 45, 70, 12),
  meal('Salmon, potatoes & greens', 'dinner', 650, 40, 55, 25),
  meal('Greek yogurt', 'snack', 150, 15, 10, 4),
];

/** Replaces both plans with a push/pull/legs week and simple meals; logs and settings are kept. */
export function withSamplePlan(data: AppData): AppData {
  return {
    ...data,
    workoutPlan: data.workoutPlan.map((d) => {
      const entry = PLAN[d.day as keyof typeof PLAN];
      return entry ? { day: d.day, title: entry[0], exercises: entry[1]() } : { day: d.day, title: 'Rest', exercises: [] };
    }),
    mealPlan: data.mealPlan.map((d) => ({ day: d.day, meals: dayMeals() })),
  };
}
