import { Day, DAYS } from '../types';
import { todayDay } from '../lib/totals';

interface Props {
  selected: Day;
  onSelect: (day: Day) => void;
  /** Optional per-day marker, e.g. "rest" or a meal count. */
  badge?: (day: Day) => string | undefined;
}

export function DayTabs({ selected, onSelect, badge }: Props) {
  const today = todayDay();
  return (
    <div className="day-tabs" role="tablist">
      {DAYS.map((day) => (
        <button
          key={day}
          role="tab"
          aria-selected={day === selected}
          className={`day-tab${day === selected ? ' active' : ''}${day === today ? ' today' : ''}`}
          onClick={() => onSelect(day)}
        >
          <span>{day}</span>
          {badge?.(day) && <small>{badge(day)}</small>}
        </button>
      ))}
    </div>
  );
}
