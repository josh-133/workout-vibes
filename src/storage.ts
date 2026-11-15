import { AppData, DAYS, Settings } from './types';

export const STORAGE_KEY = 'workout-vibes:data';

export function emptyData(): AppData {
  return {
    version: 1,
    workoutPlan: DAYS.map((day) => ({ day, title: '', exercises: [] })),
    mealPlan: DAYS.map((day) => ({ day, meals: [] })),
    workoutLogs: [],
    bodyLogs: [],
    settings: { units: 'lb', targets: {} },
  };
}

function parseSettings(raw: unknown): Settings {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Partial<Settings>;
  return {
    units: obj.units === 'kg' ? 'kg' : 'lb',
    targets: obj.targets && typeof obj.targets === 'object' ? obj.targets : {},
  };
}

/** Validates loosely-shaped input (from storage or an import) and fills any gaps. */
export function parseData(raw: unknown): AppData {
  if (!raw || typeof raw !== 'object') throw new Error('Data is not an object');
  const obj = raw as Partial<AppData>;
  if (obj.version !== 1) throw new Error('Unsupported data version');
  const base = emptyData();
  const workoutPlan = Array.isArray(obj.workoutPlan) ? obj.workoutPlan : [];
  const mealPlan = Array.isArray(obj.mealPlan) ? obj.mealPlan : [];
  return {
    version: 1,
    workoutPlan: base.workoutPlan.map((d) => workoutPlan.find((w) => w.day === d.day) ?? d),
    mealPlan: base.mealPlan.map((d) => mealPlan.find((m) => m.day === d.day) ?? d),
    workoutLogs: Array.isArray(obj.workoutLogs) ? obj.workoutLogs : [],
    bodyLogs: Array.isArray(obj.bodyLogs) ? obj.bodyLogs : [],
    settings: parseSettings(obj.settings),
  };
}

export function loadData(): AppData {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    return text ? parseData(JSON.parse(text)) : emptyData();
  } catch {
    return emptyData();
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or blocked; the app keeps working in memory.
  }
}

export function newId(): string {
  return crypto.randomUUID();
}
