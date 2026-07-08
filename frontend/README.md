# AI-Powered Smart Shopping Assistant — Frontend Scaffold

Next.js (App Router, JavaScript) + Tailwind CSS scaffold for the Capstone chat UI.

## Setup

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Structure

```
app/
  layout.js        # Root layout, imports globals.css
  page.js           # Renders <ChatWindow /> centered on the page
  globals.css       # Tailwind directives + minor scrollbar styling
components/
  ChatWindow.js     # Owns conversation state, mock AI logic, layout
  ChatBubble.js     # Renders one message (user/ai/map), embeds ProductCards
  ChatInput.js      # Text input, Send button, "send map link" button
  ProductCard.js    # Product image/title/price/Add-to-Cart card
  TypingIndicator.js# "AI is typing..." animation
```

## Where to plug in your backend

Search the codebase for `BACKEND INTEGRATION POINT` — every spot that
currently uses mock/setTimeout logic is flagged with a comment
explaining what a real fetch/axios call should look like:

1. **`components/ChatWindow.js` → `triggerAiResponse`**
   Replace the `setTimeout` + `getMockAiResponse` mock with a real
   call to your `/api/chat` (or LLM) endpoint. The expected response
   shape is already sketched in the comment: `{ reply, products? }`.

2. **`components/ChatInput.js` → `handleSendMapLink`**
   Currently sends a hardcoded mock Google Maps URL. Replace with a
   real location picker / Geolocation API call.

3. **`components/ProductCard.js` → `handleAddToCart`**
   Currently just logs to console (and shows a demo AI confirmation
   message via `ChatWindow.handleAddToCart`). Replace with a real
   POST to your cart API and/or global cart state update.

## Notes

- Message state lives in `ChatWindow` as a simple array of message
  objects (`{ id, sender, type, text|mapUrl, products?, timestamp }`).
  Swap this for a reducer, Zustand, or React Query mutation state as
  your app grows.
- `ProductCard` accepts a `compact` prop so the same component works
  both inline in chat bubbles and in a larger standalone grid later.
- Everything is plain Tailwind utility classes — no component library
  dependency, so it's easy to restyle.
