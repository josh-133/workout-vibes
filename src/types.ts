export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export type Day = (typeof DAYS)[number];

export const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
}

/** A day with no exercises is a rest day. */
export interface WorkoutDay {
  day: Day;
  title: string;
  exercises: Exercise[];
}

export interface Meal {
  id: string;
  name: string;
  slot: MealSlot;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface MealDay {
  day: Day;
  meals: Meal[];
}

export interface LoggedSet {
  reps: number;
  weight: number;
}

export interface LogEntry {
  exerciseName: string;
  sets: LoggedSet[];
}

export interface WorkoutLog {
  id: string;
  date: string; // YYYY-MM-DD
  day: Day;
  title: string;
  entries: LogEntry[];
  notes?: string;
}

export interface BodyLog {
  id: string;
  date: string; // YYYY-MM-DD
  weightLbs: number;
}

export type Units = 'lb' | 'kg';

/** Daily nutrition goals; a missing value means no goal is set. */
export interface Targets {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

/** Weights are always stored in lb; `units` only affects display and input. */
export interface Settings {
  units: Units;
  targets: Targets;
}

export interface AppData {
  version: 1;
  workoutPlan: WorkoutDay[];
  mealPlan: MealDay[];
  workoutLogs: WorkoutLog[];
  bodyLogs: BodyLog[];
  settings: Settings;
}
