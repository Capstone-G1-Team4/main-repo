"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import rawProducts from "../../Agentic-RAG/data/processed/products.json";
export default function Home() {
  const router = useRouter();
  const [fullCatalog] = useState( rawProducts || []);
  const [randomizedProducts, setRandomizedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);

  const availableCategories = ["all", ...new Set(fullCatalog.map(p => p.category).filter(Boolean))];

  useEffect(() => {
    if (fullCatalog.length > 0) {
      const shuffled = [...fullCatalog].sort(() => 0.5 - Math.random());
      setRandomizedProducts(shuffled.slice(0, 8)); 
    }
  }, [fullCatalog]);

  const getDynamicProductImage = (product) => {
    if (product.imageUrl) return product.imageUrl;
    const brand = product.brand?.toLowerCase() || "";
    const category = product.category?.toLowerCase() || "";

    if (category === "laptop") {
      if (brand.includes("apple")) return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400";
      if (brand.includes("dell")) return "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=400";
      if (brand.includes("hp")) return "https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?w=400";
      if (brand.includes("lenovo")) return "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400";
      if (brand.includes("asus")) return "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400";
      return "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400";
    }
    if (category === "phones" || category === "phone" || category === "mobile") {
      if (brand.includes("apple") || brand.includes("iphone")) return "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400";
      if (brand.includes("honor") || brand.includes("huawei")) return "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400";
      return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400";
    }
    if (category.includes("watch") || category.includes("smart_watch")) return "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400";
    if (category.includes("refrigerator") || category.includes("fridge")) return "https://images.unsplash.com/photo-1571175432244-5f0258569479?w=400";
    if (category === "tv" || category.includes("television")) return "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400";
    if (category.includes("machine") || category.includes("washing_machine")) return "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400";

    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";
  };

  const filteredProducts = randomizedProducts.filter((product) => {
    return product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           product.brand.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAddToCart = (product) => {
    setActiveProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-cyber-bg font-sans text-cyber-text selection:bg-cyber-purple/30 relative pt-20">
      
      {/* GLOBAL NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-cyber-border bg-cyber-bg/70 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
              <span className="text-xl">🔮</span>
              <span className="font-black text-sm uppercase tracking-widest bg-gradient-to-r from-cyber-purple to-cyber-cyan bg-clip-text text-transparent">
                NextGen Core
              </span>
            </div>

            <div className="flex items-center gap-5">
              <Link href="/products" className="text-xs font-bold uppercase tracking-wider text-cyber-muted hover:text-cyber-purple transition">
                🛍️ Explore Products
              </Link>
              <Link href="/about" className="text-xs font-bold uppercase tracking-wider text-cyber-muted hover:text-cyber-purple transition">
                ℹ️ About Us
              </Link>
              <Link href="/profile" className="text-xs font-bold uppercase tracking-wider text-cyber-muted hover:text-cyber-cyan transition">
                👤 My Profile 
              </Link>
              <Link 
                href="/login" 
                className="rounded-xl border border-cyber-border px-4 py-2 text-xs font-bold text-cyber-muted transition hover:bg-cyber-panel hover:text-cyber-text"
              >
                Login 🔑
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative border-b border-cyber-border bg-cyber-panel/40 backdrop-blur-md py-24 px-4 text-center sm:px-6 lg:px-8 shadow-2xl">
        <div className="mx-auto max-w-3xl relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyber-purple/10 px-3.5 py-1 text-xs font-semibold text-cyber-purple border border-cyber-purple/20">
            <span className="h-1.5 w-1.5 rounded-full bg-cyber-purple animate-ping" />
            Empowered by RAG & Semantic Grounding Layers
          </span>
          
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl text-cyber-text">
            NextGen Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-purple via-indigo-400 to-cyber-cyan">Marketplace</span>
          </h1>
          
          <p className="mt-4 text-base text-cyber-muted max-w-xl mx-auto leading-relaxed">
            Experience contextual, embedded multi-agent interactions hooked natively into deep vector analytics pipelines.
          </p>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link 
              href="/chat" 
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-cyber-purple to-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.03]"
            >
              💬 Ask our AI Assistant
            </Link>
            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 rounded-xl bg-cyber-panel border border-cyber-purple/30 px-6 py-4 text-sm font-bold text-cyber-purple transition-all duration-200 hover:bg-cyber-purple hover:text-white"
            >
              🛍️ Explore Products
            </Link>
            <Link 
              href="/about" 
              className="inline-flex items-center gap-2 rounded-xl bg-cyber-panel border border-cyber-border px-6 py-4 text-sm font-semibold text-cyber-muted transition-all duration-200 hover:bg-cyber-bg hover:text-cyber-text"
            >
              ℹ️ About Team
            </Link>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-6">
          <h2 className="text-lg font-black text-cyber-text tracking-tight">Our Featured Products</h2>
        </div>

        {/* Search Console */}
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-cyber-border pb-10">
          <div className="relative w-full lg:max-w-md group">
            <input
              type="text"
              placeholder="Search active viewport..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full rounded-xl border border-cyber-border bg-cyber-panel/60 backdrop-blur-sm px-5 py-3.5 pl-11 text-sm text-cyber-text focus:border-cyber-purple focus:outline-none"
            />
            <span className="absolute left-4 top-4 text-cyber-muted text-sm">🔍</span>
          </div>

          <div className="flex flex-wrap gap-2.5 bg-cyber-panel/40 p-1.5 rounded-2xl border border-cyber-border backdrop-blur-sm">
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => router.push(`/products?cat=${category}`)}
                className="rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-cyber-muted hover:text-cyber-text hover:bg-cyber-panel/40 transition"
              >
                {category === "all" ? "🛍️ All Products" : category.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-cyber-panel/20 rounded-2xl border border-cyber-border">
            <p className="text-cyber-muted font-mono text-sm">No inventory matched matrix conditions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {filteredProducts.map((product, idx) => (
              <div key={idx} className="group relative flex flex-col overflow-hidden rounded-2xl border border-cyber-border bg-cyber-panel/30 p-4 transition-all duration-300 hover:border-cyber-purple/30 hover:-translate-y-1">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-cyber-bg border border-cyber-border flex items-center justify-center p-4">
                  <img src={getDynamicProductImage(product)} alt={product.name} className="h-full w-full object-contain relative z-10 transition duration-500 group-hover:scale-105" />
                </div>

                <div className="mt-5 flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-cyber-purple font-mono">
                      <span>{product.brand}</span>
                      <span className="bg-cyber-bg px-2 py-0.5 rounded-md border border-cyber-border text-cyber-muted">{product.category}</span>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-cyber-text group-hover:text-cyber-purple transition line-clamp-2">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-6 pt-4 border-t border-cyber-border flex items-center justify-between">
                    <span className="text-lg font-black text-cyber-text">
                      ${Number(product.price).toLocaleString()}
                    </span>
                    <button onClick={() => handleAddToCart(product)} className="rounded-xl bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/20 px-4 py-2 text-xs font-bold hover:bg-cyber-purple hover:text-white transition">
                      Add to Cart 🛒
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-bg/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-cyber-border bg-cyber-panel p-6 shadow-2xl">
            <div className="text-center">
              <h3 className="text-base font-bold text-cyber-text">Item Registered</h3>
              <p className="mt-2 text-xs text-cyber-muted">
                <span className="text-cyber-purple font-semibold">{activeProduct?.name}</span> added to cart.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <button onClick={() => router.push("/cart")} className="w-full rounded-xl bg-cyber-purple py-3 text-xs font-black text-white">Go to Cart 💳</button>
              <button onClick={() => setIsModalOpen(false)} className="w-full rounded-xl bg-cyber-bg border border-cyber-border py-3 text-xs font-bold text-cyber-muted hover:text-cyber-text transition">Continue 🛍️</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}