import { useEffect, useState } from 'react';
import type { AppSettings, AppLanguage, ThemeMode } from '@/types';

const SETTINGS_KEY = 'turkmen_ai_settings';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'auto',
  theme: 'dark',
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateLanguage = (language: AppLanguage) =>
    setSettings((prev) => ({ ...prev, language }));

  const updateTheme = (theme: ThemeMode) =>
    setSettings((prev) => ({ ...prev, theme }));

  return { settings, updateLanguage, updateTheme };
}
