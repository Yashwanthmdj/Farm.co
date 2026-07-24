import React from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = '',
  action = null,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 20px',
        color: 'var(--muted)',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Icon size={26} style={{ color: 'var(--primary)' }} />
      </div>
      <h4 style={{ fontSize: 16, color: 'var(--text)', marginBottom: 6 }}>{title}</h4>
      {description && <p style={{ fontSize: 13.5, maxWidth: 320 }}>{description}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </motion.div>
  );
}
