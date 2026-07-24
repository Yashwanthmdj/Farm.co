import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 22, label = 'Loading...', center = true }) {
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: center ? 'center' : 'flex-start',
        gap: 10,
        padding: center ? 32 : 0,
        color: 'var(--muted)',
      }}
    >
      <Loader2 size={size} className="animate-spin" style={{ color: 'var(--primary)' }} />
      {label && <span style={{ fontSize: 13.5 }}>{label}</span>}
    </div>
  );
}
