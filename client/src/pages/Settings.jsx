import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Globe, LogOut, Save } from 'lucide-react';
import { Card, Button, Select, FormField } from '../components/ui';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../context/I18nContext';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, updateProfile, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { language, setLanguage, t, languages } = useI18n();
  const [saving, setSaving] = useState(false);

  const handleLanguageChange = (code) => {
    setLanguage(code);
  };

  const handleSaveLanguage = async () => {
    setSaving(true);
    try {
      await updateProfile({ language });
      toast.success(t('language_saved'));
    } catch (err) {
      toast.error(t('language_save_fail'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22 }}>{t('settings_title')}</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>{t('settings_subtitle')}</p>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>{t('appearance')}</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          <ThemeOption current={theme} value="light" icon={Sun} label={t('light')} onSelect={setTheme} />
          <ThemeOption current={theme} value="dark" icon={Moon} label={t('dark')} onSelect={setTheme} />
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={16} style={{ color: 'var(--primary)' }} /> {t('language')}
        </h3>
        <FormField label={t('app_language')}>
          <Select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native} ({l.label})
              </option>
            ))}
          </Select>
        </FormField>
        <p style={{ color: 'var(--muted)', fontSize: 12.5, margin: '8px 0 14px' }}>
          {language === 'en' && 'The entire interface updates instantly when you change language.'}
          {language === 'hi' && 'भाषा बदलते ही पूरा इंटरफ़ेस तुरंत अपडेट हो जाता है।'}
          {language === 'te' && 'భాష మార్చగానే మొత్తం ఇంటర్‌ఫేస్ వెంటనే అప్‌డేట్ అవుతుంది.'}
          {language === 'es' && 'Toda la interfaz se actualiza al instante al cambiar el idioma.'}
          {language === 'fr' && 'Toute l’interface se met à jour instantanément.'}
          {language === 'zh' && '切换语言后，整个界面会立即更新。'}
        </p>
        <Button icon={Save} loading={saving} onClick={handleSaveLanguage}>
          {t('save_preference')}
        </Button>
      </Card>

      <Card>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>{t('account')}</h3>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
          {t('signed_in_as')} {user?.name} ({user?.phone}).
        </p>
        <Button variant="danger" icon={LogOut} onClick={handleLogout}>
          {t('logout')}
        </Button>
      </Card>
    </div>
  );
}

function ThemeOption({ current, value, icon: Icon, label, onSelect }) {
  const active = current === value;
  return (
    <button
      onClick={() => onSelect(value)}
      aria-pressed={active}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '18px 12px',
        borderRadius: 'var(--radius-md)',
        border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
        background: active ? 'rgba(63,163,77,0.1)' : 'var(--surface)',
        color: active ? 'var(--primary)' : 'var(--text)',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: 13.5,
      }}
    >
      <Icon size={20} />
      {label}
    </button>
  );
}
