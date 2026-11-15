import { useSearchParams } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { LogWorkoutForm } from '../components/LogWorkoutForm';
import { formatDate } from '../lib/totals';
import { formatWeight } from '../lib/units';
import { Day, DAYS } from '../types';

/** `?new=1` opens the log form; `&day=Mon` pre-fills it from that plan day. */
export function LogPage() {
  const { data, update } = useAppData();
  const [params, setParams] = useSearchParams();
  const units = data.settings.units;
  const logging = params.get('new') === '1';
  const dayParam = params.get('day');
  const initialDay = DAYS.includes(dayParam as Day) ? (dayParam as Day) : undefined;
  const logs = [...data.workoutLogs].sort((a, b) => b.date.localeCompare(a.date));

  function remove(id: string) {
    if (!confirm('Delete this workout log?')) return;
    update((d) => ({ ...d, workoutLogs: d.workoutLogs.filter((l) => l.id !== id) }));
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Workout log</h1>
        {!logging && (
          <button type="button" className="primary" onClick={() => setParams({ new: '1' })}>+ Log workout</button>
        )}
      </div>

      {logging && (
        <LogWorkoutForm
          plan={data.workoutPlan}
          initialDay={initialDay}
          units={units}
          onCancel={() => setParams({})}
          onSave={(log) => {
            update((d) => ({ ...d, workoutLogs: [...d.workoutLogs, log] }));
            setParams({});
          }}
        />
      )}

      {logs.length === 0 && !logging && <p className="card empty">No workouts logged yet.</p>}

      <ul className="list">
        {logs.map((log) => (
          <li key={log.id} className="card">
            <div className="list-item">
              <div>
                <strong>{formatDate(log.date)}</strong>
                <span className="meta"> · {log.title || log.day}</span>
              </div>
              <button type="button" className="icon" aria-label={`Delete workout from ${log.date}`}
                onClick={() => remove(log.id)}>✕</button>
            </div>
            <ul className="log-summary">
              {log.entries.map((entry, i) => (
                <li key={i}>
                  <span>{entry.exerciseName}</span>
                  <span className="meta">
                    {entry.sets.map((s) => (s.weight ? `${s.reps}×${formatWeight(s.weight, units)}` : `${s.reps}`)).join(', ')}
                  </span>
                </li>
              ))}
            </ul>
            {log.notes && <p className="meta">{log.notes}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
