import { NavLink } from 'react-router-dom';

const LINKS: [string, string, string][] = [
  ['/', 'Today', '☀'],
  ['/workouts', 'Workouts', '🏋'],
  ['/meals', 'Meals', '🍽'],
  ['/log', 'Log', '📝'],
  ['/progress', 'Progress', '📈'],
  ['/settings', 'Settings', '⚙'],
];

export function Nav() {
  return (
    <nav className="nav">
      <span className="brand">Workout Vibes</span>
      {LINKS.map(([to, label, icon]) => (
        <NavLink key={to} to={to} end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span aria-hidden="true">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
