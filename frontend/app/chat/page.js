"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChatWindow from "./components/ChatWindow";
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
 * ASSUMPTIONS — no chat-history endpoint path was specified, so this page
 * uses conventional REST routes. Adjust the paths below once the real
 * ones are confirmed; everything else (loading, empty states, session
 * switching) works the same regardless of the exact path names:
 *
 *   GET  /chat/sessions              -> [{ id, title, updated_at }, ...]
 *   GET  /chat/sessions/{id}/messages -> [{ id, sender, type, content,
 *                                           timestamp, products? }, ...]
 *   POST /chat/sessions              -> { id, title, updated_at }
 *   POST /chat/sessions/{id}/messages -> persists one message
 */

/** Normalizes a backend session record, with defensive field-name
 *  fallbacks since the exact schema wasn't confirmed. */
function normalizeSession(raw) {
  return {
    id: raw.id || raw.session_id,
    title: raw.title || raw.name || "Untitled Session",
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

  // Load the session list on mount. A brand-new user simply gets an
  // empty array back — the sidebar renders the "No recent chats" empty
  // state, and the chat window starts on a fresh, unsaved session
  // showing only ChatWindow's built-in AI welcome message.
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.push("/login");
      return;
    }

    let isCancelled = false;

    async function loadSessions() {
      setIsSessionsLoading(true);
      setSessionsError("");

      try {
        const response = await apiFetch("/chat/sessions");
        if (isCancelled) return;

        const list = Array.isArray(response) ? response : response?.sessions || [];
        const normalized = list.map(normalizeSession);
        setSessions(normalized);

        if (normalized.length > 0) {
          selectSession(normalized[0].id);
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

    loadSessions();

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
      const response = await apiFetch(`/chat/sessions/${sessionId}/messages`);
      const messages = Array.isArray(response) ? response : response?.messages || [];
      setActiveMessages(messages);
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
      const created = await apiFetch("/chat/sessions", { method: "POST", body: JSON.stringify({}) });
      const session = normalizeSession(created);
      setSessions((prev) => [session, ...prev]);
      setActiveChatId(session.id);
      setActiveMessages([]);
    } catch (error) {
      console.error("Failed to create a new chat session", error);
      // Fall back to a local-only session so the user isn't blocked —
      // it just won't persist until the backend call succeeds later.
      setActiveChatId(`local-${Date.now()}`);
      setActiveMessages([]);
    }
  };

  // Persists new messages for the active session as ChatWindow's local
  // state changes. Fire-and-forget: a failed save doesn't interrupt the
  // conversation, it just won't be there next time the session loads.
  const handleMessagesChange = (messages) => {
    if (!activeChatId || typeof activeChatId === "string" && activeChatId.startsWith("local-")) return;

    const newMessage = messages[messages.length - 1];
    if (!newMessage) return;

    apiFetch(`/chat/sessions/${activeChatId}/messages`, {
      method: "POST",
      body: JSON.stringify(newMessage),
    }).catch((error) => {
      console.error("Failed to save chat message", error);
    });
  };

  const handleAddToCart = (product) => {
    addItem(product);
    setActiveProduct(product);
    setIsModalOpen(true);
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
            className={`${cyberChatSessionCard} ${
              activeChatId === session.id ? cyberChatSessionActive : cyberChatSessionInactive
            }`}
          >
            <span className={cyberChatSessionIcon}>💬</span>
            <div className="min-w-0 flex-1">
              <p className={cyberChatSessionTitle}>{session.title}</p>
              <span className={cyberChatSessionTimestamp}>{formatSessionTimestamp(session.timestamp)}</span>
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
          {isMessagesLoading ? (
            <div className="flex h-full items-center justify-center">
              <p className={cyberEmptyStateText}>Loading conversation…</p>
            </div>
          ) : (
            <ChatWindow
              key={activeChatId || "new"}
              onAddToCart={handleAddToCart}
              initialMessages={activeMessages}
              onMessagesChange={handleMessagesChange}
            />
          )}
        </div>
      </div>

      <AddToCartModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={activeProduct} />
    </div>
  );
}