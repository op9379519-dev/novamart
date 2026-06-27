import React from "react";
import { X, Trash2, ShoppingCart, Sparkles, Heart } from "lucide-react";
import { Product } from "../types";

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: string[];
  products: Product[];
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, selectedVariants: Record<string, string>) => void;
}

export default function WishlistModal({
  isOpen,
  onClose,
  wishlist,
  products,
  onToggleWishlist,
  onAddToCart,
}: WishlistModalProps) {
  if (!isOpen) return null;

  // Filter products that are in the wishlist
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleAddToCartWithDefaults = (product: Product) => {
    // Collect first option of each variant as default
    const defaultVariants: Record<string, string> = {};
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v) => {
        if (v.options && v.options.length > 0) {
          defaultVariants[v.name] = v.options[0];
        }
      });
    }
    onAddToCart(product, defaultVariants);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn" id="wishlist-modal-container">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-neutral-800 dark:text-neutral-100 text-left relative overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl"></div>

        {/* Top Header */}
        <div className="flex items-center justify-between border-b pb-4 border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
              <Heart size={20} className="fill-red-500 text-red-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight">Your Starred Wishlist</h3>
              <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                {wishlistedProducts.length} {wishlistedProducts.length === 1 ? "item" : "items"} saved for later
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-xs font-bold p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
            id="wishlist-modal-close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 flex-1 space-y-4 pr-1 scrollbar-thin">
          {wishlistedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800/50 flex items-center justify-center text-neutral-400 dark:text-neutral-600">
                <Heart size={28} className="stroke-[1.5]" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white">Your wishlist is empty</h4>
                <p className="text-xs text-neutral-400 leading-relaxed font-semibold">
                  Save items you love to your wishlist and they will show up here so you can add them to your cart later!
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 bg-red-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-red-600 active:scale-95 transition-all shadow-md shadow-red-500/10"
              >
                Start Browsing
              </button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {wishlistedProducts.map((p) => (
                <div key={p.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Product Details info block */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 overflow-hidden shrink-0 relative">
                      <img
                        src={p.images && p.images[0] ? p.images[0] : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200"}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {p.flashSale && (
                        <div className="absolute top-1 left-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                          Sale
                        </div>
                      )}
                    </div>
                    <div className="text-left space-y-1">
                      <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">
                        {p.brand} • {p.category}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white line-clamp-1 leading-snug">
                        {p.name}
                      </h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-red-500 dark:text-red-400 font-extrabold text-xs sm:text-sm">
                          ₹{p.price.toLocaleString("en-IN")}
                        </span>
                        {p.originalPrice > p.price && (
                          <span className="text-[10px] text-neutral-400 line-through font-semibold">
                            ₹{p.originalPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500 text-xs">★</span>
                        <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">{p.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this item */}
                  <div className="flex items-center gap-2 shrink-0 justify-end">
                    <button
                      onClick={() => onToggleWishlist(p)}
                      className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-red-500 hover:bg-red-500/5 dark:hover:bg-red-500/10 transition-all"
                      title="Remove from Wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => handleAddToCartWithDefaults(p)}
                      className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl active:scale-95 transition-all shadow-md shadow-red-500/10"
                    >
                      <ShoppingCart size={14} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Footer Details */}
        {wishlistedProducts.length > 0 && (
          <div className="border-t pt-4 border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" /> Save items to review later
            </span>
            <button
              onClick={onClose}
              className="text-xs font-bold hover:underline text-red-500"
            >
              Close Wishlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
