"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import rawProducts from "../../Agentic-RAG/data/processed/products.json";
import { useCart } from "../src/context/CartContext";
import { getDynamicProductImage } from "../src/lib/productImage";
import AddToCartModal from "../src/components/AddToCartModal";
import {
  cyberPageShell,
  cyberNavBar,
  cyberNavLink,
  cyberBrandText,
  cyberNavLoginButton,
  cyberHeroSection,
  cyberHeroContainer,
  cyberEyebrowBadge,
  cyberEyebrowDot,
  cyberHeroHeading,
  cyberHeroHighlight,
  cyberHeroSubtext,
  cyberButtonPrimary,
  cyberButtonOutline,
  cyberButtonSecondary,
  cyberSectionHeading,
  cyberSectionEyebrow,
  cyberSectionSubheading,
  cyberSectionContainer,
  cyberInput,
  cyberInputIcon,
  cyberFilterBar,
  cyberFilterButton,
  cyberEmptyState,
  cyberEmptyStateText,
  cyberCard,
  cyberCardImageFrame,
  cyberBadgeBrand,
  cyberBadge,
  cyberCardTitle,
  cyberCardFooter,
  cyberCardPrice,
  cyberButtonGhost,
  cyberFeatureCard,
  cyberFeatureIcon,
  cyberFeatureTitle,
  cyberFeatureText,
  cyberCategoryCard,
  cyberCategoryIcon,
  cyberCategoryName,
  cyberCategoryDescription,
  cyberTimelineStep,
  cyberTimelineStepNumber,
  cyberTimelineStepIcon,
  cyberTimelineStepTitle,
  cyberTimelineConnector,
  cyberTechBadge,
  cyberTechBadgeIcon,
  cyberStatsSection,
  cyberStatsIcon,
  cyberStatCard,
  cyberStatValue,
  cyberStatLabel,
  cyberCTASection,
  cyberCTAHeading,
  cyberCTASubtext,
} from "../src/lib/theme";

const FEATURED_PRODUCT_COUNT = 8;

const PLATFORM_FEATURES = [
  {
    icon: "🧠",
    title: "AI Shopping Assistant",
    description: "Get personalized recommendations powered by Agentic RAG.",
  },
  {
    icon: "🔍",
    title: "Semantic Product Search",
    description: "Search products using natural language instead of exact keywords.",
  },
  {
    icon: "⚡",
    title: "Fast & Reliable",
    description: "Modern FastAPI backend with optimized product retrieval.",
  },
  {
    icon: "🔒",
    title: "Secure Shopping",
    description: "Protected authentication and reliable checkout workflow.",
  },
];

// Metadata for the "Shop by Category" cards, keyed by the exact category
// values that exist in the real catalog (Agentic-RAG/data/processed/products.json).
// Falls back to a generic icon/description for any category not listed here,
// so this section never breaks if the catalog gains new categories later.
const CATEGORY_META = {
  laptop: { icon: "💻", label: "Laptops", description: "Powerful machines for work and play." },
  mobile: { icon: "📱", label: "Mobiles", description: "The latest phones from top brands." },
  tv: { icon: "📺", label: "TVs", description: "Sharp displays for every living room." },
  refrigerator: { icon: "🧊", label: "Refrigerators", description: "Keep everything fresh and cool." },
  washing_machine: { icon: "🌀", label: "Washing Machines", description: "Laundry day, simplified." },
  smart_watch: { icon: "⌚", label: "Smart Watches", description: "Stay connected on your wrist." },
};

const CATEGORY_FALLBACK_META = { icon: "🛒", description: "Explore this category's picks." };

const HOW_IT_WORKS_STEPS = [
  { icon: "💬", title: "Ask the AI Assistant" },
  { icon: "🧠", title: "Receive Grounded Recommendations" },
  { icon: "🛒", title: "Add Products & Checkout" },
];

const AI_TECHNOLOGIES = [
  { icon: "🤖", label: "Agentic AI" },
  { icon: "🧠", label: "Retrieval-Augmented Generation" },
  { icon: "🔍", label: "Semantic Search" },
  { icon: "⚡", label: "FastAPI" },
  { icon: "🐘", label: "PostgreSQL" },
  { icon: "🗂️", label: "Vector Search" },
  { icon: "🐳", label: "Docker" },
  { icon: "▲", label: "Next.js" },
];

