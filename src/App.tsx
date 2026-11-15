import { Navigate, Route, Routes } from 'react-router-dom';
import { Nav } from './components/Nav';
import { MealsPage } from './pages/MealsPage';
import { SettingsPage } from './pages/SettingsPage';
import { WorkoutsPage } from './pages/WorkoutsPage';

export function App() {
  return (
    <div className="app">
      <Nav />
      <main className="content">
        <Routes>
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/meals" element={<MealsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/workouts" replace />} />
        </Routes>
      </main>
    </div>
  );
}
