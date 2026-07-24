/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, Sprout, Calendar, CheckCircle2, Clock, AlertCircle, Smartphone } from 'lucide-react';
import { Card, Button, Input, Select, FormField, EmptyState, Spinner, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  addReminder,
  createCropSchedule,
  getCropInfo,
  getCrops,
  getReminders,
  markReminderSent,
  sendReminderSmsNow,
} from '../api/reminders';

function toLocalInputValue(date = new Date()) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function Reminders() {
  const { user } = useAuth();
  const toast = useToast();
  const userId = user?._id;

  const [reminders, setReminders] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('upcoming'); // upcoming | overdue | done | all

  const [manualForm, setManualForm] = useState({
    message: '',
    date: toLocalInputValue(new Date(Date.now() + 5 * 60 * 1000)),
  });
  const [cropForm, setCropForm] = useState({ cropType: '', plantingDate: '' });
  const [cropInfo, setCropInfo] = useState(null);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [rem, cropList] = await Promise.all([getReminders(userId), getCrops()]);
      setReminders(Array.isArray(rem) ? rem : []);
      setCrops(Array.isArray(cropList) ? cropList : []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to load reminders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [userId]);

  useEffect(() => {
    if (!cropForm.cropType) {
      setCropInfo(null);
      return;
    }
    getCropInfo(cropForm.cropType)
      .then(setCropInfo)
      .catch(() => setCropInfo(null));
  }, [cropForm.cropType]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.message || !manualForm.date) {
      toast.warning('Please fill message and date/time.');
      return;
    }
    if (!userId) {
      toast.error('Please log in again.');
      return;
    }
    setSubmitting(true);
    try {
      // datetime-local → ISO so server parses consistently
      const isoDate = new Date(manualForm.date).toISOString();
      const created = await addReminder({
        userId,
        message: manualForm.message.trim(),
        date: isoDate,
      });
      setReminders((prev) => [...prev, created]);
      setManualForm({
        message: '',
        date: toLocalInputValue(new Date(Date.now() + 5 * 60 * 1000)),
      });

      const sms = created?.smsStatus;
      if (sms?.sentNow) {
        toast.success('Reminder saved and SMS sent to your phone!');
      } else if (sms?.scheduled) {
        toast.success('Reminder saved. Confirmation SMS sent — alert SMS will come when due.');
      } else if (sms?.error) {
        toast.warning(`Reminder saved, but SMS failed: ${sms.error}`);
      } else {
        toast.success('Reminder scheduled. You will get an in-app alert when due.');
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.details || 'Failed to add reminder.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCropSchedule = async (e) => {
    e.preventDefault();
    if (!cropForm.cropType || !cropForm.plantingDate) return;
    setSubmitting(true);
    try {
      const res = await createCropSchedule({ userId, ...cropForm });
      toast.success(res.message || 'Crop schedule created.');
      setCropForm({ cropType: '', plantingDate: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create crop schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkSent = async (id) => {
    try {
      await markReminderSent(id);
      setReminders((prev) => prev.map((r) => (r._id === id ? { ...r, isSent: true } : r)));
      toast.success('Marked as done.');
    } catch (err) {
      toast.error('Failed to update reminder.');
    }
  };

  const handleSendSms = async (id) => {
    try {
      await sendReminderSmsNow(id);
      setReminders((prev) => prev.map((r) => (r._id === id ? { ...r, isSent: true } : r)));
      toast.success('SMS sent to your registered phone number!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'SMS failed. Check Fast2SMS balance and your phone in Profile.');
    }
  };

  const now = Date.now();
  const categorized = useMemo(() => {
    const upcoming = [];
    const overdue = [];
    const done = [];
    for (const r of reminders) {
      if (r.isSent) {
        done.push(r);
        continue;
      }
      const t = new Date(r.date).getTime();
      if (t <= now) overdue.push(r);
      else upcoming.push(r);
    }
    const byDate = (a, b) => new Date(a.date) - new Date(b.date);
    upcoming.sort(byDate);
    overdue.sort(byDate);
    done.sort((a, b) => new Date(b.date) - new Date(a.date));
    return { upcoming, overdue, done };
  }, [reminders, now]);

  const visible =
    filter === 'upcoming'
      ? categorized.upcoming
      : filter === 'overdue'
        ? categorized.overdue
        : filter === 'done'
          ? categorized.done
          : [...categorized.overdue, ...categorized.upcoming, ...categorized.done];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 22 }}>Reminders</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
            Schedule tasks — you get an in-app alert (and SMS if configured) when due.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <StatChip icon={Clock} label="Upcoming" count={categorized.upcoming.length} tone="primary" />
          <StatChip icon={AlertCircle} label="Due now" count={categorized.overdue.length} tone="warning" />
          <StatChip icon={CheckCircle2} label="Done" count={categorized.done.length} tone="success" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: 20 }} className="two-col-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={16} style={{ color: 'var(--primary)' }} /> New Reminder
            </h3>
            <form onSubmit={handleManualSubmit}>
              <FormField label="Message" required>
                <Input
                  value={manualForm.message}
                  onChange={(e) => setManualForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="e.g. Apply fertilizer to field 2"
                  required
                />
              </FormField>
              <FormField label="Date & time" required>
                <Input
                  type="datetime-local"
                  value={manualForm.date}
                  onChange={(e) => setManualForm((f) => ({ ...f, date: e.target.value }))}
                  required
                />
              </FormField>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
                Tip: set a time ~2–5 minutes ahead to test alerts quickly.
              </p>
              <Button type="submit" icon={Plus} loading={submitting} fullWidth>
                Add Reminder
              </Button>
            </form>
          </Card>

          <Card>
            <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sprout size={16} style={{ color: 'var(--primary)' }} /> Crop Schedule
            </h3>
            <form onSubmit={handleCropSchedule}>
              <FormField label="Crop" required>
                <Select
                  value={cropForm.cropType}
                  onChange={(e) => setCropForm((f) => ({ ...f, cropType: e.target.value }))}
                  required
                >
                  <option value="">Select a crop</option>
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Planting date" required>
                <Input
                  type="date"
                  value={cropForm.plantingDate}
                  onChange={(e) => setCropForm((f) => ({ ...f, plantingDate: e.target.value }))}
                  required
                />
              </FormField>

              {cropInfo && (
                <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: 12.5 }}>
                  <p style={{ color: 'var(--muted)' }}>Growth duration: {cropInfo.growthDuration}</p>
                  <p style={{ color: 'var(--muted)' }}>
                    Will create {(cropInfo.fertilizerSchedule?.length || 0) + 5} automatic reminders.
                  </p>
                </div>
              )}

              <Button type="submit" variant="secondary" icon={Plus} loading={submitting} fullWidth>
                Generate Schedule
              </Button>
            </form>
          </Card>
        </div>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} style={{ color: 'var(--primary)' }} /> Your Reminders
            </h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['upcoming', 'overdue', 'done', 'all'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${filter === f ? 'var(--primary)' : 'var(--border)'}`,
                    background: filter === f ? 'rgba(63,163,77,0.14)' : 'transparent',
                    color: filter === f ? 'var(--primary)' : 'var(--muted)',
                    fontSize: 12.5,
                    fontWeight: 650,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No reminders here"
              description="Add a manual reminder or generate a crop schedule."
            />
          ) : (
            <div style={{ maxHeight: 560, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {visible.map((r) => {
                const due = new Date(r.date).getTime() <= now && !r.isSent;
                return (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: 14,
                      borderRadius: 'var(--radius-md)',
                      background: due ? 'rgba(250, 204, 21, 0.08)' : 'var(--surface)',
                      borderLeft: `3px solid ${
                        r.isSent
                          ? 'var(--success)'
                          : due
                            ? 'var(--warning)'
                            : r.reminderType === 'planting'
                              ? 'var(--success)'
                              : r.reminderType === 'fertilizer'
                                ? 'var(--warning)'
                                : 'var(--primary)'
                      }`,
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>{r.message}</p>
                      <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {new Date(r.date).toLocaleString()}
                      </p>
                      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                        {r.cropType && <Badge tone="primary">{r.cropType}</Badge>}
                        <Badge tone={r.isSent ? 'success' : due ? 'warning' : 'neutral'}>
                          {r.isSent ? 'Done' : due ? 'Due now' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                    {!r.isSent && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <button
                          aria-label="Send SMS now"
                          onClick={() => handleSendSms(r._id)}
                          title="Send SMS to my phone now"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            background: 'rgba(63,163,77,0.12)',
                            border: '1px solid rgba(63,163,77,0.35)',
                            color: 'var(--primary)',
                            borderRadius: 8,
                            padding: '6px 8px',
                            cursor: 'pointer',
                            fontSize: 11.5,
                            fontWeight: 700,
                          }}
                        >
                          <Smartphone size={14} /> SMS
                        </button>
                        <button
                          aria-label="Mark reminder as done"
                          onClick={() => handleMarkSent(r._id)}
                          title="Mark as done"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatChip({ icon: Icon, label, count, tone }) {
  const color =
    tone === 'warning' ? 'var(--warning)' : tone === 'success' ? 'var(--success)' : 'var(--primary)';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        fontSize: 12.5,
        fontWeight: 650,
      }}
    >
      <Icon size={14} style={{ color }} />
      {label}
      <span style={{ color }}>{count}</span>
    </div>
  );
}
