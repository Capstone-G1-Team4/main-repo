"use client";

import { useEffect, useRef, useState } from "react";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import { getDynamicProductImage, getProductId } from "../../../src/lib/productImage";
import rawProducts from "../../../../Agentic-RAG/data/processed/products.json";

/**
 * ChatWindow
 * ------------------------------------------------------------------
 * Sends user messages to the backend (which calls the real AI service)
 * and displays both the AI text response and matching product cards.
 *
 * Props:
 *  - onAddToCart: (product) => void
 *  - onSendMessage: async (text) => { reply: string } — sends to backend
 *  - initialMessages: array of messages to restore from the backend
 */

const CATALOG = rawProducts;

const CATEGORY_KEYWORDS = {
  laptop: ["laptop", "laptops", "notebook", "notebooks", "macbook", "computer"],
  mobile: ["phone", "phones", "mobile", "mobiles", "smartphone", "smartphones", "iphone"],
  tv: ["tv", "tvs", "television", "televisions", "smart tv"],
  refrigerator: ["fridge", "fridges", "refrigerator", "refrigerators", "freezer"],
  washing_machine: ["washing machine", "washing machines", "washer", "washers", "laundry"],
  smart_watch: ["watch", "watches", "smartwatch", "smartwatches", "smart watch", "wearable"],
};

const MAX_RESULTS = 6;

let messageIdCounter = 0;
function generateMessageId() {
  messageIdCounter += 1;
  return `msg-${Date.now()}-${messageIdCounter}`;
}

function parseBudget(lowerText) {
  const underMatch = lowerText.match(/under\s*[₹$]?\s*(\d+(\.\d+)?)/i);
  if (underMatch) return parseFloat(underMatch[1]);

  const bareMatch = lowerText.match(/[₹$]\s*(\d+(\.\d+)?)/);
  if (bareMatch) return parseFloat(bareMatch[1]);

  return null;
}

function matchCategory(lowerText) {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      return category;
    }
  }
  return null;
}

function shapeProduct(raw) {
  return {
    id: getProductId(raw),
    name: raw.name,
    brand: raw.brand,
    category: raw.category,
    price: raw.price,
    rating: raw.rating,
    currency: "INR",
    inStock: true,
    imageUrl: getDynamicProductImage(raw),
  };
}

export function findMatchingProducts(userText) {
  const lower = userText.toLowerCase();
  const category = matchCategory(lower);
  const budget = parseBudget(lower);

  if (!category && budget === null) return null;

  let results = CATALOG;

  if (category) {
    results = results.filter((p) => p.category === category);
  }

  if (budget !== null) {
    results = results.filter((p) => typeof p.price === "number" && p.price <= budget);
  }

  if (results.length === 0) return [];

  return results.slice(0, MAX_RESULTS).map(shapeProduct);
}

function buildProductRecommendation(recommended) {
  if (!recommended || recommended.length === 0) return null;
  return {
    id: generateMessageId(),
    sender: "ai",
    type: "product-recommendation",
    content: "Here are some products I found for you:",
    products: recommended,
    timestamp: new Date().toISOString(),
  };
}

export default function ChatWindow({ onAddToCart, onSendMessage, initialMessages }) {
  const [messages, setMessages] = useState(() => initialMessages || []);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const scrollRef = useRef(null);
  const isInitialLoad = useRef(true);
  const prevInitialMessagesRef = useRef(null);

  useEffect(() => {
    const prevInitial = prevInitialMessagesRef.current;
    prevInitialMessagesRef.current = initialMessages;

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (initialMessages && initialMessages !== prevInitial) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]);

  const appendMessage = (message) => {
    setMessages((prev) => [
      ...prev,
      { id: generateMessageId(), timestamp: new Date().toISOString(), ...message },
    ]);
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const triggerAiResponse = async (userText) => {
    setIsAiTyping(true);

    try {
      const result = await onSendMessage(userText);
      const reply = result?.reply || result?.response || "I couldn't process that request.";

      await wait(400);
      setIsAiTyping(false);

      appendMessage({
        sender: "ai",
        type: "text",
        content: reply,
      });

      const recommended = findMatchingProducts(userText);
      if (recommended && recommended.length > 0) {
        await wait(300);
        const recMsg = buildProductRecommendation(recommended);
        if (recMsg) appendMessage(recMsg);
      }
    } catch (error) {
      console.error("AI response failed:", error);
      setIsAiTyping(false);
      appendMessage({
        sender: "ai",
        type: "text",
        content: "Sorry, I encountered an error. Please try again.",
      });
    }
  };

  const handleSendMessage = (text) => {
    appendMessage({ sender: "user", type: "text", content: text });
    triggerAiResponse(text);
  };

  const handleSendMapLink = (mapUrl) => {
    appendMessage({ sender: "user", type: "map", mapUrl });
    triggerAiResponse("Here's my current location");
  };

  const handleProductAddToCart = (product) => {
    appendMessage({ sender: "system", type: "system", content: `${product.name} added to your cart` });
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-cyber-border bg-cyber-panel/20">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-cyber-border bg-slate-950/60 px-4 py-3 sm:px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-cyber-purple to-indigo-600 text-sm font-bold text-white shadow-lg shadow-purple-900/30">
          AI
        </div>
        <div>
          <h1 className="text-sm font-bold text-cyber-text sm:text-base">Smart Shopping Assistant</h1>
          <p className="flex items-center gap-1 font-mono text-xs text-cyber-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-6">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} onAddToCart={handleProductAddToCart} />
        ))}
        {isAiTyping && <TypingIndicator />}
      </div>

      {/* Input */}
      <ChatInput onSendMessage={handleSendMessage} onSendMapLink={handleSendMapLink} disabled={isAiTyping} />
    </div>
  );
}
