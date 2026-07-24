import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageCircle,
  Wallet,
  Tractor,
  Bell,
  CloudSun,
  FlaskConical,
  Bug,
  Store,
  ShoppingBag,
  LineChart,
  Landmark,
  Droplets,
  BarChart3,
  User,
  Settings,
  Sprout,
  X,
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

const NAV_ITEMS = [
  { to: '/app/dashboard', labelKey: 'nav_dashboard', icon: LayoutDashboard },
  { to: '/app/chat', labelKey: 'nav_chat', icon: MessageCircle },
  { to: '/app/expenses', labelKey: 'nav_expenses', icon: Wallet },
  { to: '/app/tractor', labelKey: 'nav_tractor', icon: Tractor },
  { to: '/app/reminders', labelKey: 'nav_reminders', icon: Bell },
  { to: '/app/weather', labelKey: 'nav_weather', icon: CloudSun },
  { to: '/app/soil', labelKey: 'nav_soil', icon: FlaskConical },
  { to: '/app/disease', labelKey: 'nav_disease', icon: Bug },
  { to: '/app/marketplace', labelKey: 'nav_marketplace', icon: Store },
  { to: '/app/store', labelKey: 'nav_store', icon: ShoppingBag },
  { to: '/app/prices', labelKey: 'nav_prices', icon: LineChart },
  { to: '/app/schemes', labelKey: 'nav_schemes', icon: Landmark },
  { to: '/app/irrigation', labelKey: 'nav_irrigation', icon: Droplets },
  { to: '/app/analytics', labelKey: 'nav_analytics', icon: BarChart3 },
];

const BOTTOM_ITEMS = [
  { to: '/app/profile', labelKey: 'nav_profile', icon: User },
  { to: '/app/settings', labelKey: 'nav_settings', icon: Settings },
];

function NavItem({ to, label, icon: Icon, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 14,
        fontWeight: 600,
        color: isActive ? '#fff' : 'var(--muted)',
        background: isActive
          ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
          : 'transparent',
        transition: 'background var(--transition-fast), color var(--transition-fast)',
      })}
    >
      <Icon size={17} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ mobileOpen = false, onClose }) {
  const { t } = useI18n();

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 90,
          }}
          className="sidebar-overlay"
        />
      )}
      <nav
        aria-label="Primary navigation"
        className={`app-sidebar${mobileOpen ? ' mobile-open' : ''}`}
        style={{
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          width: 'var(--sidebar-width)',
          height: '100vh',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 14px',
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sprout size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 19 }}>
              Farm<span style={{ color: 'var(--primary)' }}>.co</span>
            </span>
          </div>
          <button
            aria-label={t('close_menu')}
            onClick={onClose}
            className="sidebar-close-btn"
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'none' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={t(item.labelKey)}
              onNavigate={onClose}
            />
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {BOTTOM_ITEMS.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={t(item.labelKey)}
              onNavigate={onClose}
            />
          ))}
        </div>
      </nav>
    </>
  );
}
