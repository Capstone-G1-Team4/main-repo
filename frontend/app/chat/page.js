"use client";

import { useState } from "react";
import Link from "next/link";
import ChatWindow from "./components/ChatWindow";
import AddToCartModal from "../../src/components/AddToCartModal";
import { useCart } from "../../src/context/CartContext";
import {
  cyberPageShell,
  cyberNavLink,
  cyberChatTopBar,
  cyberChatSidebar,
  cyberChatSidebarTitle,
  cyberChatSessionCard,
  cyberChatSessionActive,
  cyberChatSessionInactive,
  cyberChatSessionIcon,
  cyberChatSessionTitle,
  cyberChatSessionTimestamp,
  cyberChatWindowFrame,
  cyberChatMobileToggle,
  cyberChatDrawerOverlay,
  cyberButtonGhost,
  cyberEmptyStateText,
} from "../../src/lib/theme";

/**
 * ChatPage
 * ------------------------------------------------------------------
 * Page shell: a Previous Conversational Sessions sidebar (drawer on
 * mobile, persistent panel on desktop) plus the standalone
 * <ChatWindow />. All conversational logic lives in
 * ./components/ChatWindow.js; this page owns session-list mock state,
 * real cart mutation (via useCart()), and the shared
 * <AddToCartModal /> confirmation, matching the pattern used on the
 * home and products pages.
 */
export default function ChatPage() {
  const { addItem } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeChatId, setActiveChatId] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock previous conversational sessions. Wire this up to a real
  // session-history API when one is available — each entry only needs
  // an icon, a short human title, and a timestamp to render.
  const chatHistory = [
    { id: 1, icon: "💬", title: "Current Session", timestamp: "Just now" },
    { id: 2, icon: "💻", title: "Gaming Laptop Search - July 10", timestamp: "Today, 9:14 AM" },
    { id: 3, icon: "📱", title: "Mobile Comparison - July 8", timestamp: "2 days ago" },
    { id: 4, icon: "📺", title: "Smart TV Recommendations - July 5", timestamp: "5 days ago" },
    { id: 5, icon: "⌚", title: "Fitness Watch Search - June 29", timestamp: "Last week" },
  ];

  const handleAddToCart = (product) => {
    addItem(product);
    setActiveProduct(product);
    setIsModalOpen(true);
  };

  const handleSelectSession = (id) => {
    setActiveChatId(id);
    setIsSidebarOpen(false);
  };

  const handleNewSession = () => {
    setActiveChatId(Date.now());
    setIsSidebarOpen(false);
  };

  const renderSessionList = () => {
    if (chatHistory.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center py-10">
          <p className={cyberEmptyStateText}>No recent chats.</p>
        </div>
      );
    }

    return (
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
        {chatHistory.map((session) => (
          <div
            key={session.id}
            onClick={() => handleSelectSession(session.id)}
            className={`${cyberChatSessionCard} ${
              activeChatId === session.id ? cyberChatSessionActive : cyberChatSessionInactive
            }`}
          >
            <span className={cyberChatSessionIcon}>{session.icon}</span>
            <div className="min-w-0 flex-1">
              <p className={cyberChatSessionTitle}>{session.title}</p>
              <span className={cyberChatSessionTimestamp}>{session.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`${cyberPageShell} relative flex min-h-screen w-full flex-col`}>
      {/* Top navigation */}
      <div className={cyberChatTopBar}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className={cyberChatMobileToggle}
            aria-label="Open chat history"
          >
            <span>☰</span> History
          </button>
          <Link href="/" className={cyberNavLink}>
            ⬅ Back to Marketplace
          </Link>
        </div>
        <span className="font-mono text-xs font-semibold text-cyber-muted">AI Shopping Assistant</span>
      </div>

      {/* Sidebar + chat window */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 gap-6 p-2 sm:p-4 md:p-6">
        {/* Desktop sidebar */}
        <div className={`${cyberChatSidebar} hidden md:flex`}>
          <div className="flex items-center justify-between">
            <h3 className={cyberChatSidebarTitle}>Previous Sessions</h3>
            <button type="button" onClick={handleNewSession} className={cyberButtonGhost}>
              + New
            </button>
          </div>
          {renderSessionList()}
        </div>

        {/* Mobile drawer sidebar */}
        {isSidebarOpen && (
          <div className="md:hidden">
            <div className={cyberChatDrawerOverlay} onClick={() => setIsSidebarOpen(false)} />
            <div className={`${cyberChatSidebar} fixed left-2 top-20 bottom-2 z-50 w-72`}>
              <div className="flex items-center justify-between">
                <h3 className={cyberChatSidebarTitle}>Previous Sessions</h3>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className={cyberButtonGhost}
                  aria-label="Close chat history"
                >
                  ✕
                </button>
              </div>
              <button type="button" onClick={handleNewSession} className={cyberButtonGhost}>
                + New Session
              </button>
              {renderSessionList()}
            </div>
          </div>
        )}

        <div className={cyberChatWindowFrame}>
          <ChatWindow key={activeChatId} onAddToCart={handleAddToCart} />
        </div>
      </div>

      <AddToCartModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={activeProduct} />
    </div>
  );
}