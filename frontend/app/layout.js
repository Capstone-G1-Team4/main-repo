import "./globals.css";

export const metadata = {
  title: "AI-Powered Smart Shopping Assistant",
  description: "Capstone Project — AI chat assistant for e-commerce",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 antialiased">{children}</body>
    </html>
  );
}
