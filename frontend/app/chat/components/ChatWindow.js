"use client";

import { useEffect, useRef, useState } from "react";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";

// IMPORT NODE: Fetching external data source cleanly away from UI logic
import rawProducts from "../../../Agentic-RAG/data/processed/products.json";

/**
 * Keyword map to dynamically determine and route user intent 
 * into specific inventory product categories.
 */
const CATEGORY_KEYWORDS = {
  phones: ["phone", "phones", "iphone", "mobile", "smartphone", "apple"],
  headphones: ["headphone", "headphones", "sound", "audio", "sony", "earbuds"]
};

let idCounter = 0;
const generateId = () => {
  idCounter += 1;
  return `msg-${Date.now()}-${idCounter}`;
};

/**
 * RegEx Helper: Parses free-text input to extract numerical budget constraints
 * Matches phrases like "under $120" or standalone price tags like "$99"
 */
function parseBudget(text) {
  const match = text.match(/under\s*\$?\s*(\d+(\.\d+)?)/i);
  if (match) return parseFloat(match[1]);
  
  const bare = text.match(/\$\s*(\d+(\.\d+)?)/);
  if (bare) return parseFloat(bare[1]);
  
  return null;
}

/**
 * Advanced Search Logic Engine: Smart Intent Routing
 * Resolves typos (like "shoe" instead of "show") and strictly isolates categories.
 */
function findMatchingProducts(userText) {
  const lower = userText.toLowerCase();
  let matchedCategory = null;

  // 1) Refined keyword weights to avoid generic typo hijacking (e.g., "shoe me")
  const strictKeywords = {
    shoes: ["shoes", "sneaker", "sneakers", "trainer", "trainers", "running shoes"],
    phones: ["phone", "phones", "iphone", "mobile", "smartphone", "apple"],
    headphones: ["headphone", "headphones", "sony", "earbuds", "audio"]
  };

  // Check for strict category matches first
  for (const [category, keywords] of Object.entries(strictKeywords)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      matchedCategory = category;
      break;
    }
  }

  // Edge case handle: If someone types "shoe" as a standalone singular or typo for "show"
  if (!matchedCategory && (lower.includes("shoe") || lower.includes("sound"))) {
    if (lower.includes("headphone") || lower.includes("sony")) {
      matchedCategory = "headphones";
    } else {
      matchedCategory = "shoes";
    }
  }

  const budget = parseBudget(lower);
  if (!matchedCategory && budget === null) return null;

  // 2) Strict filtering execution
  return mockData.catalog.filter((product) => {
    if (matchedCategory) {
      return product.category === matchedCategory && (budget !== null ? product.price <= budget : true);
    }
    return budget !== null ? product.price <= budget : true;
  });
}

/**
 * Context Follow-up Engine: Maps user contextual text (e.g. "CloudFlex ones")
 * to specific product items previously recommended in view.
 */
function findReferencedProduct(userText) {
  const lower = userText.toLowerCase();
  // Safe navigation fallback check to prevent runtime crashes if catalog is empty
  const catalog = mockData?.catalog || [];
  
  return catalog.find((product) => {
    const nameWords = product.name.toLowerCase().split(" ");
    return (
      lower.includes(product.name.toLowerCase()) ||
      nameWords.some((word) => word.length > 3 && lower.includes(word)) ||
      lower.includes(product.brand.toLowerCase())
    );
  });
}

