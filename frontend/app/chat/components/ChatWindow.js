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
 * Self-contained conversational engine for the AI shopping assistant.
 * Matches user text against the real product catalog (categories:
 * laptop, mobile, tv, refrigerator, washing_machine, smart_watch) and
 * renders recommendations as ProductCards. When the person clicks
 * "Add to Cart" on a card, or asks the assistant to add a previously
 * recommended item, `onAddToCart` is called so the parent page can add
 * it to the real cart (via useCart()) and surface the confirmation
 * modal — this component never touches cart state directly.
 *
 * Props:
 *  - onAddToCart: (product) => void
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

/** Parses free-text input for a numeric budget, e.g. "under 50000" or "$799". */
function parseBudget(lowerText) {
  const underMatch = lowerText.match(/under\s*[₹$]?\s*(\d+(\.\d+)?)/i);
  if (underMatch) return parseFloat(underMatch[1]);

  const bareMatch = lowerText.match(/[₹$]\s*(\d+(\.\d+)?)/);
  if (bareMatch) return parseFloat(bareMatch[1]);

  return null;
}

/** Matches free-text input to one of the real catalog categories. */
function matchCategory(lowerText) {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      return category;
    }
  }
  return null;
}

/** Shapes a raw catalog record into the prop shape ProductCard expects. */
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

/** Filters the catalog by category and/or budget, returning shaped results. */
function findMatchingProducts(userText) {
  const lower = userText.toLowerCase();
  const category = matchCategory(lower);
  const budget = parseBudget(lower);

  if (!category && budget === null) return null;

  const filtered = CATALOG.filter((product) => {
    const matchesCategory = category ? product.category === category : true;
    const matchesBudget = budget !== null ? product.price <= budget : true;
    return matchesCategory && matchesBudget;
  });

  return filtered.slice(0, MAX_RESULTS).map(shapeProduct);
}

/** Looks for a follow-up reference (e.g. "add that Lenovo one") among recently shown products. */
function findReferencedProduct(userText, recentProducts) {
  const lower = userText.toLowerCase();
  return recentProducts.find((product) => {
    const nameWords = product.name.toLowerCase().split(/\s+/);
    return (
      lower.includes(product.brand.toLowerCase()) ||
      nameWords.some((word) => word.length > 3 && lower.includes(word))
    );
  });
}

/** Builds the assistant's reply (and any resulting cart action) for a given message. */
function buildAiReply(userText, recentProducts) {
  const lower = userText.toLowerCase();
  const matchingProducts = findMatchingProducts(userText);

  if (matchingProducts && matchingProducts.length > 0) {
    const budget = parseBudget(lower);
    const intro = budget
      ? `Here's what I found within your budget of ₹${budget.toLocaleString()}:`
      : "Here's what I found in our catalog for you:";

    return {
      replies: [
        { sender: "ai", type: "text", content: intro },
        {
          sender: "ai",
          type: "product-recommendation",
          content: 'Tap "Add to Cart" on anything you\u2019d like to buy:',
          products: matchingProducts,
        },
      ],
      recommended: matchingProducts,
    };
  }

  const referencedProduct = findReferencedProduct(userText, recentProducts);

  if (referencedProduct && /add|cart|buy|get|want/.test(lower)) {
    return {
      replies: [{ sender: "system", type: "system", content: `${referencedProduct.name} added to your cart` }],
      recommended: recentProducts,
      addToCart: referencedProduct,
    };
  }

  if (referencedProduct && /stock|available|color|colour|spec|detail/.test(lower)) {
    return {
      replies: [
        {
          sender: "ai",
          type: "text",
          content: `Yes, the ${referencedProduct.name} is currently in stock. Would you like me to add it to your cart?`,
        },
      ],
      recommended: recentProducts,
    };
  }

  return {
    replies: [
      {
        sender: "ai",
        type: "text",
        content:
          'I can help you find laptops, mobiles, TVs, refrigerators, washing machines, or smart watches. Try something like "show me laptops under 50000".',
      },
    ],
    recommended: recentProducts,
  };
}

const INITIAL_MESSAGES = [
  {
    id: "welcome",
    sender: "ai",
    type: "text",
    content:
      "Hi! I'm your AI shopping assistant. Ask me about laptops, mobiles, TVs, refrigerators, washing machines, or smart watches \u2014 I can add anything you like straight to your cart.",
    timestamp: new Date().toISOString(),
  },
];

export default function ChatWindow({ onAddToCart }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [recentProducts, setRecentProducts] = useState([]);
  const scrollRef = useRef(null);

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
    await wait(700 + Math.random() * 500);

    const { replies, recommended, addToCart } = buildAiReply(userText, recentProducts);

    setIsAiTyping(false);
    setRecentProducts(recommended);

    for (let i = 0; i < replies.length; i += 1) {
      appendMessage(replies[i]);
      if (i < replies.length - 1) {
        await wait(350);
      }
    }

    if (addToCart && onAddToCart) {
      onAddToCart(addToCart);
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