"use client";

/**
 * TypingIndicator
 * ------------------------------------------------------------------
 * Small "AI is typing..." bubble shown while waiting for a (mocked)
 * assistant response. Purely presentational.
 */
export default function TypingIndicator() {
  return (
    <div className="flex w-full justify-start">
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-2 pl-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-cyber-purple to-indigo-600 text-[10px] font-bold text-white">
            AI
          </div>
          <span className="text-xs font-medium text-cyber-muted">Shopping Assistant</span>
        </div>
        <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-cyber-border bg-cyber-panel px-4 py-3">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyber-purple [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyber-purple [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyber-purple" />
        </div>
      </div>
    </div>
  );
}