export default function ChatWindow() {
  // STATE MANAGEMENT: Initializing conversational thread directly from detached JSON file
  const [messages, setMessages] = useState(mockData.initialMessages);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const scrollRef = useRef(null);

  // UX TRIGGER: Auto-scroll viewport down to enforce view continuity on update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]);

  /**
   * Safe Append Handler: Updates chat array gracefully keeping historical tracking immutability
   */
  const addMessage = (message) => {
    setMessages((prev) => [
      ...prev,
      { id: generateId(), timestamp: new Date().toISOString(), ...message },
    ]);
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * Mock Response Orchestrator: Decides state machines workflows based on 
   * custom rule-based intent routing, mimicking production LLM behaviors.
   */
  const getMockAiReplies = (userText) => {
    const lower = userText.toLowerCase();
    const matchingProducts = findMatchingProducts(userText);

    // Flow Route 1: Target Product Recommendations Matches Found
    if (matchingProducts && matchingProducts.length > 0) {
      const budget = parseBudget(lower);
      const intro = budget
        ? `Perfect! I found some great options matching your request under $${budget}:`
        : "Sure! Here are the best options from our grounded catalog matching your query:";

      return [
        { sender: "ai", type: "text", content: intro },
        {
          sender: "ai",
          type: "product-recommendation",
          content: "Here is what matches your search:",
          products: matchingProducts,
        },
      ];
    }

    // Flow Route 2: Property Check / Attribute Query Follow-ups (Colors, Stocks)
    const referencedProduct = findReferencedProduct(userText);
    if (referencedProduct && /color|colour|available|stock|options/.test(lower)) {
      window.dispatchEvent(new CustomEvent("chat-add-to-cart", { detail: { productName: referencedProduct.name } }));
      return [
        {
          sender: "ai",
          type: "text",
          content: `Yes! The ${referencedProduct.name} is fully available in multiple options. Would you like me to add one to your cart?`,
        },
      ];
    }

    // Flow Route 3: Cart Commitment Confirmation State
    if (referencedProduct && /add|cart|buy|get/.test(lower)) {
      return [
        {
          sender: "system",
          type: "system",
          content: `${referencedProduct.name} added to your cart`,
        },
        
      ];

    }

    // Flow Route 4: Fallback Guardrail Response Handler
    return [
      {
        sender: "ai",
        type: "text",
        content: `I can help you explore our catalog! Try searching for "iphone", "sony headphones", or "shoes".`,
      },
    ];
  };

  /**
   * UI Latency Simulator: Introduces artificial delays alongside visual typing statuses
   * to enrich the aesthetic illusion of an asynchronous processing pipeline.
   */
  const triggerAiResponse = async (userText) => {
    setIsAiTyping(true);
    
    // Simulate thinking network delay latency
    const thinkingDelay = 800 + Math.random() * 600;
    await wait(thinkingDelay);

    const replies = getMockAiReplies(userText);
    setIsAiTyping(false);

    // Stagger sequential message bubble injection layout for structural organic timing pacing
    for (let i = 0; i < replies.length; i += 1) {
      addMessage(replies[i]);
      if (i < replies.length - 1) {
        await wait(400);
      }
    }
  };

  const handleSendMessage = (text) => {
    addMessage({ sender: "user", type: "text", content: text });
    triggerAiResponse(text);
  };

  const handleSendMapLink = (mapUrl) => {
    addMessage({ sender: "user", type: "map", mapUrl });
    triggerAiResponse("Here's my location");
  };

  const handleAddToCart = (product) => {
    console.log("Added to cart global snapshot register:", product);
    
    window.dispatchEvent(new CustomEvent("chat-add-to-cart", { detail: { productName: product.name } }));

    addMessage({
      sender: "system",
      type: "system",
      content: `${product.name} added to your cart`,
    });
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-lg">
      {/* Header Container Banner */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
          AI
        </div>
        <div>
          <h1 className="text-sm font-semibold text-gray-900 sm:text-base">
            Smart Shopping Assistant
          </h1>
          <p className="flex items-center gap-1 text-xs text-gray-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Online
          </p>
        </div>
      </div>

      {/* Main Messages Interacting Viewport Layout */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-6">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} onAddToCart={handleAddToCart} />
        ))}
        {isAiTyping && <TypingIndicator />}
      </div>

      {/* Footer Interactive User Controls Panel Input */}
      <ChatInput onSendMessage={handleSendMessage} onSendMapLink={handleSendMapLink} disabled={isAiTyping} />
    </div>
  );
}