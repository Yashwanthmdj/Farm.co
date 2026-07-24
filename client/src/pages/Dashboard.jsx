import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CloudSun,
  Wallet,
  Bell,
  MessageCircle,
  FlaskConical,
  LineChart,
  ArrowRight,
  Tractor,
  Bug,
  Store,
} from 'lucide-react';
import { Card, Badge, Skeleton, LanguageSwitcher } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { getExpenses, getRevenues } from '../api/expenses';
import { getReminders } from '../api/reminders';
import { getSoilHistory } from '../api/soil';
import { getCropPrices } from '../api/cropPrices';

const QUICK_ACTION_DEFS = [
  { to: '/app/chat', labelKey: 'ask_ai', icon: MessageCircle },
  { to: '/app/soil', labelKey: 'soil_test', icon: FlaskConical },
  { to: '/app/disease', labelKey: 'detect_disease', icon: Bug },
  { to: '/app/tractor', labelKey: 'tractor_log', icon: Tractor },
  { to: '/app/store', labelKey: 'store', icon: Store },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const userId = user?._id;

  const [loading, setLoading] = useState(true);
  const [expenseSummary, setExpenseSummary] = useState({ totalExpense: 0, totalRevenue: 0 });
  const [reminders, setReminders] = useState([]);
  const [soilLatest, setSoilLatest] = useState(null);
  const [prices, setPrices] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [expenses, revenues, remindersData, soilHistory, cropPrices] = await Promise.all([
          getExpenses(userId).catch(() => []),
          getRevenues(userId).catch(() => []),
          getReminders(userId).catch(() => []),
          getSoilHistory(userId).catch(() => []),
          getCropPrices().catch(() => null),
        ]);
        if (!active) return;
        const totalExpense = (expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
        const totalRevenue = (revenues || []).reduce((s, r) => s + (r.amount || 0), 0);
        setExpenseSummary({ totalExpense, totalRevenue });
        const upcoming = (remindersData || [])
          .filter((r) => !r.isSent)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3);
        setReminders(upcoming);
        setSoilLatest((soilHistory || [])[0] || null);
        setPrices(cropPrices);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  const profit = expenseSummary.totalRevenue - expenseSummary.totalExpense;
  const priceSample = prices?.categories
    ? Object.values(prices.categories).flat().slice(0, 3)
    : [];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          marginBottom: 26,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 24px)', marginBottom: 4 }}>
            {t('welcome')}, {user?.name?.split(' ')[0] || t('farmer')} 👋
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            {t('dashboard_subtitle')}
          </p>
        </div>
        <LanguageSwitcher />
      </motion.div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
        {QUICK_ACTION_DEFS.map((qa, i) => (
          <motion.div
            key={qa.to}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={qa.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              <qa.icon size={15} style={{ color: 'var(--primary)' }} />
              {t(qa.labelKey)}
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}
      >
        {/* Weather shortcut */}
        <motion.div variants={item}>
          <Card hover style={{ height: '100%' }}>
            <CardHeader icon={CloudSun} title={t('nav_weather')} to="/app/weather" />
            <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
              {t('dashboard_subtitle')}
            </p>
          </Card>
        </motion.div>

        {/* Expense summary */}
        <motion.div variants={item}>
          <Card hover style={{ height: '100%' }}>
            <CardHeader icon={Wallet} title={t('expenses_overview')} to="/app/expenses" />
            {loading ? (
              <Skeleton height={40} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Row label={t('total_revenue')} value={`₹${expenseSummary.totalRevenue.toLocaleString()}`} color="var(--success)" />
                <Row label={t('total_expense')} value={`₹${expenseSummary.totalExpense.toLocaleString()}`} color="var(--error)" />
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 2 }}>
                  <Row
                    label={t('net')}
                    value={`₹${Math.abs(profit).toLocaleString()}`}
                    color={profit >= 0 ? 'var(--success)' : 'var(--error)'}
                    bold
                  />
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Reminders */}
        <motion.div variants={item}>
          <Card hover style={{ height: '100%' }}>
            <CardHeader icon={Bell} title={t('todays_tasks')} to="/app/reminders" />
            {loading ? (
              <Skeleton height={40} />
            ) : reminders.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>{t('no_reminders')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reminders.map((r) => (
                  <div key={r._id} style={{ fontSize: 13.5 }}>
                    <strong>{new Date(r.date).toLocaleDateString()}</strong> — {r.message}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* AI chat */}
        <motion.div variants={item}>
          <Card hover style={{ height: '100%' }}>
            <CardHeader icon={MessageCircle} title={t('ask_farmco_ai')} to="/app/chat" />
            <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 14 }}>
              {t('ask_farmco_desc')}
            </p>
            <Link
              to="/app/chat"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 700, fontSize: 13.5 }}
            >
              {t('start_chatting')} <ArrowRight size={14} />
            </Link>
          </Card>
        </motion.div>

        {/* Soil health */}
        <motion.div variants={item}>
          <Card hover style={{ height: '100%' }}>
            <CardHeader icon={FlaskConical} title={t('soil_health')} to="/app/soil" />
            {loading ? (
              <Skeleton height={40} />
            ) : soilLatest ? (
              <div style={{ fontSize: 13.5 }}>
                <Badge tone={soilLatest.status === 'completed' ? 'success' : 'warning'} style={{ marginBottom: 8 }}>
                  {soilLatest.status}
                </Badge>
                <p style={{ color: 'var(--muted)' }}>
                  {soilLatest.fileName} ({new Date(soilLatest.createdAt).toLocaleDateString()})
                </p>
              </div>
            ) : (
              <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>{t('no_soil')}</p>
            )}
          </Card>
        </motion.div>

        {/* Crop prices */}
        <motion.div variants={item}>
          <Card hover style={{ height: '100%' }}>
            <CardHeader icon={LineChart} title={t('crop_prices')} to="/app/prices" />
            {loading ? (
              <Skeleton height={40} />
            ) : priceSample.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {priceSample.map((p) => (
                  <Row key={p.name} label={p.name} value={`₹${p.price}`} />
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>{t('loading')}</p>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

function CardHeader({ icon: Icon, title, to }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: 'rgba(63,163,77,0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={16} style={{ color: 'var(--primary)' }} />
        </div>
        <h3 style={{ fontSize: 15 }}>{title}</h3>
      </div>
      <Link to={to} aria-label={`View ${title}`} style={{ color: 'var(--muted)' }}>
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function Row({ label, value, color, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ color: color || 'var(--text)', fontWeight: bold ? 800 : 600 }}>{value}</span>
    </div>
  );
}
