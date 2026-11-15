import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { DayTabs } from '../components/DayTabs';
import { ExerciseForm } from '../components/ExerciseForm';
import { todayDay } from '../lib/totals';
import { formatWeight } from '../lib/units';
import { Day, WorkoutDay } from '../types';

export function WorkoutsPage() {
  const { data, update } = useAppData();
  const [day, setDay] = useState<Day>(todayDay());
  const [editingId, setEditingId] = useState<string | null>(null);
  const units = data.settings.units;
  const plan = data.workoutPlan.find((d) => d.day === day)!;

  function updateDay(fn: (d: WorkoutDay) => WorkoutDay) {
    update((prev) => ({ ...prev, workoutPlan: prev.workoutPlan.map((d) => (d.day === day ? fn(d) : d)) }));
  }

  function selectDay(next: Day) {
    setDay(next);
    setEditingId(null);
  }

  return (
    <div className="page">
      <h1>Workout plan</h1>
      <DayTabs
        selected={day}
        onSelect={selectDay}
        badge={(d) => {
          const w = data.workoutPlan.find((p) => p.day === d)!;
          return w.exercises.length ? w.title || `${w.exercises.length} ex` : 'rest';
        }}
      />

      <section className="card">
        <label>
          {day} title
          <input value={plan.title} placeholder="e.g. Push, Legs, Rest"
            onChange={(e) => updateDay((d) => ({ ...d, title: e.target.value }))} />
        </label>
      </section>

      {plan.exercises.length === 0 ? (
        <p className="card empty">Rest day — add an exercise below to plan a workout.</p>
      ) : (
        <ul className="list">
          {plan.exercises.map((ex, i) =>
            editingId === ex.id ? (
              <li key={ex.id}>
                <ExerciseForm initial={ex} units={units} onCancel={() => setEditingId(null)}
                  onSave={(saved) => {
                    updateDay((d) => ({ ...d, exercises: d.exercises.map((e) => (e.id === saved.id ? saved : e)) }));
                    setEditingId(null);
                  }} />
              </li>
            ) : (
              <li key={ex.id} className="card list-item">
                <div>
                  <strong>{ex.name}</strong>
                  <div className="meta">
                    {ex.sets} × {ex.reps}
                    {ex.weight !== undefined && ` @ ${formatWeight(ex.weight, units)}`}
                    {ex.notes && ` · ${ex.notes}`}
                  </div>
                </div>
                <div className="actions">
                  <button type="button" className="icon" aria-label={`Move ${ex.name} up`} disabled={i === 0}
                    onClick={() => updateDay((d) => ({ ...d, exercises: swap(d.exercises, i, i - 1) }))}>↑</button>
                  <button type="button" onClick={() => setEditingId(ex.id)}>Edit</button>
                  <button type="button" className="icon" aria-label={`Delete ${ex.name}`}
                    onClick={() => updateDay((d) => ({ ...d, exercises: d.exercises.filter((e) => e.id !== ex.id) }))}>✕</button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      <h2>Add exercise</h2>
      <ExerciseForm key={day} units={units}
        onSave={(ex) => updateDay((d) => ({ ...d, exercises: [...d.exercises, ex] }))} />
    </div>
  );
}

function swap<T>(items: T[], a: number, b: number): T[] {
  const next = [...items];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}
