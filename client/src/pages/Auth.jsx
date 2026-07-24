import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, Phone, User as UserIcon, Tractor, ShoppingBag } from 'lucide-react';
import { Button, Input, FormField } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { checkPhoneExists } from '../api/users';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'te', label: 'Telugu' },
];

export default function Auth() {
  const navigate = useNavigate();
  const toast = useToast();
  const { authenticate, loading, isAuthenticated } = useAuth();

  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('farmer');
  const [language, setLanguage] = useState('en');
  const [phoneChecked, setPhoneChecked] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [checking, setChecking] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/app/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handlePhoneContinue = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!/^\d{10}$/.test(phone)) {
      setFormError('Please enter a valid 10-digit phone number.');
      return;
    }
    setChecking(true);
    try {
      const { exists } = await checkPhoneExists(phone);
      setIsNewUser(!exists);
      setPhoneChecked(true);
    } catch (err) {
      setFormError('Could not verify phone number. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!/^\d{6}$/.test(pin)) {
      setFormError('PIN must be exactly 6 digits.');
      return;
    }
    if (isNewUser && !name.trim()) {
      setFormError('Please enter your name.');
      return;
    }
    try {
      await authenticate({
        phone,
        pin,
        name: isNewUser ? name.trim() : undefined,
        role: isNewUser ? role : undefined,
        language,
      });
      toast.success(isNewUser ? 'Account created! Welcome to Farm.co.' : 'Welcome back!');
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="bg-farm-gradient" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass"
        style={{ width: '100%', maxWidth: 420, borderRadius: 'var(--radius-lg)', padding: 34, boxShadow: 'var(--shadow-lg)' }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, justifyContent: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sprout size={21} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22 }}>
            Farm<span style={{ color: 'var(--primary)' }}>.co</span>
          </span>
        </Link>

        <h2 style={{ fontSize: 21, textAlign: 'center', marginBottom: 6 }}>
          {phoneChecked ? (isNewUser ? 'Create your account' : 'Welcome back') : 'Sign in with your phone'}
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5, textAlign: 'center', marginBottom: 26 }}>
          {phoneChecked
            ? isNewUser
              ? 'Set a 6-digit PIN to secure your account.'
              : 'Enter your PIN to continue.'
            : 'We will check if you already have an account.'}
        </p>

        {!phoneChecked ? (
          <form onSubmit={handlePhoneContinue}>
            <FormField label="Phone number" htmlFor="phone" required>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
              />
            </FormField>
            {formError && <p style={{ color: 'var(--error)', fontSize: 13, marginBottom: 14 }}>{formError}</p>}
            <Button type="submit" fullWidth size="lg" loading={checking} icon={Phone}>
              Continue
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <FormField label="Phone number">
              <Input value={phone} disabled style={{ opacity: 0.7 }} />
            </FormField>

            {isNewUser && (
              <FormField label="Full name" htmlFor="name" required>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </FormField>
            )}

            {isNewUser && (
              <FormField label="I am a" required>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { value: 'farmer', label: 'Farmer', icon: Tractor },
                    { value: 'customer', label: 'Customer', icon: ShoppingBag },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        padding: '14px 10px',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${role === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                        background: role === opt.value ? 'rgba(63,163,77,0.1)' : 'var(--surface)',
                        color: role === opt.value ? 'var(--primary)' : 'var(--text)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 13.5,
                      }}
                    >
                      <opt.icon size={18} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </FormField>
            )}

            <FormField label="6-digit PIN" htmlFor="pin" required>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                placeholder="••••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
            </FormField>

            {isNewUser && (
              <FormField label="Preferred language">
                <div style={{ display: 'flex', gap: 8 }}>
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLanguage(l.code)}
                      style={{
                        flex: 1,
                        padding: '8px 6px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1.5px solid ${language === l.code ? 'var(--primary)' : 'var(--border)'}`,
                        background: language === l.code ? 'rgba(63,163,77,0.1)' : 'var(--surface)',
                        color: language === l.code ? 'var(--primary)' : 'var(--text)',
                        cursor: 'pointer',
                        fontSize: 12.5,
                        fontWeight: 600,
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </FormField>
            )}

            {formError && <p style={{ color: 'var(--error)', fontSize: 13, marginBottom: 14 }}>{formError}</p>}

            <Button type="submit" fullWidth size="lg" loading={loading} icon={UserIcon}>
              {isNewUser ? 'Create account' : 'Log in'}
            </Button>
            <button
              type="button"
              onClick={() => {
                setPhoneChecked(false);
                setFormError('');
                setPin('');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, marginTop: 14, cursor: 'pointer', width: '100%' }}
            >
              ← Use a different number
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
