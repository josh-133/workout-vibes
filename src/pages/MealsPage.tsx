import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { DayTabs } from '../components/DayTabs';
import { MacroTotals } from '../components/MacroTotals';
import { MealForm } from '../components/MealForm';
import { sumMacros, todayDay } from '../lib/totals';
import { newId } from '../storage';
import { Day, Meal, MEAL_SLOTS, MealDay } from '../types';

export function MealsPage() {
  const { data, update } = useAppData();
  const [day, setDay] = useState<Day>(todayDay());
  const [editingId, setEditingId] = useState<string | null>(null);
  const plan = data.mealPlan.find((d) => d.day === day)!;

  function updateDay(fn: (d: MealDay) => MealDay) {
    update((prev) => ({ ...prev, mealPlan: prev.mealPlan.map((d) => (d.day === day ? fn(d) : d)) }));
  }

  function copyToAllDays() {
    if (!confirm(`Replace every other day's meals with ${day}'s meals?`)) return;
    update((prev) => ({
      ...prev,
      mealPlan: prev.mealPlan.map((d) =>
        d.day === day ? d : { day: d.day, meals: plan.meals.map((m) => ({ ...m, id: newId() })) },
      ),
    }));
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Meal plan</h1>
        {plan.meals.length > 0 && <button type="button" onClick={copyToAllDays}>Copy {day} to all days</button>}
      </div>
      <DayTabs
        selected={day}
        onSelect={(d) => { setDay(d); setEditingId(null); }}
        badge={(d) => {
          const kcal = sumMacros(data.mealPlan.find((p) => p.day === d)!.meals).calories;
          return kcal ? `${Math.round(kcal)}` : undefined;
        }}
      />

      <section className="card">
        <MacroTotals totals={sumMacros(plan.meals)} targets={data.settings.targets} />
      </section>

      {plan.meals.length === 0 && <p className="card empty">No meals planned for {day}.</p>}

      {MEAL_SLOTS.map((slot) => {
        const meals = plan.meals.filter((m) => m.slot === slot);
        if (meals.length === 0) return null;
        return (
          <section key={slot}>
            <h2>{slot[0].toUpperCase() + slot.slice(1)}</h2>
            <ul className="list">
              {meals.map((meal) =>
                editingId === meal.id ? (
                  <li key={meal.id}>
                    <MealForm initial={meal} onCancel={() => setEditingId(null)}
                      onSave={(saved) => {
                        updateDay((d) => ({ ...d, meals: d.meals.map((m) => (m.id === saved.id ? saved : m)) }));
                        setEditingId(null);
                      }} />
                  </li>
                ) : (
                  <li key={meal.id} className="card list-item">
                    <div>
                      <strong>{meal.name}</strong>
                      <div className="meta">{describeMacros(meal)}</div>
                    </div>
                    <div className="actions">
                      <button type="button" onClick={() => setEditingId(meal.id)}>Edit</button>
                      <button type="button" className="icon" aria-label={`Delete ${meal.name}`}
                        onClick={() => updateDay((d) => ({ ...d, meals: d.meals.filter((m) => m.id !== meal.id) }))}>✕</button>
                    </div>
                  </li>
                ),
              )}
            </ul>
          </section>
        );
      })}

      <h2>Add meal</h2>
      <MealForm key={day} onSave={(meal) => updateDay((d) => ({ ...d, meals: [...d.meals, meal] }))} />
    </div>
  );
}

function describeMacros(meal: Meal): string {
  const parts = [
    meal.calories !== undefined && `${meal.calories} kcal`,
    meal.protein !== undefined && `${meal.protein}g P`,
    meal.carbs !== undefined && `${meal.carbs}g C`,
    meal.fat !== undefined && `${meal.fat}g F`,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'No macros entered';
}
