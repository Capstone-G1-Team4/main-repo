/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Each channel is a CSS variable holding space-separated RGB
        // numbers (e.g. "2 6 23"), defined in globals.css under :root
        // (dark, default) and html[data-theme="light"] (light). This is
        // what makes theme switching instant and global: the utility
        // class names (bg-cyber-bg, text-cyber-text, etc.) never change,
        // only the variable value they resolve to at runtime.
        cyber: {
          bg: "rgb(var(--cyber-bg) / <alpha-value>)",
          panel: "rgb(var(--cyber-panel) / <alpha-value>)",
          border: "rgb(var(--cyber-border) / <alpha-value>)",
          purple: "rgb(var(--cyber-purple) / <alpha-value>)",
          indigo: "rgb(var(--cyber-indigo) / <alpha-value>)",
          cyan: "rgb(var(--cyber-cyan) / <alpha-value>)",
          text: "rgb(var(--cyber-text) / <alpha-value>)",
          muted: "rgb(var(--cyber-muted) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};