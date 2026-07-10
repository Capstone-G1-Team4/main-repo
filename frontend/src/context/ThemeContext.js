"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(undefined);

const STORAGE_KEY = "nextgen-theme";
const DEFAULT_THEME = "dark";

/**
 * Reads the persisted theme from localStorage. Safe to call during the
 * initial render effect only — never during SSR, since `window` doesn't
 * exist there.
 */
function readStoredTheme() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "light" || raw === "dark" ? raw : DEFAULT_THEME;
  } catch (error) {
    console.error("ThemeContext: failed to read theme from localStorage", error);
    return DEFAULT_THEME;
  }
}

/**
 * ThemeProvider
 * ------------------------------------------------------------------
 * Owns the "dark" | "light" theme name, persists it to localStorage,
 * and reflects it onto <html data-theme="..."> so the CSS variables
 * defined in globals.css (and therefore every cyber-* Tailwind class
 * already used throughout theme.js) repaint instantly with no
 * per-component color changes required.
 *
 * A tiny inline script in layout.js sets the initial data-theme
 * attribute before hydration to avoid a flash of the wrong theme;
 * this provider takes over from there.
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(DEFAULT_THEME);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage once, after mount (client only).
  useEffect(() => {
    setThemeState(readStoredTheme());
    setIsHydrated(true);
  }, []);

  // Reflect the current theme onto <html data-theme="..."> and persist
  // it, but only after hydration so we don't briefly stomp the value the
  // no-flash inline script already applied.
  useEffect(() => {
    if (!isHydrated) return;
    try {
      document.documentElement.setAttribute("data-theme", theme);
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.error("ThemeContext: failed to persist theme", error);
    }
  }, [theme, isHydrated]);

  const setTheme = useCallback((next) => {
    setThemeState(next === "light" ? "light" : "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({ theme, isHydrated, setTheme, toggleTheme }),
    [theme, isHydrated, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Access the current theme and toggle actions from any client component.
 * Must be called from a component rendered under <ThemeProvider>.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return context;
}