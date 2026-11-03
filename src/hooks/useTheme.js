import { useEffect, useState } from 'react';

const STORAGE_KEY = 'redom_theme';

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return window.localStorage.getItem(STORAGE_KEY) || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const resolved =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;
    root.classList.toggle('dark', resolved === 'dark');
    root.style.colorScheme = resolved;
  }, [theme]);

  const setTheme = (next) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  };

  return { theme, setTheme };
}

export default useTheme;