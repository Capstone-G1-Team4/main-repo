/**
 * Shared product utilities.
 *
 * Previously, `getDynamicProductImage` was copy-pasted into three separate
 * page files (home, products, and the old broken login page). This is the
 * single source of truth now — update image mappings here only.
 */

const CATEGORY_FALLBACKS = {
  watch: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400",
  smart_watch: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400",
  refrigerator: "https://images.unsplash.com/photo-1571175432244-5f0258569479?w=400",
  fridge: "https://images.unsplash.com/photo-1571175432244-5f0258569479?w=400",
  tv: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400",
  television: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400",
  machine: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400",
  washing_machine: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";

/**
 * Resolves a product image URL. Falls back to a curated Unsplash image
 * based on category/brand when the product has no `imageUrl` of its own
 * (the current catalog JSON never sets one, so this fallback path is
 * always the one actually used today).
 *
 * @param {{ imageUrl?: string, brand?: string, category?: string }} product
 * @returns {string}
 */
export function getDynamicProductImage(product) {
  if (product?.imageUrl) return product.imageUrl;

  const brand = product?.brand?.toLowerCase() || "";
  const category = product?.category?.toLowerCase() || "";

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

  const matchedFallbackKey = Object.keys(CATEGORY_FALLBACKS).find((key) => category.includes(key));
  if (matchedFallbackKey) return CATEGORY_FALLBACKS[matchedFallbackKey];

  return DEFAULT_IMAGE;
}

/**
 * The catalog JSON (`Agentic-RAG/data/processed/products.json`) does not
 * include an `id` field on any product. Every place that needs a stable,
 * unique identifier (cart line items, React list keys, admin table rows)
 * should derive it through this function instead of inventing its own
 * scheme, so the same product always resolves to the same id.
 *
 * @param {{ name?: string, brand?: string }} product
 * @returns {string}
 */
export function getProductId(product) {
  const base = `${product?.brand || ""}-${product?.name || ""}`;
  return base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}