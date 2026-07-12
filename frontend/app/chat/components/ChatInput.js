"use client";

import { useState } from "react";

/**
 * ChatInput
 * ------------------------------------------------------------------
 * The input area at the bottom of the chat window. Contains:
 *  - a text field for typing a message
 *  - a "Send" button
 *  - a dedicated button to simulate attaching/sending a Google Maps link
 *
 * Props:
 *  - onSendMessage: (text: string) => void
 *  - onSendMapLink: (url: string) => void
 *  - disabled: boolean  // disabled while the assistant is "typing"
 */
export default function ChatInput({ onSendMessage, onSendMapLink, disabled }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSendMessage(trimmed);
    setText("");
  };

  const handleSendMapLink = () => {
    if (disabled) return;
    // Simulated/mocked Google Maps link for now.
    //
    // TODO: BACKEND INTEGRATION POINT
    // Replace with real location logic, e.g.:
    //  - open a location picker / use the browser Geolocation API
    //  - generate a real Google Maps share link from selected coordinates
    //  - send that link to the backend along with the conversation context
    const mockMapUrl = "https://maps.google.com/?q=Downtown+Store+Location";
    onSendMapLink(mockMapUrl);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-cyber-border bg-cyber-panel/40 p-3 sm:p-4"
    >
      {/* Google Maps link simulation button */}
      <button
        type="button"
        onClick={handleSendMapLink}
        disabled={disabled}
        title="Share store location"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyber-border text-cyber-muted transition hover:border-cyber-purple/40 hover:text-cyber-purple disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Text input */}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Ask about a product, e.g. "Show me laptops under 50000"'
        disabled={disabled}
        className="flex-1 rounded-full border border-cyber-border bg-cyber-bg px-4 py-2.5 text-sm text-cyber-text placeholder-cyber-muted outline-none transition focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple disabled:opacity-50"
      />

      {/* Send button */}
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyber-purple to-indigo-600 text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>
  );
}