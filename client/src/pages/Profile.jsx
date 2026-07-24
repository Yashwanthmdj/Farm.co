import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Phone, Badge as BadgeIcon } from 'lucide-react';
import { Card, Button, Input, Select, FormField, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../context/I18nContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const { setLanguage, languages, t } = useI18n();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    farmName: user?.farmName || '',
    language: user?.language || 'en',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      setLanguage(form.language);
      toast.success(t('language_saved'));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22 }}>Profile</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>Manage your personal information and preferences.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 800,
                color: '#fff',
              }}
            >
              {(user?.name || 'F').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: 18 }}>{user?.name}</h3>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <Badge tone="primary" icon={BadgeIcon}>{user?.role}</Badge>
                <Badge icon={Phone}>{user?.phone}</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Edit Details</h3>
          <form onSubmit={handleSubmit}>
            <FormField label="Full name" required>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </FormField>
            <FormField label="Email">
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
            </FormField>
            {user?.role === 'farmer' && (
              <FormField label="Farm name">
                <Input value={form.farmName} onChange={(e) => setForm((f) => ({ ...f, farmName: e.target.value }))} placeholder="e.g. Green Valley Farm" />
              </FormField>
            )}
            <FormField label={t('preferred_language')}>
              <Select
                value={form.language}
                onChange={(e) => {
                  const code = e.target.value;
                  setForm((f) => ({ ...f, language: code }));
                  setLanguage(code);
                }}
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>{l.native} ({l.label})</option>
                ))}
              </Select>
            </FormField>
            <Button type="submit" icon={Save} loading={saving}>{t('save')}</Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
