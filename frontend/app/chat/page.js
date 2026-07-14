"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChatWindow, { findMatchingProducts } from "./components/ChatWindow";
import AddToCartModal from "../../src/components/AddToCartModal";
import { useCart } from "../../src/context/CartContext";
import { apiFetch, getStoredToken, ApiError } from "../../src/lib/api";
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
 * Chat history endpoints (backend uses /chat/conversations):
 *
 *   GET  /chat/conversations              -> [{ id, title, updated_at }, ...]
 *   GET  /chat/conversations/{id}/messages -> [{ id, role, content, created_at }, ...]
 *   POST /chat/conversations              -> { id, title, updated_at }
 *   POST /chat/conversations/{id}/messages -> { conversation_id, messages: [...] }
 */

function normalizeSession(raw) {
  return {
    id: raw.id || raw.session_id,
    title: raw.title || raw.name || `Chat ${new Date(raw.created_at).toLocaleDateString()}`,
    timestamp: raw.updated_at || raw.timestamp || raw.created_at,
  };
}

function formatSessionTimestamp(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ChatPage() {
  const router = useRouter();
  const { addItem } = useCart();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState("");

  const [activeChatId, setActiveChatId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.push("/login");
      return;
    }

    let isCancelled = false;

    async function init() {
      setIsSessionsLoading(true);
      setSessionsError("");

      try {
        const response = await apiFetch("/chat/conversations");
        if (isCancelled) return;

        const list = Array.isArray(response) ? response : response?.sessions || [];
        const normalized = list.map(normalizeSession);
        setSessions(normalized);

        if (normalized.length > 0) {
          selectSession(normalized[0].id);
        } else {
          const created = await apiFetch("/chat/conversations", {
            method: "POST",
            body: JSON.stringify({}),
          });
          if (isCancelled) return;
          const session = normalizeSession(created);
          setSessions([session]);
          setActiveChatId(session.id);
          setActiveMessages([]);
        }
      } catch (error) {
        if (isCancelled) return;

        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          router.push("/login");
          return;
        }

        setSessionsError(
          error instanceof ApiError ? error.message : "Couldn't load your previous chats."
        );
      } finally {
        if (!isCancelled) setIsSessionsLoading(false);
      }
    }

    init();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const selectSession = async (sessionId) => {
    setActiveChatId(sessionId);
    setIsSidebarOpen(false);
    setIsMessagesLoading(true);

    try {
      const response = await apiFetch(`/chat/conversations/${sessionId}/messages`);
      const raw = Array.isArray(response) ? response : response?.messages || [];
      const backendMessages = raw.map((m) => ({
        id: String(m.id),
        sender: m.role === "assistant" ? "ai" : m.role === "user" ? "user" : "system",
        type: "text",
        content: m.content,
        timestamp: m.created_at,
      }));

      const restored = [];
      for (const msg of backendMessages) {
        restored.push(msg);
        if (msg.sender === "user") {
          const products = findMatchingProducts(msg.content);
          if (products && products.length > 0) {
            restored.push({
              id: `rec-${msg.id}`,
              sender: "ai",
              type: "product-recommendation",
              content: "Here are some products I found for you:",
              products,
              timestamp: msg.timestamp,
            });
          }
        }
      }

      setActiveMessages(restored);
    } catch (error) {
      console.error("Failed to load session messages", error);
      setActiveMessages([]);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const handleNewSession = async () => {
    setIsSidebarOpen(false);

    try {
      const created = await apiFetch("/chat/conversations", { method: "POST", body: JSON.stringify({}) });
      const session = normalizeSession(created);
      setSessions((prev) => [session, ...prev]);
      setActiveChatId(session.id);
      setActiveMessages([]);
    } catch (error) {
      console.error("Failed to create a new chat session", error);
      setActiveChatId(`local-${Date.now()}`);
      setActiveMessages([]);
    }
  };

  const handleSendMessage = useCallback(async (text) => {
    if (!activeChatId || String(activeChatId).startsWith("local-")) {
      return { reply: "Please wait while we connect..." };
    }

    const response = await apiFetch(`/chat/conversations/${activeChatId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content: text }),
    });

    const messages = response?.messages || [];
    const assistantMsg = [...messages].reverse().find((m) => m.role === "assistant");
    return { reply: assistantMsg?.content || "I couldn't process that request." };
  }, [activeChatId]);

  const handleAddToCart = (product) => {
    addItem(product);
    setActiveProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteSession = async (sessionId, event) => {
    event.stopPropagation();

    try {
      await apiFetch(`/chat/conversations/${sessionId}`, { method: "DELETE" });
    } catch {
      // Ignore errors — delete locally regardless
    }

    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== sessionId);

      if (activeChatId === sessionId) {
        if (next.length > 0) {
          selectSession(next[0].id);
        } else {
          handleNewSession();
        }
      }

      return next;
    });
  };

  const renderSessionList = () => {
    if (isSessionsLoading) {
      return (
        <div className="flex flex-1 items-center justify-center py-10">
          <p className={cyberEmptyStateText}>Loading chats…</p>
        </div>
      );
    }

    if (sessionsError) {
      return (
        <div className="flex flex-1 items-center justify-center py-10">
          <p className={cyberEmptyStateText}>{sessionsError}</p>
        </div>
      );
    }

    if (sessions.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center py-10">
          <p className={cyberEmptyStateText}>No recent chats.</p>
        </div>
      );
    }

    return (
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => selectSession(session.id)}
            className={`${cyberChatSessionCard} group relative ${
              activeChatId === session.id ? cyberChatSessionActive : cyberChatSessionInactive
            }`}
          >
            <span className={cyberChatSessionIcon}>💬</span>
            <div className="min-w-0 flex-1">
              <p className={cyberChatSessionTitle}>{session.title}</p>
              <span className={cyberChatSessionTimestamp}>{formatSessionTimestamp(session.timestamp)}</span>
            </div>
            <button
              type="button"
              onClick={(e) => handleDeleteSession(session.id, e)}
              className="ml-2 shrink-0 rounded-lg p-1.5 text-slate-500 opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
              aria-label="Delete chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
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
          {isMessagesLoading ? (
            <div className="flex h-full items-center justify-center">
              <p className={cyberEmptyStateText}>Loading conversation…</p>
            </div>
          ) : (
            <ChatWindow
              key={activeChatId || "new"}
              onAddToCart={handleAddToCart}
              onSendMessage={handleSendMessage}
              initialMessages={activeMessages}
            />
          )}
        </div>
      </div>

      <AddToCartModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={activeProduct} />
    </div>
  );
}
