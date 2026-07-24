import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { I18nProvider } from './context/I18nContext';
import { ReminderWatcher } from './context/ReminderWatcher';

import { AppShell } from './components/layout';
import { Spinner } from './components/ui';

import './styles/global.css';

const Landing = lazy(() => import('./pages/Landing'));
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Chat = lazy(() => import('./pages/Chat'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Tractor = lazy(() => import('./pages/Tractor'));
const Reminders = lazy(() => import('./pages/Reminders'));
const Weather = lazy(() => import('./pages/Weather'));
const Soil = lazy(() => import('./pages/Soil'));
const Disease = lazy(() => import('./pages/Disease'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Store = lazy(() => import('./pages/Store'));
const CropPrices = lazy(() => import('./pages/CropPrices'));
const Schemes = lazy(() => import('./pages/Schemes'));
const Irrigation = lazy(() => import('./pages/Irrigation'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function PageLoader() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <Spinner size={32} />
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />

        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="chat" element={<Chat />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="tractor" element={<Tractor />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="weather" element={<Weather />} />
          <Route path="soil" element={<Soil />} />
          <Route path="disease" element={<Disease />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="store" element={<Store />} />
          <Route path="prices" element={<CropPrices />} />
          <Route path="schemes" element={<Schemes />} />
          <Route path="irrigation" element={<Irrigation />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <I18nProvider>
              <ReminderWatcher />
              <AppRoutes />
            </I18nProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
