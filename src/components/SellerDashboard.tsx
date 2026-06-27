import React, { useState } from "react";
import { Product, Order, Seller } from "../types";
import { BarChart3, TrendingUp, Inbox, ShieldAlert, PlusCircle, Check, Trash2, ArrowUpRight, IndianRupee } from "lucide-react";

interface SellerDashboardProps {
  products: Product[];
  orders: Order[];
  sellers: Seller[];
  onAddProduct: (newProd: Product) => void;
  onEditProduct: (editProd: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order["status"]) => void;
  onApplyForVerification: (businessName: string, description: string) => void;
}

export default function SellerDashboard({
  products,
  orders,
  sellers,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onApplyForVerification
}: SellerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"sales" | "inventory" | "orders-manage" | "verify">("sales");

  // Get active seller metadata context
  const activeSeller = sellers.find((s) => s.ownerId === "user-seller-1") || sellers[0];
  const sellerProducts = products.filter((p) => p.sellerId === activeSeller.id);

  // Filter seller-specific order items
  const sellerOrders = orders.filter((ord) => 
    ord.items.some((item) => item.sellerId === activeSeller.id)
  );

  // Financial calculations
  const sellerRevenue = sellerOrders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => {
      const itemsCost = o.items
        .filter((item) => item.sellerId === activeSeller.id)
        .reduce((s, item) => s + (item.price * item.quantity), 0);
      return sum + itemsCost;
    }, 0);

  // New Product Modal details
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 99,
    originalPrice: 129,
    category: "Tech & Gadgets",
    brand: "Local Craft",
    stock: 10,
    images: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=600",
    description: "Premium handcrafted design styled for high-end workspace longevity.",
    batteryLife: "N/A",
    customSpecs: "{}"
  });

  // Seller application form state
  const [verifyName, setVerifyName] = useState("");
  const [verifyDesc, setVerifyDesc] = useState("");
  const [verifyNotice, setVerifyNotice] = useState("");

  const handleApplyVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyName.trim()) return;
    onApplyForVerification(verifyName, verifyDesc);
    setVerifyNotice("✓ Application submitted! Admin panel moderator has been pinged to perform business workflow audit.");
    setTimeout(() => setVerifyNotice(""), 4500);
  };

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name) return;

    const prodId = `prod-custom-${Date.now()}`;
    const productObj: Product = {
      id: prodId,
      name: newProduct.name,
      price: Number(newProduct.price),
      originalPrice: Number(newProduct.originalPrice),
      description: newProduct.description,
      sellerId: activeSeller.id,
      sellerName: activeSeller.businessName,
      category: newProduct.category,
      brand: newProduct.brand,
      rating: 5.0,
      stock: Number(newProduct.stock),
      images: [newProduct.images],
      specifications: {
        "Configured": "Bespoke Seller design specifications",
        "Battery specs": newProduct.batteryLife,
        "Package weight": "380g standard box"
      },
      variants: [],
      reviews: []
    };

    onAddProduct(productObj);
    setShowAddForm(false);
    setNewProduct({
      name: "", price: 99, originalPrice: 129, category: "Tech & Gadgets", brand: "Local Craft", stock: 10,
      images: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=600",
      description: "Premium handcrafted design styled for high-end workspace longevity.", batteryLife: "N/A", customSpecs: "{}"
    });
  };

  return (
    <div className="space-y-8 text-left pb-16" id="seller-dashboard-root">
      
      {/* Top statistics overview bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden" id="seller-summary">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-radial bg-red-600/3 opacity-30"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
              ● Verified active seller
            </span>
            <h2 className="text-xl sm:text-2xl font-black">{activeSeller.businessName} Dashboard 🏢</h2>
            <p className="text-xs text-neutral-400 max-w-md">{activeSeller.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-6 divide-x divide-neutral-800">
            <div className="px-4 text-left">
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Unwithdrawn Earnings</p>
              <div className="flex items-center gap-1.5 text-2xl font-extrabold text-emerald-400">
                <IndianRupee size={20} />
                <span>₹{(sellerRevenue).toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[9px] text-neutral-500">Auto Transfer Active</p>
            </div>
            <div className="pl-6 text-left">
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Seller Rating</p>
              <p className="text-2xl font-black text-amber-400">★ {activeSeller.rating || "5.0"}</p>
              <p className="text-[9px] text-neutral-500">Based on verified reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto gap-2 py-1">
        <button
          onClick={() => setActiveTab("sales")}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap rounded ${activeTab === "sales" ? "bg-red-600 text-white" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
        >
          📈 Sales, Analytics & Finance
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap rounded ${activeTab === "inventory" ? "bg-red-600 text-white" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
        >
          📦 Catalog & Live Inventory ({sellerProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("orders-manage")}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap rounded ${activeTab === "orders-manage" ? "bg-red-600 text-white" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
        >
          ⚡ Incoming Order Dispatch ({sellerOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("verify")}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap rounded ${activeTab === "verify" ? "bg-red-600 text-white" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
        >
          🛡️ Apply New Brand / Verification Setup
        </button>
      </div>

      {/* Tabs Body area */}
      {activeTab === "sales" && (
        <div className="space-y-6" id="sales-dashboard-stats">
          
          {/* Bento analytics grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-neutral-200/80 dark:border-neutral-850 p-5 rounded-2xl bg-white dark:bg-neutral-900 text-left">
              <span className="text-[10px] uppercase font-black tracking-wider text-neutral-400">Total Store Sales</span>
              <p className="text-2xl font-black text-neutral-950 dark:text-white mt-1">₹{(sellerRevenue * 1.08).toLocaleString("en-IN")}</p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-500 mt-2">
                <TrendingUp size={13} /> <span>+4.2% Month-over-Month</span>
              </div>
            </div>

            <div className="border border-neutral-200/80 dark:border-neutral-850 p-5 rounded-2xl bg-white dark:bg-neutral-900 text-left">
              <span className="text-[10px] uppercase font-black tracking-wider text-neutral-400">Incoming Orders</span>
              <p className="text-2xl font-black text-neutral-950 dark:text-white mt-1">{sellerOrders.length} Claims</p>
              <p className="text-[10px] text-neutral-400 mt-2">Checked daily via priority alerts</p>
            </div>

            <div className="border border-neutral-200/80 dark:border-neutral-850 p-5 rounded-2xl bg-white dark:bg-neutral-900 text-left">
              <span className="text-[10px] uppercase font-black tracking-wider text-neutral-400">Withdrawal limits</span>
              <p className="text-2xl font-black text-emerald-500 mt-1">₹{(sellerRevenue).toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-neutral-400 mt-2">Next automated transfer tomorrow 4 AM</p>
            </div>

            <div className="border border-neutral-200/80 dark:border-neutral-850 p-5 rounded-2xl bg-white dark:bg-neutral-900 text-left">
              <span className="text-[10px] uppercase font-black tracking-wider text-neutral-400">Dispatched Success</span>
              <p className="text-2xl font-black text-red-500 mt-1">100% On-time</p>
              <p className="text-[10px] text-neutral-400 mt-2">Average handoff loop: 1.2 Hours</p>
            </div>
          </div>

          <div className="border p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900 text-xs text-left text-neutral-500 space-y-4">
            <h3 className="text-sm font-extrabold uppercase text-neutral-900 dark:text-white">📊 Simulated Analytics Engine</h3>
            <p className="leading-relaxed">
              NovaMart integrates deep charts tracking vendor margins and brand search impressions. Since you are in simulation mode as an authenticated sandbox seller, you can increase your unwithdrawn revenue instantaneously by placing more buyer mock orders inside the cart. We configure 18% GST automatic invoices for bookkeeping compliance.
            </p>
          </div>

        </div>
      )}

      {/* Live Inventory tab */}
      {activeTab === "inventory" && (
        <div className="space-y-6" id="inventory-panel">
          <div className="flex items-center justify-between pb-3 border-b">
            <h3 className="text-sm font-extrabold uppercase text-neutral-950 dark:text-white tracking-wider">Configure Verified Stock Items</h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2 px-3 rounded-lg flex items-center gap-1 transition-all"
            >
              <PlusCircle size={14} /> Add Luxury Product
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sellerProducts.map((p) => (
              <div key={p.id} className="border border-neutral-200 dark:border-neutral-850 rounded-2xl p-4 bg-white dark:bg-neutral-900 flex gap-4 text-xs select-none">
                <img src={p.images[0]} alt={p.name} className="w-20 h-20 rounded object-cover flex-shrink-0 bg-neutral-100" />
                <div className="flex-1 flex flex-col justify-between text-left min-w-0">
                  <div>
                    <h4 className="font-bold text-neutral-950 dark:text-white truncate">{p.name}</h4>
                    <p className="text-neutral-400">Min Rate Category: {p.category}</p>
                    <p className="font-extrabold text-red-500 mt-1.5">₹{p.price.toLocaleString("en-IN")} <span className="text-neutral-400 text-[10px] line-through font-normal">₹{p.originalPrice.toLocaleString("en-IN")}</span></p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-1 border-t mt-1 border-neutral-100 dark:border-neutral-800">
                    <span className={`font-semibold ${p.stock < 10 ? "text-amber-500" : "text-emerald-500"}`}>
                      Stock: {p.stock} units
                    </span>
                    <button
                      onClick={() => onDeleteProduct(p.id)}
                      className="p-1 px-1.5 bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/20 rounded font-bold"
                      title="Delete product"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incoming Order dispatch tracking */}
      {activeTab === "orders-manage" && (
        <div className="space-y-6" id="order-dispatch-panel">
          <div className="pb-3 border-b">
            <h3 className="text-sm font-extrabold uppercase text-neutral-950 dark:text-white tracking-wider">Handoff Order Dispatches</h3>
          </div>

          {sellerOrders.length === 0 ? (
            <p className="text-xs text-neutral-400 italic">No incoming orders require transit setup. Complete a shopping cycle to generate simulator logs.</p>
          ) : (
            <div className="space-y-4">
              {sellerOrders.map((ord) => (
                <div key={ord.id} className="border border-neutral-200 dark:border-neutral-850 rounded-2xl p-5 bg-white dark:bg-neutral-900 text-xs text-left space-y-4">
                  <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-950 p-3.5 rounded-lg">
                    <div>
                      <p className="text-neutral-400">Order ID Record</p>
                      <span className="font-bold text-red-500">{ord.id}</span>
                    </div>
                    <div>
                      <p className="text-neutral-400">Buyer</p>
                      <span className="font-semibold text-neutral-900 dark:text-white">{ord.buyerName}</span>
                    </div>
                    <div>
                      <p className="text-neutral-400">Shipment State</p>
                      <span className="bg-red-500/10 text-red-500 font-extrabold px-2 py-0.5 rounded uppercase">{ord.status}</span>
                    </div>
                  </div>

                  {/* Specific items dispatch */}
                  <div className="space-y-3">
                    {ord.items.filter((i) => i.sellerId === activeSeller.id).map((i, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-neutral-700 dark:text-neutral-300 font-bold">{i.productName} (Qty: {i.quantity})</span>
                        <span className="text-neutral-400 font-semibold">₹{(i.price * i.quantity).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>

                  {/* Dispatch workflow modifiers */}
                  <div className="flex flex-wrap gap-2.5 pt-2 border-t border-dashed">
                    <p className="font-bold text-neutral-400 self-center uppercase tracking-wider mr-2">Dispatches action route:</p>
                    <button
                      onClick={() => onUpdateOrderStatus(ord.id, "processing")}
                      disabled={ord.status === "processing"}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 rounded font-bold text-neutral-600 dark:text-neutral-300 disabled:opacity-40"
                    >
                      Set 'Processing'
                    </button>
                    <button
                      onClick={() => onUpdateOrderStatus(ord.id, "shipped")}
                      disabled={ord.status === "shipped"}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold disabled:opacity-40"
                    >
                      Set 'Shipped' (Mark Transit Air)
                    </button>
                    <button
                      onClick={() => onUpdateOrderStatus(ord.id, "delivered")}
                      disabled={ord.status === "delivered"}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold disabled:opacity-40"
                    >
                      Set 'Delivered' (Close order)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verify store / Apply brand setups */}
      {activeTab === "verify" && (
        <div className="border p-6 rounded-2xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-850 space-y-4 max-w-lg" id="verification-request">
          <h3 className="text-sm font-extrabold uppercase text-neutral-900 dark:text-white">🛡️ Apply Brand / Verification</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Register your active physical warehouse address and corporate business license details to bypass default review holds automatically. NovaMart system administrators verify applications within 24 hours.
          </p>

          {verifyNotice && (
            <p className="text-[10px] text-emerald-500 font-semibold leading-tight">{verifyNotice}</p>
          )}

          <form onSubmit={handleApplyVerification} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-neutral-400 block" htmlFor="verify-comp">Registered Corporate Name</label>
              <input
                type="text"
                id="verify-comp"
                value={verifyName}
                onChange={(e) => setVerifyName(e.target.value)}
                placeholder="e.g. AeroTech Audio Ltd"
                className="w-full bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded border focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-neutral-400 block" htmlFor="verify-desc">Business Description (include tax residency / corporate IDs)</label>
              <textarea
                id="verify-desc"
                rows={3}
                value={verifyDesc}
                onChange={(e) => setVerifyDesc(e.target.value)}
                placeholder="Sourcing premium beryllium headphones, customized switches config..."
                className="w-full bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded border resize-none focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg uppercase tracking-wider"
            >
              Submit Application
            </button>
          </form>
        </div>
      )}

      {/* Add luxury product Modal Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateProductSubmit} className="bg-white dark:bg-neutral-900 p-6 rounded-2xl max-w-lg w-full text-xs text-left space-y-4 border shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-extrabold uppercase text-neutral-900 dark:text-white">📦 Add Luxury Product to Catalog</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold block" htmlFor="prod-name">Name</label>
                <input
                  type="text"
                  id="prod-name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. AeroPro v2"
                  className="w-full p-2.5 border rounded"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold block" htmlFor="prod-cat">Category</label>
                <select
                  id="prod-cat"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full p-2.5 border rounded bg-white dark:bg-neutral-900"
                >
                  <option value="Tech & Gadgets">Tech & Gadgets</option>
                  <option value="Apparel & Fashion">Apparel & Fashion</option>
                  <option value="Home & Smart Living">Home & Smart Living</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold block" htmlFor="prod-price">Sale Price (₹)</label>
                <input
                  type="number"
                  id="prod-price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  className="w-full p-2.5 border rounded"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold block" htmlFor="prod-orig">Original Price (₹)</label>
                <input
                  type="number"
                  id="prod-orig"
                  value={newProduct.originalPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, originalPrice: Number(e.target.value) })}
                  className="w-full p-2.5 border rounded"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold block" htmlFor="prod-brand">Brand</label>
                <input
                  type="text"
                  id="prod-brand"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  className="w-full p-2.5 border rounded"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold block" htmlFor="prod-stock">Units in Stock</label>
                <input
                  type="number"
                  id="prod-stock"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                  className="w-full p-2.5 border rounded"
                  required
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="font-bold block" htmlFor="prod-img">Image URL</label>
                <input
                  type="text"
                  id="prod-img"
                  value={newProduct.images}
                  onChange={(e) => setNewProduct({ ...newProduct, images: e.target.value })}
                  className="w-full p-2.5 border rounded"
                  required
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="font-bold block" htmlFor="prod-desc">Description</label>
                <textarea
                  id="prod-desc"
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full p-2.5 border rounded resize-none"
                  required
                ></textarea>
              </div>
            </div>

            <div className="flex gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 bg-neutral-200 text-neutral-800 rounded font-bold dark:bg-neutral-850 dark:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
              >
                Publish Live Product
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
