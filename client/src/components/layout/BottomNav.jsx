import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageCircle, CloudSun, Bell, Menu } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

const TABS = [
  { to: '/app/dashboard', labelKey: 'nav_dashboard', icon: LayoutDashboard },
  { to: '/app/chat', labelKey: 'nav_chat', icon: MessageCircle },
  { to: '/app/weather', labelKey: 'nav_weather', icon: CloudSun },
  { to: '/app/reminders', labelKey: 'nav_reminders', icon: Bell },
];

export default function BottomNav({ onMoreClick }) {
  const { t } = useI18n();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {TABS.map(({ to, labelKey, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `mobile-bottom-nav__item${isActive ? ' is-active' : ''}`
          }
        >
          <Icon size={20} strokeWidth={2.2} />
          <span>{t(labelKey)}</span>
        </NavLink>
      ))}
      <button
        type="button"
        className="mobile-bottom-nav__item"
        onClick={onMoreClick}
        aria-label={t('open_menu')}
      >
        <Menu size={20} strokeWidth={2.2} />
        <span>{t('nav_more')}</span>
      </button>
    </nav>
  );
}
