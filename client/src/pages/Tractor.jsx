/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tractor as TractorIcon, Plus, Fuel, Clock, Wrench } from 'lucide-react';
import { Card, Button, Input, Textarea, FormField, EmptyState, Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { addTractorLog, getTractorLogs } from '../api/tractor';

export default function Tractor() {
  const { user } = useAuth();
  const toast = useToast();
  const userId = user?._id;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ usageHours: '', fuelUsed: '', maintenanceNote: '' });

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getTractorLogs(userId);
      setLogs(data || []);
    } catch (err) {
      toast.error('Failed to load tractor logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  const totals = logs.reduce(
    (acc, l) => ({
      hours: acc.hours + (l.usageHours || 0),
      fuel: acc.fuel + (l.fuelUsed || 0),
    }),
    { hours: 0, fuel: 0 }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.usageHours || !form.fuelUsed) return;
    setSubmitting(true);
    try {
      await addTractorLog({
        userId,
        usageHours: Number(form.usageHours),
        fuelUsed: Number(form.fuelUsed),
        maintenanceNote: form.maintenanceNote,
      });
      setForm({ usageHours: '', fuelUsed: '', maintenanceNote: '' });
      toast.success('Tractor log added.');
      load();
    } catch (err) {
      toast.error('Failed to add tractor log.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22 }}>Tractor Logs</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
          Track machine usage hours, fuel consumption and maintenance notes.
        </p>
      </div>

      <div className="page-grid-sm" style={{ marginBottom: 24 }}>
        <StatCard icon={Clock} label="Total Hours" value={totals.hours.toFixed(1)} />
        <StatCard icon={Fuel} label="Total Fuel Used (L)" value={totals.fuel.toFixed(1)} />
        <StatCard icon={TractorIcon} label="Total Logs" value={logs.length} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20 }} className="two-col-grid">
        <Card>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Log Tractor Usage</h3>
          <form onSubmit={handleSubmit}>
            <FormField label="Usage hours" required>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={form.usageHours}
                onChange={(e) => setForm((f) => ({ ...f, usageHours: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Fuel used (liters)" required>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={form.fuelUsed}
                onChange={(e) => setForm((f) => ({ ...f, fuelUsed: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Maintenance note">
              <Textarea
                value={form.maintenanceNote}
                onChange={(e) => setForm((f) => ({ ...f, maintenanceNote: e.target.value }))}
                placeholder="e.g. Oil changed, tyre pressure checked..."
              />
            </FormField>
            <Button type="submit" icon={Plus} loading={submitting} fullWidth>
              Add Log
            </Button>
          </form>
        </Card>

        <Card>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>History</h3>
          {loading ? (
            <Spinner />
          ) : logs.length === 0 ? (
            <EmptyState icon={TractorIcon} title="No tractor logs yet" description="Add your first log to start tracking usage." />
          ) : (
            <div className="table-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Hours</th>
                    <th style={thStyle}>Fuel (L)</th>
                    <th style={thStyle}>
                      <Wrench size={13} style={{ marginRight: 4 }} />
                      Maintenance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <motion.tr
                      key={log._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <td style={tdStyle}>{new Date(log.date).toLocaleDateString()}</td>
                      <td style={tdStyle}>{log.usageHours}</td>
                      <td style={tdStyle}>{log.fuelUsed}</td>
                      <td style={{ ...tdStyle, color: 'var(--muted)' }}>{log.maintenanceNote || '—'}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

const thStyle = { padding: '8px 10px', fontWeight: 600, fontSize: 12 };
const tdStyle = { padding: '10px 10px' };

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(63,163,77,0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={19} style={{ color: 'var(--primary)' }} />
        </div>
        <div>
          <p style={{ color: 'var(--muted)', fontSize: 12.5 }}>{label}</p>
          <p style={{ fontSize: 19, fontWeight: 800 }}>{value}</p>
        </div>
      </div>
    </Card>
  );
}
