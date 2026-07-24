import React from 'react';

export default function Skeleton({ width = '100%', height = 16, radius = 8, style = {} }) {
  return (
    <div
      className="animate-pulse"
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, var(--surface), var(--border), var(--surface))',
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
      }}
    >
      <Skeleton width="40%" height={18} style={{ marginBottom: 14 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={12} style={{ marginBottom: 10 }} width={`${90 - i * 10}%`} />
      ))}
    </div>
  );
}
