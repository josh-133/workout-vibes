import { Macros } from '../lib/totals';

export function MacroTotals({ totals }: { totals: Macros }) {
  const items: [string, number, string][] = [
    ['Calories', totals.calories, ''],
    ['Protein', totals.protein, 'g'],
    ['Carbs', totals.carbs, 'g'],
    ['Fat', totals.fat, 'g'],
  ];
  return (
    <div className="macro-totals">
      {items.map(([label, value, unit]) => (
        <div key={label} className="macro">
          <strong>{Math.round(value)}{unit}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
