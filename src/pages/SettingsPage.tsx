import { ChangeEvent, FormEvent, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { emptyData, parseData } from '../storage';
import { optionalNumber } from '../lib/forms';
import { withSamplePlan } from '../lib/sample';
import { Targets, Units } from '../types';

const TARGET_FIELDS: [keyof Targets, string][] = [
  ['calories', 'Calories'],
  ['protein', 'Protein (g)'],
  ['carbs', 'Carbs (g)'],
  ['fat', 'Fat (g)'],
];

export function SettingsPage() {
  const { data, update, replace } = useAppData();
  const [targets, setTargets] = useState(() =>
    Object.fromEntries(TARGET_FIELDS.map(([k]) => [k, data.settings.targets[k]?.toString() ?? ''])),
  );
  const [message, setMessage] = useState('');

  function setUnits(units: Units) {
    update((d) => ({ ...d, settings: { ...d.settings, units } }));
  }

  function saveTargets(e: FormEvent) {
    e.preventDefault();
    const next: Targets = Object.fromEntries(TARGET_FIELDS.map(([k]) => [k, optionalNumber(targets[k])]));
    update((d) => ({ ...d, settings: { ...d.settings, targets: next } }));
    setMessage('Targets saved.');
  }

  function loadSample() {
    if (!confirm('Replace your workout and meal plans with the sample plan? Logs are kept.')) return;
    update(withSamplePlan);
    setMessage('Sample plan loaded.');
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `workout-vibes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importData(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const parsed = parseData(JSON.parse(await file.text()));
      if (!confirm('Replace all current data with this backup?')) return;
      replace(parsed);
      setMessage('Backup imported.');
    } catch (err) {
      setMessage(`Import failed: ${err instanceof Error ? err.message : 'invalid file'}`);
    }
  }

  function reset() {
    if (!confirm('Delete all plans, logs and settings? This cannot be undone.')) return;
    replace(emptyData());
    setMessage('All data cleared.');
  }

  return (
    <div className="page">
      <h1>Settings</h1>
      {message && <p className="notice" role="status">{message}</p>}

      <section className="card">
        <h2>Units</h2>
        <div className="segmented" role="radiogroup" aria-label="Weight units">
          {(['lb', 'kg'] as const).map((u) => (
            <button key={u} type="button" role="radio" aria-checked={data.settings.units === u}
              className={data.settings.units === u ? 'active' : ''} onClick={() => setUnits(u)}>
              {u}
            </button>
          ))}
        </div>
      </section>

      <form className="card form" onSubmit={saveTargets}>
        <h2 className="wide">Daily targets</h2>
        {TARGET_FIELDS.map(([k, label]) => (
          <label key={k}>
            {label}
            <input type="number" min="0" step="any" inputMode="decimal" value={targets[k]}
              onChange={(e) => setTargets((t) => ({ ...t, [k]: e.target.value }))} />
          </label>
        ))}
        <div className="actions wide">
          <button type="submit" className="primary">Save targets</button>
        </div>
      </form>

      <section className="card">
        <h2>Data</h2>
        <p className="muted">Everything is stored in this browser. Export a backup to move it to another device.</p>
        <div className="actions">
          <button type="button" onClick={loadSample}>Load sample plan</button>
          <button type="button" onClick={exportData}>Export JSON</button>
          <label className="button">
            Import JSON
            <input type="file" accept="application/json,.json" onChange={importData} hidden />
          </label>
          <button type="button" className="danger" onClick={reset}>Reset all data</button>
        </div>
      </section>
    </div>
  );
}
