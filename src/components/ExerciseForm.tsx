import { FormEvent, useState } from 'react';
import { Exercise, Units } from '../types';
import { newId } from '../storage';
import { optionalNumber } from '../lib/forms';
import { fromLbs, toLbs } from '../lib/units';

interface Props {
  initial?: Exercise;
  units: Units;
  onSave: (exercise: Exercise) => void;
  onCancel?: () => void;
}

export function ExerciseForm({ initial, units, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [sets, setSets] = useState(String(initial?.sets ?? 3));
  const [reps, setReps] = useState(String(initial?.reps ?? 10));
  const initialWeight = initial?.weight !== undefined ? String(fromLbs(initial.weight, units)) : '';
  const [weight, setWeight] = useState(initialWeight);
  const [notes, setNotes] = useState(initial?.notes ?? '');

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    // Keep the stored value when untouched so kg rounding doesn't drift it.
    const w = optionalNumber(weight);
    onSave({
      id: initial?.id ?? newId(),
      name: name.trim(),
      sets: Math.max(1, Number(sets) || 1),
      reps: Math.max(1, Number(reps) || 1),
      weight: weight === initialWeight ? initial?.weight : w === undefined ? undefined : toLbs(w, units),
      notes: notes.trim() || undefined,
    });
    if (!initial) {
      setName('');
      setWeight('');
      setNotes('');
    }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <label className="wide">
        Exercise
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Back squat" required />
      </label>
      <label>
        Sets
        <input type="number" min="1" inputMode="numeric" value={sets} onChange={(e) => setSets(e.target.value)} />
      </label>
      <label>
        Reps
        <input type="number" min="1" inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} />
      </label>
      <label>
        Weight ({units})
        <input type="number" min="0" step="any" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
      </label>
      <label className="wide">
        Notes
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="optional" />
      </label>
      <div className="actions wide">
        <button type="submit" className="primary">{initial ? 'Save' : 'Add exercise'}</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
