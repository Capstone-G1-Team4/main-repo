"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import rawProducts from "../../../Agentic-RAG/data/processed/products.json";
/**
 * ChatWindow Component - Interactive Agent Interface Workspace
 * Handles contextual vector mappings, dynamic messages streams, and geo-location routing flags.
 */
function ChatWindow({ activeChatId }) {
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState("");
  const [isMapVisible, setIsMapVisible] = useState(false);

  // Synchronize conversational state layers based on historical session selection parameters
  useEffect(() => {
    if (activeChatId === 1) {
      setMessages([
        { id: 1, text: "Welcome! I am your AI Smart Assistant. How can I help you explore our product catalog today?", sender: "agent" }
      ]);
    } else if (activeChatId === 2) {
      setMessages([
        { id: 1, text: "Previous Session: Looking for high-performance laptops.", sender: "user" },
        { id: 2, text: "I found 3 Apple MacBooks and 2 Dell XPS models matching your criteria in our catalog pools.", sender: "agent" }
      ]);
    } else {
      setMessages([
        { id: 1, text: "New Chat Matrix Initiated. Ask me anything about current stock levels or logistics queries.", sender: "agent" }
      ]);
    }
  }, [activeChatId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Automated custom event simulation layer for checkout data extraction pipeline
    if (input.toLowerCase().includes("buy") || input.toLowerCase().includes("cart") || input.toLowerCase().includes("add")) {
      setTimeout(() => {
        const event = new CustomEvent("chat-add-to-cart", {
          detail: { productName: "AI Optimized Hardware Matrix Item" },
        });
        window.dispatchEvent(event);
      }, 800);
    }
  };

  return (
    <div className="flex flex-col h-full bg-cyber-bg text-cyber-text font-sans relative">
      
      {/* Top Window Sub-Header Viewport */}
      <div className="px-4 py-3 border-b border-cyber-border bg-slate-950/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyber-purple animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyber-text">
            {activeChatId === 2 ? "Session: Laptop Inquiry Cluster" : "RAG Semantic Assistant"}
          </span>
        </div>
        <button 
          onClick={() => setIsMapVisible(!isMapVisible)}
          className="text-[10px] font-mono font-black uppercase tracking-wider bg-cyber-purple/10 border border-cyber-purple/30 text-cyber-purple px-2.5 py-1 rounded-md hover:bg-cyber-purple hover:text-white transition-all"
        >
          {isMapVisible ? "Hide Location 🗺️" : "Show Map Node 🗺️"}
        </button>
      </div>

      {/* Messages Feed Layout Splitter */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        
        {/* Dynamic Mapping Overlay Component Container */}
        {isMapVisible && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm p-4 flex flex-col items-center justify-center text-center animate-fadeIn z-20">
            <div className="w-full h-48 bg-slate-950 rounded-xl border border-cyber-border relative overflow-hidden shadow-inner flex flex-col items-center justify-center p-4">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]" />
              <span className="text-3xl animate-bounce z-10">📍</span>
              <p className="text-xs font-mono text-cyber-muted mt-2 z-10">Simulated Location Registry Mapping</p>
              <p className="text-[10px] font-mono text-cyber-purple mt-1 z-10">Coordinates: 32.5514° N, 35.8514° E (Irbid Hub)</p>
            </div>
          </div>
        )}

        {/* Core Conversational Rendering Engine */}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-md leading-relaxed ${
              msg.sender === "user" ? "bg-cyber-purple text-white rounded-tr-none" : "bg-cyber-panel border border-cyber-border text-cyber-text rounded-tl-none"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Terminal Input Context Form Controller */}
      <form onSubmit={handleSend} className="p-3 border-t border-cyber-border bg-cyber-panel/30 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask our intelligent agent anything..."
          className="flex-1 bg-cyber-bg border border-cyber-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyber-purple text-white placeholder-slate-500 transition"
        />
        <button type="submit" className="bg-cyber-purple hover:opacity-90 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all">
          Send
        </button>
      </form>
    </div>
  );
}

