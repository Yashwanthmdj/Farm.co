import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { t as translate, translations, LANGUAGE_OPTIONS } from '../i18n/translations';
import { useAuth } from './AuthContext';

const I18nContext = createContext(null);
const LANG_KEY = 'farmco_language';

function readStoredLang() {
  try {
    return localStorage.getItem(LANG_KEY) || null;
  } catch (e) {
    return null;
  }
}

export function I18nProvider({ children }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState(() => {
    return readStoredLang() || user?.language || 'en';
  });

  // Sync from user profile when it loads / changes
  useEffect(() => {
    if (user?.language && user.language !== language) {
      const stored = readStoredLang();
      // Prefer explicit local choice; otherwise follow profile
      if (!stored) {
        setLanguageState(user.language);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.language]);

  useEffect(() => {
    document.documentElement.lang = language || 'en';
    try {
      localStorage.setItem(LANG_KEY, language);
    } catch (e) {
      /* ignore */
    }
  }, [language]);

  const setLanguage = useCallback((code) => {
    if (!translations[code]) return;
    setLanguageState(code);
  }, []);

  const t = useCallback(
    (key) => translate(language, key),
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      languages: LANGUAGE_OPTIONS,
    }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}
