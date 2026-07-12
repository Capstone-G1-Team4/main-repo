"use client";

import ProductCard from "./ProductCard";

/**
 * ChatBubble
 * ------------------------------------------------------------------
 * Renders a single message in the conversation. Supports:
 *  - "user" messages (right-aligned, neon gradient)
 *  - "ai" messages (left-aligned, cyber panel)
 *  - "system" messages (centered pill, e.g. "X added to your cart")
 *  - "map" type messages (a simulated Google Maps link/attachment)
 *  - "product-recommendation" type messages, which render an embedded
 *    `products` array as ProductCards under the AI's text.
 *
 * Message shape (matches the conversation contract used by ChatWindow.js):
 * {
 *   id: string,
 *   sender: "user" | "ai" | "system",
 *   type: "text" | "map" | "product-recommendation" | "system",
 *   content?: string,
 *   mapUrl?: string,
 *   products?: Array<{ id, name, price, brand, imageUrl, rating, inStock, currency }>,
 *   timestamp: string | number,
 * }
 */
export default function ChatBubble({ message, onAddToCart }) {
  const isUser = message.sender === "user";
  const isSystem = message.sender === "system" || message.type === "system";

  if (isSystem) {
    return (
      <div className="flex w-full justify-center">
        <span className="rounded-full border border-cyber-purple/30 bg-cyber-purple/10 px-3 py-1 text-xs font-medium text-cyber-purple">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[85%] flex-col gap-2 sm:max-w-[75%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        {/* Avatar + label row (only for AI, to reinforce it's the assistant) */}
        {!isUser && (
          <div className="flex items-center gap-2 pl-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-cyber-purple to-indigo-600 text-[10px] font-bold text-white">
              AI
            </div>
            <span className="text-xs font-medium text-cyber-muted">Shopping Assistant</span>
          </div>
        )}

        {/* Bubble content */}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "rounded-br-sm bg-gradient-to-r from-cyber-purple to-indigo-600 text-white"
              : "rounded-bl-sm border border-cyber-border bg-cyber-panel text-cyber-text"
          }`}
        >
          {message.type === "map" ? (
            <a
              href={message.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 underline underline-offset-2 ${
                isUser ? "text-white" : "text-cyber-purple"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              📍 Shared location: {message.mapUrl}
            </a>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Product recommendations rendered inline under the AI bubble */}
        {message.products && message.products.length > 0 && (
          <div className="flex w-full gap-3 overflow-x-auto pb-1 pl-1 sm:flex-wrap sm:overflow-visible">
            {message.products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} compact />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="px-1 font-mono text-[10px] text-cyber-muted">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}