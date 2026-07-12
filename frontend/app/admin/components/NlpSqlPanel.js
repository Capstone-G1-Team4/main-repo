"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { apiFetch, getStoredToken } from "../../../src/lib/api";

// ---------------------------------------------------------------------------
// Voice recorder — captures audio via MediaRecorder, sends to backend Whisper
// ---------------------------------------------------------------------------

function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [supported, setSupported] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      setSupported(true);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      if (!recorderRef.current || recorderRef.current.state === "inactive") {
        resolve(null);
        return;
      }

      recorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        setIsRecording(false);

        // Stop all tracks to release microphone
        recorderRef.current?.stream?.getTracks()?.forEach((t) => t.stop());

        // Send to backend Whisper
        try {
          const formData = new FormData();
          formData.append("file", blob, "audio.webm");

          const API_BASE =
            (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1";
          const token = getStoredToken();

          const resp = await fetch(`${API_BASE}/admin/speech-to-text`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          });

          if (!resp.ok) throw new Error(`Whisper failed: ${resp.status}`);
          const data = await resp.json();
          resolve(data.text);
        } catch (err) {
          console.error("Speech-to-text failed:", err);
          resolve(null);
        }
      };

      recorderRef.current.stop();
    });
  }, []);

  return { isRecording, supported, startRecording, stopRecording };
}

// ---------------------------------------------------------------------------
// SQL result table
// ---------------------------------------------------------------------------

