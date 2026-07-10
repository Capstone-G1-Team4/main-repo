"use client";

/**
 * Shared backend API client.
 * ------------------------------------------------------------------
 * ASSUMPTIONS (no backend/env config existed in this repo prior to this
 * file — adjust these two constants once real values are confirmed):
 *
 *  - API_BASE_URL: read from NEXT_PUBLIC_API_URL. No .env file exists in
 *    this repo yet, so add one (e.g. `.env.local`) with:
 *        NEXT_PUBLIC_API_URL=http://localhost:8000
 *    Falls back to http://localhost:8000 for local FastAPI dev if unset.
 *
 *  - Auth: Bearer token in the `Authorization` header, read from
 *    localStorage under TOKEN_STORAGE_KEY. login/page.js writes a mock
 *    token here on simulated login — swap for a real one once a real
 *    auth endpoint exists.
 *
 * DEMO FALLBACK — READ BEFORE RELYING ON THIS:
 *  When the backend is unreachable (connection refused, DNS failure,
 *  CORS block — i.e. fetch() itself throws), apiFetch() returns
 *  realistic mock data instead of throwing, so the UI still renders
 *  something polished for walkthroughs/demos.
 *
 *  This ONLY applies to network-level failures. A real HTTP error
 *  response (401, 403, 500, etc.) means the backend IS reachable and
 *  responded on purpose — those still throw ApiError as before, because
 *  masking them would hide real bugs (e.g. the 401-redirect-to-login
 *  logic in profile/page.js and chat/page.js depends on seeing real
 *  401s).
 *
 *  Enabled by default in development. Disabled in production builds
 *  unless you explicitly opt in — showing fake order/chat data to real
 *  users because your production backend happened to be down is a much
 *  worse outcome than showing an error. Opt in with:
 *        NEXT_PUBLIC_ENABLE_API_MOCKS=true
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TOKEN_STORAGE_KEY = "auth_token";

const MOCKS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_API_MOCKS === "true" || process.env.NODE_ENV !== "production";

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error("api: failed to read auth token", error);
    return null;
  }
}

export function setStoredToken(token) {
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.error("api: failed to persist auth token", error);
  }
}

export function clearStoredToken() {
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error("api: failed to clear auth token", error);
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ---------------------------------------------------------------------
// Mock data — used only as a network-failure fallback, see banner above.
// ---------------------------------------------------------------------

function isoDaysAgo(days, hours = 12) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
}

const MOCK_USER = {
  username: "dania.jarbooh",
  full_name: "Dania Jarbooh",
  role: "Standard Member",
  email: "developer@example.com",
  member_since: "2026-03-15T00:00:00.000Z",
};

const MOCK_ORDERS = [
  {
    id: "ORD-9410",
    created_at: isoDaysAgo(29),
    status: "Delivered",
    items: [
      { name: "AeroStride Runners", quantity: 1, price: 145.0 },
      { name: "SoundWave Elite", quantity: 1, price: 100.0 },
    ],
  },
  {
    id: "ORD-8821",
    created_at: isoDaysAgo(70),
    status: "Delivered",
    items: [{ name: "Quantum Phone Pro", quantity: 1, price: 799.0 }],
  },
  {
    id: "ORD-1103",
    created_at: isoDaysAgo(3),
    status: "Shipped",
    items: [{ name: "Cyber Cushion Trainer", quantity: 2, price: 62.5 }],
  },
  {
    id: "ORD-1052",
    created_at: isoDaysAgo(2),
    status: "Pending",
    items: [
      { name: "NovaVision 55\" Smart TV", quantity: 1, price: 610.0 },
      { name: "WallMount Pro Bracket", quantity: 1, price: 34.99 },
    ],
  },
];

const MOCK_SESSIONS = [
  { id: "mock-session-1", title: "Current Session", updated_at: isoDaysAgo(0, 0) },
  { id: "mock-session-2", title: "Gaming Laptop Search - July 10", updated_at: isoDaysAgo(1) },
  { id: "mock-session-3", title: "Mobile Comparison - July 8", updated_at: isoDaysAgo(3) },
  { id: "mock-session-4", title: "Smart TV Recommendations - July 5", updated_at: isoDaysAgo(6) },
  { id: "mock-session-5", title: "Fitness Watch Search - June 29", updated_at: isoDaysAgo(12) },
];

const MOCK_MESSAGES_BY_SESSION = {
  "mock-session-2": [
    {
      id: "m1",
      sender: "ai",
      type: "text",
      content: "Hi! I'm your AI shopping assistant. Ask me about laptops, mobiles, TVs, refrigerators, washing machines, or smart watches.",
      timestamp: isoDaysAgo(1, 9),
    },
    {
      id: "m2",
      sender: "user",
      type: "text",
      content: "Show me gaming laptops under 90000",
      timestamp: isoDaysAgo(1, 9),
    },
    {
      id: "m3",
      sender: "ai",
      type: "text",
      content: "Here's what I found within your budget of ₹90,000:",
      timestamp: isoDaysAgo(1, 9),
    },
  ],
};

const DEFAULT_MOCK_MESSAGES = [
  {
    id: "welcome-mock",
    sender: "ai",
    type: "text",
    content:
      "Hi! I'm your AI shopping assistant. Ask me about laptops, mobiles, TVs, refrigerators, washing machines, or smart watches.",
    timestamp: new Date().toISOString(),
  },
];

// Ordered list of {method, pattern, handler} — first match wins. `handler`
// receives the regex match array so path params (session id, etc.) are
// available for shaping the mock response.
const MOCK_ROUTES = [
  { method: "GET", pattern: /^\/auth\/me\/?$/, handler: () => MOCK_USER },
  { method: "GET", pattern: /^\/orders\/?$/, handler: () => MOCK_ORDERS },
  { method: "GET", pattern: /^\/chat\/sessions\/?$/, handler: () => MOCK_SESSIONS },
  {
    method: "GET",
    pattern: /^\/chat\/sessions\/([^/]+)\/messages\/?$/,
    handler: (match) => MOCK_MESSAGES_BY_SESSION[match[1]] || DEFAULT_MOCK_MESSAGES,
  },
  {
    method: "POST",
    pattern: /^\/chat\/sessions\/?$/,
    handler: () => ({
      id: `mock-session-${Date.now()}`,
      title: "New Conversation",
      updated_at: new Date().toISOString(),
    }),
  },
  {
    method: "POST",
    pattern: /^\/chat\/sessions\/([^/]+)\/messages\/?$/,
    handler: () => ({ success: true }),
  },
];

function findMockRoute(method, path) {
  const normalizedMethod = (method || "GET").toUpperCase();
  for (const route of MOCK_ROUTES) {
    if (route.method !== normalizedMethod) continue;
    const match = path.match(route.pattern);
    if (match) return { route, match };
  }
  return null;
}

/** Simulates realistic network latency so mock responses don't render
 *  suspiciously instantly next to real ones. */
