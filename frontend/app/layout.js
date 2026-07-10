import "./globals.css";
import { CartProvider } from "../src/context/CartContext";
import { ThemeProvider } from "../src/context/ThemeContext";

export const metadata = {
  title: "AI-Powered Smart Shopping Assistant",
  description: "Capstone Project — AI chat assistant for e-commerce",
};

// Runs before React hydrates so the correct theme (from localStorage) is
// applied to <html> before first paint, avoiding a flash of the default
// dark theme for users who previously chose light. ThemeProvider takes
// over ownership of the data-theme attribute after mount.
const NO_FLASH_THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("nextgen-theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 antialiased">
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
        <ThemeProvider>
          <CartProvider>{children}</CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}