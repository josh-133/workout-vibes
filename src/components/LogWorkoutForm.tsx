import { FormEvent, useState } from 'react';
import { Day, DAYS, LogEntry, WorkoutDay, WorkoutLog } from '../types';
import { newId } from '../storage';
import { isoDate, todayDay } from '../lib/totals';

interface Props {
  plan: WorkoutDay[];
  initialDay?: Day;
  onSave: (log: WorkoutLog) => void;
  onCancel: () => void;
}

/** Turns a planned day into editable log entries (one row per planned set). */
function entriesFromPlan(day: WorkoutDay | undefined): LogEntry[] {
  if (!day || day.exercises.length === 0) return [{ exerciseName: '', sets: [{ reps: 0, weight: 0 }] }];
  return day.exercises.map((ex) => ({
    exerciseName: ex.name,
    sets: Array.from({ length: ex.sets }, () => ({ reps: ex.reps, weight: ex.weight ?? 0 })),
  }));
}

export function LogWorkoutForm({ plan, initialDay, onSave, onCancel }: Props) {
  const [day, setDay] = useState<Day>(initialDay ?? todayDay());
  const [date, setDate] = useState(isoDate());
  const [notes, setNotes] = useState('');
  const [entries, setEntries] = useState<LogEntry[]>(() =>
    entriesFromPlan(plan.find((d) => d.day === (initialDay ?? todayDay()))),
  );

  function changeDay(next: Day) {
    setDay(next);
    setEntries(entriesFromPlan(plan.find((d) => d.day === next)));
  }

  function setEntry(i: number, fn: (e: LogEntry) => LogEntry) {
    setEntries((prev) => prev.map((e, j) => (j === i ? fn(e) : e)));
  }

  function setSetField(i: number, s: number, field: 'reps' | 'weight', value: string) {
    setEntry(i, (e) => ({
      ...e,
      sets: e.sets.map((set, k) => (k === s ? { ...set, [field]: Number(value) || 0 } : set)),
    }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const cleaned = entries
      .map((en) => ({ ...en, exerciseName: en.exerciseName.trim(), sets: en.sets.filter((s) => s.reps > 0) }))
      .filter((en) => en.exerciseName && en.sets.length > 0);
    if (cleaned.length === 0) return;
    onSave({
      id: newId(),
      date,
      day,
      title: plan.find((d) => d.day === day)?.title ?? '',
      entries: cleaned,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form className="card log-form" onSubmit={submit}>
      <div className="row">
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          Plan day
          <select value={day} onChange={(e) => changeDay(e.target.value as Day)}>
            {DAYS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
      </div>

      {entries.map((entry, i) => (
        <fieldset key={i} className="log-entry">
          <div className="row">
            <input
              aria-label="Exercise name"
              value={entry.exerciseName}
              onChange={(e) => setEntry(i, (en) => ({ ...en, exerciseName: e.target.value }))}
              placeholder="Exercise"
            />
            <button type="button" className="icon" aria-label="Remove exercise"
              onClick={() => setEntries((prev) => prev.filter((_, j) => j !== i))}>✕</button>
          </div>
          <div className="set-grid">
            <span>Set</span><span>Reps</span><span>Weight</span><span />
            {entry.sets.map((set, s) => (
              <div key={s} className="set-row">
                <span>{s + 1}</span>
                <input type="number" min="0" inputMode="numeric" aria-label={`Set ${s + 1} reps`}
                  value={set.reps || ''} onChange={(e) => setSetField(i, s, 'reps', e.target.value)} />
                <input type="number" min="0" step="any" inputMode="decimal" aria-label={`Set ${s + 1} weight`}
                  value={set.weight || ''} onChange={(e) => setSetField(i, s, 'weight', e.target.value)} />
                <button type="button" className="icon" aria-label={`Remove set ${s + 1}`}
                  onClick={() => setEntry(i, (en) => ({ ...en, sets: en.sets.filter((_, k) => k !== s) }))}>−</button>
              </div>
            ))}
          </div>
          <button type="button" className="link"
            onClick={() => setEntry(i, (en) => ({ ...en, sets: [...en.sets, { ...(en.sets.at(-1) ?? { reps: 0, weight: 0 }) }] }))}>
            + Add set
          </button>
        </fieldset>
      ))}

      <button type="button" onClick={() => setEntries((prev) => [...prev, { exerciseName: '', sets: [{ reps: 0, weight: 0 }] }])}>
        + Add exercise
      </button>

      <label>
        Notes
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it go?" />
      </label>

      <div className="actions">
        <button type="submit" className="primary">Save workout</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
