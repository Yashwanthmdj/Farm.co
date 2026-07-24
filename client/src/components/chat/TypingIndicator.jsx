import React from 'react';
import { motion } from 'framer-motion';
import { Sprout } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 18 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          color: '#fff',
        }}
      >
        <Sprout size={15} />
      </div>
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md) var(--radius-md) var(--radius-md) 4px',
          padding: '14px 18px',
          display: 'flex',
          gap: 5,
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--muted)',
              display: 'inline-block',
            }}
          />
        ))}
      </div>
    </div>
  );
}
