"use client";

import { useTheme } from "../context/ThemeContext";
import { cyberThemeToggle, cyberThemeToggleIcon } from "../lib/theme";

/**
 * ThemeToggle
 * ------------------------------------------------------------------
 * Drop this into any navigation bar to let the user switch between
 * Dark Cyberpunk and Light Cyberpunk. It never hardcodes a color per
 * mode — it only reads/writes the shared theme name via useTheme(),
 * and the actual repaint happens through the CSS variables defined
 * in globals.css.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme, isHydrated } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={!isHydrated}
      aria-label={`Switch to ${isLight ? "dark" : "light"} theme`}
      className={`${cyberThemeToggle} disabled:opacity-50`}
    >
      <span className={cyberThemeToggleIcon}>{isLight ? "🌙" : "☀️"}</span>
      {isLight ? "Dark Mode" : "Light Mode"}
    </button>
  );
}