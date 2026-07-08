"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import rawProducts from "../../../Agentic-RAG/data/processed/products.json";/**
 * ProductsPageComponent - Full Dynamic Inventory Grid Matrix
 * Features automated asset brand-matching pointers and deep URL query flag evaluation streams.
 */
export default function ProductsPage() {
  const router = useRouter();
  
  // Reads mockData directly as an array matching your core 2525 records database schema
  const [catalog] = useState(rawProducts || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // State to track the vertical scroll layout visibility for the top anchor arrow
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // State Management for the Custom Alert Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);

  // 🧠 DYNAMIC CATEGORY EXTRACTOR: Reads categories directly from data to build filters with no hardcoding
  const availableCategories = ["all", ...new Set(catalog.map(p => p.category).filter(Boolean))];

  // ⚙️ URL QUERY LISTENER NODE: Catches parameter strings seamlessly upon context initialization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const incomingCategory = urlParams.get("cat");
      if (incomingCategory && availableCategories.includes(incomingCategory)) {
        setSelectedCategory(incomingCategory);
      }
    }
  }, [catalog]);

  // SCROLL MONITORING PIPELINE: Dynamic listener toggles the arrow visibility flag post 400px scroll depth
  useEffect(() => {
    const handleScrollVisibility = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScrollVisibility);
    return () => window.removeEventListener("scroll", handleScrollVisibility);
  }, []);

  /**
   * Dynamic Brand-to-Asset Image Mapper Engine (Expanded Platform Version)
   * Resolves specific hardware placeholder frames based on extended core dataset categories.
   */
  const getDynamicProductImage = (product) => {
    if (product.imageUrl) return product.imageUrl;

    const brand = product.brand?.toLowerCase() || "";
    const category = product.category?.toLowerCase() || "";

    // 1. LAPTOP NODE
    if (category === "laptop") {
      if (brand.includes("apple")) return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400";
      if (brand.includes("dell")) return "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=400";
      if (brand.includes("hp")) return "https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?w=400";
      if (brand.includes("lenovo")) return "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400";
      if (brand.includes("asus")) return "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400";
      return "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400";
    }

    // 2. MOBILE NODE
    if (category === "phones" || category === "phone" || category === "mobile") {
      if (brand.includes("apple") || brand.includes("iphone")) return "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400";
      if (brand.includes("honor") || brand.includes("huawei")) return "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400";
      return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400";
    }

    // 3. SMART_WATCH NODE ⌚
    if (category.includes("watch") || category.includes("smart_watch")) {
      return "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400";
    }

    // 4. REFRIGERATOR NODE ❄️
    if (category.includes("refrigerator") || category.includes("fridge")) {
      return "https://images.unsplash.com/photo-1571175432244-5f0258569479?w=400";
    }

    // 5. TV NODE 📺
    if (category === "tv" || category.includes("television")) {
      return "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400";
    }

    // 6. WASHING_MACHINE NODE 🧺
    if (category.includes("machine") || category.includes("washing_machine")) {
      return "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400";
    }

    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";
  };

  /**
   * Smooth Scroll Execution Vector: Snaps the viewport back to core top matrix bounds safely
   */
  const scrollToTopProtocol = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // FILTER PIPELINE: Coordinates search input matching and category tab filters globally
  const filteredProducts = catalog.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    setActiveProduct(product);
    setIsModalOpen(true);
    console.log(`Dispatched ${product.name} successfully to temporary state buffer.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-purple-500/30 pt-20 relative">
      
      {/* FUTURISTIC GLOBAL NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-slate-900 bg-slate-950/70 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
              <span className="text-xl">🔮</span>
              <span className="font-black text-sm uppercase tracking-widest bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                NextGen Core
              </span>
            </div>
            <div className="flex items-center gap-5">
              <Link href="/" className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-purple-400 transition">⬅️ Back to Home </Link>
              <Link href="/profile" className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-cyan-400 transition">👤 Profile </Link>
              <Link href="/cart" className="rounded-xl bg-purple-600/10 border border-purple-500/20 px-3.5 py-2 text-xs font-bold text-purple-400 hover:bg-purple-600 transition">🛒 View Cart</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Catalog Workspace Container */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10 border-b border-slate-900 pb-5">
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent sm:text-3xl">Discover Products</h1>
        </div>

        {/* Filters and Inputs Console */}
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl opacity-10 blur transition duration-300 group-hover:opacity-30" />
            <input
              type="text"
              placeholder="Search products by name or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm px-5 py-3.5 pl-11 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <span className="absolute left-4 top-4 text-slate-500 text-sm">🔍</span>
          </div>

          {/* AUTOMATED MATRIX TABS */}
          <div className="flex flex-wrap gap-2.5 bg-slate-900/40 p-1.5 rounded-2xl border border-slate-900 backdrop-blur-sm">
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  router.replace(`/products?cat=${category}`, { scroll: false });
                }}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                {category === "all" 
                  ? "🛍️ All Products" 
                  : category.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid Layout */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/20 rounded-2xl border border-slate-900 backdrop-blur-sm">
            <p className="text-slate-500 font-medium font-mono text-sm">No inventory matched current query matrices.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {filteredProducts.map((product, idx) => (
              <div key={idx} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/30 p-4 transition-all duration-300 hover:border-purple-500/30 hover:-translate-y-1">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-900/60 flex items-center justify-center p-4">
                  <span className="text-4xl absolute opacity-5 select-none font-mono">
                    {product.category === "laptop" && "💻"}
                    {(product.category === "phones" || product.category === "mobile") && "📱"}
                    {product.category?.includes("watch") && "⌚"}
                    {product.category?.includes("refrigerator") && "❄️"}
                    {product.category === "tv" && "📺"}
                    {product.category?.includes("machine") && "🧺"}
                  </span>
                  <img
                    src={getDynamicProductImage(product)}
                    alt={product.name}
                    className="h-full w-full object-contain relative z-10 transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40" />
                </div>

                <div className="mt-5 flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-purple-400 font-mono">
                      <span>{product.brand}</span>
                      <span className="bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800 text-slate-500">{product.category}</span>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-slate-100 group-hover:text-purple-300 transition duration-200 line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                    {product.details && product.details.length > 0 && (
                      <p className="text-[10px] text-slate-500 line-clamp-3 mt-1.5 font-mono">⚙️ {product.details.join(" | ")}</p>
                    )}
                    <div className="mt-2 text-xs text-amber-400 font-bold font-mono">★ {product.rating || 4.2}</div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-900/80 flex items-center justify-between">
                    <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                      ${Number(product.price).toLocaleString()}
                    </span>
                    <button onClick={() => handleAddToCart(product)} className="rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 px-4 py-2 text-xs font-bold hover:bg-purple-600 hover:text-white transition">
                      Add to Cart 🛒
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BACK-TO-TOP TRIGGER BUTTON */}
      {showBackToTop && (
        <button onClick={scrollToTopProtocol} className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg border border-purple-500/30 transition-all hover:scale-110 active:scale-95">▲</button>
      )}

      {/* CUSTOM INTELLIGENT ROUTING MODAL CONTAINER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-xl mb-4">🛒</div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-100">Item Registered Successfully</h3>
              <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                <span className="text-purple-400 font-semibold">{activeProduct?.name}</span> has been successfully added to your shopping cart.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <button onClick={() => router.push("/cart")} className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg">Go to Cart  💳</button>
              <button onClick={() => setIsModalOpen(false)} className="w-full rounded-xl bg-slate-950 border border-slate-800 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition">Continue Shopping 🛍️</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}