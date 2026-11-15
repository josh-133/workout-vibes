import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { AppDataProvider } from './context/AppDataContext';
import { withSamplePlan } from './lib/sample';
import { emptyData, loadData, saveData } from './storage';

// Recharts' ResponsiveContainer needs ResizeObserver, which jsdom lacks.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

function renderAt(path: string) {
  return render(
    <AppDataProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </AppDataProvider>,
  );
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it.each([
    ['/', /Rest day|Workout/],
    ['/workouts', 'Workout plan'],
    ['/meals', 'Meal plan'],
    ['/log', 'Workout log'],
    ['/progress', 'Progress'],
    ['/settings', 'Settings'],
  ])('renders %s with the sample plan', (path, heading) => {
    saveData(withSamplePlan(emptyData()));
    renderAt(path);
    expect(screen.getAllByRole('heading', { name: heading }).length).toBeGreaterThan(0);
  });

  it('shows an empty-plan hint on Today', () => {
    renderAt('/');
    expect(screen.getByText(/Your plan is empty/)).toBeTruthy();
  });

  it('adds an exercise to the plan', () => {
    renderAt('/workouts');
    fireEvent.change(screen.getByPlaceholderText('e.g. Back squat'), { target: { value: 'Pull-up' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add exercise' }));
    expect(screen.getByText('Pull-up')).toBeTruthy();
    expect(loadData().workoutPlan.some((d) => d.exercises.some((e) => e.name === 'Pull-up'))).toBe(true);
  });

  it('displays weights in kg when selected but stores lb', () => {
    saveData(withSamplePlan(emptyData()));
    renderAt('/settings');
    fireEvent.click(screen.getByRole('radio', { name: 'kg' }));
    cleanup();
    renderAt('/workouts');
    fireEvent.click(screen.getByRole('tab', { name: /Mon/ }));
    expect(screen.getByText(/@ 61.2 kg/)).toBeTruthy(); // 135 lb bench
    expect(loadData().workoutPlan[0].exercises[0].weight).toBe(135);
  });

  it('logs a workout from the plan', () => {
    saveData(withSamplePlan(emptyData()));
    renderAt('/log?new=1&day=Mon');
    fireEvent.click(screen.getByRole('button', { name: 'Save workout' }));
    const [log] = loadData().workoutLogs;
    expect(log.title).toBe('Push');
    expect(log.entries[0]).toEqual({ exerciseName: 'Bench press', sets: Array(3).fill({ reps: 8, weight: 135 }) });
    expect(screen.getByText('Bench press')).toBeTruthy();
  });

  it('saves macro targets', () => {
    renderAt('/settings');
    fireEvent.change(screen.getByLabelText('Calories'), { target: { value: '2400' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save targets' }));
    expect(loadData().settings.targets.calories).toBe(2400);
  });
});
