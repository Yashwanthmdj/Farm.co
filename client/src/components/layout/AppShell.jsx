import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import PageTransition from './PageTransition';
import { useI18n } from '../../context/I18nContext';

const TITLE_KEYS = {
  dashboard: 'title_dashboard',
  chat: 'title_chat',
  expenses: 'title_expenses',
  tractor: 'title_tractor',
  reminders: 'title_reminders',
  weather: 'title_weather',
  soil: 'title_soil',
  disease: 'title_disease',
  marketplace: 'title_marketplace',
  store: 'title_store',
  prices: 'title_prices',
  schemes: 'title_schemes',
  irrigation: 'title_irrigation',
  analytics: 'title_analytics',
  profile: 'title_profile',
  settings: 'title_settings',
};

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { t } = useI18n();
  const segment = location.pathname.split('/')[2] || 'dashboard';
  const title = t(TITLE_KEYS[segment] || 'title_dashboard');

  return (
    <div className="bg-farm-gradient" style={{ display: 'flex', minHeight: '100vh' }}>
      <a href="#main-content" className="skip-link">
        {t('skip_main')}
      </a>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar title={title} onMenuClick={() => setMobileOpen((o) => !o)} />
        <main
          id="main-content"
          style={{
            flex: 1,
            padding: 'clamp(16px, 3vw, 28px) clamp(14px, 3vw, 28px) 60px',
            maxWidth: 1320,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
