"use client";

/**
 * TypingIndicator
 * ------------------------------------------------------------------
 * Small "AI is typing..." bubble shown while waiting for a (mocked or
 * real) AI response. Purely presentational.
 */
export default function TypingIndicator() {
  return (
    <div className="flex w-full justify-start">
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-2 pl-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
            AI
          </div>
          <span className="text-xs font-medium text-gray-400">
            Shopping Assistant
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
        </div>
      </div>
    </div>
  );
}
