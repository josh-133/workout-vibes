import { FormEvent, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import { useAppData } from '../context/AppDataContext';
import { formatDate, isoDate, loggedExerciseNames, topSetHistory } from '../lib/totals';
import { formatWeight, fromLbs, toLbs } from '../lib/units';
import { newId } from '../storage';
import { Units } from '../types';

interface Point {
  date: string;
  value: number;
}

export function ProgressPage() {
  const { data, update } = useAppData();
  const units = data.settings.units;
  const names = loggedExerciseNames(data.workoutLogs);
  const [exercise, setExercise] = useState(names[0] ?? '');
  const selected = names.includes(exercise) ? exercise : names[0] ?? '';
  const [weightDate, setWeightDate] = useState(isoDate());
  const [weight, setWeight] = useState('');

  const liftPoints = topSetHistory(data.workoutLogs, selected).map((p) => ({ date: p.date, value: fromLbs(p.weight, units) }));
  const bodyLogs = [...data.bodyLogs].sort((a, b) => a.date.localeCompare(b.date));
  const bodyPoints = bodyLogs.map((b) => ({ date: b.date, value: fromLbs(b.weightLbs, units) }));

  function addBodyWeight(e: FormEvent) {
    e.preventDefault();
    const value = Number(weight);
    if (!weight || !Number.isFinite(value) || value <= 0) return;
    // One entry per date: logging the same day again replaces it.
    update((d) => ({
      ...d,
      bodyLogs: [...d.bodyLogs.filter((b) => b.date !== weightDate), { id: newId(), date: weightDate, weightLbs: toLbs(value, units) }],
    }));
    setWeight('');
  }

  return (
    <div className="page">
      <h1>Progress</h1>

      <section className="card">
        <div className="page-header">
          <h2>Top set</h2>
          {names.length > 0 && (
            <select aria-label="Exercise" value={selected} onChange={(e) => setExercise(e.target.value)} style={{ width: 'auto' }}>
              {names.map((n) => <option key={n}>{n}</option>)}
            </select>
          )}
        </div>
        {liftPoints.length > 0 ? (
          <WeightChart points={liftPoints} units={units} label={selected} />
        ) : (
          <p className="empty">Log a workout to see your lifts here.</p>
        )}
      </section>

      <section className="card">
        <h2>Body weight</h2>
        <form className="row" onSubmit={addBodyWeight}>
          <label>
            Date
            <input type="date" value={weightDate} onChange={(e) => setWeightDate(e.target.value)} required />
          </label>
          <label>
            Weight ({units})
            <input type="number" min="0" step="any" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} required />
          </label>
          <button type="submit" className="primary">Add</button>
        </form>
        {bodyPoints.length > 0 ? (
          <>
            {bodyPoints.length > 1 && <WeightChart points={bodyPoints} units={units} label="Body weight" />}
            <ul className="list log-summary">
              {[...bodyLogs].reverse().map((b) => (
                <li key={b.id}>
                  <span>{formatDate(b.date)}</span>
                  <span>
                    {formatWeight(b.weightLbs, units)}{' '}
                    <button type="button" className="icon" aria-label={`Delete weight from ${b.date}`}
                      onClick={() => update((d) => ({ ...d, bodyLogs: d.bodyLogs.filter((x) => x.id !== b.id) }))}>✕</button>
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="empty">No weigh-ins yet.</p>
        )}
      </section>
    </div>
  );
}

function WeightChart({ points, units, label }: { points: Point[]; units: Units; label: string }) {
  return (
    <div className="chart" role="img" aria-label={`${label} over time, in ${units}`}>
      <ResponsiveContainer>
        <LineChart data={points} margin={{ top: 12, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" tickFormatter={(d: string) => formatDate(d, { month: 'short', day: 'numeric' })}
            axisLine={false} tickLine={false} minTickGap={24} />
          <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} width={48} />
          <Tooltip content={<ChartTooltip units={units} />} cursor={{ stroke: 'var(--muted)', strokeDasharray: '3 3' }} />
          <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2}
            dot={{ r: 4, fill: 'var(--accent)', stroke: 'var(--surface)', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: 'var(--accent)', stroke: 'var(--surface)', strokeWidth: 2 }}
            isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartTooltip({ active, payload, units }: TooltipProps<number, string> & { units: Units }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as Point;
  return (
    <div className="chart-tooltip">
      <div className="meta">{formatDate(point.date)}</div>
      <strong>{point.value} {units}</strong>
    </div>
  );
}
