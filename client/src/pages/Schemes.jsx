/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Landmark, ExternalLink, ChevronDown, Info } from 'lucide-react';
import { Card, Spinner, EmptyState } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { getSchemes } from '../api/schemes';

export default function Schemes() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getSchemes()
      .then(setData)
      .catch(() => toast.error('Failed to load government schemes.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading schemes..." />;
  if (!data?.schemes?.length) return <EmptyState icon={Landmark} title="No schemes available" />;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 22 }}>Government Schemes</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>Explore support schemes available to Indian farmers.</p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          background: 'rgba(63,163,77,0.08)',
          border: '1px solid rgba(63,163,77,0.25)',
          borderRadius: 'var(--radius-md)',
          padding: 12,
          marginBottom: 22,
          fontSize: 12.5,
        }}
      >
        <Info size={15} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 1 }} />
        <span>{data.disclaimer}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {data.schemes.map((s) => {
          const isOpen = expanded === s.id;
          return (
            <Card key={s.id} padding={0}>
              <button
                onClick={() => setExpanded(isOpen ? null : s.id)}
                aria-expanded={isOpen}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 18,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <strong style={{ fontSize: 15 }}>{s.name}</strong>
                  <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>{s.summary}</p>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} style={{ flexShrink: 0, marginLeft: 12 }}>
                  <ChevronDown size={18} style={{ color: 'var(--muted)' }} />
                </motion.div>
              </button>

              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  style={{ padding: '0 18px 18px', overflow: 'hidden' }}
                >
                  <SchemeSection title="Eligibility" items={s.eligibility} />
                  <SchemeSection title="Benefits" items={s.benefits} />
                  <SchemeSection title="How to Apply" items={s.howToApply} />
                  {s.website && (
                    <a
                      href={s.website}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--primary)', fontWeight: 700, fontSize: 13 }}
                    >
                      Visit official website <ExternalLink size={13} />
                    </a>
                  )}
                </motion.div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function SchemeSection({ title, items }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <h4 style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>{title}</h4>
      <ul style={{ listStyle: 'disc', paddingLeft: 20 }}>
        {items.map((it, i) => (
          <li key={i} style={{ fontSize: 13, marginBottom: 4 }}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
