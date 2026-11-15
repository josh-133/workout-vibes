import { Link } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { MacroTotals } from '../components/MacroTotals';
import { formatDate, isoDate, sumMacros, todayDay } from '../lib/totals';
import { formatWeight } from '../lib/units';
import { MEAL_SLOTS } from '../types';

export function TodayPage() {
  const { data } = useAppData();
  const units = data.settings.units;
  const day = todayDay();
  const today = isoDate();
  const workout = data.workoutPlan.find((d) => d.day === day)!;
  const meals = data.mealPlan.find((d) => d.day === day)!.meals;
  const loggedToday = data.workoutLogs.some((l) => l.date === today);
  const latestWeight = [...data.bodyLogs].sort((a, b) => b.date.localeCompare(a.date))[0];
  const hasPlan = data.workoutPlan.some((d) => d.exercises.length) || data.mealPlan.some((d) => d.meals.length);

  return (
    <div className="page">
      <h1>{formatDate(today, { weekday: 'long', month: 'long', day: 'numeric' })}</h1>

      {!hasPlan && (
        <p className="notice">
          Your plan is empty. Build one under <Link to="/workouts">Workouts</Link> and <Link to="/meals">Meals</Link>,
          or load a sample plan in <Link to="/settings">Settings</Link>.
        </p>
      )}

      <section className="card">
        <div className="page-header">
          <h2>{workout.exercises.length ? `Workout${workout.title ? ` · ${workout.title}` : ''}` : 'Rest day'}</h2>
          {loggedToday ? (
            <span className="badge good">✓ Logged</span>
          ) : (
            <Link className="button primary" to={`/log?new=1&day=${day}`}>Log workout</Link>
          )}
        </div>
        {workout.exercises.length > 0 ? (
          <ul className="log-summary">
            {workout.exercises.map((ex) => (
              <li key={ex.id}>
                <span>{ex.name}</span>
                <span className="meta">
                  {ex.sets} × {ex.reps}{ex.weight !== undefined && ` @ ${formatWeight(ex.weight, units)}`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="meta">Nothing planned. Recover well.</p>
        )}
      </section>

      <section className="card">
        <div className="page-header">
          <h2>Meals</h2>
          <Link to="/meals">Edit</Link>
        </div>
        <MacroTotals totals={sumMacros(meals)} targets={data.settings.targets} />
        {meals.length > 0 ? (
          <ul className="log-summary">
            {MEAL_SLOTS.flatMap((slot) => meals.filter((m) => m.slot === slot)).map((m) => (
              <li key={m.id}>
                <span>{m.name}</span>
                <span className="meta">
                  {m.slot}{m.calories !== undefined && ` · ${m.calories} kcal`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="meta">No meals planned for today.</p>
        )}
      </section>

      <section className="card list-item">
        <div>
          <h2>Body weight</h2>
          <span className="meta">
            {latestWeight ? `${formatWeight(latestWeight.weightLbs, units)} on ${formatDate(latestWeight.date)}` : 'No weigh-ins yet'}
          </span>
        </div>
        <Link to="/progress">Progress →</Link>
      </section>
    </div>
  );
}
