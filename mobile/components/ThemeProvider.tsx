import React, { createContext, useCallback, useContext, useMemo } from 'react';

type ColorScheme = 'light';

export type ThemePalette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentMuted: string;
  onAccent: string;
  success: string;
  danger: string;
  warning: string;
};

type ThemeContextValue = {
  colorScheme: ColorScheme;
  theme: ThemePalette;
  setTheme: (scheme: ColorScheme) => void;
  toggleTheme: () => void;
};

const palettes: Record<ColorScheme, ThemePalette> = {
  light: {
    background: '#F3F4F6',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF2FF',
    border: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    accent: '#2563EB',
    accentMuted: '#1D4ED8',
    onAccent: '#F8FAFC',
    success: '#22C55E',
    danger: '#EF4444',
    warning: '#F59E0B',
  },
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

let hasWarned = false;
const warnOnce = () => {
  if (hasWarned) return;
  hasWarned = true;
  console.warn('Theme switching is disabled. The application uses the light theme only.');
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const setTheme = useCallback((_scheme: ColorScheme) => {
    warnOnce();
  }, []);

  const toggleTheme = useCallback(() => {
    warnOnce();
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    colorScheme: 'light',
    theme: palettes.light,
    setTheme,
    toggleTheme,
  }), [setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