function simulatedDelay() {
  return new Promise((resolve) => setTimeout(resolve, 250 + Math.random() * 300));
}

function resolveMockResponse(method, path) {
  const found = findMockRoute(method, path);

  if (found) {
    console.warn(
      `🎭 [api mock] Backend unreachable — serving mock data for ${method || "GET"} ${path}`
    );
    return found.route.handler(found.match);
  }

  // No mock defined for this exact route — fail safe with an empty
  // collection rather than crashing the page, but say so loudly.
  console.warn(
    `🎭 [api mock] Backend unreachable and no mock defined for ${method || "GET"} ${path} — returning empty result.`
  );
  return null;
}

/**
 * Authenticated fetch wrapper. Attaches `Authorization: Bearer <token>`
 * whenever a token is present. Throws ApiError (with `.status`) on any
 * real non-2xx HTTP response so callers can branch on status — e.g.
 * redirect to /login on 401.
 *
 * On a network-level failure (server unreachable), and only when
 * MOCKS_ENABLED is true, returns mock data instead of throwing — see
 * the file banner above for exactly when that applies.
 */
export async function apiFetch(path, options = {}) {
  const token = getStoredToken();

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (networkError) {
    if (MOCKS_ENABLED) {
      await simulatedDelay();
      return resolveMockResponse(options.method, path);
    }

    throw new ApiError(
      `Could not reach the backend at ${API_BASE_URL}${path}. Is the server running?`,
      0
    );
  }

  if (!response.ok) {
    let message = `Request to ${path} failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      message = errorBody.detail || errorBody.message || message;
    } catch {
      // Response body wasn't JSON — keep the default message.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return null;

  try {
    return await response.json();
  } catch {
    return null;
  }
}