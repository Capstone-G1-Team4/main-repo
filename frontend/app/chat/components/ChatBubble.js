"use client";

import ProductCard from "./ProductCard";

/**
 * ChatBubble
 * ------------------------------------------------------------------
 * Renders a single message in the conversation. Supports:
 *  - "user" messages (right-aligned, solid color)
 *  - "ai" messages (left-aligned, light background)
 *  - "system" messages (centered pill, e.g. "X added to your cart")
 *  - "map" type messages (a simulated Google Maps link/attachment)
 *  - "product-recommendation" type messages, which render an embedded
 *    `products` array as ProductCards under the AI's text — this is
 *    the hook point for "AI recommends items" responses.
 *
 * Message shape (matches the conversation JSON contract used by
 * ChatWindow.js):
 * {
 *   id: string,
 *   sender: "user" | "ai" | "system",
 *   type: "text" | "map" | "product-recommendation" | "system",
 *   content?: string,
 *   mapUrl?: string,
 *   products?: Array<{
 *     id, name, price, originalPrice?, currency?, imageUrl?,
 *     rating?, reviewCount?, inStock?, brand?
 *   }>,
 *   timestamp: string | number,  // ISO string or epoch ms, both work with `new Date(...)`
 * }
 */
export default function ChatBubble({ message, onAddToCart }) {
  const isUser = message.sender === "user";
  const isSystem = message.sender === "system" || message.type === "system";

  // System messages (e.g. "CloudFlex Trainers added to your cart") render
  // as a small centered pill rather than a left/right chat bubble.
  if (isSystem) {
    return (
      <div className="flex w-full justify-center">
        <span className="rounded-full bg-gray-200/80 px-3 py-1 text-xs font-medium text-gray-600">
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
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
              AI
            </div>
            <span className="text-xs font-medium text-gray-400">
              Shopping Assistant
            </span>
          </div>
        )}

        {/* Bubble content */}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "rounded-br-sm bg-indigo-600 text-white"
              : "rounded-bl-sm bg-white text-gray-800 border border-gray-100"
          }`}
        >
          {message.type === "map" ? (
            // Simulated Google Maps link message
            <a
              href={message.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 underline underline-offset-2 ${
                isUser ? "text-white" : "text-indigo-600"
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              📍 Shared location: {message.mapUrl}
            </a>
          ) : (
            // Covers both "text" and "product-recommendation" types —
            // both carry their message in `content`.
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Product recommendations rendered inline under the AI bubble.
            This is the integration point for AI-driven product suggestions.
            Triggered by type === "product-recommendation", but we also
            fall back to checking for a `products` array directly in case
            you want to attach recommendations to a plain "text" message. */}
        {message.products && message.products.length > 0 && (
          <div className="flex w-full gap-3 overflow-x-auto pb-1 pl-1 sm:flex-wrap sm:overflow-visible">
            {message.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                compact
              />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="px-1 text-[10px] text-gray-400">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
