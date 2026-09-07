import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('novyra_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('novyra_lang', lang);
    const activeTranslations = translations[lang] || translations.en;
    const dir = activeTranslations?.dir || 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    if (dir === 'rtl') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [lang]);

  const t = useCallback(
    (key, fallback = '') => {
      if (!key) return fallback;
      const parts = typeof key === 'string' ? key.split('.') : [];
      
      // Try active language
      let current = translations[lang] || translations.en;
      let found = true;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          found = false;
          break;
        }
      }
      if (found && typeof current === 'string') {
        return current;
      }

      // Fallback to English dictionary
      let fb = translations.en;
      let fbFound = true;
      for (const p of parts) {
        if (fb && typeof fb === 'object' && p in fb) {
          fb = fb[p];
        } else {
          fbFound = false;
          break;
        }
      }
      if (fbFound && typeof fb === 'string') {
        return fb;
      }

      return fallback || key;
    },
    [lang]
  );

  const activeDict = translations[lang] || translations.en;
  const dir = activeDict?.dir || 'ltr';

  const contextValue = useMemo(
    () => ({
      lang,
      language: lang,
      setLang,
      setLanguage: setLang,
      t,
      dir,
      dictionary: activeDict
    }),
    [lang, t, dir, activeDict]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

