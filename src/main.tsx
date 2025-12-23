import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainSite from './App';
import AdminRoutes from './admin/AdminRoutes';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Основной сайт */}
        <Route path="/azhar" element={<MainSite />} />
        <Route path="/azhar/:slug" element={<MainSite />} />

        {/* Все роуты админки */}
        <Route path="/azhar/admin/*" element={<AdminRoutes />} />

        {/* Редирект на главную */}
        <Route path="/" element={<Navigate to="/azhar" replace />} />
        <Route path="*" element={<Navigate to="/azhar" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);