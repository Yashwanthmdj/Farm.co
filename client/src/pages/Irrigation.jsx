import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Send, AlertCircle } from 'lucide-react';
import { Card, Button, Input, Select, FormField, Badge } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { getIrrigationAdvice } from '../api/irrigation';

const CROPS = ['rice', 'wheat', 'sugarcane', 'cotton', 'maize', 'corn', 'potato', 'tomato'];

const URGENCY_TONE = { low: 'success', medium: 'warning', high: 'error' };

export default function Irrigation() {
  const toast = useToast();
  const [form, setForm] = useState({ soilMoisture: '', weatherSummary: '', cropType: '', lastRainMm: '' });
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        soilMoisture: form.soilMoisture ? Number(form.soilMoisture) : undefined,
        weatherSummary: form.weatherSummary || undefined,
        cropType: form.cropType || undefined,
        lastRainMm: form.lastRainMm ? Number(form.lastRainMm) : undefined,
      };
      const result = await getIrrigationAdvice(payload);
      setAdvice(result);
    } catch (err) {
      toast.error('Failed to generate irrigation advice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22 }}>Irrigation Advisor</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
          Get a quick recommendation based on soil moisture, rainfall and crop type.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20 }} className="two-col-grid">
        <Card>
          <form onSubmit={handleSubmit}>
            <FormField label="Soil moisture (%)" hint="0-100, if known">
              <Input
                type="number"
                min="0"
                max="100"
                value={form.soilMoisture}
                onChange={(e) => setForm((f) => ({ ...f, soilMoisture: e.target.value }))}
                placeholder="e.g. 35"
              />
            </FormField>
            <FormField label="Recent rainfall (mm)" hint="Used if soil moisture is unknown">
              <Input
                type="number"
                min="0"
                value={form.lastRainMm}
                onChange={(e) => setForm((f) => ({ ...f, lastRainMm: e.target.value }))}
                placeholder="e.g. 8"
              />
            </FormField>
            <FormField label="Crop type">
              <Select value={form.cropType} onChange={(e) => setForm((f) => ({ ...f, cropType: e.target.value }))}>
                <option value="">Select crop (optional)</option>
                {CROPS.map((c) => (
                  <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Weather summary" hint="e.g. 'hot and dry' or 'rain expected tomorrow'">
              <Input
                value={form.weatherSummary}
                onChange={(e) => setForm((f) => ({ ...f, weatherSummary: e.target.value }))}
                placeholder="Describe current weather"
              />
            </FormField>
            <Button type="submit" icon={Send} loading={loading} fullWidth>Get Advice</Button>
          </form>
        </Card>

        <Card>
          <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Droplets size={16} style={{ color: 'var(--primary)' }} /> Recommendation
          </h3>
          {!advice ? (
            <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>Fill in the form to get personalized irrigation advice.</p>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Badge tone={URGENCY_TONE[advice.urgency] || 'neutral'} icon={AlertCircle}>
                  {advice.urgency} urgency
                </Badge>
                {advice.waterNeed && <Badge tone="primary">{advice.waterNeed} water need</Badge>}
              </div>
              <p style={{ fontSize: 15, marginBottom: 18, lineHeight: 1.6 }}>{advice.recommendation}</p>
              {advice.notes?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase' }}>Additional Notes</h4>
                  <ul style={{ listStyle: 'disc', paddingLeft: 20 }}>
                    {advice.notes.map((n, i) => (
                      <li key={i} style={{ fontSize: 13.5, marginBottom: 6, color: 'var(--muted)' }}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  );
}