/**
 * ChatPage - Main View Wrapper Matrix
 * Houses historical routing modules and anchors embedded layout interfaces safely.
 */
export default function ChatPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeChatId, setActiveChatId] = useState(1);

  // Mock Datastore Vectors representing prior message history listings
  const chatHistory = [
    { id: 1, title: "✨ Current Active Chat", date: "Today" },
    { id: 2, title: "💻 Laptop Inquiry Cluster", date: "Yesterday" },
    { id: 3, title: "📱 Smartphone Specs Audit", date: "July 04" },
  ];

  useEffect(() => {
    const handleCartNotification = (event) => {
      const productName = event.detail?.productName || "AI Recommended Hardware Item";
      setActiveProduct({ name: productName });
      setIsModalOpen(true);
    };
    window.addEventListener("chat-add-to-cart", handleCartNotification);
    return () => window.removeEventListener("chat-add-to-cart", handleCartNotification);
  }, []);

  return (
    <div className="min-h-screen w-full bg-cyber-bg flex flex-col font-sans relative selection:bg-cyber-purple/30 text-cyber-text">
      
      {/* Top Navigation Frame */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cyber-border bg-slate-950 z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyber-purple hover:text-purple-300 transition">⬅️ Back to Marketplace</Link>
        <span className="text-xs font-semibold text-cyber-muted font-mono">Session ID: SECURE-RAG-ROUTER-VECTOR</span>
      </div>

      {/* Main Split Layout Core Container (History Sidebar & Main Box Workspace) */}
      <div className="flex-1 flex p-2 sm:p-4 md:p-6 gap-6 bg-gradient-to-b from-slate-950 to-cyber-bg relative z-10 max-w-6xl mx-auto w-full">
        
        {/* HISTORICAL SIDEBAR INTERFACE CONSOLE */}
        <div className="hidden md:flex flex-col w-64 bg-cyber-panel/40 border border-cyber-border rounded-2xl p-4 space-y-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-cyber-text font-mono">Chat History</h3>
            <button 
              onClick={() => setActiveChatId(Date.now())}
              className="text-[10px] bg-cyber-purple/10 border border-cyber-purple/20 text-cyber-purple px-2 py-1 rounded hover:bg-cyber-purple hover:text-white transition"
            >
              + New
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {chatHistory.map((history) => (
              <div
                key={history.id}
                onClick={() => setActiveChatId(history.id)}
                className={`p-3 rounded-xl border cursor-pointer transition duration-200 text-left ${
                  activeChatId === history.id
                    ? "bg-cyber-purple/10 border-cyber-purple text-white"
                    : "bg-slate-950/40 border-cyber-border/60 hover:border-cyber-purple/40 text-cyber-muted hover:text-cyber-text"
                }`}
              >
                <p className="text-xs font-bold truncate">{history.title}</p>
                <span className="text-[9px] font-mono text-cyber-purple/70 block mt-1">{history.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Core Active Chat Window Box Node */}
        <div className="flex-1 h-[650px] shadow-2xl rounded-2xl overflow-hidden border border-cyber-border bg-slate-950">
          <ChatWindow activeChatId={activeChatId} />
        </div>
      </div>

      {/* Global Scifi Alert Modal Notification Trigger */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-cyber-border bg-cyber-panel p-6 shadow-2xl">
            <div className="text-center">
              <h3 className="text-base font-bold text-white">AI Assistant Dispatch</h3>
              <p className="mt-2 text-xs text-cyber-muted leading-relaxed">
                <span className="text-cyber-purple font-semibold">{activeProduct?.name}</span> has been securely buffered into operational storage layout loops.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <button onClick={() => router.push("/cart")} className="w-full rounded-xl bg-cyber-purple py-3 text-xs font-black text-white">Go to Cart Matrix 💳</button>
              <button onClick={() => setIsModalOpen(false)} className="w-full rounded-xl bg-slate-950 border border-cyber-border py-3 text-xs font-bold text-cyber-muted hover:text-slate-200 transition-all">Continue Chat 💬</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}