const PLATFORM_STATS = [
  { icon: "📦", value: "2,500+", label: "Products" },
  { icon: "🗂️", value: "6", label: "Categories" },
  { icon: "💬", value: "24/7", label: "AI Assistant" },
  { icon: "⚡", value: "FastAPI", label: "Backend" },
];

export default function HomePage() {
  const router = useRouter();
  const { addItem } = useCart();

  const fullCatalog = rawProducts || [];

  const [randomizedProducts, setRandomizedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);

  const availableCategories = useMemo(
    () => ["all", ...new Set(fullCatalog.map((product) => product.category).filter(Boolean))],
    [fullCatalog]
  );

  // Categories excluding "all", enriched with icon/label/description metadata
  // for the "Shop by Category" cards. Same source of truth as the filter bar.
  const categoryCards = useMemo(
    () =>
      availableCategories
        .filter((category) => category !== "all")
        .map((category) => {
          const meta = CATEGORY_META[category] || {
            icon: CATEGORY_FALLBACK_META.icon,
            label: category.replace(/_/g, " "),
            description: CATEGORY_FALLBACK_META.description,
          };
          return { category, ...meta };
        }),
    [availableCategories]
  );

  // Pick a random sample of featured products once per page load. This is
  // intentionally in an effect (not render) so the sample is stable across
  // re-renders caused by typing in the search box.
  useEffect(() => {
    if (fullCatalog.length === 0) return;
    const shuffled = [...fullCatalog].sort(() => 0.5 - Math.random());
    setRandomizedProducts(shuffled.slice(0, FEATURED_PRODUCT_COUNT));
  }, [fullCatalog]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    return randomizedProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.brand.toLowerCase().includes(normalizedQuery)
    );
  }, [randomizedProducts, searchQuery]);

  const handleAddToCart = (product) => {
    addItem(product);
    setActiveProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className={`${cyberPageShell} pt-20`}>
      <nav className={cyberNavBar}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🔮</span>
              <span className={cyberBrandText}>NextGen Core</span>
            </Link>

            <div className="flex items-center gap-5">
              <Link href="/products" className={cyberNavLink}>🛍️ Explore Products</Link>
              <Link href="/about" className={cyberNavLink}>ℹ️ About Us</Link>
              <Link href="/profile" className={cyberNavLink}>👤 My Profile</Link>
              <Link href="/login" className={cyberNavLoginButton}>
                Login 🔑
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className={cyberHeroSection}>
        <div className={cyberHeroContainer}>
          <span className={cyberEyebrowBadge}>
            <span className={cyberEyebrowDot} />
            Empowered by RAG &amp; Semantic Grounding Layers
          </span>

          <h1 className={cyberHeroHeading}>
            NextGen Smart{" "}
            <span className={cyberHeroHighlight}>Marketplace</span>
          </h1>

          <p className={cyberHeroSubtext}>
            Chat with our AI shopping assistant or browse the catalog directly.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/chat" className={cyberButtonPrimary}>
              💬 Ask our AI Assistant
            </Link>
            <Link href="/products" className={cyberButtonOutline}>
              🛍️ Explore Products
            </Link>
            <Link href="/about" className={cyberButtonSecondary}>
              ℹ️ About Team
            </Link>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Platform Features                                                */}
      {/* ---------------------------------------------------------------- */}
      <section className={cyberSectionContainer}>
        <div className="mb-10 text-center">
          <p className={cyberSectionEyebrow}>Platform</p>
          <h2 className={`${cyberSectionHeading} mt-2 text-2xl`}>Why Shop with NextGen?</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM_FEATURES.map((feature) => (
            <div key={feature.title} className={cyberFeatureCard}>
              <div className={cyberFeatureIcon}>{feature.icon}</div>
              <h3 className={cyberFeatureTitle}>{feature.title}</h3>
              <p className={cyberFeatureText}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Shop by Category                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className={cyberSectionContainer}>
        <div className="mb-10 text-center">
          <p className={cyberSectionEyebrow}>Browse</p>
          <h2 className={`${cyberSectionHeading} mt-2 text-2xl`}>Shop by Category</h2>
          <p className={`${cyberSectionSubheading} mx-auto mt-3 max-w-2xl`}>
            Jump straight into the category you're after.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {categoryCards.map((cat) => (
            <button
              key={cat.category}
              type="button"
              onClick={() => router.push(`/products?cat=${cat.category}`)}
              className={cyberCategoryCard}
            >
              <span className={cyberCategoryIcon}>{cat.icon}</span>
              <span className={cyberCategoryName}>{cat.label}</span>
              <span className={cyberCategoryDescription}>{cat.description}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How It Works                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className={cyberSectionContainer}>
        <div className="mb-10 text-center">
          <p className={cyberSectionEyebrow}>Process</p>
          <h2 className={`${cyberSectionHeading} mt-2 text-2xl`}>How It Works</h2>
        </div>

        <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-center">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div key={step.title} className="flex flex-1 flex-col items-center gap-6 sm:flex-row">
              <div className={cyberTimelineStep}>
                <span className={cyberTimelineStepNumber}>{index + 1}</span>
                <span className={cyberTimelineStepIcon}>{step.icon}</span>
                <h3 className={cyberTimelineStepTitle}>{step.title}</h3>
              </div>
              {index < HOW_IT_WORKS_STEPS.length - 1 && (
                <div className={cyberTimelineConnector}>→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* AI Technology                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className={cyberSectionContainer}>
        <div className="mb-10 text-center">
          <p className={cyberSectionEyebrow}>Under the Hood</p>
          <h2 className={`${cyberSectionHeading} mt-2 text-2xl`}>Powered By</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {AI_TECHNOLOGIES.map((tech) => (
            <span key={tech.label} className={cyberTechBadge}>
              <span className={cyberTechBadgeIcon}>{tech.icon}</span>
              {tech.label}
            </span>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Platform Statistics                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className={cyberSectionContainer}>
        <div className={cyberStatsSection}>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {PLATFORM_STATS.map((stat) => (
              <div key={stat.label} className={cyberStatCard}>
                <div className={cyberStatsIcon}>{stat.icon}</div>
                <div className={`${cyberStatValue} mt-1`}>{stat.value}</div>
                <div className={cyberStatLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Featured Products (unchanged)                                    */}
      {/* ---------------------------------------------------------------- */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-6">
          <h2 className={cyberSectionHeading}>Our Featured Products</h2>
        </div>

        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-cyber-border pb-10">
          <div className="relative w-full lg:max-w-md">
            <input
              type="text"
              placeholder="Search featured products..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className={`${cyberInput} pl-11`}
            />
            <span className={cyberInputIcon}>🔍</span>
          </div>

          <div className={cyberFilterBar}>
            {availableCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => router.push(`/products?cat=${category}`)}
                className={cyberFilterButton}
              >
                {category === "all" ? "🛍️ All Products" : category.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className={cyberEmptyState}>
            <p className={cyberEmptyStateText}>No featured products matched your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {filteredProducts.map((product, index) => (
              <div key={`${product.brand}-${product.name}-${index}`} className={cyberCard}>
                <div className={cyberCardImageFrame}>
                  <img
                    src={getDynamicProductImage(product)}
                    alt={product.name}
                    className="h-full w-full object-contain relative z-10 transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="mt-5 flex flex-1 flex-col justify-between">
                  <div>
                    <div className={`flex items-center justify-between ${cyberBadgeBrand}`}>
                      <span>{product.brand}</span>
                      <span className={cyberBadge}>{product.category}</span>
                    </div>
                    <h3 className={cyberCardTitle}>
                      {product.name}
                    </h3>
                  </div>

                  <div className={cyberCardFooter}>
                    <span className={cyberCardPrice}>
                      ${Number(product.price).toLocaleString()}
                    </span>
                    <button type="button" onClick={() => handleAddToCart(product)} className={cyberButtonGhost}>
                      Add to Cart 🛒
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Bottom CTA                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className={`${cyberSectionContainer} pb-24`}>
        <div className={cyberCTASection}>
          <h2 className={cyberCTAHeading}>Ready to discover your next product?</h2>
          <p className={cyberCTASubtext}>
            Chat with the AI assistant for grounded recommendations, or browse the full catalog yourself.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/chat" className={cyberButtonPrimary}>
              💬 Start Chatting
            </Link>
            <Link href="/products" className={cyberButtonOutline}>
              🛍️ Browse Catalog
            </Link>
          </div>
        </div>
      </section>

      <AddToCartModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={activeProduct} />
    </div>
  );
}