function ResultTable({ columns, rows }) {
  if (!columns || !rows || rows.length === 0) {
    return (
      <div className="rounded-xl border border-cyber-border bg-cyber-bg/40 p-8 text-center">
        <p className="font-mono text-xs text-cyber-muted">No results returned</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-cyber-border">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-cyber-border bg-cyber-panel/40">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-cyber-purple"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-cyber-border/40 transition hover:bg-cyber-bg/30 last:border-b-0"
            >
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 font-mono text-[11px] text-cyber-text">
                  {row[col] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Suggested questions
// ---------------------------------------------------------------------------

const SUGGESTIONS = [
  "How many users do we have?",
  "What is our total revenue?",
  "Show me all pending orders",
  "Which products are out of stock?",
  "What are the top 5 best selling products?",
  "How many orders were delivered this month?",
  "Show me orders by payment method",
  "What categories do we sell?",
  "How many conversations have we had?",
  "Show me the most expensive products",
];

// ---------------------------------------------------------------------------
// Main NLP-to-SQL Panel
// ---------------------------------------------------------------------------

export default function NlpSqlPanel() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [memoryCount, setMemoryCount] = useState(0);
  const inputRef = useRef(null);
  const historyEndRef = useRef(null);

  const { isRecording, supported, startRecording, stopRecording } = useVoiceRecorder();

  const handleClearHistory = useCallback(async () => {
    try {
      await apiFetch("/admin/nlp-query/history", { method: "DELETE" });
      setHistory([]);
      setMemoryCount(0);
    } catch {
      // ignore
    }
  }, []);

  const handleVoiceInput = useCallback(async () => {
    if (isRecording) {
      setTranscribing(true);
      const text = await stopRecording();
      setTranscribing(false);
      if (text) {
        setQuestion(text);
        // Auto-submit after transcription
        handleSubmit(text);
      }
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const handleSubmit = useCallback(
    async (q) => {
      const query = (q || question).trim();
      if (!query || loading) return;

      setLoading(true);
      setQuestion("");

      const entry = { role: "user", content: query };
      setHistory((prev) => [...prev, entry]);

      try {
        const result = await apiFetch("/admin/nlp-query", {
          method: "POST",
          body: JSON.stringify({ question: query }),
        });
        setHistory((prev) => [...prev, { role: "assistant", ...result }]);
        setMemoryCount((c) => c + 1);
      } catch (err) {
        setHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            success: false,
            error: err.message || "Request failed",
            question: query,
            sql: "",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [question, loading]
  );

  // Auto-scroll
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Handle Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-full flex-col p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-black tracking-tight text-cyber-text sm:text-xl">
            NLP to SQL
          </h1>
          <p className="mt-1 font-mono text-[10px] text-cyber-muted">
            Ask questions about your database in plain English — or speak them aloud with Whisper
          </p>
        </div>
        <div className="flex items-center gap-3">
          {memoryCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-lg border border-cyber-purple/20 bg-cyber-purple/10 px-2.5 py-1 font-mono text-[9px] text-cyber-purple">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyber-purple" />
              {memoryCount} turn{memoryCount !== 1 ? "s" : ""} in memory
            </span>
          )}
          {memoryCount > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="rounded-lg border border-cyber-border/60 bg-cyber-bg/40 px-2.5 py-1 font-mono text-[9px] text-cyber-muted transition hover:border-red-500/30 hover:text-red-400"
              title="Clear conversation memory"
            >
              Clear memory
            </button>
          )}
        </div>
      </div>

      {/* Conversation area */}
      <div className="mb-4 flex-1 overflow-y-auto space-y-4 rounded-2xl border border-cyber-border bg-cyber-panel/20 p-4 min-h-[300px] max-h-[500px]">
        {history.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div className="text-4xl opacity-40">🧠</div>
            <p className="text-center font-mono text-xs text-cyber-muted max-w-md">
              Ask anything about your data. Try:
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setQuestion(s);
                    handleSubmit(s);
                  }}
                  className="rounded-lg border border-cyber-border/60 bg-cyber-bg/40 px-3 py-1.5 font-mono text-[10px] text-cyber-muted transition hover:border-cyber-purple/40 hover:text-cyber-text"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((entry, i) => (
          <div key={i} className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                entry.role === "user"
                  ? "bg-gradient-to-r from-cyber-purple to-cyber-indigo text-white"
                  : "border border-cyber-border bg-cyber-panel/60"
              }`}
            >
              {entry.role === "user" ? (
                <p className="text-xs font-bold">{entry.content}</p>
              ) : (
                <div className="space-y-3">
                  {/* Error */}
                  {entry.error && !entry.success && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                      <p className="text-[10px] font-mono text-red-400">{entry.error}</p>
                    </div>
                  )}

                  {/* Natural language answer — the main response */}
                  {entry.success && entry.answer && (
                    <div className="rounded-lg bg-gradient-to-r from-cyber-purple/10 to-cyber-indigo/10 border border-cyber-purple/20 p-3">
                      <p className="text-xs leading-relaxed text-cyber-text font-medium">
                        {entry.answer}
                      </p>
                    </div>
                  )}

                  {/* Collapsible details: SQL + table */}
                  {entry.success && entry.columns && (
                    <details className="group">
                      <summary className="cursor-pointer select-none text-[9px] font-bold uppercase tracking-wider text-cyber-muted hover:text-cyber-text transition">
                        View SQL &amp; Raw Results ({entry.row_count} row{entry.row_count !== 1 ? "s" : ""})
                      </summary>
                      <div className="mt-2 space-y-2">
                        {entry.sql && (
                          <pre className="overflow-x-auto rounded-lg bg-cyber-bg/80 p-3 font-mono text-[10px] text-cyber-cyan leading-relaxed">
                            {entry.sql}
                          </pre>
                        )}
                        <ResultTable columns={entry.columns} rows={entry.result} />
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {(loading || transcribing) && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-cyber-border bg-cyber-panel/60 px-4 py-3">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-cyber-purple border-t-transparent" />
              <span className="font-mono text-[10px] text-cyber-muted">
                {transcribing ? "Transcribing with Whisper..." : "Thinking..."}
              </span>
            </div>
          </div>
        )}

        <div ref={historyEndRef} />
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-cyber-border bg-cyber-panel/40 p-3 backdrop-blur-sm">
        {supported && (
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={transcribing || loading}
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-all ${
              isRecording
                ? "border-red-500/50 bg-red-500/20 text-red-400 animate-pulse"
                : "border-cyber-border bg-cyber-bg/60 text-cyber-muted hover:border-cyber-purple/40 hover:text-cyber-text"
            } disabled:opacity-30`}
            title={isRecording ? "Stop recording (sends to Whisper)" : "Speak your question"}
          >
            {transcribing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyber-purple border-t-transparent" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        )}

        <input
          ref={inputRef}
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isRecording
              ? "Recording... click mic to stop"
              : transcribing
              ? "Transcribing..."
              : "Ask a question about your data..."
          }
          disabled={loading || transcribing}
          className="flex-1 bg-transparent font-mono text-xs text-cyber-text placeholder-cyber-muted focus:outline-none disabled:opacity-50"
        />

        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={loading || transcribing || !question.trim()}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-cyber-purple to-cyber-indigo text-white shadow-lg shadow-cyber-purple/30 transition hover:opacity-90 disabled:opacity-30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      {/* Voice status indicator */}
      {isRecording && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
          <span className="font-mono text-[10px] text-red-400">
            Recording... click mic to stop &amp; transcribe
          </span>
        </div>
      )}
    </div>
  );
}
