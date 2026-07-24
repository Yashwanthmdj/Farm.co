import React from 'react';

const TONES = {
  neutral: { bg: 'var(--surface)', color: 'var(--muted)' },
  primary: { bg: 'rgba(63, 163, 77, 0.15)', color: 'var(--primary)' },
  success: { bg: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)' },
  warning: { bg: 'rgba(250, 204, 21, 0.15)', color: 'var(--warning)' },
  error: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--error)' },
};

export default function Badge({ children, tone = 'neutral', icon: Icon, style = {} }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: t.bg,
        color: t.color,
        fontSize: 12,
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        textTransform: 'capitalize',
        letterSpacing: 0.2,
        ...style,
      }}
    >
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}
