import React, { useState, useRef } from "react";
import { User, Seller, Product, Order, Coupon, ProductVariant } from "../types";
import { 
  Users, 
  Landmark, 
  Tag, 
  Percent, 
  ShieldAlert, 
  BadgeInfo, 
  Check, 
  Sparkles, 
  TrendingUp, 
  RefreshCw, 
  Star, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  ShoppingBag, 
  X, 
  Image, 
  Layers,
  Box,
  Truck,
  MapPin
} from "lucide-react";

const GALLERY_TEMPLATES = [
  { name: "Sleek Phone", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=300" },
  { name: "Sports Shoes", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300" },
  { name: "Smart Watch", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=300" },
  { name: "Studio Headphone", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300" },
  { name: "Mechanical Keyboard", url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=300" },
  { name: "Premium Mug", url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300" },
  { name: "Casual Backpack", url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=300" },
  { name: "Summer Sunglasses", url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=300" }
];

interface LogisticsOrderRowProps {
  key?: string;
  order: Order;
  onUpdateOrder?: (updated: Order) => void;
}

function LogisticsOrderRow({ order: o, onUpdateOrder }: LogisticsOrderRowProps) {
  const [shippedFrom, setShippedFrom] = useState(o.shippedFrom || "");
  const [currentLocation, setCurrentLocation] = useState(o.currentLocation || "");
  const [checkpointLoc, setCheckpointLoc] = useState("");

  const triggerStatusUpdate = (newStatus: Order["status"]) => {
    if (onUpdateOrder) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
      const newLog = {
        status: newStatus.toUpperCase().replace(/_/g, " "),
        location: currentLocation || "Logistics Hub Gateway",
        timestamp: timeStr
      };
      
      const updated: Order = {
        ...o,
        status: newStatus,
        shippedFrom: shippedFrom || o.shippedFrom,
        currentLocation: currentLocation || o.currentLocation,
        trackingEvents: [newLog, ...(o.trackingEvents || [])]
      };

      onUpdateOrder(updated);
    }
  };

  const triggerLocationSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateOrder) {
      const updated: Order = {
        ...o,
        shippedFrom: shippedFrom.trim(),
        currentLocation: currentLocation.trim()
      };
      onUpdateOrder(updated);
    }
  };

  const addCheckpointLog = () => {
    if (!checkpointLoc.trim()) return;
    if (onUpdateOrder) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
      const newEvent = {
        status: o.status.toUpperCase().replace(/_/g, " "),
        location: checkpointLoc.trim(),
        timestamp: timeStr
      };
      const updated: Order = {
        ...o,
        shippedFrom: shippedFrom || o.shippedFrom,
        currentLocation: currentLocation || o.currentLocation,
        trackingEvents: [newEvent, ...(o.trackingEvents || [])]
      };
      onUpdateOrder(updated);
      setCheckpointLoc("");
    }
  };

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 bg-white dark:bg-neutral-900 shadow-xs space-y-5 text-left">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b dark:border-neutral-800 pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-sm text-neutral-900 dark:text-white font-mono bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg">ID: {o.id}</span>
            <span className="text-neutral-500 text-xs font-bold font-sans">Buyer: {o.buyerName}</span>
          </div>
          <p className="text-[10px] text-neutral-450 pt-1.5 font-semibold">Logged on: {o.date}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-black text-red-500">₹{o.total.toLocaleString("en-IN")}</span>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
            o.status === "delivered" 
              ? "bg-emerald-600/10 text-emerald-500 border border-emerald-500/20" 
              : o.status === "cancelled" 
                ? "bg-red-600/10 text-red-500 border border-red-500/20" 
                : "bg-red-650/10 text-red-650 border border-red-650/20"
          }`}>
            {o.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>      {/* Decision center for cancel and return requests */}
      {(o.cancelRequest?.status === "pending" || o.returnRequest?.status === "pending") && (
        <div className="p-6 bg-gradient-to-br from-amber-500/[0.06] to-orange-500/[0.06] dark:from-amber-500/[0.03] dark:to-orange-500/[0.03] border border-amber-500/30 dark:border-amber-500/20 rounded-3xl space-y-5 shadow-sm relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-700 dark:text-amber-400">
                🚨 Moderation Desk: Pending Customer Requests
              </span>
            </div>
            <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Needs Attention
            </span>
          </div>

          {o.cancelRequest?.status === "pending" && (
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 py-2 first:pt-0 last:pb-0">
              <div className="text-left space-y-1.5">
                <p className="text-xs font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  🛑 Requested Immediate Cancellation
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xl">
                  The client has requested order cancellation. Approve to automatically void this purchase and update shipment tracking.
                </p>
                {o.cancelRequest.reason && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 dark:bg-red-500/15 border border-red-500/20 rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black text-red-650 dark:text-red-400 uppercase tracking-wider">
                      Reason: "{o.cancelRequest.reason}"
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2.5 w-full lg:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateOrder) {
                      const updated: Order = {
                        ...o,
                        status: "cancelled",
                        cancelRequest: {
                          requestedAt: o.cancelRequest?.requestedAt || "",
                          status: "approved",
                          reason: o.cancelRequest?.reason
                        }
                      };
                      onUpdateOrder(updated);
                      alert("Order Cancellation approved! Status set to Cancelled.");
                    }
                  }}
                  className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-750 active:scale-[0.98] text-white rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-sm hover:shadow-emerald-500/10 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Check size={13} /> Accept Cancellation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateOrder) {
                      const updated: Order = {
                        ...o,
                        cancelRequest: {
                          requestedAt: o.cancelRequest?.requestedAt || "",
                          status: "rejected",
                          reason: o.cancelRequest?.reason
                        }
                      };
                      onUpdateOrder(updated);
                      alert("Order Cancellation request rejected!");
                    }
                  }}
                  className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-750 active:scale-[0.98] text-white rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-sm hover:shadow-rose-500/10 transition-all cursor-pointer whitespace-nowrap"
                >
                  <X size={13} /> Reject Request
                </button>
              </div>
            </div>
          )}

          {o.returnRequest?.status === "pending" && (
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 pt-3 border-t border-amber-500/10">
              <div className="text-left space-y-2.5 w-full lg:max-w-xl">
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    🔄 Requested Product Return
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span className="font-bold text-neutral-700 dark:text-neutral-300">Reason:</span> {o.returnRequest.reason}
                  </p>
                </div>
                <div className="bg-white/80 dark:bg-neutral-950/80 border border-amber-500/10 px-4 py-3 rounded-2xl">
                  <p className="text-[11px] text-neutral-650 dark:text-neutral-450 italic font-medium leading-relaxed">
                    "{o.returnRequest.details}"
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 w-full lg:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateOrder) {
                      const updated: Order = {
                        ...o,
                        status: "returned",
                        paymentStatus: "refunded",
                        returnRequest: {
                          ...o.returnRequest!,
                          status: "approved"
                        }
                      };
                      onUpdateOrder(updated);
                      alert("Product Return approved! Refund issued.");
                    }
                  }}
                  className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-750 active:scale-[0.98] text-white rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-sm hover:shadow-emerald-500/10 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Check size={13} /> Approve Return
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateOrder) {
                      const updated: Order = {
                        ...o,
                        returnRequest: {
                          ...o.returnRequest!,
                          status: "rejected",
                          details: "Rejected by Administrator following policy evaluation."
                        }
                      };
                      onUpdateOrder(updated);
                      alert("Product Return claim rejected!");
                    }
                  }}
                  className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-750 active:scale-[0.98] text-white rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-sm hover:shadow-rose-500/10 transition-all cursor-pointer whitespace-nowrap"
                >
                  <X size={13} /> Decline Return
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transit Status triggers */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block">⚡ Quick Logistics Transit Status Changers</span>
        <div className="grid grid-cols-2 xs:flex xs:flex-wrap gap-2">
          {[
            { key: "pending", label: "Placed" },
            { key: "processing", label: "Pack & Process" },
            { key: "shipped", label: "Shipped" },
            { key: "in_transit", label: "In Transit" },
            { key: "out_for_delivery", label: "Out For Delivery" },
            { key: "delivered", label: "Delivered" },
            { key: "cancelled", label: "Cancel Order" }
          ].map((btn) => {
            const isActive = o.status === btn.key;
            return (
              <button
                key={btn.key}
                type="button"
                onClick={() => triggerStatusUpdate(btn.key as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wide border ${
                  isActive 
                    ? "bg-red-650 text-white border-red-650 shadow-sm shadow-red-650/15 scale-105" 
                    : "bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location management inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-neutral-850">
        
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-450 block flex items-center gap-1.5">
            📍 Dispatch Channels ("Kidhr se shipped & abhi kidhr h")
          </span>
          <div className="space-y-3.5">
            <div className="space-y-1 text-xs">
              <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block" htmlFor={`ship-from-${o.id}`}>Shipped From Origin Location</label>
              <input
                type="text"
                id={`ship-from-${o.id}`}
                placeholder="e.g. Noida Industrial Warehouse Section-15"
                value={shippedFrom}
                onChange={(e) => setShippedFrom(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 p-2.5 rounded-xl text-neutral-900 dark:text-white"
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block" htmlFor={`curr-loc-${o.id}`}>Current Transit Location Hub</label>
              <input
                type="text"
                id={`curr-loc-${o.id}`}
                placeholder="e.g. Delhi NCR Sorted Hub Gateway"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 p-2.5 rounded-xl text-neutral-900 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={triggerLocationSave}
              className="w-full py-2.5 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-850 dark:hover:bg-neutral-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
            >
              💾 Save Active Coordinates
            </button>
          </div>
        </div>

        {/* Journey log additions */}
        <div className="space-y-3 border-t md:border-t-0 md:border-l border-neutral-200 dark:border-neutral-800 md:pl-6">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-450 block">
            📋 Append Historic Log Milestone Checkpoint
          </span>
          <div className="space-y-3.5 pt-1">
            <input
              type="text"
              placeholder="e.g. Consolidated at Delhi Air Cargo Sorting Terminal"
              value={checkpointLoc}
              onChange={(e) => setCheckpointLoc(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 p-2.5 rounded-xl text-[11px] text-neutral-900 dark:text-white"
            />
            <button
              type="button"
              onClick={addCheckpointLog}
              className="w-full py-2.5 bg-red-650 hover:bg-red-750 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
            >
              ➕ Append Log Checklist Event
            </button>

            {/* Historical view */}
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase font-black text-neutral-450 tracking-wider">Saved Milestone Checkpoint Tracking Log</span>
              <div className="max-h-[90px] overflow-y-auto space-y-1 bg-neutral-50 dark:bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                {(!o.trackingEvents || o.trackingEvents.length === 0) ? (
                  <p className="text-[10px] italic text-neutral-500 text-center py-1.5">No custom milestones logged yet.</p>
                ) : (
                  o.trackingEvents.map((evt, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] py-1 border-b dark:border-neutral-800 last:border-0 text-left">
                      <span className="font-extrabold text-neutral-800 dark:text-neutral-300 truncate max-w-[155px]">{evt.location}</span>
                      <span className="text-neutral-400 font-bold shrink-0">{evt.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

interface AdminPanelProps {
  users: User[];
  sellers: Seller[];
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  onApproveSeller: (sellerId: string) => void;
  onDeleteProduct: (productId: string) => void;
  onModifyUserBalance: (userId: string, amount: number) => void;
  onAddNewCoupon: (newCoupon: Coupon) => void;
  onLockSession?: () => void;
  onAddProduct?: (newProd: Product) => void;
  onEditProduct?: (editedProd: Product) => void;
  onUpdateOrder?: (updatedOrder: Order) => void;
}

export default function AdminPanel({
  users,
  sellers,
  products,
  orders,
  coupons,
  onApproveSeller,
  onDeleteProduct,
  onModifyUserBalance,
  onAddNewCoupon,
  onLockSession,
  onAddProduct,
  onEditProduct,
  onUpdateOrder
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "product-mgmt" | "promo-mgmt" | "customer-directory" | "logistics-hub">("overview");

  const [selectedLogisticOrderId, setSelectedLogisticOrderId] = useState<string | null>(null);

  // Coupons creation state
  const [couponCode, setCouponCode] = useState("");
  const [couponVal, setCouponVal] = useState(15);
  const [couponType, setCouponType] = useState<"percent" | "fixed">("percent");
  const [couponMin, setCouponMin] = useState(50);
  const [couponDesc, setCouponDesc] = useState("Voucher code created by system administrator");
  const [couponNotice, setCouponNotice] = useState("");

  // Product operations state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  // Create / Edit Product Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Product Form Field States
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState(0);
  const [prodOriginalPrice, setProdOriginalPrice] = useState(0);
  const [prodDescription, setProdDescription] = useState("");
  const [prodCategory, setProdCategory] = useState("Electronics");
  const [prodBrand, setProdBrand] = useState("");
  const [prodStock, setProdStock] = useState(10);
  const [prodImage, setProdImage] = useState("");
  const [productNotice, setProductNotice] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProdImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    onAddNewCoupon({
      code: couponCode.trim().toUpperCase(),
      discountValue: Number(couponVal),
      type: couponType,
      expiryDate: "2026-12-31",
      minOrderValue: Number(couponMin),
      description: couponDesc
    });
    setCouponCode("");
    setCouponNotice("✓ Coupon successfully appended to global state! Customers can use it during checkout.");
    setTimeout(() => setCouponNotice(""), 4500);
  };

  // Open Form modal to Add a brand new product
  const startAddProduct = () => {
    setEditingProductId(null);
    setProdName("");
    setProdPrice(0);
    setProdOriginalPrice(0);
    setProdDescription("");
    setProdCategory("Electronics");
    setProdBrand("");
    setProdStock(10);
    setProdImage("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600");
    setShowProductModal(true);
  };

  // Open Form modal to Edit an existing product
  const startEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdPrice(prod.price);
    setProdOriginalPrice(prod.originalPrice || prod.price);
    setProdDescription(prod.description);
    setProdCategory(prod.category);
    setProdBrand(prod.brand);
    setProdStock(prod.stock);
    setProdImage(prod.images?.[0] || "");
    setShowProductModal(true);
  };

  // Handle addition or updates
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    if (editingProductId) {
      // Find original to retain specifics
      const original = products.find(p => p.id === editingProductId);
      const updatedProduct: Product = {
        ...original,
        id: editingProductId,
        name: prodName.trim(),
        price: Number(prodPrice),
        originalPrice: Number(prodOriginalPrice),
        description: prodDescription.trim(),
        category: prodCategory,
        brand: prodBrand.trim() || "NovaMart",
        stock: Number(prodStock),
        images: [prodImage.trim() || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=85&w=600"],
        sellerId: original?.sellerId || "admin",
        sellerName: original?.sellerName || "NovaMart Enterprise",
        rating: original?.rating || 4.8,
        specifications: original?.specifications || { "Standard Warranty": "1 Year" },
        variants: original?.variants || [],
        reviews: original?.reviews || []
      };

      if (onEditProduct) {
        onEditProduct(updatedProduct);
        setProductNotice("✓ Product specifications parsed & updated successfully!");
      }
    } else {
      const newProduct: Product = {
        id: `PROD-${Date.now()}`,
        name: prodName.trim(),
        price: Number(prodPrice),
        originalPrice: Number(prodOriginalPrice) || Number(prodPrice),
        description: prodDescription.trim(),
        category: prodCategory,
        brand: prodBrand.trim() || "NovaMart",
        stock: Number(prodStock),
        images: [prodImage.trim() || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=85&w=600"],
        sellerId: "admin",
        sellerName: "NovaMart Enterprise",
        rating: 5.0,
        specifications: { "Regulatory GST": "18%", "Shipping Protection": "Fully Covered" },
        variants: [],
        reviews: []
      };

      if (onAddProduct) {
        onAddProduct(newProduct);
        setProductNotice("✓ New premium item launched successfully inside catalog matrix!");
      }
    }

    setTimeout(() => setProductNotice(""), 4500);
    setShowProductModal(false);
  };

  // Platform broad calculations
  const totalEnterpriseRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.total, 0);

  const totalGstTaxesCollected = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.gst, 0);

  // Extract unique categories for catalog query filtering
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  // Filtered Products for the table
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 text-left pb-16" id="admin-panel-root">
      
      {/* Admin Title Hero banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden" id="admin-banner">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-red-600/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] bg-red-500/20 text-red-500 rounded-full border border-red-500/30 font-black tracking-widest uppercase">
              🛡️ Superuser Admin Portal
            </span>
            <h2 className="text-xl sm:text-2xl font-black">Admin Commercial Controls</h2>
            <p className="text-xs text-neutral-400">Inventory modification, global coupons, and compliance tax reviews.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="bg-neutral-800 border border-neutral-700/80 px-4 py-2.5 rounded-2xl text-xs space-y-0.5">
              <p className="text-neutral-400">Total Revenue Settled</p>
              <p className="text-xl font-extrabold text-red-500">₹{totalEnterpriseRevenue.toLocaleString("en-IN")}</p>
            </div>

            {onLockSession && (
              <button
                onClick={onLockSession}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all self-stretch sm:self-auto flex items-center justify-center gap-1.5 text-white"
                id="btn-admin-logout"
              >
                🔒 Lock Session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto gap-2 py-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider whitespace-nowrap rounded-lg transition-all ${activeTab === "overview" ? "bg-red-600 text-white" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
        >
          📊 GST Report & Sales
        </button>
        <button
          onClick={() => setActiveTab("product-mgmt")}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider whitespace-nowrap rounded-lg transition-all ${activeTab === "product-mgmt" ? "bg-red-600 text-white" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
        >
          📦 Product Inventory Administrator ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("promo-mgmt")}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider whitespace-nowrap rounded-lg transition-all ${activeTab === "promo-mgmt" ? "bg-red-600 text-white" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
        >
          ticket🎟️ Global Coupon Manager ({coupons.length})
        </button>
        <button
          onClick={() => setActiveTab("customer-directory")}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider whitespace-nowrap rounded-lg transition-all ${activeTab === "customer-directory" ? "bg-red-600 text-white" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
        >
          👥 Customers & Logins ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("logistics-hub")}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider whitespace-nowrap rounded-lg transition-all ${activeTab === "logistics-hub" ? "bg-red-600 text-white" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
        >
          🚚 Logistics & Tracking ({orders.length})
        </button>

      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="space-y-6" id="overview-tabs-body">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="border border-neutral-200/80 dark:border-neutral-800 p-5 rounded-2xl bg-white dark:bg-neutral-900 text-left">
              <span className="text-[10px] uppercase font-black tracking-wider text-neutral-400">Catalogued Stock items</span>
              <p className="text-2xl font-black text-neutral-950 dark:text-white mt-1">{products.length} Products</p>
              <p className="text-[10px] text-neutral-400 mt-2">Active inside searchable customer catalog</p>
            </div>

            <div className="border border-neutral-200/80 dark:border-neutral-800 p-5 rounded-2xl bg-white dark:bg-neutral-900 text-left">
              <span className="text-[10px] uppercase font-black tracking-wider text-neutral-400">Total Orders Settled</span>
              <p className="text-2xl font-black text-neutral-950 dark:text-white mt-1">{orders.length} Handled</p>
              <p className="text-[10px] text-neutral-400 mt-2">Processed through standard local simulation</p>
            </div>

            <div className="border border-neutral-200/80 dark:border-neutral-800 p-5 rounded-2xl bg-white dark:bg-neutral-900 text-left">
              <span className="text-[10px] uppercase font-black tracking-wider text-neutral-400">Taxes Documented (CGST+SGST)</span>
              <p className="text-2xl font-black text-emerald-500 mt-1">₹{totalGstTaxesCollected.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-neutral-400 mt-2">Compulsory 18% tax distribution metric</p>
            </div>

          </div>

          <div className="border p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 space-y-4 text-xs">
            <h3 className="text-sm font-extrabold uppercase text-neutral-950 dark:text-white flex items-center gap-2">
              <Landmark size={15} className="text-red-500" />
              <span>📑 Dynamic GST Regulatory Tax compliance Reports</span>
            </h3>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              <div className="py-2.5 flex justify-between">
                <span>Unified CGST Standard Tax (9%)</span>
                <span className="font-bold text-neutral-900 dark:text-white">₹{(totalGstTaxesCollected / 2).toLocaleString("en-IN")}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Unified SGST Standard Tax (9%)</span>
                <span className="font-bold text-neutral-900 dark:text-white">₹{(totalGstTaxesCollected / 2).toLocaleString("en-IN")}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Total Tax liabilities documented</span>
                <span className="font-black text-emerald-500">₹{totalGstTaxesCollected.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <p className="text-neutral-400 italic">These compliance reports are compiled for administrative oversight on order clearances to enforce enterprise-grade billing guidelines.</p>
          </div>

        </div>
      )}

      {/* Product Manager tab */}
      {activeTab === "product-mgmt" && (
        <div className="space-y-6" id="product-mgmt-admin">
          
          {productNotice && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-500 font-bold">
              {productNotice}
            </div>
          )}

          {/* Filtering & Operations headers */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search catalogue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs px-4 py-2.5 pl-9 rounded-xl text-neutral-900 dark:text-white focus:outline-none w-52"
                />
                <Search className="absolute left-3 top-3 text-neutral-400" size={13} />
              </div>

              {/* Category Filter selector */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-2.5 text-xs rounded-xl text-neutral-900 dark:text-white font-sans"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={startAddProduct}
              className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/10 self-start sm:self-auto"
            >
              <Plus size={14} /> Add New Product
            </button>
          </div>

          {/* Products Catalogue Table */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-250 dark:border-neutral-800 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-4">Merchandise / Item details</th>
                    <th className="p-4">Brand</th>
                    <th className="p-4">Category</th>
                    <th className="p-4 text-right">Selling Price</th>
                    <th className="p-4 text-right">Original Price</th>
                    <th className="p-4 text-center">In-Stock Qty</th>
                    <th className="p-4 text-center">Item actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-sans">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-neutral-400 font-bold">
                        No product items matched the active administrator filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 transition-all">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={p.images?.[0] || ""} alt={p.name} className="w-11 h-11 object-cover rounded-lg border dark:border-neutral-800" />
                            <div className="max-w-xs space-y-0.5">
                              <p className="font-extrabold text-neutral-950 dark:text-white truncate" title={p.name}>{p.name}</p>
                              <p className="text-[10px] text-neutral-400 font-mono tracking-wider">{p.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-extrabold text-neutral-600 dark:text-neutral-300">{p.brand}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-full font-bold text-[10px] text-neutral-500 dark:text-neutral-300">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4 text-right font-black text-red-500">₹{p.price.toLocaleString("en-IN")}</td>
                        <td className="p-4 text-right text-neutral-400">₹{(p.originalPrice || p.price).toLocaleString("en-IN")}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded font-black font-mono text-[10px] ${p.stock > 3 ? "text-emerald-500 bg-emerald-500/10" : "text-amber-500 bg-amber-500/10"}`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                            <button
                              onClick={() => startEditProduct(p)}
                              className="p-1.5 text-neutral-600 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-all"
                              title="Edit product stats"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to permanently delete "${p.name}"?`)) {
                                  onDeleteProduct(p.id);
                                  setProductNotice("✓ Product has been decommissioned from search results.");
                                  setTimeout(() => setProductNotice(""), 4000);
                                }
                              }}
                              className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                              title="Decommission merchandise"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* coupons management and insertion */}
      {activeTab === "promo-mgmt" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="promo-mgmt-panel">
          
          {/* Create new coupon form */}
          <div className="lg:col-span-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 p-5 rounded-2xl h-fit">
            <h3 className="text-sm font-extrabold uppercase text-neutral-900 dark:text-white pb-3 border-b">Create Promo Code</h3>
            
            {couponNotice && (
              <p className="text-[10px] font-semibold text-emerald-500 my-2 leading-tight">{couponNotice}</p>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs pt-3">
              <div className="space-y-1">
                <label className="font-bold text-neutral-400 block" htmlFor="new-coupon-code">Voucher Code Key</label>
                <input
                  type="text"
                  id="new-coupon-code"
                  placeholder="e.g. SAVED50"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-950 p-2.5 rounded border uppercase font-mono text-neutral-900 dark:text-white tracking-widest focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-400 block" htmlFor="coupon-type">Discount Type</label>
                  <select
                    id="coupon-type"
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value as "percent" | "fixed")}
                    className="w-full bg-white dark:bg-neutral-950 p-2.5 border rounded text-neutral-900 dark:text-white dark:bg-neutral-900"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Cash (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-400 block" htmlFor="coupon-val">Voucher Value</label>
                  <input
                    type="number"
                    id="coupon-val"
                    value={couponVal}
                    onChange={(e) => setCouponVal(Number(e.target.value))}
                    className="w-full bg-white dark:bg-neutral-950 p-2.5 border rounded text-neutral-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-400 block" htmlFor="coupon-min">Minimum Cart Basket Size (₹)</label>
                <input
                  type="number"
                  id="coupon-min"
                  value={couponMin}
                  onChange={(e) => setCouponMin(Number(e.target.value))}
                  className="w-full bg-white dark:bg-neutral-950 p-2.5 border rounded text-neutral-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-400 block" htmlFor="coupon-desc">Voucher Label Description</label>
                <input
                  type="text"
                  id="coupon-desc"
                  value={couponDesc}
                  onChange={(e) => setCouponDesc(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-950 p-2.5 border rounded text-neutral-900 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black uppercase rounded-lg tracking-wider transition-all"
              >
                Register Code Live
              </button>
            </form>
          </div>

          {/* Active codes lists */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">Active Promo Codes Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.map((c) => (
                <div key={c.code} className="border p-4 rounded-xl bg-white dark:bg-neutral-900 space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-mono font-black text-sm text-red-500 tracking-widest">{c.code}</span>
                    <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-300 px-2 py-0.5 rounded uppercase font-bold text-[9px]">
                      {c.type === "percent" ? `${c.discountValue}% Off` : `₹${c.discountValue.toLocaleString("en-IN")} Off`}
                    </span>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 font-medium">{c.description}</p>
                  <p className="text-neutral-400 text-[10px]">Min purchase: ₹{c.minOrderValue.toLocaleString("en-IN")} | Exp: {c.expiryDate}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Customer Directory log tab */}
      {activeTab === "customer-directory" && (
        <div className="space-y-6" id="admin-customer-directory">
          <div className="border border-neutral-200/80 dark:border-neutral-800 p-6 rounded-2xl bg-white dark:bg-neutral-900 text-left">
            <h3 className="text-sm font-extrabold text-neutral-950 dark:text-white uppercase tracking-wider mb-2">
              👥 Registered Customer Directory Logins
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              View all active real-time logged-in customer profiles and their synced credentials.
            </p>

            <div className="space-y-6">
              {users.filter(u => u.role === "customer").map((cust) => {
                return (
                  <div key={cust.id} className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 bg-neutral-50/50 dark:bg-neutral-950 space-y-4 text-left">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      
                      {/* Avatar & information */}
                      <div className="flex items-center gap-3.5">
                        <img 
                          src={cust.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"} 
                          alt={cust.name} 
                          className="w-12 h-12 rounded-full border-2 border-red-500/15 object-cover shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-neutral-900 dark:text-white text-sm">{cust.name}</h4>
                            <span className="font-mono text-[9px] font-bold uppercase tracking-wider bg-red-650/10 text-red-500 px-2.5 py-0.5 rounded">
                              {cust.role}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 font-mono italic">{cust.email}</p>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* Logistics Dispatch Control hub */}
      {activeTab === "logistics-hub" && (
        <div className="space-y-6" id="admin-logistics-hub">
          <div className="border border-neutral-200/80 dark:border-neutral-800 p-6 rounded-2xl bg-white dark:bg-neutral-900 text-left animate-fade-in">
            {!selectedLogisticOrderId ? (
              <>
                <h3 className="text-sm font-extrabold text-neutral-950 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-5 bg-red-650 rounded"></span> 🚚 National Logistics Shipping Queue
                </h3>
                <p className="text-xs text-neutral-400 mb-6 font-sans">
                  Select a dispatched cargo order from the live tracking database to update checkpoints and transit steps.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {orders.length === 0 ? (
                    <div className="col-span-full p-10 text-center text-xs text-neutral-400 italic border border-dashed border-neutral-300 dark:border-neutral-800 rounded-3xl bg-neutral-50 dark:bg-neutral-900/40 font-sans">
                      No customer orders recorded in live logistics nodes.
                    </div>
                  ) : (
                    orders.map((o) => {
                      const firstProduct = o.items[0];
                      return (
                        <div
                          key={o.id}
                          onClick={() => setSelectedLogisticOrderId(o.id)}
                          className="border border-neutral-200 dark:border-neutral-800 rounded-px p-5 bg-white dark:bg-neutral-950 shadow-sm hover:shadow-lg hover:border-red-500 hover:scale-[1.01] cursor-pointer transition-all space-y-4 text-left group relative"
                        >
                          <div className="flex justify-between items-center pb-2 border-b dark:border-neutral-800">
                            <span className="font-mono text-[11px] font-black tracking-wide text-neutral-900 dark:text-white">ID: {o.id}</span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {o.cancelRequest?.status === "pending" && (
                                <span className="text-[8px] font-black bg-amber-500 text-neutral-950 px-1.5 py-0.5 rounded-full animate-pulse tracking-wide">
                                  ⚠️ CANCEL REQ
                                </span>
                              )}
                              {o.returnRequest?.status === "pending" && (
                                <span className="text-[8px] font-black bg-amber-500 text-neutral-950 px-1.5 py-0.5 rounded-full animate-pulse tracking-wide">
                                  ⚠️ RETURN REQ
                                </span>
                              )}
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                                o.status === "delivered" 
                                  ? "bg-emerald-600/10 text-emerald-500" 
                                  : o.status === "cancelled" 
                                    ? "bg-red-600/10 text-red-500" 
                                    : "bg-red-650/10 text-red-650"
                              }`}>
                                {o.status.replace(/_/g, " ")}
                              </span>
                            </div>
                          </div>

                          {/* Order simple thumbnails & display */}
                          <div className="flex items-center gap-3.5">
                            {firstProduct?.productImage ? (
                              <img
                                src={firstProduct.productImage}
                                alt={firstProduct.productName}
                                className="w-14 h-14 object-cover rounded-xl border border-neutral-200/60 dark:border-neutral-800 shrink-0 bg-neutral-50"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl border bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-[10px] text-neutral-400 font-bold shrink-0">N/A</div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-black text-neutral-900 dark:text-white text-xs truncate leading-tight group-hover:text-red-500 transition-colors">
                                {firstProduct?.productName || "E-Commerce Checkout Delivery"}
                              </p>
                              {o.items.length > 1 && (
                                <p className="text-[10px] text-neutral-400 font-bold mt-1">
                                  + {o.items.length - 1} more items in dispatch bundle
                                </p>
                              )}
                              <p className="text-[10px] text-neutral-400 font-bold mt-1">
                                Buyer: {o.buyerName}
                              </p>
                              <p className="text-[10px] text-red-500 font-black mt-2 font-mono">
                                Value: ₹{o.total.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2.5 border-t dark:border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400 font-black tracking-wider uppercase font-mono">
                            <span>Logged: {o.date}</span>
                            <span className="text-red-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              Manage Tracker 👉
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              // Sub-page
              <div className="animate-fade-in font-sans">
                <button
                  onClick={() => setSelectedLogisticOrderId(null)}
                  className="inline-flex items-center gap-1.5 text-[10px] font-black text-neutral-500 hover:text-red-500 uppercase tracking-widest mb-6 transition-all bg-neutral-100 dark:bg-neutral-800/80 px-3.5 py-2 rounded-xl border dark:border-neutral-800"
                >
                  ← Back to Shipments Queue
                </button>

                {(() => {
                  const o = orders.find((order) => order.id === selectedLogisticOrderId);
                  if (!o) {
                    return (
                      <p className="text-xs text-neutral-400 italic">This shipment record is out of bounds or deactivated.</p>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      <div className="border-b dark:border-neutral-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h4 className="text-sm font-extrabold text-neutral-950 dark:text-white uppercase flex items-center gap-2">
                            🛰️ National Tracking Command Station
                          </h4>
                          <p className="text-xs text-neutral-450 mt-1">
                            Order ID <span className="font-mono font-bold text-red-500">{o.id}</span> • Customer: <span className="font-semibold text-neutral-900 dark:text-white">{o.buyerName} ({o.buyerId})</span>
                          </p>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-xl border ${
                          o.status === "delivered" 
                            ? "bg-emerald-600/15 text-emerald-500 border-emerald-500/20" 
                            : o.status === "cancelled" 
                              ? "bg-red-600/15 text-red-500 border-red-500/20" 
                              : "bg-red-650/15 text-red-650 border-red-650/20 animate-pulse"
                        }`}>
                          Checkpoint: {o.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      <LogisticsOrderRow
                        order={o}
                        onUpdateOrder={onUpdateOrder}
                      />
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}



      {/* Brand New Product creation / editing backdrop overlay */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden text-neutral-900 dark:text-white">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider">
                  {editingProductId ? "✏️ Edit Product Specifications" : "➕ Register New Premium Product"}
                </h3>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Inventory Administrative Form</p>
              </div>
              <button 
                onClick={() => setShowProductModal(false)}
                className="p-1 px-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form content */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs text-left">
              
              {/* Product Name */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-400 uppercase tracking-widest block" htmlFor="prod-title">Product Display Name</label>
                <input
                  type="text"
                  id="prod-title"
                  placeholder="e.g. Apple iPad Pro M4 Ultra"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded border text-neutral-900 dark:text-white"
                  required
                />
              </div>

              {/* Pricing section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-400 uppercase tracking-widest block" htmlFor="prod-price">Selling Price (₹)</label>
                  <input
                    type="number"
                    id="prod-price"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded border text-neutral-900 dark:text-white font-semibold"
                    required
                    min={0}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-400 uppercase tracking-widest block" htmlFor="prod-orig-price">Original Price (₹)</label>
                  <input
                    type="number"
                    id="prod-orig-price"
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(Number(e.target.value))}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded border text-neutral-400 font-semibold"
                    required
                    min={0}
                  />
                </div>
              </div>

              {/* Brand and category info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-400 uppercase tracking-widest block" htmlFor="prod-brand">Brand Name</label>
                  <input
                    type="text"
                    id="prod-brand"
                    placeholder="e.g. Oneplus, Nike"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded border text-neutral-900 dark:text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-400 uppercase tracking-widest block" htmlFor="prod-cat">Product Category</label>
                  <select
                    id="prod-cat"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded border text-neutral-900 dark:text-white dark:bg-neutral-950"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Appliances">Appliances</option>
                    <option value="Sports">Sports</option>
                    <option value="Groceries">Groceries</option>
                  </select>
                </div>
              </div>

              {/* Stock and Image Selector */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-400 uppercase tracking-widest block" htmlFor="prod-qty">In-stock units available</label>
                  <input
                    type="number"
                    id="prod-qty"
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded border text-neutral-900 dark:text-white font-mono"
                    required
                    min={1}
                  />
                </div>

                {/* Product Image Control */}
                <div className="space-y-3.5 border-t pt-4 border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-neutral-400 uppercase tracking-widest text-[10px] block">Product Media Illustration</label>
                    <span className="text-[10px] text-red-500 font-extrabold uppercase">Device, Web URL, or Preset Gallery</span>
                  </div>

                  {/* Main Preview with File Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                    
                    {/* Preview Container */}
                    <div className="relative group aspect-square rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center">
                      {prodImage ? (
                        <>
                          <img 
                            src={prodImage} 
                            alt="Preview" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setProdImage("")}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-neutral-900 rounded-full text-white"
                            title="Remove image"
                          >
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <Image className="mx-auto text-neutral-400 mb-2" size={24} />
                          <span className="text-[10px] text-neutral-500 font-bold block text-center">No Media selected</span>
                        </div>
                      )}
                    </div>

                    {/* Actions & URL Input */}
                    <div className="sm:col-span-2 space-y-3 h-full flex flex-col justify-between">
                      <div>
                        {/* File selector input */}
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleLocalFileChange} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-3 px-4 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                        >
                          📁 Choose Local Image File
                        </button>
                        <p className="text-[9px] text-neutral-400 mt-1.5 text-center sm:text-left font-sans">
                          Select any local image. It is converted instantly.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-neutral-400 text-[10px] block" htmlFor="prod-img">Display Image URL Link</label>
                        <input
                          type="url"
                          id="prod-img"
                          placeholder="https://images.unsplash.com/..."
                          value={prodImage}
                          onChange={(e) => setProdImage(e.target.value)}
                          className="w-full bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded border text-neutral-900 dark:text-white text-xs font-mono"
                          required
                        />
                      </div>
                    </div>

                  </div>

                  {/* Pre-defined Unsplash High Quality Preset Templates Selection */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-neutral-400 uppercase font-extrabold tracking-wider block">⚡ Premium Item Gallery Templates</span>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                      {GALLERY_TEMPLATES.map((tmpl) => {
                        const isSelected = prodImage === tmpl.url;
                        return (
                          <button
                            key={tmpl.name}
                            type="button"
                            onClick={() => setProdImage(tmpl.url)}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${isSelected ? "border-red-600 scale-95 shadow-md shadow-red-500/20" : "border-neutral-200 dark:border-neutral-800"}`}
                            title={tmpl.name}
                          >
                            <img src={tmpl.url} alt={tmpl.name} className="w-full h-full object-cover" />
                            <div className={`absolute inset-0 bg-red-600/20 flex items-center justify-center transition-opacity ${isSelected ? "opacity-100" : "opacity-0"}`}>
                              <Check size={14} className="text-white drop-shadow-md font-bold" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-400 uppercase tracking-widest block" htmlFor="prod-desc">Promotional Specifications Description</label>
                <textarea
                  id="prod-desc"
                  rows={3}
                  placeholder="Include main design aspects or functional notes..."
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded border text-neutral-900 dark:text-white"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 font-extrabold text-white text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  {editingProductId ? "Save Changes" : "Create Product"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
