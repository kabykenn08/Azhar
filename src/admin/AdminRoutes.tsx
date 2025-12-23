import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import LoginPage from './components/LoginPage';
import TranslationsPage from './components/TranslationsPage';
import MenuManager from './components/MenuManager';
import SectionsManager from './components/SectionsManager';

export default function AdminRoutes() {
  return (
    <Routes>
      {/* Страница логина (без layout) */}
      <Route path="/" element={<LoginPage />} />

      {/* Защищённые страницы (с layout и проверкой авторизации) */}
      <Route element={<AdminLayout />}>
        <Route path="translations" element={<TranslationsPage />} />
        <Route path="menu" element={<MenuManager />} />
        <Route path="sections" element={<SectionsManager />} />
      </Route>

      {/* Редирект на translations после входа */}
      <Route path="*" element={<Navigate to="/azhar/admin" replace />} />
    </Routes>
  );
}