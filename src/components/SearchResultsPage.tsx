import React, { useState, useMemo } from "react";
import { Product } from "../types";
import { ArrowLeft, Star, ShoppingCart, SlidersHorizontal, Eye, Check, Info, X, ChevronDown, ChevronUp, Menu } from "lucide-react";

interface SearchResultsPageProps {
  products: Product[];
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  onAddToCart: (product: Product, selectedVariants: Record<string, string>) => void;
  onBuyNow: (product: Product, selectedVariants: Record<string, string>) => void;
  onToggleWishlist: (product: Product) => void;
  wishlist: string[];
  onBackToCatalog: () => void;
}

export default function SearchResultsPage({
  products,
  searchQuery,
  onSearchQueryChange,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlist,
  onBackToCatalog
}: SearchResultsPageProps) {
  // Filters & Sorting state
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<number>(25000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("popular");

  // Controls if the main 3-bar filter panel is opened or closed
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(true);
  
  // Controls which sub-accordions are expanded inside the 3-bar menu panel
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    brand: false,
    price: false,
    rating: false,
    sort: false
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };
  
  // Quick View spec modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  // Derive active items matching search string
  const searchedProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return products.filter((product) => 
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Available filters from the search result subset or full set
  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(searchedProducts.map((p) => p.category)))];
  }, [searchedProducts]);

  const brands = useMemo(() => {
    return ["All", ...Array.from(new Set(searchedProducts.map((p) => p.brand)))];
  }, [searchedProducts]);

  // Apply filters onto search subset
  const filteredProducts = useMemo(() => {
    return searchedProducts.filter((product) => {
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesBrand = selectedBrand === "All" || product.brand === selectedBrand;
      const matchesPrice = product.price <= priceRange;
      const matchesRating = product.rating >= minRating;
      return matchesCategory && matchesBrand && matchesPrice && matchesRating;
    });
  }, [searchedProducts, selectedCategory, selectedBrand, priceRange, minRating]);

  // Apply sorting
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return b.rating - a.rating; // default to rating / popularity
    });
  }, [filteredProducts, sortBy]);

  const handleVariantChange = (variantName: string, option: string) => {
    setSelectedVariants((prev) => ({ ...prev, [variantName]: option }));
  };

  const handleOpenSpecs = (p: Product) => {
    setSelectedProduct(p);
    const initial: Record<string, string> = {};
    p.variants.forEach((v) => {
      if (v.options.length > 0) initial[v.name] = v.options[0];
    });
    setSelectedVariants(initial);
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-left animate-fade-in" id="search-results-viewport">
      {/* Search Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div className="space-y-1">
          <button
            onClick={onBackToCatalog}
            className="group flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-neutral-400 hover:text-red-500 transition-colors"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" /> 
            Back to Marketplace
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mt-2">
            Search Results for <span className="text-red-500 font-mono italic">"{searchQuery}"</span>
          </h1>
          <p className="text-xs text-neutral-400 font-medium">
            Found <span className="font-extrabold text-neutral-900 dark:text-white">{searchedProducts.length} matched goods</span> inside store collections.
          </p>
        </div>

        {/* Clear Search Trigger */}
        <button
          onClick={() => {
            onSearchQueryChange("");
            onBackToCatalog();
          }}
          className="px-4 py-2 text-xs font-black rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-200"
        >
          ✕ Clear Search
        </button>
      </div>

      {/* Added Toast Alert */}
      {addedNotice && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl flex items-center justify-between shadow-lg sticky top-20 z-30 transition-all duration-300">
          <span className="text-xs font-semibold flex items-center gap-2">
            <Check size={16} /> Added <strong>"{addedNotice}"</strong> successfully!
          </span>
          <button onClick={() => setAddedNotice(null)} className="text-xs bg-white/20 px-2.5 py-1 rounded">Dismiss</button>
        </div>
      )}

      {/* 3-bar Menu Trigger Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xs">
        <button
          onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-red-650 hover:bg-red-750 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-98 text-left"
          id="toggle-three-bar-filters"
        >
          <Menu size={16} />
          <span>{isFilterPanelOpen ? "✕ Close Filters" : "☰ Filter & Sort Menu"}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-400 font-bold">Refined Items:</span>
          {selectedCategory !== "All" && (
            <span className="bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 font-bold px-2 py-1 rounded">
              Cat: {selectedCategory}
            </span>
          )}
          {selectedBrand !== "All" && (
            <span className="bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 font-bold px-2 py-1 rounded">
              Brand: {selectedBrand}
            </span>
          )}
          {priceRange < 25000 && (
            <span className="bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 font-bold px-2 py-1 rounded">
              Max: ₹{priceRange}
            </span>
          )}
          {minRating > 0 && (
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-1 rounded">
              ★ {minRating}+
            </span>
          )}
          <span className="bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 font-bold px-2 py-1 rounded">
            Sort: {sortBy === "popular" ? "Best Quality" : sortBy === "price-low" ? "Price Low-High" : sortBy === "price-high" ? "Price High-Low" : "Rating Score"}
          </span>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSelectedBrand("All");
              setPriceRange(25000);
              setMinRating(0);
              setSortBy("popular");
            }}
            className="text-[10px] text-red-500 hover:underline uppercase tracking-wider font-extrabold ml-1"
          >
            Reset
          </button>
        </div>
      </div>

      {searchedProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-white dark:bg-neutral-900/20 max-w-xl mx-auto">
          <Info className="mx-auto text-neutral-400" size={40} />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">No exact matching products found</h3>
          <p className="text-xs text-neutral-450 max-w-xs mx-auto leading-relaxed">
            We couldn't locate any products with specifications matching "{searchQuery}". Try editing the keyword search query.
          </p>
          <button
            onClick={onBackToCatalog}
            className="inline-block mt-2 px-5 py-2 text-xs font-bold text-white bg-red-650 hover:bg-red-700 rounded-lg"
          >
            Browse Catalog
          </button>
        </div>
      ) : (
        /* Core Results Grid with Filters Sidebar */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Collapsible 3-Bar Filter Accordion Rail */}
          {isFilterPanelOpen && (
            <div className="space-y-4 lg:border-r border-neutral-100 dark:border-neutral-800 lg:pr-6" id="three-bar-filter-accordion-container">
              {/* Accordion 1: Category Selection */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/40">
                <button
                  type="button"
                  onClick={() => toggleSection("category")}
                  className="w-full flex items-center justify-between p-3 text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 text-left transition-colors"
                >
                  <span className="flex items-center gap-1.5">📂 Click to choose Category</span>
                  {openSections.category ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {openSections.category && (
                  <div className="p-3 space-y-1 bg-white dark:bg-neutral-905 transition-all">
                    <div className="flex flex-col gap-1">
                      {categories.map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedCategory(c)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-all ${
                            selectedCategory === c
                              ? "bg-red-650 text-white shadow-xs"
                              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                          }`}
                        >
                          {c === "All" ? "All Categories" : c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Brand Selection */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/40">
                <button
                  type="button"
                  onClick={() => toggleSection("brand")}
                  className="w-full flex items-center justify-between p-3 text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 text-left transition-colors"
                >
                  <span className="flex items-center gap-1.5">🏷️ Click to choose Brand</span>
                  {openSections.brand ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {openSections.brand && (
                  <div className="p-3 space-y-1 bg-white dark:bg-neutral-905 transition-all">
                    <div className="flex flex-col gap-1">
                      {brands.map((b) => (
                        <button
                          key={b}
                          onClick={() => setSelectedBrand(b)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-all ${
                            selectedBrand === b
                              ? "bg-red-650/15 text-red-500 border border-red-500/20"
                              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                          }`}
                        >
                          {b === "All" ? "All Brands" : b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: Price Limit Selection */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/40">
                <button
                  type="button"
                  onClick={() => toggleSection("price")}
                  className="w-full flex items-center justify-between p-3 text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 text-left transition-colors"
                >
                  <span className="flex items-center gap-1.5">💰 Click to set Price Limit</span>
                  {openSections.price ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {openSections.price && (
                  <div className="p-3.5 space-y-3 bg-white dark:bg-neutral-905 transition-all">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest font-mono">
                      <span className="text-neutral-400">Limit Max</span>
                      <span className="text-neutral-900 dark:text-white">₹{priceRange.toLocaleString("en-IN")}</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="25000"
                      step="500"
                      value={priceRange}
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      className="w-full h-1.5 accent-red-600 bg-neutral-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-neutral-400 font-bold">
                      <span>₹500</span>
                      <span>₹25,000</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 4: Rating Star Score Selection */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/40">
                <button
                  type="button"
                  onClick={() => toggleSection("rating")}
                  className="w-full flex items-center justify-between p-3 text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 text-left transition-colors"
                >
                  <span className="flex items-center gap-1.5">⭐ Click to set Rating</span>
                  {openSections.rating ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {openSections.rating && (
                  <div className="p-3 space-y-1 bg-white dark:bg-neutral-905 transition-all">
                    <div className="grid grid-cols-2 gap-1.5">
                      {[0, 3, 4, 4.5].map((val) => (
                        <button
                          key={val}
                          onClick={() => setMinRating(val)}
                          className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                            minRating === val
                              ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                              : "bg-neutral-105 border-neutral-200 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                          }`}
                        >
                          {val === 0 ? "Any Rating" : `${val}★ +`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 5: Sorting Selection */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/40">
                <button
                  type="button"
                  onClick={() => toggleSection("sort")}
                  className="w-full flex items-center justify-between p-3 text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 text-left transition-colors"
                >
                  <span className="flex items-center gap-1.5">🔄 Click to Sort Results</span>
                  {openSections.sort ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {openSections.sort && (
                  <div className="p-3 space-y-1 bg-white dark:bg-neutral-905 transition-all">
                    <div className="flex flex-col gap-1">
                      {[
                        { key: "popular", val: "Best Quality Stars" },
                        { key: "price-low", val: "Price: Low to High" },
                        { key: "price-high", val: "Price: High to Low" },
                        { key: "rating", val: "Rating Score Rank" }
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setSortBy(opt.key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-all ${
                            sortBy === opt.key
                              ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-black shadow-xs"
                              : "bg-neutral-100 text-neutral-605 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                          }`}
                        >
                          {opt.val}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Right Matching Products Panel */}
          <div className={`${isFilterPanelOpen ? "lg:col-span-3" : "lg:col-span-4"} space-y-6`}>
            {/* Catalog Controls Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <p className="text-xs text-neutral-405 font-medium font-sans">
                Showing <span className="font-extrabold text-neutral-800 dark:text-neutral-200">{sortedProducts.length} filtered match items</span>
              </p>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="py-16 text-center text-xs text-neutral-400 italic block">
                No products match the selected filters (Category/Price limit). Reset filters to view all matches.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((p) => {
                  const isFavorited = wishlist.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className="flex flex-col h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300"
                    >
                      {/* Thumbnail Media */}
                      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          onClick={() => handleOpenSpecs(p)}
                          className="w-full h-full object-cover cursor-pointer group-hover:scale-103 transition-transform duration-500"
                        />
                        <button
                          onClick={() => onToggleWishlist(p)}
                          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/95 dark:bg-neutral-900/95 shadow text-neutral-400 hover:text-red-500 transition-colors"
                        >
                          <Star size={13} className={isFavorited ? "text-amber-500" : "text-neutral-400"} fill={isFavorited ? "currentColor" : "none"} />
                        </button>
                      </div>

                      {/* Content Panel */}
                      <div className="p-4 flex flex-col flex-1 justify-between gap-3 text-left">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider">{p.brand}</span>
                            <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-sm">{p.category}</span>
                          </div>
                          <h3
                            onClick={() => handleOpenSpecs(p)}
                            className="text-sm font-bold text-neutral-950 dark:text-white cursor-pointer hover:text-red-500 transition-colors line-clamp-2 leading-tight"
                          >
                            {p.name}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold pt-0.5">
                            <Star size={11} className="fill-amber-500" /> {p.rating}
                            <span className="text-neutral-400 text-[10px] font-medium">({p.reviews.length} reviews)</span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-dashed border-neutral-100 dark:border-neutral-805">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-black text-neutral-950 dark:text-white">₹{p.price.toLocaleString("en-IN")}</span>
                            {p.originalPrice > p.price && (
                              <span className="text-[10px] text-neutral-400 line-through">₹{p.originalPrice.toLocaleString("en-IN")}</span>
                            )}
                          </div>

                          {/* Hide actual numerical stock: show In Stock or Out of Stock indicator only */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={`font-semibold ${p.stock > 0 ? "text-emerald-500" : "text-red-500"}`}>
                              {p.stock > 0 ? "✓ In Stock" : "✖ Out of Stock"}
                            </span>
                            <span className="text-neutral-400 text-[9px]">By: {p.sellerName}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            <button
                              onClick={() => handleOpenSpecs(p)}
                              className="py-1.5 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-[10px] font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-200 rounded-lg transition-all"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => {
                                const quickVar: Record<string, string> = {};
                                p.variants.forEach((v) => { if (v.options.length > 0) quickVar[v.name] = v.options[0]; });
                                onAddToCart(p, quickVar);
                                setAddedNotice(p.name);
                                setTimeout(() => setAddedNotice(null), 2500);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-wider py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all"
                            >
                              <ShoppingCart size={11} /> Add
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
        </div>
      )}

      {/* Specifications Details Modal overlay */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto" id="search-modal">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto text-left space-y-6 shadow-2xl">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-2xl overflow-hidden">
                <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex flex-col justify-between space-y-5">
                <div className="space-y-2">
                  <span className="bg-red-50 text-red-650 dark:bg-red-950/25 dark:text-red-405 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white leading-tight">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-xs text-neutral-400 font-bold">Brand: {selectedProduct.brand} | ★ {selectedProduct.rating}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed pt-1">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Variants selector inside search modal */}
                {selectedProduct.variants.map((v) => (
                  <div key={v.name} className="space-y-1">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Select {v.name}:</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {v.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleVariantChange(v.name, opt)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                            selectedVariants[v.name] === opt
                              ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-950"
                              : "border-neutral-250 text-neutral-500 dark:border-neutral-800 hover:border-neutral-400"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-neutral-900 dark:text-white">₹{selectedProduct.price.toLocaleString("en-IN")}</span>
                  {selectedProduct.originalPrice > selectedProduct.price && (
                    <span className="text-xs text-neutral-400 line-through">₹{selectedProduct.originalPrice.toLocaleString("en-IN")}</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onAddToCart(selectedProduct, selectedVariants);
                      setSelectedProduct(null);
                      setAddedNotice(selectedProduct.name);
                      setTimeout(() => setAddedNotice(null), 2500);
                    }}
                    className="flex-1 py-2.5 bg-neutral-950 hover:bg-neutral-850 dark:bg-white dark:text-neutral-950 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart size={13} /> Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      onBuyNow(selectedProduct, selectedVariants);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl"
                  >
                    🚀 Buy Now (Instant)
                  </button>
                </div>
              </div>
            </div>

            {/* Specifications Details */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Merchant Specifications</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(selectedProduct.specifications).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1">
                    <span className="text-neutral-400">{key}</span>
                    <span className="text-neutral-800 dark:text-neutral-200 font-bold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
