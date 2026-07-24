/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Store, MapPin } from 'lucide-react';
import { Card, Input, Select, EmptyState, Spinner, Badge } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { getMarketplaceProducts } from '../api/farmerProducts';
import { resolveAssetUrl } from '../api/client';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Handicrafts', 'Other'];

export default function Marketplace() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getMarketplaceProducts();
        if (active) setProducts(data || []);
      } catch (err) {
        toast.error('Failed to load marketplace products.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category;
      const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, category, search]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22 }}>Farmer Marketplace</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
          Fresh produce and goods, sold directly by local farmers.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          style={{ maxWidth: 280 }}
          aria-label="Search marketplace products"
        />
        <Select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: 170 }} aria-label="Filter by category">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <Spinner label="Loading marketplace..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Store} title="No products found" description="Try adjusting your search or filters." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 20 }}>
          {filtered.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4) }}>
              <Card padding={0} hover style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 160, background: 'var(--surface)', overflow: 'hidden' }}>
                  <img
                    src={resolveAssetUrl(p.imageUrl)}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginBottom: 6 }}>
                    <strong style={{ fontSize: 14.5 }}>{p.name}</strong>
                    <Badge tone="primary">{p.category}</Badge>
                  </div>
                  <p style={{ fontSize: 12.5, color: 'var(--muted)', flex: 1, marginBottom: 10 }}>{p.description}</p>
                  <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 16, marginBottom: 6 }}>
                    ₹{p.price} <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>/ {p.unit}</span>
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                    <MapPin size={12} />
                    {p.farmerId?.farmName || p.farmerId?.name || 'Local Farmer'}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
