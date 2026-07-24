import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sprout,
  MessageCircle,
  CloudSun,
  FlaskConical,
  Wallet,
  Store,
  ArrowRight,
  Bug,
} from 'lucide-react';
import { LanguageSwitcher } from '../components/ui';
import { useI18n } from '../context/I18nContext';

const FEATURES = [
  { icon: MessageCircle, titleKey: 'nav_chat', desc: 'Ask anything about crops, pests or soil in your own language.' },
  { icon: CloudSun, titleKey: 'nav_weather', desc: 'Localized forecasts with rain alerts and sowing-day suggestions.' },
  { icon: FlaskConical, titleKey: 'nav_soil', desc: 'Upload a soil report and get fertilizer & crop recommendations.' },
  { icon: Bug, titleKey: 'nav_disease', desc: 'Snap a leaf photo to detect disease and get treatment advice.' },
  { icon: Wallet, titleKey: 'nav_expenses', desc: 'Track expenses and revenue with clear profit/loss summaries.' },
  { icon: Store, titleKey: 'nav_marketplace', desc: 'Sell your produce directly or shop for farming supplies.' },
];

export default function Landing() {
  const { t } = useI18n();

  return (
    <div style={{ minHeight: '100dvh', overflowX: 'hidden' }} className="bg-farm-gradient landing-page">
      <div className="landing-orb landing-orb-a" aria-hidden />
      <div className="landing-orb landing-orb-b" aria-hidden />

      <header className="container landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            whileHover={{ rotate: 8 }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Sprout size={19} color="#fff" />
          </motion.div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(20px, 5vw, 22px)' }}>
            Farm<span className="gradient-text">.co</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LanguageSwitcher compact />
          <Link to="/login">
            <motion.span
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="landing-cta"
            >
              {t('get_started')} <ArrowRight size={15} />
            </motion.span>
          </Link>
        </div>
      </header>

      <section className="container landing-hero">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              margin: '0 auto 22px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Sprout size={34} color="#fff" />
          </motion.div>

          <h1 className="landing-title">
            Farm<span className="gradient-text">.co</span>
          </h1>
          <p className="landing-sub" style={{ marginBottom: 10, fontSize: 'clamp(16px, 3vw, 20px)', color: 'var(--text)', fontWeight: 600 }}>
            {t('landing_headline')}
          </p>
          <p className="landing-sub">{t('landing_sub')}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login">
              <motion.span
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="landing-cta landing-cta-lg"
              >
                {t('get_started')} <ArrowRight size={16} />
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="container" style={{ padding: '8px 16px 90px' }}>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          className="landing-features"
        >
          {FEATURES.map((f) => (
            <motion.article
              key={f.titleKey}
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -6 }}
              className="landing-feature-card glass"
            >
              <div className="landing-feature-icon">
                <f.icon size={18} />
              </div>
              <h3>{t(f.titleKey)}</h3>
              <p>{f.desc}</p>
            </motion.article>
          ))}
        </motion.div>

        <div style={{ textAlign: 'center', marginTop: 48, color: 'var(--muted)', fontSize: 13 }}>
          Farm.co — Smart Agriculture Platform
        </div>
      </section>
    </div>
  );
}
