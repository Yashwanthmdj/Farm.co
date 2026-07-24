import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Card, Spinner, EmptyState } from '../components/ui';
import { getCropPrices } from '../api/cropPrices';

const FALLBACK = {
  asOf: 'static fallback',
  disclaimer: 'Live data unavailable — showing static market estimate ranges.',
  categories: {
    cereals: [
      { name: 'Wheat', unit: 'per quintal', price: 2275, change: 0 },
      { name: 'Rice (Paddy Common)', unit: 'per quintal', price: 2183, change: 0 },
    ],
    vegetables: [
      { name: 'Onion', unit: 'per quintal', price: 1800, change: 0 },
      { name: 'Potato', unit: 'per quintal', price: 1400, change: 0 },
    ],
    fruits: [{ name: 'Banana', unit: 'per quintal', price: 2200, change: 0 }],
    pulses: [{ name: 'Chana (Gram)', unit: 'per quintal', price: 6200, change: 0 }],
  },
};

export default function CropPrices() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    getCropPrices()
      .then((res) => setData(res))
      .catch(() => {
        setData(FALLBACK);
        setIsFallback(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Fetching latest market estimates..." />;
  if (!data) return <EmptyState icon={LineChart} title="No price data available" />;

  const categories = Object.keys(data.categories || {});
  const visibleCategories = activeCategory === 'all' ? categories : [activeCategory];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 22 }}>Crop Prices</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
          Market estimates for informational purposes — always confirm with your local mandi.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          background: 'rgba(250,204,21,0.1)',
          border: '1px solid rgba(250,204,21,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: 12,
          marginBottom: 20,
          fontSize: 12.5,
        }}
      >
        <Info size={15} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
        <span>
          {isFallback ? data.disclaimer : `${data.disclaimer} As of ${data.asOf}.`}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        {['all', ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${activeCategory === c ? 'var(--primary)' : 'var(--border)'}`,
              background: activeCategory === c ? 'var(--primary)' : 'var(--card)',
              color: activeCategory === c ? '#fff' : 'var(--text)',
              fontSize: 12.5,
              fontWeight: 700,
              textTransform: 'capitalize',
              cursor: 'pointer',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {visibleCategories.map((cat) => (
        <div key={cat} style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14, textTransform: 'capitalize' }}>{cat}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {(data.categories[cat] || []).map((item, i) => (
              <motion.div key={item.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <strong style={{ fontSize: 14 }}>{item.name}</strong>
                    {item.change !== undefined && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: item.change >= 0 ? 'var(--success)' : 'var(--error)' }}>
                        {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(item.change)}%
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>
                    ₹{item.price?.toLocaleString()}
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}> {item.unit}</span>
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
