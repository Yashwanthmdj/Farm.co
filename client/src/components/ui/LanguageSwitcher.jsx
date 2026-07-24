import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

/**
 * Premium language switcher — works on dashboard, chat, landing, etc.
 */
export default function LanguageSwitcher({
  compact = false,
  align = 'right',
  className = '',
  style = {},
}) {
  const { language, setLanguage, languages, t } = useI18n();
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, right: 0 });

  const current = languages.find((l) => l.code === language) || languages[0];

  const updatePos = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 8,
      left: rect.left,
      right: window.innerWidth - rect.right,
      width: Math.max(rect.width, 200),
    });
  };

  useEffect(() => {
    if (!open) return undefined;
    updatePos();
    const onScroll = () => updatePos();
    const onResize = () => updatePos();
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target)) {
        const menu = document.getElementById('farmco-lang-menu');
        if (menu && !menu.contains(e.target)) setOpen(false);
      }
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const select = (code) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <div className={`lang-switcher ${className}`} style={{ position: 'relative', ...style }}>
      <motion.button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('language')}
        onClick={() => {
          updatePos();
          setOpen((o) => !o);
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="lang-switcher-btn"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: compact ? 6 : 8,
          padding: compact ? '8px 12px' : '9px 14px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: 'var(--text)',
          cursor: 'pointer',
          fontWeight: 650,
          fontSize: compact ? 12.5 : 13.5,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Globe size={compact ? 14 : 15} style={{ color: 'var(--primary)' }} />
        <span>{compact ? current?.code?.toUpperCase() : current?.native}</span>
        <ChevronDown
          size={14}
          style={{
            opacity: 0.7,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        />
      </motion.button>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.ul
                id="farmco-lang-menu"
                role="listbox"
                aria-label={t('app_language')}
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.16 }}
                style={{
                  position: 'fixed',
                  top: pos.top,
                  ...(align === 'right'
                    ? { right: pos.right }
                    : { left: pos.left }),
                  minWidth: pos.width,
                  zIndex: 9999,
                  margin: 0,
                  padding: 6,
                  listStyle: 'none',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  overflow: 'hidden',
                }}
              >
                {languages.map((l) => {
                  const active = l.code === language;
                  return (
                    <li key={l.code} role="option" aria-selected={active}>
                      <button
                        type="button"
                        onClick={() => select(l.code)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          padding: '10px 12px',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          background: active ? 'rgba(63,163,77,0.14)' : 'transparent',
                          color: active ? 'var(--primary)' : 'var(--text)',
                          cursor: 'pointer',
                          fontWeight: active ? 700 : 550,
                          fontSize: 13.5,
                          textAlign: 'left',
                        }}
                      >
                        <span>
                          <span style={{ display: 'block' }}>{l.native}</span>
                          <span style={{ display: 'block', fontSize: 11.5, color: 'var(--muted)', fontWeight: 500 }}>
                            {l.label}
                          </span>
                        </span>
                        {active && <Check size={15} />}
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
