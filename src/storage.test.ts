import { emptyData, loadData, parseData, saveData, STORAGE_KEY } from './storage';
import { isoDate, sumMacros, todayDay, topSetHistory } from './lib/totals';
import { WorkoutLog } from './types';
import { fromLbs, toLbs } from './lib/units';
import { withSamplePlan } from './lib/sample';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('returns empty data when nothing is stored', () => {
    expect(loadData()).toEqual(emptyData());
  });

  it('round-trips through localStorage', () => {
    const data = emptyData();
    data.bodyLogs.push({ id: 'a', date: '2026-01-01', weightLbs: 180 });
    data.workoutPlan[0].exercises.push({ id: 'e', name: 'Squat', sets: 3, reps: 5, weight: 225 });
    saveData(data);
    expect(loadData()).toEqual(data);
  });

  it('falls back to empty data on corrupt storage', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadData()).toEqual(emptyData());
  });

  it('rejects imports with the wrong version', () => {
    expect(() => parseData({ version: 2 })).toThrow();
  });

  it('fills in missing days on import', () => {
    const parsed = parseData({ version: 1, workoutPlan: [{ day: 'Wed', title: 'Legs', exercises: [] }] });
    expect(parsed.workoutPlan).toHaveLength(7);
    expect(parsed.workoutPlan[2].title).toBe('Legs');
    expect(parsed.mealPlan).toHaveLength(7);
  });
});

describe('totals', () => {
  it('sums macros, treating missing values as zero', () => {
    expect(
      sumMacros([
        { id: '1', name: 'Oats', slot: 'breakfast', calories: 300, protein: 10, carbs: 50, fat: 5 },
        { id: '2', name: 'Apple', slot: 'snack', calories: 95 },
      ]),
    ).toEqual({ calories: 395, protein: 10, carbs: 50, fat: 5 });
  });

  it('finds the top set per session, sorted by date', () => {
    const logs: WorkoutLog[] = [
      {
        id: '2', date: '2026-01-08', day: 'Mon', title: '',
        entries: [{ exerciseName: 'Squat', sets: [{ reps: 5, weight: 235 }] }],
      },
      {
        id: '1', date: '2026-01-01', day: 'Mon', title: '',
        entries: [
          { exerciseName: 'squat ', sets: [{ reps: 5, weight: 215 }, { reps: 5, weight: 225 }] },
          { exerciseName: 'Bench', sets: [{ reps: 5, weight: 185 }] },
        ],
      },
    ];
    expect(topSetHistory(logs, 'Squat')).toEqual([
      { date: '2026-01-01', weight: 225 },
      { date: '2026-01-08', weight: 235 },
    ]);
  });

  it('maps dates to plan days and ISO strings', () => {
    const sunday = new Date(2026, 10, 15);
    expect(todayDay(sunday)).toBe('Sun');
    expect(todayDay(new Date(2026, 10, 16))).toBe('Mon');
    expect(isoDate(sunday)).toBe('2026-11-15');
  });
});

describe('settings', () => {
  it('defaults settings when missing from an import', () => {
    expect(parseData({ version: 1 }).settings).toEqual({ units: 'lb', targets: {} });
  });

  it('keeps valid settings and drops unknown units', () => {
    const parsed = parseData({ version: 1, settings: { units: 'kg', targets: { calories: 2400 } } });
    expect(parsed.settings).toEqual({ units: 'kg', targets: { calories: 2400 } });
    expect(parseData({ version: 1, settings: { units: 'stone' } }).settings.units).toBe('lb');
  });
});

describe('units', () => {
  it('stores lb and displays either unit', () => {
    expect(fromLbs(225, 'lb')).toBe(225);
    expect(fromLbs(220.462, 'kg')).toBe(100);
    expect(fromLbs(toLbs(100, 'kg'), 'kg')).toBe(100);
    expect(toLbs(135, 'lb')).toBe(135);
  });
});

describe('sample plan', () => {
  it('fills a push/pull/legs week with a rest day and keeps logs', () => {
    const data = emptyData();
    data.bodyLogs.push({ id: 'a', date: '2026-01-01', weightLbs: 180 });
    const sample = withSamplePlan(data);
    expect(sample.workoutPlan.map((d) => d.title)).toEqual(['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest']);
    expect(sample.workoutPlan[6].exercises).toHaveLength(0);
    expect(sample.mealPlan.every((d) => d.meals.length > 0)).toBe(true);
    expect(sample.bodyLogs).toEqual(data.bodyLogs);
  });
});
