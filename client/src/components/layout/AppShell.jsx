import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
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
  const isChat = segment === 'chat';

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="app-shell bg-farm-gradient">
      <a href="#main-content" className="skip-link">
        {t('skip_main')}
      </a>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="app-shell__main">
        <TopBar title={title} onMenuClick={() => setMobileOpen((o) => !o)} />
        <main
          id="main-content"
          className={`app-shell__content${isChat ? ' is-chat' : ''}`}
        >
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
        <BottomNav onMoreClick={() => setMobileOpen(true)} />
      </div>
    </div>
  );
}
