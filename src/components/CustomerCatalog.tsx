import React, { useState, useEffect, useMemo } from "react";
import { Product, User, Order } from "../types";
import { Sparkles, Star, Tag, ShoppingCart, Info, Eye, Check, Flame, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface CustomerCatalogProps {
  products: Product[];
  searchQuery: string;
  onAddToCart: (product: Product, selectedVariants: Record<string, string>) => void;
  onBuyNow: (product: Product, selectedVariants: Record<string, string>) => void;
  onToggleWishlist: (product: Product) => void;
  wishlist: string[];
  orders?: Order[];
}

export default function CustomerCatalog({
  products,
  searchQuery,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlist,
  orders = []
}: CustomerCatalogProps) {
  // Catalog filter and sort states
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<number>(100000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Selected variants state for the active or quick-view product
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [aiRecs, setAiRecs] = useState<string>("");
  const [aiRecsLoading, setAiRecsLoading] = useState<boolean>(false);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);
  const [wishlistNotice, setWishlistNotice] = useState<{ message: string; type: "add" | "remove" } | null>(null);

  useEffect(() => {
    if (wishlistNotice) {
      const timer = setTimeout(() => {
        setWishlistNotice(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [wishlistNotice]);

  const handleToggleWishlist = (product: Product) => {
    onToggleWishlist(product);
    const isFavorited = wishlist.includes(product.id);
    if (!isFavorited) {
      setWishlistNotice({
        message: `"${product.name}" added to wishlist!`,
        type: "add"
      });
    } else {
      setWishlistNotice({
        message: `"${product.name}" removed from wishlist.`,
        type: "remove"
      });
    }
  };

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const brands = ["All", ...Array.from(new Set(products.map((p) => p.brand)))];

  const maxPriceLimit = useMemo(() => {
    if (products.length === 0) return 100000;
    const maxVal = Math.max(...products.map(p => p.price));
    return maxVal > 100000 ? maxVal : 100000;
  }, [products]);

  // Adjust price range state to match maximum limit once products load
  useEffect(() => {
    if (products.length > 0) {
      const maxVal = Math.max(...products.map(p => p.price));
      const neededMax = maxVal > 100000 ? maxVal : 100000;
      setPriceRange((prev) => {
        if (prev === 25000 || prev === 100000 || prev > neededMax) {
          return neededMax;
        }
        return prev;
      });
    }
  }, [products]);

  // Dynamically calculate trending products based on sales volumes in order history
  const trendingProducts = useMemo(() => {
    const volumeMap: Record<string, number> = {};
    
    // Initialize
    products.forEach((p) => {
      volumeMap[p.id] = 0;
    });

    // Sum quantities from orders
    orders.forEach((order) => {
      if (order.status !== "cancelled") {
        order.items.forEach((item) => {
          if (typeof volumeMap[item.productId] === "number") {
            volumeMap[item.productId] += item.quantity;
          } else {
            volumeMap[item.productId] = item.quantity;
          }
        });
      }
    });

    // Map each product to its sales volume and sort descending. Break ties using rating.
    return products
      .map((p) => ({
        ...p,
        salesVolume: volumeMap[p.id] || 0
      }))
      .sort((a, b) => {
        if (b.salesVolume !== a.salesVolume) {
          return b.salesVolume - a.salesVolume;
        }
        return b.rating - a.rating;
      })
      .slice(0, 8);
  }, [products, orders]);

  // Fetch AI Recommendations via our backend endpoint
  useEffect(() => {
    if (selectedProduct) {
      setAiRecsLoading(true);
      fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentProduct: selectedProduct })
      })
        .then((res) => res.json())
        .then((data) => {
          setAiRecs(data.recommendations);
          setAiRecsLoading(false);
        })
        .catch(() => {
          setAiRecs("🎯 Perfect pairing choices: Check out our premium accessories.");
          setAiRecsLoading(false);
        });
    }
  }, [selectedProduct]);

  // Set default variants when product is loaded
  useEffect(() => {
    if (selectedProduct) {
      const initial: Record<string, string> = {};
      selectedProduct.variants.forEach((v) => {
        if (v.options.length > 0) {
          initial[v.name] = v.options[0];
        }
      });
      setSelectedVariants(initial);
    }
  }, [selectedProduct]);

  // Handle filtering
  const filteredProducts = products.filter((product) => {
    // Search option removed - show all products on the front page
    const matchesSearch = true;

    const matchesCategory = selectedCategory === "All" || (product.category || "").toLowerCase() === selectedCategory.toLowerCase();
    const matchesBrand = selectedBrand === "All" || (product.brand || "").toLowerCase() === selectedBrand.toLowerCase();
    const matchesPrice = (product.price ?? 0) <= priceRange;
    const matchesRating = (product.rating ?? 0) >= minRating;

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesRating;
  });

  // Handle sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return b.rating - a.rating; // default to rating / popularity
  });

  // Hot flash sales
  const flashSaleProducts = products.filter((p) => p.flashSale);

  const handleVariantChange = (variantName: string, option: string) => {
    setSelectedVariants((prev) => ({ ...prev, [variantName]: option }));
  };

  const triggerCartWithNotice = (product: Product) => {
    onAddToCart(product, selectedVariants);
    setAddedNotice(product.name);
    setTimeout(() => setAddedNotice(null), 2500);
  };

  return (
    <div className="space-y-12 pb-16" id="catalog-root">
      
      {/* 1. Hero Promo Section */}
      <section className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800" id="hero-promo">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600"
          alt="Luxury Mall banner"
          className="absolute inset-y-0 right-0 w-1/2 h-full object-cover opacity-60 hidden lg:block"
        />
        <div className="relative z-20 py-16 px-8 sm:px-12 lg:py-24 max-w-2xl text-left space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
            <Sparkles size={12} /> ENTERPRISE SHOPPING SANDBOX
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
            Next Generation <span className="text-red-500">Marketplace.</span>
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Experience lightning-fast transactions, verified enterprise level merchants, automatic GST invoices, and AI-Powered personal style assistants.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                const target = products.find((p) => p.featured);
                if (target) setSelectedProduct(target);
              }}
              className="px-6 py-3 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all transform hover:scale-[1.02]"
            >
              Explore Featured Item
            </button>
            <div className="text-xs text-neutral-400 flex items-center gap-4">
              <span className="flex items-center gap-1">🛡️ SSL Payment Secured</span>
              <span className="flex items-center gap-1">⚡ Instant dispatch</span>
            </div>
          </div>
        </div>
      </section>

      {/* Inline Banner for Feedback */}
      {addedNotice && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl flex items-center justify-between shadow-lg sticky top-20 z-30 transition-all duration-300">
          <span id="toast-message" className="text-xs font-semibold flex items-center gap-2">
            <Check size={16} /> Added <strong>"{addedNotice}"</strong> successfully! Continue or checkout.
          </span>
          <button onClick={() => setAddedNotice(null)} className="text-xs bg-white/20 px-2.5 py-1 rounded">Dismiss</button>
        </div>
      )}

      {/* 1.5. Trending Products Horizontal Scroll */}
      <section className="space-y-6" id="trending-section">
        <div className="flex items-center justify-between">
          <div className="space-y-1 text-left">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <span className="inline-block w-2.5 h-6 bg-amber-500 rounded"></span> Trending Products
            </h2>
            <p className="text-xs text-neutral-400">High-demand products calculated from verified real-time receipt orders.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-black rounded-full border border-amber-500/20 uppercase tracking-widest">
            <Flame size={12} className="text-amber-500 fill-amber-500 animate-pulse" /> Hot list
          </div>
        </div>

        <div className="relative">
          <div className="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800 scroll-smooth">
            {trendingProducts.map((p) => {
              const isFavorited = wishlist.includes(p.id);
              return (
                <div
                  key={p.id}
                  className="w-48 sm:w-56 shrink-0 snap-start bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col relative group"
                  id={`trending-card-${p.id}`}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-neutral-150 dark:bg-neutral-800">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      onClick={() => setSelectedProduct(p)}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Badge */}
                    <span className="absolute top-2.5 left-2.5 bg-neutral-950/90 text-amber-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wide border border-white/10 flex items-center gap-1 shadow-md">
                      <Flame size={11} className="fill-amber-400" /> {p.salesVolume > 0 ? "Best Product" : "Hot choice"}
                    </span>

                    {/* Wishlist Icon */}
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => handleToggleWishlist(p)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/95 dark:bg-neutral-900/95 shadow text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Add to Wishlist"
                    >
                      <Star size={11} className={isFavorited ? "text-amber-500" : "text-neutral-400"} fill={isFavorited ? "currentColor" : "none"} />
                    </motion.button>
                  </div>

                  {/* Info Panel */}
                  <div className="p-4 flex flex-col flex-1 justify-between text-left space-y-3">
                    <div className="space-y-1">
                      <p className="text-[9px] text-neutral-400 uppercase font-black tracking-widest">{p.brand}</p>
                      <h3
                        onClick={() => setSelectedProduct(p)}
                        className="text-xs sm:text-sm font-bold text-neutral-950 dark:text-white cursor-pointer hover:text-red-500 transition-colors line-clamp-2 leading-tight"
                      >
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold pt-0.5">
                        <Star size={11} className="fill-amber-500" /> {p.rating}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-dashed border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-xs font-black text-neutral-950 dark:text-white">₹{p.price.toLocaleString("en-IN")}</p>
                        {p.originalPrice > p.price && (
                          <p className="text-[9px] text-neutral-400 line-through">₹{p.originalPrice.toLocaleString("en-IN")}</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const quickVar: Record<string, string> = {};
                          p.variants.forEach((v) => { if (v.options.length > 0) quickVar[v.name] = v.options[0]; });
                          onAddToCart(p, quickVar);
                          setAddedNotice(p.name);
                          setTimeout(() => setAddedNotice(null), 2500);
                        }}
                        className="p-1.5 rounded-lg bg-red-600 hover:bg-neutral-950 hover:text-white text-white dark:hover:bg-white dark:hover:text-neutral-950 transition-all flex items-center justify-center shadow-xs"
                        title="Add to Cart"
                      >
                        <ShoppingCart size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Urgent Flash Sales (If applicable) */}
      <section className="space-y-6" id="flash-sales">
        <div className="flex items-center justify-between">
          <div className="space-y-1 text-left">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <span className="inline-block w-2.5 h-6 bg-red-600 rounded"></span> Flash Deals & Discounts
            </h2>
            <p className="text-xs text-neutral-400">Limited-stock priority merchant bundles with immediate 18% GST savings coupons.</p>
          </div>
          <span className="bg-red-600/10 text-red-500 text-xs font-extrabold px-3 py-1 rounded-full border border-red-500/20">
            ⏳ Ends soon
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashSaleProducts.map((p) => (
            <div
              key={p.id}
              className="group border rounded-2xl p-4 bg-white border-neutral-200/60 dark:bg-neutral-900 dark:border-neutral-800 transition-all hover:shadow-lg flex gap-4"
              id={`flash-item-${p.id}`}
            >
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100 dark:bg-neutral-800">
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded leading-none">
                  Sale
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-between text-left min-w-0">
                <div>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{p.brand}</p>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate group-hover:text-red-500 transition-colors">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-extrabold text-neutral-900 dark:text-white">₹{p.price.toLocaleString("en-IN")}</span>
                    <span className="text-xs text-neutral-400 line-through">₹{p.originalPrice.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-dashed border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => setSelectedProduct(p)}
                    className="p-1 px-2.5 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1"
                    title="View Product"
                  >
                    <Eye size={12} /> Specs
                  </button>
                  <button
                    onClick={() => {
                      const itemVariants: Record<string, string> = {};
                      p.variants.forEach((v) => { if (v.options.length > 0) itemVariants[v.name] = v.options[0]; });
                      onAddToCart(p, itemVariants);
                      setAddedNotice(p.name);
                      setTimeout(() => setAddedNotice(null), 2000);
                    }}
                    className="flex-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold tracking-wide transition-all"
                  >
                    Quick Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Catalog Controls + Filters Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-left" id="search-filter-grid">
        
        {/* Toggle Filters Button for Mobile Devices */}
        <div className="lg:hidden block">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full py-3 px-4 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-xs font-black rounded-xl text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-800 transition-all shadow-xs"
          >
            <span>{showMobileFilters ? "✕ Close Category & Brand Filters" : "⚙️ Open Category & Brand Filters"}</span>
          </button>
        </div>

        {/* Sidebar Filters */}
        <div className={`${showMobileFilters ? "block" : "hidden"} lg:block space-y-6 lg:border-r border-neutral-100 dark:border-neutral-800 lg:pr-6`}>
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-extrabold text-neutral-950 dark:text-white uppercase tracking-wider">Search Filters</h3>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedBrand("All");
                setPriceRange(maxPriceLimit);
                setMinRating(0);
              }}
              className="text-xs text-red-500 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>

          {/* Categories Chips */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Business Categories</p>
            <div className="flex flex-wrap lg:flex-col gap-1.5">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-all ${
                    selectedCategory === c
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Enterprise Brands</p>
            <div className="flex flex-wrap lg:flex-col gap-1.5">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-all ${
                    selectedBrand === b
                      ? "bg-red-600/15 text-red-500 border border-red-500/30"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase">
              <span className="text-neutral-400 tracking-widest">Pricing Limit</span>
              <span className="text-neutral-900 dark:text-white">₹{priceRange.toLocaleString("en-IN")} Max</span>
            </div>
            <input
              type="range"
              min="500"
              max={maxPriceLimit}
              step="500"
              value={priceRange > maxPriceLimit ? maxPriceLimit : priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-red-600 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Minimum Rating</p>
            <div className="flex items-center gap-1">
              {[0, 3, 4, 4.5].map((val) => (
                <button
                  key={val}
                  onClick={() => setMinRating(val)}
                  className={`flex-1 py-1.5 rounded text-xs font-semibold transition-all ${
                    minRating === val
                      ? "bg-amber-500 text-white"
                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  }`}
                >
                  {val === 0 ? "Any" : `${val}★+`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Matrix */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <p className="text-xs font-semibold text-neutral-500">
              Showing <span className="text-neutral-900 dark:text-white font-bold">{sortedProducts.length}</span> luxury goods configured.
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sorting-input" className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Sort:</label>
              <select
                id="sorting-input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold rounded-lg px-3 py-1.5 text-neutral-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="popular">Best Quality Stars</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating Score</option>
              </select>
            </div>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Info className="mx-auto text-neutral-400" size={32} />
              <p className="text-neutral-500 font-semibold">No high-end matching goods found.</p>
              <p className="text-xs text-neutral-400">Try matching broad keywords or reset the budget thresholds.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" id="products-grid">
              {sortedProducts.map((p) => {
                const isFavorited = wishlist.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className="flex flex-col h-full bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/80 rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300"
                    id={`product-card-${p.id}`}
                  >
                    {/* Visual Media Holder */}
                    <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        onClick={() => setSelectedProduct(p)}
                        className="w-full h-full object-cover cursor-pointer group-hover:scale-103 transition-transform duration-500"
                      />
                      {p.featured && (
                        <span className="absolute top-2.5 left-2.5 bg-neutral-900 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wide border border-white/20 flex items-center gap-1">
                          <Star size={9} fill="white" className="text-amber-400" /> Featured
                        </span>
                      )}
                      
                      {/* Favorite Hearts */}
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => handleToggleWishlist(p)}
                        className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/95 dark:bg-neutral-900/95 shadow-md text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Add to Wishlist"
                      >
                        <Star size={14} className={isFavorited ? "text-amber-500" : "text-neutral-400"} fill={isFavorited ? "currentColor" : "none"} />
                      </motion.button>
                    </div>

                    {/* Metadata Content */}
                    <div className="p-5 flex flex-col flex-1 justify-between text-left space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-neutral-400 uppercase font-black tracking-widest">{p.brand}</p>
                          <span className="text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded font-medium">
                            {p.category}
                          </span>
                        </div>
                        <h3
                          onClick={() => setSelectedProduct(p)}
                          className="text-base font-bold text-neutral-950 dark:text-white cursor-pointer hover:text-red-500 transition-colors line-clamp-2 leading-tight"
                        >
                          {p.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Star className="text-amber-400 fill-amber-400" size={13} />
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{p.rating}</span>
                          <span className="text-neutral-400">({p.reviews.length} reviews)</span>
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-neutral-950 dark:text-white">₹{p.price.toLocaleString("en-IN")}</span>
                          {p.originalPrice > p.price && (
                            <span className="text-xs text-neutral-400 line-through">₹{p.originalPrice.toLocaleString("en-IN")}</span>
                          )}
                        </div>

                        {/* Direct Stock Warnings with hidden stock quantities */}
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-semibold ${p.stock > 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {p.stock > 0 ? "✓ In Stock" : "✖ Out of Stock"}
                          </span>
                          <span className="text-neutral-400 text-[10px]">Seller: {p.sellerName}</span>
                        </div>

                        {/* CTA Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => setSelectedProduct(p)}
                            className="py-2 px-3 border border-neutral-200 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 rounded-lg transition-all"
                          >
                            Explore Details
                          </button>
                          <button
                            onClick={() => {
                              const quickVar: Record<string, string> = {};
                              p.variants.forEach((v) => { if (v.options.length > 0) quickVar[v.name] = v.options[0]; });
                              onAddToCart(p, quickVar);
                              setAddedNotice(p.name);
                              setTimeout(() => setAddedNotice(null), 2500);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm"
                          >
                            <ShoppingCart size={13} /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. Product Details Modal / Preview with AI Recommendations */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" id="product-detail-modal">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-5xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto text-left space-y-8 shadow-2xl">
            
            {/* Close Cross */}
            <button
              onClick={() => { setSelectedProduct(null); setAiRecs(""); }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all font-bold text-lg"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Image zoom mock / Slider view */}
              <div className="space-y-4">
                <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-inner relative group">
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover transform cursor-zoom-in hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2.5 left-2.5 bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-md backdrop-blur-xs font-semibold">
                    🔍 Hover to Zoom image
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {selectedProduct.images.map((img, idx) => (
                    <div key={idx} className="aspect-video bg-neutral-50 dark:bg-neutral-800 rounded-lg overflow-hidden">
                      <img src={img} alt="Product perspective" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Specs & Buy triggers */}
              <div className="flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <span className="bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 px-3 py-1 text-xs font-bold uppercase rounded tracking-wider">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white leading-tight">
                    {selectedProduct.name}
                  </h2>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="text-neutral-400">Brand: <span className="text-neutral-800 dark:text-white">{selectedProduct.brand}</span></span>
                    <span className="text-amber-500 flex items-center gap-1">★ {selectedProduct.rating} ({selectedProduct.reviews.length} reviews)</span>
                    <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">✓ Certified Seller Verified</span>
                  </div>
                  
                  <div className="flex items-baseline gap-3 pt-2">
                    <span className="text-3xl font-black text-neutral-950 dark:text-white">₹{selectedProduct.price.toLocaleString("en-IN")}</span>
                    <span className="text-xs text-neutral-400 line-through">₹{selectedProduct.originalPrice.toLocaleString("en-IN")}</span>
                    <span className="text-xs text-red-500 font-bold">Save ₹{(selectedProduct.originalPrice - selectedProduct.price).toLocaleString("en-IN")} instantly!</span>
                  </div>

                  <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed pt-2">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Variants Selection */}
                {selectedProduct.variants.map((v) => (
                  <div key={v.name} className="space-y-1.5">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Select {v.name}:</p>
                    <div className="flex flex-wrap gap-2">
                      {v.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleVariantChange(v.name, opt)}
                          className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${
                            selectedVariants[v.name] === opt
                              ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-950"
                              : "border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-300"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* AI Automated recommended pairing box */}
                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4 border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300">
                  <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400 font-bold mb-1">
                    <Sparkles size={13} />
                    <span>Nova AI Product pairing assistant</span>
                  </div>
                  {aiRecsLoading ? (
                    <div className="animate-pulse space-y-1">
                      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
                      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-5/6"></div>
                    </div>
                  ) : (
                    <div className="leading-relaxed list-disc list-inside whitespace-pre-wrap">
                      {aiRecs}
                    </div>
                  )}
                </div>

                {/* Buy/Cart flow Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => {
                      onAddToCart(selectedProduct, selectedVariants);
                      setSelectedProduct(null);
                      setAddedNotice(selectedProduct.name);
                      setTimeout(() => setAddedNotice(null), 2500);
                    }}
                    className="flex-1 py-3 bg-neutral-900 dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 text-white font-extrabold text-sm rounded-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={15} /> Add to Shopping Cart
                  </button>
                  <button
                    onClick={() => {
                      onBuyNow(selectedProduct, selectedVariants);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-lg transition-transform hover:scale-[1.01]"
                  >
                    🚀 Buy Now (Instant Checkout)
                  </button>
                </div>
              </div>
            </div>

            {/* Specifications Matrix */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6 space-y-3">
              <h4 className="text-sm font-extrabold uppercase text-neutral-800 dark:text-white tracking-widest">Product Specifications</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(selectedProduct.specifications).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b pb-2 text-xs border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-400 font-medium">{key}</span>
                    <span className="text-neutral-800 dark:text-neutral-200 font-bold">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Store Reviews Section */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6 space-y-4">
              <h4 className="text-sm font-extrabold uppercase text-neutral-800 dark:text-white tracking-widest">Verified Buyer Reviews ({selectedProduct.reviews.length})</h4>
              {selectedProduct.reviews.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No reviews yet. Be the first to purchase and review this verified seller!</p>
              ) : (
                <div className="space-y-4">
                  {selectedProduct.reviews.map((r, idx) => (
                    <div key={idx} className="bg-neutral-50 dark:bg-neutral-800/30 p-3.5 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">{r.buyerName}</span>
                        <span className="text-neutral-400">{r.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-500 font-semibold">{"★".repeat(r.rating)}</span>
                        {r.status === "moderated" && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 rounded uppercase font-bold">
                            ✨ Auto Moderated AI content
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Wishlist Notification Toast */}
      <AnimatePresence>
        {wishlistNotice && (
          <motion.div
            id="wishlist-toast"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm font-semibold max-w-sm ${
              wishlistNotice.type === "add"
                ? "bg-neutral-900 border-neutral-800 text-amber-400 dark:bg-white dark:border-neutral-200 dark:text-amber-600"
                : "bg-white border-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400"
            }`}
          >
            <div className="flex items-center gap-2">
              <Star size={16} className={wishlistNotice.type === "add" ? "fill-amber-400 text-amber-400" : "text-neutral-450"} />
              <span>{wishlistNotice.message}</span>
            </div>
            <button
              onClick={() => setWishlistNotice(null)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs font-bold pl-3 ml-auto border-l border-neutral-200 dark:border-neutral-700 cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
