import { Macros } from '../lib/totals';
import { Targets } from '../types';

export function MacroTotals({ totals, targets = {} }: { totals: Macros; targets?: Targets }) {
  const items: [keyof Macros, string, string][] = [
    ['calories', 'Calories', ''],
    ['protein', 'Protein', 'g'],
    ['carbs', 'Carbs', 'g'],
    ['fat', 'Fat', 'g'],
  ];
  return (
    <div className="macro-totals">
      {items.map(([key, label, unit]) => {
        const value = totals[key];
        const target = targets[key];
        return (
          <div key={key} className="macro">
            <strong>{Math.round(value)}{unit}</strong>
            <span>{target ? `${label} / ${target}${unit}` : label}</span>
            {target ? (
              <div className="bar" role="meter" aria-label={`${label} vs target`}
                aria-valuemin={0} aria-valuemax={target} aria-valuenow={Math.round(value)}>
                <i className={value > target ? 'over' : ''} style={{ width: `${Math.min(100, (value / target) * 100)}%` }} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
