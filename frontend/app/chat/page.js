"use client";

import { useState } from "react";
import Link from "next/link";
import ChatWindow from "./components/ChatWindow";
import AddToCartModal from "../../src/components/AddToCartModal";
import { useCart } from "../../src/context/CartContext";

/**
 * ChatPage
 * ------------------------------------------------------------------
 * Thin page shell: a session sidebar plus the standalone <ChatWindow />.
 * All conversational logic lives in ./components/ChatWindow.js; this
 * page is only responsible for real cart mutation (via useCart()) and
 * the shared <AddToCartModal /> confirmation, matching the pattern
 * used on the home and products pages.
 */
export default function ChatPage() {
  const { addItem } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeChatId, setActiveChatId] = useState(1);

  const chatHistory = [
    { id: 1, title: "Current Session", date: "Today" },
    { id: 2, title: "Laptop Inquiry", date: "Yesterday" },
    { id: 3, title: "Mobile Comparison", date: "Earlier" },
  ];

  const handleAddToCart = (product) => {
    addItem(product);
    setActiveProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-cyber-bg font-sans text-cyber-text selection:bg-cyber-purple/30">
      {/* Top navigation */}
      <div className="z-10 flex items-center justify-between border-b border-cyber-border bg-slate-950 px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyber-purple transition hover:text-purple-300"
        >
          ⬅ Back to Marketplace
        </Link>
        <span className="font-mono text-xs font-semibold text-cyber-muted">AI Shopping Assistant</span>
      </div>

      {/* Sidebar + chat window */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 gap-6 bg-gradient-to-b from-slate-950 to-cyber-bg p-2 sm:p-4 md:p-6">
        <div className="hidden w-64 flex-col space-y-4 rounded-2xl border border-cyber-border bg-cyber-panel/40 p-4 backdrop-blur-sm md:flex">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-black uppercase tracking-widest text-cyber-text">Chat History</h3>
            <button
              onClick={() => setActiveChatId(Date.now())}
              className="rounded bg-cyber-purple/10 border border-cyber-purple/20 px-2 py-1 text-[10px] text-cyber-purple transition hover:bg-cyber-purple hover:text-white"
            >
              + New
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
            {chatHistory.map((history) => (
              <div
                key={history.id}
                onClick={() => setActiveChatId(history.id)}
                className={`cursor-pointer rounded-xl border p-3 text-left transition duration-200 ${
                  activeChatId === history.id
                    ? "border-cyber-purple bg-cyber-purple/10 text-white"
                    : "border-cyber-border/60 bg-slate-950/40 text-cyber-muted hover:border-cyber-purple/40 hover:text-cyber-text"
                }`}
              >
                <p className="truncate text-xs font-bold">{history.title}</p>
                <span className="mt-1 block font-mono text-[9px] text-cyber-purple/70">{history.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-[650px] flex-1 overflow-hidden rounded-2xl border border-cyber-border bg-slate-950 shadow-2xl">
          <ChatWindow key={activeChatId} onAddToCart={handleAddToCart} />
        </div>
      </div>

      <AddToCartModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={activeProduct} />
    </div>
  );
}