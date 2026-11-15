import { FormEvent, useState } from 'react';
import { Meal, MEAL_SLOTS, MealSlot } from '../types';
import { newId } from '../storage';
import { optionalNumber } from '../lib/forms';

interface Props {
  initial?: Meal;
  onSave: (meal: Meal) => void;
  onCancel?: () => void;
}

export function MealForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [slot, setSlot] = useState<MealSlot>(initial?.slot ?? 'breakfast');
  const [calories, setCalories] = useState(initial?.calories?.toString() ?? '');
  const [protein, setProtein] = useState(initial?.protein?.toString() ?? '');
  const [carbs, setCarbs] = useState(initial?.carbs?.toString() ?? '');
  const [fat, setFat] = useState(initial?.fat?.toString() ?? '');

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: initial?.id ?? newId(),
      name: name.trim(),
      slot,
      calories: optionalNumber(calories),
      protein: optionalNumber(protein),
      carbs: optionalNumber(carbs),
      fat: optionalNumber(fat),
    });
    if (!initial) {
      setName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
    }
  }

  const num = (value: string, set: (v: string) => void) => ({
    type: 'number',
    min: '0',
    step: 'any',
    inputMode: 'decimal' as const,
    value,
    onChange: (e: { target: { value: string } }) => set(e.target.value),
  });

  return (
    <form className="card form" onSubmit={submit}>
      <label className="wide">
        Meal
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chicken & rice" required />
      </label>
      <label className="wide">
        Slot
        <select value={slot} onChange={(e) => setSlot(e.target.value as MealSlot)}>
          {MEAL_SLOTS.map((s) => (
            <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </label>
      <label>Calories<input {...num(calories, setCalories)} /></label>
      <label>Protein (g)<input {...num(protein, setProtein)} /></label>
      <label>Carbs (g)<input {...num(carbs, setCarbs)} /></label>
      <label>Fat (g)<input {...num(fat, setFat)} /></label>
      <div className="actions wide">
        <button type="submit" className="primary">{initial ? 'Save' : 'Add meal'}</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
