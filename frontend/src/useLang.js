import { useState, useEffect, useCallback } from 'react';
import { t } from './i18n';

export default function useLang() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang(prev => (prev === 'en' ? 'fr' : 'en'));
  }, []);

  const _t = useCallback((key) => t(lang, key), [lang]);

  return { lang, setLang, toggleLang, _t };
}