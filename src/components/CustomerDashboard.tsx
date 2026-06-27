import React, { useState } from "react";
import { Order, User, SupportTicket } from "../types";
import { Calendar, Package, ArrowRight, ShieldAlert, BadgeInfo, CheckCircle2, RefreshCw, Star, MessageSquare, ArrowLeft, MapPin, CreditCard, Truck, ChevronRight, Clock } from "lucide-react";
import { generatePDFInvoice } from "../utils/invoiceGenerator";

interface CustomerDashboardProps {
  orders: Order[];
  currentUser: User;
  tickets: SupportTicket[];
  onAddNewSupportTicket: (subject: string, initialMessage: string) => void;
  onSubmittingReturnRequest: (orderId: string, itemIndex: number, reason: string, details: string) => void;
  onSubmittingReview: (productId: string, rating: number, comment: string) => void;
}

export default function CustomerDashboard({
  orders,
  currentUser,
  tickets,
  onAddNewSupportTicket,
  onSubmittingReturnRequest,
  onSubmittingReview
}: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"history" | "returns" | "tickets">("history");
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);

  
  // Return request form state
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [returnItemIndex, setReturnItemIndex] = useState<number>(0);
  const [returnReason, setReturnReason] = useState<string>("Defective item received");
  const [returnDetails, setReturnDetails] = useState<string>("");

  // Review submission state
  const [selectedProductForReview, setSelectedProductForReview] = useState<{ productId: string, productName: string } | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewStatusNotice, setReviewStatusNotice] = useState<string>("");

  // Support ticket form state
  const [newTicketSubject, setNewTicketSubject] = useState<string>("");
  const [newTicketMessage, setNewTicketMessage] = useState<string>("");
  const [ticketNotice, setTicketNotice] = useState<string>("");

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) return;
    onAddNewSupportTicket(newTicketSubject, newTicketMessage);
    setNewTicketSubject("");
    setNewTicketMessage("");
    setTicketNotice("✓ Ticket opened successfully! Highly trained Copilot AI or Vendor agent has queued a custom response.");
    setTimeout(() => setTicketNotice(""), 4000);
  };

  const handleReturnActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForReturn) return;
    onSubmittingReturnRequest(selectedOrderForReturn.id, returnItemIndex, returnReason, returnDetails);
    setSelectedOrderForReturn(null);
    setReturnDetails("");
    alert("Return request created! Pending merchant approval. Check standard details under 'Returns & Refunds' tab.");
  };

  const handleReviewSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForReview) return;

    // AI moderated content filter before committing review
    setReviewStatusNotice("AI Moderator is vetting review quality...");
    try {
      const response = await fetch("/api/ai/moderate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: reviewComment, rating: reviewRating })
      });
      const data = await response.json();
      onSubmittingReview(selectedProductForReview.productId, reviewRating, data.comment);
      setReviewStatusNotice(data.approved ? "Review Approved & Published!" : "Review polished for professional compliance!");
      setTimeout(() => {
        setSelectedProductForReview(null);
        setReviewComment("");
        setReviewStatusNotice("");
      }, 2500);
    } catch {
      onSubmittingReview(selectedProductForReview.productId, reviewRating, reviewComment);
      setSelectedProductForReview(null);
      setReviewComment("");
      setReviewStatusNotice("");
    }
  };

  return (
    <div className="space-y-8 text-left pb-16" id="dashboard-root">
      
      {/* Dashboard Top Hero Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden" id="dashboard-hero">
        <div className="absolute inset-y-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-600/10 via-transparent to-transparent"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src={currentUser.avatar} alt="User Avatar" className="w-16 h-16 rounded-full border-2 border-red-500 object-cover" />
            <div className="text-left">
              <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Enterprise Buyer sandbox</span>
              <h2 className="text-xl sm:text-2xl font-black">{currentUser.name} 💎</h2>
              <p className="text-xs text-neutral-400">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto gap-2 py-1">
        <button
          onClick={() => {
            setActiveTab("history");
            setSelectedOrderDetail(null);
          }}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap rounded ${
            activeTab === "history" ? "bg-red-600 text-white" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          📦 Purchase History & Track ({orders.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("returns");
            setSelectedOrderDetail(null);
          }}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap rounded ${
            activeTab === "returns" ? "bg-red-600 text-white" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          🔄 Return / Refund Tracking
        </button>
        <button
          onClick={() => {
            setActiveTab("tickets");
            setSelectedOrderDetail(null);
          }}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap rounded ${
            activeTab === "tickets" ? "bg-red-600 text-white" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          💬 Live Support Tickets ({tickets.length})
        </button>

      </div>

      {/* Main Tabs Segment */}
      {activeTab === "history" && (
        <div className="space-y-6" id="history-panel">
          {selectedOrderDetail ? (
            /* Selected Order Detail VIEW (Simulating a separate details page) */
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-3xl bg-white dark:bg-neutral-900 shadow-lg overflow-hidden" id="order-detail-page">
              {/* Back header */}
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950">
                <button
                  onClick={() => setSelectedOrderDetail(null)}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-850 rounded-lg text-neutral-705 dark:text-neutral-300 text-xs font-black transition-all border border-neutral-300/60 dark:border-neutral-750"
                >
                  <ArrowLeft size={16} /> Back to My Orders
                </button>
                <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-emerald-500/20 tracking-wider">
                  Verified Purchase Record
                </span>
              </div>

              {/* Order Meta Header */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-neutral-100 dark:border-neutral-800 text-xs">
                <div className="space-y-1">
                  <p className="text-neutral-400 font-bold uppercase tracking-wider">Order Reference</p>
                  <p className="font-extrabold text-base text-red-500 tracking-tight">{selectedOrderDetail.id}</p>
                  <p className="text-[10px] text-neutral-400">Payment: <span className="text-emerald-500 font-bold uppercase">PAID VIA {selectedOrderDetail.paymentMethod.toUpperCase()}</span></p>
                </div>
                <div className="space-y-1">
                  <p className="text-neutral-400 font-bold uppercase tracking-wider">Placed Date</p>
                  <p className="font-semibold text-sm text-neutral-800 dark:text-white flex items-center gap-1.5 pt-0.5">
                    <Calendar size={14} className="text-neutral-400" /> {selectedOrderDetail.date}
                  </p>
                  <p className="text-[10px] text-neutral-400">Verified Secure Checkout Transaction</p>
                </div>
                <div className="space-y-1">
                  <p className="text-neutral-400 font-bold uppercase tracking-wider">Estimated Delivery</p>
                  <p className="font-semibold text-sm text-neutral-800 dark:text-white flex items-center gap-1.5 pt-0.5">
                    <Truck size={14} className="text-neutral-400" /> 3-4 Days Priority Transit
                  </p>
                  <p className="text-[10px] text-neutral-400">FedEx / India Post Premium Courier</p>
                </div>
              </div>

              {/* Delivery Stepper Tracker Progress bar */}
              <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider flex items-center gap-1.5">
                    <Truck size={14} className="text-neutral-400 animate-bounce" /> Live Shipment Transit Timeline
                  </h3>
                  <span className="bg-red-600 text-white dark:bg-red-600 font-black uppercase text-[10px] px-3 py-1 rounded-md tracking-wider">
                    {selectedOrderDetail.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center text-[10px] pt-2">
                  <div className="space-y-2">
                    <div className="h-2.5 bg-red-600 rounded-full shadow-xs"></div>
                    <div>
                      <p className="font-extrabold text-neutral-900 dark:text-white">1. Placed & Confirmed</p>
                      <p className="text-[9px] text-neutral-400">{selectedOrderDetail.date}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className={`h-2.5 rounded-full ${["processing", "shipped", "delivered"].includes(selectedOrderDetail.status) ? "bg-red-600" : "bg-neutral-200 dark:bg-neutral-800"}`}></div>
                    <div>
                      <p className={`font-extrabold ${["processing", "shipped", "delivered"].includes(selectedOrderDetail.status) ? "text-red-500" : "text-neutral-400"}`}>2. In Processing</p>
                      <p className="text-[9px] text-neutral-400">Inventory Reserved</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className={`h-2.5 rounded-full ${["shipped", "delivered"].includes(selectedOrderDetail.status) ? "bg-red-600" : "bg-neutral-200 dark:bg-neutral-800"}`}></div>
                    <div>
                      <p className={`font-extrabold ${["shipped", "delivered"].includes(selectedOrderDetail.status) ? "text-red-500" : "text-neutral-400"}`}>3. Out for Dispatch</p>
                      <p className="text-[9px] text-neutral-400">Transit Partner Hub</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className={`h-2.5 rounded-full ${selectedOrderDetail.status === "delivered" ? "bg-red-600" : "bg-neutral-200 dark:bg-neutral-800"}`}></div>
                    <div>
                      <p className={`font-extrabold ${selectedOrderDetail.status === "delivered" ? "text-red-500" : "text-neutral-400"}`}>4. Delivered</p>
                      <p className="text-[9px] text-neutral-400">Handed to Consignee</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address & Billing summary */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-neutral-100 dark:border-neutral-800">
                <div className="border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl space-y-3 bg-white dark:bg-neutral-900/60 shadow-xs">
                  <h4 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={14} className="text-red-500" /> Delivery Address Details
                  </h4>
                  <div className="text-xs space-y-1 text-neutral-600 dark:text-neutral-300">
                    <p className="font-bold text-neutral-850 dark:text-white text-sm">{selectedOrderDetail.shippingAddress.name}</p>
                    <p className="text-neutral-500 dark:text-neutral-400">{selectedOrderDetail.shippingAddress.details}</p>
                    <p>{selectedOrderDetail.shippingAddress.city}, {selectedOrderDetail.shippingAddress.state} - {selectedOrderDetail.shippingAddress.pincode}</p>
                    <div className="pt-2 border-t mt-3 border-neutral-100 dark:border-neutral-850">
                      <span className="text-neutral-400">Primary Contact Phone:</span>
                      <p className="font-bold text-neutral-800 dark:text-white mt-0.5">{selectedOrderDetail.shippingAddress.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl space-y-3 bg-white dark:bg-neutral-900/60 shadow-xs">
                  <h4 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard size={14} className="text-red-500" /> Financial Settlement Breakdown
                  </h4>
                  <div className="text-xs space-y-2 text-neutral-600 dark:text-neutral-300">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Cart Merchandises:</span>
                      <span className="font-bold text-neutral-900 dark:text-white">₹{selectedOrderDetail.subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    {selectedOrderDetail.discount > 0 && (
                      <div className="flex justify-between text-emerald-500">
                        <span>Voucher Campaign discount:</span>
                        <span>-₹{selectedOrderDetail.discount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Fixed Platform Processing:</span>
                      <span className="font-bold text-neutral-900 dark:text-white">₹21.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Cash-on-Delivery (COD) Fee:</span>
                      <span className="font-bold text-neutral-900 dark:text-white">₹25.00</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed pt-2.5 font-extrabold text-neutral-900 dark:text-white text-sm">
                      <span>Total Invoice Paid (COD):</span>
                      <span className="text-red-500 font-extrabold">₹{selectedOrderDetail.total.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ordered Products detailed segment with Review & Returns controls */}
              <div className="p-6 space-y-4">
                <h3 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">
                  Purchased Products
                </h3>

                <div className="space-y-4">
                  {selectedOrderDetail.items.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/10 dark:bg-neutral-950/20">
                      <div className="flex items-center gap-4 text-xs">
                        <img src={item.productImage} alt={item.productName} className="w-16 h-16 rounded-xl object-cover border border-neutral-200 dark:border-neutral-850 shadow-sm" />
                        <div className="text-left space-y-1">
                          <h4 className="font-extrabold text-neutral-950 dark:text-white text-sm leading-snug">{item.productName}</h4>
                          <p className="text-neutral-400 font-medium">Single Price: ₹{item.price.toLocaleString("en-IN")} | Qty: {item.quantity}</p>
                          <p className="text-red-500 font-extrabold">Item Subtotal: ₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setSelectedProductForReview({ productId: item.productId, productName: item.productName })}
                          className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-800 dark:hover:bg-neutral-700 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs"
                        >
                          ✍ Write Product Review
                        </button>
                        
                        {selectedOrderDetail.status === "delivered" && (
                          <button
                            onClick={() => {
                              setSelectedOrderForReturn(selectedOrderDetail);
                              setReturnItemIndex(index);
                            }}
                            className="text-red-500 border border-red-500/20 hover:bg-red-50/60 dark:hover:bg-red-950/20 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                          >
                            🔄 Request Item Return
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom control buttons */}
              <div className="p-6 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between gap-4">
                <button
                  onClick={() => setSelectedOrderDetail(null)}
                  className="px-5 py-2.5 border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-750 dark:hover:bg-neutral-800 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 transition-all text-center"
                >
                  ← Back to My Orders
                </button>

                <button
                  onClick={() => {
                    generatePDFInvoice(selectedOrderDetail, currentUser.name);
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  📄 Download Secure Bill Invoice (PDF)
                </button>
              </div>

            </div>
          ) : (
            /* Simple list of orders view (Only showing product names and images) */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-450">Click on any order card below to open its dedicated page with tracking details.</p>
                <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-extrabold uppercase px-2 py-0.5 text-[9px] rounded-md tracking-wider">
                  Interactive Catalogue
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrderDetail(ord)}
                    className="border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 bg-white dark:bg-neutral-900 hover:border-red-500/50 hover:shadow-md cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    id={`order-listing-card-${ord.id}`}
                  >
                    {/* Items list - Showing ONLY image and product name as requested */}
                    <div className="flex-1 space-y-4">
                      {/* Top status & date header, kept quick list format */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-extrabold text-neutral-400 dark:text-neutral-500">Order ID:</span>
                        <span className="font-black text-red-500 tracking-tight group-hover:underline">{ord.id}</span>
                        <span className="text-neutral-300 dark:text-neutral-700 font-light">|</span>
                        <span className="text-neutral-450">{ord.date}</span>
                        <span className="ml-auto bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-neutral-200/50 dark:border-neutral-700/50">
                          {ord.status}
                        </span>
                      </div>

                      {/* Display name and images only! */}
                      <div className="space-y-3 pt-1">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <img src={item.productImage} alt={item.productName} className="w-12 h-12 rounded-xl object-cover border border-neutral-150 dark:border-neutral-800 shadow-xs shrink-0" />
                            <div className="text-left">
                              <h4 className="font-bold text-xs sm:text-sm text-neutral-850 dark:text-neutral-100 leading-snug">
                                {item.productName}
                              </h4>
                              <p className="text-[10px] text-neutral-450 mt-0.5">Purchased Verified Product</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right side helper slide trigger */}
                    <div className="flex items-center gap-1 shadow-xs border border-neutral-200 dark:border-neutral-800 hover:border-red-500 dark:hover:border-red-500/70 p-2.5 rounded-xl bg-neutral-50/50 dark:bg-neutral-950/20 text-red-500 text-xs font-extrabold shrink-0 self-start md:self-auto pt-2.5 md:pt-2.5">
                      <span>View Delivery Tracking & Info</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Returns & Refund status */}
      {activeTab === "returns" && (
        <div className="border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl bg-white dark:bg-neutral-900 text-xs space-y-6" id="returns-refunds">
          <div className="flex items-center gap-2 border-b dark:border-neutral-800 pb-3">
            <span className="w-1.5 h-3 bg-neutral-900 dark:bg-white rounded-full"></span>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">Active Refund & Return Claims</h3>
          </div>
          
          {orders.some((o) => o.returnRequest) ? (
            <div className="space-y-4">
              {orders.filter((o) => o.returnRequest).map((ord) => (
                <div key={ord.id} className="bg-neutral-50/50 dark:bg-neutral-950/20 p-5 rounded-2xl border border-neutral-150 dark:border-neutral-800/80 space-y-4 transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="font-extrabold text-neutral-850 dark:text-neutral-200">
                      Order Reference: <span className="font-mono text-xs text-red-500 font-bold">#{ord.id}</span>
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full ${
                      ord.returnRequest?.status === "pending"
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse"
                        : ord.returnRequest?.status === "rejected"
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${
                        ord.returnRequest?.status === "pending"
                          ? "bg-amber-500"
                          : ord.returnRequest?.status === "rejected"
                            ? "bg-red-500"
                            : "bg-emerald-500"
                      }`} />
                      {ord.returnRequest?.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="space-y-1">
                      <p className="text-[10px] text-neutral-400 uppercase font-black tracking-wider">Reason for Claim</p>
                      <p className="font-semibold text-neutral-800 dark:text-white text-xs">{ord.returnRequest?.reason}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-neutral-400 uppercase font-black tracking-wider">Merchant Moderation Notes</p>
                      <p className="font-semibold text-neutral-700 dark:text-neutral-300 text-xs">
                        {ord.returnRequest?.details || "Assigned for physical audit pickup."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 pt-1">
                    <Clock size={12} />
                    <span>Claim registered on {ord.returnRequest?.requestedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-400 italic bg-neutral-50/30 dark:bg-neutral-950/10 rounded-2xl border border-dashed dark:border-neutral-800">
              <p className="text-sm font-medium mb-1 not-italic text-neutral-500 dark:text-neutral-400">No active claims found</p>
              <p className="text-[11px] text-neutral-400">Go to your <strong className="font-bold">Purchase History</strong> tab, expand a delivered order, and choose "Return Item".</p>
            </div>
          )}
        </div>
      )}

      {/* Support tickets filing */}
      {activeTab === "tickets" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="tickets-panel">
          
          {/* File New Ticket form */}
          <div className="lg:col-span-1 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 p-5 rounded-2xl space-y-4 h-fit">
            <h3 className="text-sm font-extrabold uppercase text-neutral-900 dark:text-white">🎟️ Open Support Ticket</h3>
            
            {ticketNotice && (
              <p className="text-[10px] font-semibold text-emerald-500 leading-tight">{ticketNotice}</p>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-neutral-400 block" htmlFor="ticket-subj">Topic / Subject</label>
                <input
                  type="text"
                  id="ticket-subj"
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  placeholder="e.g. Broken packaging / accessory claim"
                  className="w-full bg-white dark:bg-neutral-950 p-2.5 rounded-lg border focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-400 block" htmlFor="ticket-msg">Detailed Complaint Message</label>
                <textarea
                  id="ticket-msg"
                  rows={4}
                  value={newTicketMessage}
                  onChange={(e) => setNewTicketMessage(e.target.value)}
                  placeholder="Please list order number, product faults, or shipping delays."
                  className="w-full bg-white dark:bg-neutral-950 p-2.5 rounded-lg border resize-none focus:ring-1 focus:ring-red-500"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg tracking-wider"
              >
                Submit Ticket
              </button>
            </form>
          </div>

          {/* Existing tickets records */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-extrabold uppercase text-neutral-900 dark:text-white tracking-wider">Historical Tickets & Copilot AI Answers</h3>
            
            {tickets.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">No tickets filed. Use the left panel form to file complaints or feedback.</p>
            ) : (
              <div className="space-y-4">
                {tickets.map((t) => (
                  <div key={t.id} className="border rounded-2xl p-5 bg-white dark:bg-neutral-900 space-y-4 text-xs">
                    <div className="flex justify-between items-center border-b pb-3.5">
                      <div>
                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{t.id}</span>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-1">{t.subject}</h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full font-bold uppercase ${t.status === "open" ? "bg-red-600/15 text-red-500" : "bg-neutral-100 text-neutral-400"}`}>
                        {t.status}
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {t.messages.map((m, idx) => (
                        <div key={idx} className={`p-3.5 rounded-xl text-xs flex flex-col space-y-1 max-w-[85%] text-left ${
                          m.sender === "user" ? "bg-red-50 dark:bg-red-950/20 mr-auto" : "bg-neutral-50 dark:bg-neutral-800/60 ml-auto"
                        }`}>
                          <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 mb-0.5">
                            <span>{m.sender === "user" ? "You" : "NovaMart Support AI"}</span>
                            <span>{m.timestamp}</span>
                          </div>
                          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">{m.text}</p>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}



      {/* Return Request Modal Form */}
      {selectedOrderForReturn && (

        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleReturnActionSubmit} className="bg-white dark:bg-neutral-900 p-6 rounded-2xl max-w-md w-full text-xs text-left space-y-4 shadow-xl border">
            <h3 className="text-sm font-extrabold uppercase text-neutral-900 dark:text-white">🔄 Initiate Item Return Request</h3>
            
            <p className="text-neutral-400">
              Returning: <span className="font-bold text-neutral-700 dark:text-white">
                {selectedOrderForReturn.items[returnItemIndex]?.productName}
              </span>
            </p>

            <div className="space-y-1.5">
              <label className="font-bold text-neutral-400 block" htmlFor="return-reasons">Reason for Return</label>
              <select
                id="return-reasons"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-850 p-2.5 rounded border font-semibold text-neutral-800 dark:text-white focus:outline-none"
              >
                <option value="Defective item received">Defective item / structural cracks</option>
                <option value="Item did not match description">Item did not match dimensions/specs</option>
                <option value="Ordered wrong variant size">Size/variant choice did not fit</option>
                <option value="Late delivery arrived past timeline">Jet arrival delayed indefinitely</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-neutral-400 block" htmlFor="return-feedback">Details or Feedback</label>
              <textarea
                id="return-feedback"
                rows={3}
                value={returnDetails}
                onChange={(e) => setReturnDetails(e.target.value)}
                placeholder="Explain the packaging anomalies or defect specifics..."
                className="w-full bg-neutral-100 dark:bg-neutral-850 p-2.5 rounded border resize-none focus:outline-none"
                required
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrderForReturn(null)}
                className="flex-1 py-2 bg-neutral-200 text-neutral-800 rounded font-bold dark:bg-neutral-850 dark:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
              >
                Submit Return Claim
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Review Submission Modal Form */}
      {selectedProductForReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleReviewSubmission} className="bg-white dark:bg-neutral-900 p-6 rounded-2xl max-w-md w-full text-xs text-left space-y-4 shadow-xl border">
            <h3 className="text-sm font-extrabold uppercase text-neutral-900 dark:text-white">✍ Submit product review</h3>
            <p className="text-neutral-400">Write rating on: <strong>{selectedProductForReview.productName}</strong></p>

            {reviewStatusNotice && (
              <p className="text-[10px] bg-red-500/10 text-red-500 px-2 py-1 rounded font-bold tracking-wide">{reviewStatusNotice}</p>
            )}

            <div className="space-y-1">
              <label className="font-bold text-neutral-400 block" htmlFor="rating-scale">Select Star Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewRating(s)}
                    className={`flex-1 py-1 px-2 rounded-lg font-bold border ${reviewRating === s ? "bg-amber-400 text-white border-amber-400" : "border-neutral-200 text-neutral-600 dark:border-neutral-800"}`}
                  >
                    {s}★
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-neutral-400 block" htmlFor="review-desc">Product Comment (Vetted by AI Moderation System)</label>
              <textarea
                id="review-desc"
                rows={3}
                placeholder="Share your acoustics performance or fit comfort..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-850 p-2.5 rounded border resize-none focus:outline-none"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedProductForReview(null)}
                className="flex-1 py-2 bg-neutral-200 text-neutral-600 rounded font-bold dark:bg-neutral-800 dark:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
              >
                Publish Review
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
