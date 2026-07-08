/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#020617",       // Dark Slate core background
          panel: "#0f172a",    // Dashboard panels and card layers
          border: "#1e293b",   // Futuristic wireframe split-borders
          purple: "#a855f7",   // Prime vibrant neon branding color
          indigo: "#6366f1",   // Gradient mesh secondary color
          cyan: "#06b6d4",     // High tech pulse dynamic state
          text: "#f1f5f9",     // Primary high-contrast text fields
          muted: "#64748b"     // Descriptive low-priority gray logs
        }
      }
    },
  },
  plugins: [],
};