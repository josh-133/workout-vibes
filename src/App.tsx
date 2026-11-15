import { Navigate, Route, Routes } from 'react-router-dom';
import { Nav } from './components/Nav';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <div className="app">
      <Nav />
      <main className="content">
        <Routes>
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/settings" replace />} />
        </Routes>
      </main>
    </div>
  );
}
