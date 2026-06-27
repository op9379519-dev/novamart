import React, { useState, useEffect } from "react";
import { Order } from "../types";
import { ShoppingBag, FileText, Truck, CheckCircle2, Clock, MapPin, AlertCircle, ArrowLeft, ChevronRight, CreditCard, XCircle, RotateCcw, Undo2, Sparkles, ShieldAlert } from "lucide-react";
import { generatePDFInvoice } from "../utils/invoiceGenerator";

export const CANCELLATION_REASONS = {
  en: [
    "Wrong item ordered",
    "Found better price",
    "Ordered by mistake",
    "Delivery time is too long",
    "Other / Changed mind"
  ],
  hi: [
    "गलत आइटम ऑर्डर हो गया",
    "बेहतर कीमत मिल गई",
    "गलती से ऑर्डर हो गया",
    "डिलीवरी का समय बहुत लंबा है",
    "अन्य / मन बदल गया"
  ],
  es: [
    "Se ordenó el artículo incorrecto",
    "Encontré un mejor precio",
    "Ordenado por error",
    "El tiempo de entrega es demasiado largo",
    "Otro / Cambié de opinión"
  ]
};

interface UserOrdersPageProps {
  orders: Order[];
  currentUser: { id: string; name: string } | null;
  lang: "en" | "hi" | "es";
  onRequestCancel?: (orderId: string, reason: string) => void;
  onRequestReturn?: (orderId: string, reason: string, details: string) => void;
}

const translations = {
  en: {
    title: "🛍️ My Purchased Orders",
    sub: "Manage your registered purchases, track dispatch status, and download statements.",
    empty: "No transactions documented. Visit the marketplace catalog to place your first order!",
    orderId: "Order ID",
    date: "Transaction Date",
    status: "Shipping Status",
    paymentMethod: "Payment Mode",
    invoice: "Download Invoice",
    details: "Order Details",
    deliveryInfo: "Priority Courier Delivery Service Included",
    total: "Gross Balance Paid",
    items: "Purchased Merchandise Items",
    tracker: "Order Status Tracker",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
    stageInfo: "Your order is presently under live evaluation.",
    estDelivery: "Delivery Scheduled",
    backBtn: "← Back to My Orders"
  },
  hi: {
    title: "🛍️ मेरे द्वारा खरीदे गए ऑर्डर्स",
    sub: "अपनी खरीद रसीदें प्रबंधित करें, शिपमेंट ट्रैक करें और विवरण देखें।",
    empty: "कोई लेन-देन दर्ज नहीं मिला। अपना पहला ऑर्डर देने के लिए लाइव कैटलॉग पर जाएं!",
    orderId: "ऑर्डर आईडी",
    date: "लेन-देन की तारीख",
    status: "शिपमेंट की स्थिति",
    paymentMethod: "भुगतान का प्रकार",
    invoice: "रसीद डाउनलोड करें",
    details: "ऑर्डर विवरण",
    deliveryInfo: "प्राथमिकता कूरियर वितरण सेवा शामिल",
    total: "कुल भुगतान की गई राशि",
    items: "खरीदी गई सामग्री",
    tracker: "ऑर्डर ट्रैकिंग सेवा",
    processing: "प्रसंस्करण",
    shipped: "भेज दिया गया",
    delivered: "डिलिवर हुआ",
    cancelled: "रद्द किया गया",
    returned: "वापस किया गया",
    stageInfo: "आपका ऑर्डर वर्तमान में लाइव मूल्यांकन में है।",
    estDelivery: "अनुमानित वितरण तिथि",
    backBtn: "← वापस ऑर्डर्स पर जाएं"
  },
  es: {
    title: "🛍️ Mis Pedidos Comprados",
    sub: "Administre sus compras certificadas, rastree despachos y descargue facturas.",
    empty: "No se encontraron transacciones. ¡Explora el catálogo para realizar compras en vivo!",
    orderId: "ID del Pedido",
    date: "Fecha de Compra",
    status: "Estado de Envío",
    paymentMethod: "Método de Pago",
    invoice: "Descargar Factura",
    details: "Detalles del Pedido",
    deliveryInfo: "Servicio de Entrega de Mensajería Prioritaria Incluido",
    total: "Monto Neto Pagado",
    items: "Artículos Comprados",
    tracker: "Rastreo de Estado del Pedido",
    processing: "Procesando",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
    returned: "Devuelto",
    stageInfo: "Su pedido se encuentra bajo evaluación continua.",
    estDelivery: "Entrega Planificada",
    backBtn: "← Volver a Mis Pedidos"
  }
};

export default function UserOrdersPage({
  orders,
  currentUser,
  lang,
  onRequestCancel,
  onRequestReturn
}: UserOrdersPageProps) {
  const t = translations[lang] || translations.en;
  const [selectedUserOrderDetailState, setSelectedUserOrderDetail] = useState<Order | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>("Wrong item ordered");

  useEffect(() => {
    setShowCancelConfirm(false);
    setCancelReason(CANCELLATION_REASONS[lang]?.[0] || CANCELLATION_REASONS.en[0]);
  }, [selectedUserOrderDetailState, lang]);
  
  if (!currentUser) return null;

  // Filter orders related strictly to active logged-in user
  const userOrders = orders.filter(o => o.buyerId === currentUser.id);

  // Helper inside tracking component to determine 7 day policy
  const isWithin7Days = (dateStr: string) => {
    try {
      const orderDate = new Date(dateStr);
      if (isNaN(orderDate.getTime())) return true;
      const now = new Date();
      const diffTime = now.getTime() - orderDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    } catch (e) {
      return true;
    }
  };

  // Sync selectedOrderDetail if order changed (e.g. updated cancellation/return state)
  const selectedUserOrderDetail = selectedUserOrderDetailState
    ? orders.find((o) => o.id === selectedUserOrderDetailState.id) || null
    : null;

  // Helper inside tracking component to determine current stepper position
  const getStepProgress = (status: string) => {
    const s = status.toLowerCase().replace(/_/g, " ");
    if (s === "cancelled" || s === "returned") return -1;
    if (s === "delivered") return 4;
    if (s === "shipped" || s === "in transit" || s === "out for delivery") return 3;
    if (s === "processing" || s === "pending") return 2;
    return 1; // Registered / Placed
  };

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto py-4 select-none min-h-[60vh]" id="user-orders-view-page">
      
      {/* Title Header Branding */}
      <div className="space-y-2 border-b pb-4 border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div className="text-left space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            {t.title}
          </h2>
          <p className="text-xs text-neutral-400 font-medium leading-relaxed">
            {t.sub}
          </p>
        </div>
        {selectedUserOrderDetail && (
          <button
            onClick={() => setSelectedUserOrderDetail(null)}
            className="text-xs px-3 py-1.5 border hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-600 dark:text-neutral-300 font-bold"
          >
            {t.backBtn}
          </button>
        )}
      </div>

      {userOrders.length === 0 ? (
        <div className="p-16 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl text-center space-y-4">
          <div className="inline-flex p-4 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-400">
            <ShoppingBag size={32} />
          </div>
          <p className="text-xs text-neutral-400 font-semibold">{t.empty}</p>
        </div>
      ) : selectedUserOrderDetail ? (
        /* Detailed Order Page Layout */
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-3xl bg-white dark:bg-neutral-900 shadow-lg overflow-hidden animate-fade-in" id="user-order-detail-view">
          
          {/* Back header button */}
          <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950">
            <button
              onClick={() => setSelectedUserOrderDetail(null)}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-bold rounded-lg border text-neutral-700 dark:text-neutral-300 transition-all"
            >
              <ArrowLeft size={14} /> {t.backBtn}
            </button>
            <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded font-black text-white uppercase tracking-wider">
              {selectedUserOrderDetail.status.toUpperCase()}
            </span>
          </div>

          {/* Details header */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-neutral-100 dark:border-neutral-800 text-xs text-left">
            <div>
              <span className="text-neutral-400 font-bold block">{t.orderId}</span>
              <span className="font-extrabold text-red-500 tracking-tight text-sm">{selectedUserOrderDetail.id}</span>
            </div>
            <div>
              <span className="text-neutral-400 font-bold block">{t.date}</span>
              <span className="font-semibold text-neutral-800 dark:text-white text-sm">{selectedUserOrderDetail.date}</span>
            </div>
            <div>
              <span className="text-neutral-400 font-bold block">{t.paymentMethod}</span>
              <span className="font-semibold text-neutral-800 dark:text-white text-sm uppercase">PAID VIA {selectedUserOrderDetail.paymentMethod}</span>
            </div>
          </div>

          {/* Progress Tracker display row */}
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 text-xs space-y-4">
            <div className="flex justify-between items-center">
              <span className="uppercase font-black text-neutral-455 text-[10px] tracking-widest block font-sans">
                📌 {t.tracker}
              </span>
              <span className="text-[10px] text-neutral-400">
                {t.estDelivery}: <span className="font-extrabold text-neutral-850 dark:text-white">With Priority Courier Services</span>
              </span>
            </div>

            {(() => {
              const currentStepProgress = getStepProgress(selectedUserOrderDetail.status);
              
              if (currentStepProgress === -1) {
                return (
                  <div className="flex items-center gap-3 p-3 bg-red-500/5 rounded-xl text-red-500 font-bold border border-red-500/10 animate-pulse">
                    <AlertCircle size={16} />
                    <span>This purchase has been marked as {selectedUserOrderDetail.status}. Dispute processes apply automatically.</span>
                  </div>
                );
              }

              const getThirdStepDetails = () => {
                const s = selectedUserOrderDetail.status.toLowerCase().replace(/_/g, " ");
                if (s === "in transit") {
                  return {
                    title: lang === "hi" ? "रास्ते में है" : lang === "es" ? "En Tránsito" : "In Transit",
                    sub: lang === "hi" ? "कोरियर हब के रास्ते में" : lang === "es" ? "En camino" : "En route to delivery hub"
                  };
                }
                if (s === "out for delivery") {
                  return {
                    title: lang === "hi" ? "वितरण के लिए बाहर" : lang === "es" ? "En Reparto" : "Out for Delivery",
                    sub: lang === "hi" ? "आपके दरवाजे पर आ रहा है" : lang === "es" ? "Llegando hoy" : "Out for delivery with courier"
                  };
                }
                return {
                  title: t.shipped,
                  sub: lang === "hi" ? "कूरियर द्वारा रवाना हुआ" : lang === "es" ? "Despachado" : "In transit with logistics"
                };
              };

              const thirdStepInfo = getThirdStepDetails();

              const steps = [
                {
                  key: 1,
                  title: lang === "hi" ? "ऑर्डर बुक हुआ" : lang === "es" ? "Pedido Realizado" : "Placed",
                  sub: lang === "hi" ? "ऑर्डर सफलतापूर्वक दर्ज हो गया" : lang === "es" ? "Confirmado" : "Order logged & confirmed",
                  icon: ShoppingBag,
                },
                {
                  key: 2,
                  title: t.processing,
                  sub: lang === "hi" ? "पैकेजिंग और जांच जारी" : lang === "es" ? "En preparación" : "Quality check & packed",
                  icon: Clock,
                },
                {
                  key: 3,
                  title: thirdStepInfo.title,
                  sub: thirdStepInfo.sub,
                  icon: Truck,
                },
                {
                  key: 4,
                  title: t.delivered,
                  sub: lang === "hi" ? "वितरित हुआ" : lang === "es" ? "Entregado" : "Package received safely",
                  icon: MapPin,
                },
              ];

              return (
                <>
                  {/* Desktop Layout Stepper */}
                  <div className="relative py-6 px-4 hidden sm:block">
                    {/* Desktop connection lines */}
                    <div className="absolute top-[34px] left-[12%] right-[12%] h-1 bg-neutral-200 dark:bg-neutral-800 -translate-y-1/2 rounded-full z-0">
                      <div 
                        className="h-full bg-red-600 dark:bg-red-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(0, ((currentStepProgress - 1) / 3) * 100)}%` }}
                      ></div>
                    </div>

                    <div className="relative z-10 flex justify-between items-start">
                      {steps.map((step) => {
                        const isCompleted = step.key < currentStepProgress;
                        const isActive = step.key === currentStepProgress;
                        const isPending = step.key > currentStepProgress;
                        const StepIcon = step.icon;

                        return (
                          <div key={step.key} className="flex flex-col items-center flex-1">
                            {/* Circle Element */}
                            <div 
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 border ${
                                isCompleted 
                                  ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-650/15" 
                                  : isActive 
                                    ? "bg-red-600 border-red-600 text-white shadow-lg ring-4 ring-red-500/10 scale-105" 
                                    : "bg-white dark:bg-neutral-905 border-neutral-300 dark:border-neutral-700 text-neutral-400"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 size={16} />
                              ) : (
                                <StepIcon size={15} className={isActive ? "animate-pulse" : ""} />
                              )}
                            </div>

                            {/* Title and descriptions */}
                            <div className="text-center mt-3 max-w-[170px] space-y-1">
                              <p className={`font-extrabold text-xs tracking-tight ${
                                isActive 
                                  ? "text-red-500" 
                                  : isCompleted 
                                    ? "text-neutral-800 dark:text-neutral-200" 
                                    : "text-neutral-400 dark:text-neutral-500"
                              }`}>
                                {step.title}
                              </p>
                              <p className={`text-[10px] leading-tight font-medium ${
                                isActive 
                                  ? "text-neutral-600 dark:text-neutral-300" 
                                  : "text-neutral-450 dark:text-neutral-500"
                              }`}>
                                {step.sub}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Layout Stepper */}
                  <div className="relative py-4 px-2 sm:hidden flex flex-col gap-8">
                    {/* Vertical Line behind steps */}
                    <div className="absolute top-6 bottom-6 left-[20px] w-1 bg-neutral-200 dark:bg-neutral-800 rounded-full z-0">
                      <div 
                        className="w-full bg-red-600 dark:bg-red-500 rounded-full transition-all duration-700"
                        style={{ height: `${Math.max(0, ((currentStepProgress - 1) / 3) * 100)}%` }}
                      ></div>
                    </div>

                    {steps.map((step) => {
                      const isCompleted = step.key < currentStepProgress;
                      const isActive = step.key === currentStepProgress;
                      const isPending = step.key > currentStepProgress;
                      const StepIcon = step.icon;

                      return (
                        <div key={step.key} className="flex gap-4 items-start relative z-10 text-left">
                          {/* Circle indicator */}
                          <div 
                            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                              isCompleted 
                                ? "bg-green-600 border-green-600 text-white shadow-md shadow-green-650/10" 
                                : isActive 
                                  ? "bg-red-600 border-red-600 text-white shadow-lg ring-4 ring-red-500/15" 
                                  : "bg-white dark:bg-neutral-905 border-neutral-300 dark:border-neutral-700 text-neutral-400"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <StepIcon size={15} className={isActive ? "animate-pulse" : ""} />
                            )}
                          </div>

                          {/* Info label */}
                          <div className="space-y-0.5 pt-1 text-xs text-left">
                            <p className={`font-black text-xs ${
                              isActive 
                                ? "text-red-500" 
                                : isCompleted 
                                  ? "text-neutral-800 dark:text-neutral-200" 
                                  : "text-neutral-400 dark:text-neutral-500"
                            }`}>
                              {step.title}
                            </p>
                            <p className={`text-[10px] font-semibold leading-relaxed ${
                              isActive 
                                ? "text-neutral-600 dark:text-neutral-300" 
                                : "text-neutral-400 dark:text-neutral-500"
                            }`}>
                              {step.sub}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            {/* Real-time Live Logistics Checkpoints */}
            {(selectedUserOrderDetail.shippedFrom || selectedUserOrderDetail.currentLocation || (selectedUserOrderDetail.trackingEvents && selectedUserOrderDetail.trackingEvents.length > 0)) && (
              <div className="mt-6 mx-6 p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-650 dark:bg-red-500 animate-ping"></span>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-neutral-800 dark:text-neutral-200">
                      {lang === "hi" ? "लाइव ऑर्डर ट्रैकिंग" : lang === "es" ? "Seguimiento en Vivo" : "Live Shipment Tracking Status"}
                    </h4>
                  </div>
                  <span className="text-[9px] text-neutral-400 bg-neutral-200/50 dark:bg-neutral-800 px-2 py-0.5 rounded font-black uppercase">
                    {lang === "hi" ? "अपडेटेड" : lang === "es" ? "Actualizado" : "Updated Real-time"}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans text-neutral-600 dark:text-neutral-350">
                  {selectedUserOrderDetail.shippedFrom && (
                    <div className="bg-white dark:bg-neutral-950 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                      <p className="text-[9px] text-neutral-400 uppercase font-black tracking-widest mb-1.5 flex items-center gap-1">
                        📦 {lang === "hi" ? "कहाँ से शिप हुआ" : "Shipped From Location"}
                      </p>
                      <p className="text-sm font-extrabold text-neutral-900 dark:text-white">{selectedUserOrderDetail.shippedFrom}</p>
                    </div>
                  )}

                  {selectedUserOrderDetail.currentLocation && (
                    <div className="bg-red-500/5 dark:bg-red-500/10 p-3.5 rounded-xl border border-red-500/10 dark:border-red-500/20 shadow-sm">
                      <p className="text-[9px] text-red-500 uppercase font-black tracking-widest mb-1.5 flex items-center gap-1">
                        📍 {lang === "hi" ? "अभी कहाँ है" : "Current Hub Location"}
                      </p>
                      <p className="text-sm font-black text-red-600 dark:text-red-400">{selectedUserOrderDetail.currentLocation}</p>
                    </div>
                  )}
                </div>

                {selectedUserOrderDetail.trackingEvents && selectedUserOrderDetail.trackingEvents.length > 0 && (
                  <div className="space-y-2 pt-3.5 border-t border-neutral-200 dark:border-neutral-800">
                    <p className="text-[10px] text-neutral-400 uppercase font-black tracking-wider text-left">
                      📋 {lang === "hi" ? "यात्रा इतिहास लॉग" : "Transit Milestones Log"}
                    </p>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {selectedUserOrderDetail.trackingEvents.map((evt, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-2 px-3 bg-neutral-100/50 dark:bg-neutral-950/40 rounded-lg border border-neutral-150 dark:border-neutral-900">
                          <div className="flex items-center gap-2.5">
                            <span className="font-extrabold text-[9px] text-white bg-red-650 px-2 py-0.5 rounded uppercase tracking-wide">
                              {evt.status}
                            </span>
                            <span className="font-extrabold text-neutral-850 dark:text-neutral-200">{evt.location}</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono font-bold">{evt.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Action Panel (Cancel & Return) */}
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/20 dark:bg-neutral-950/10 text-xs space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-4 bg-gradient-to-b from-red-500 to-rose-600 rounded-full"></span>
              <h4 className="text-[11px] uppercase font-black text-neutral-600 dark:text-neutral-300 tracking-wider">
                ⚡ Support & Fulfillment Console
              </h4>
            </div>
            
            {/* Cancellation section */}
            {selectedUserOrderDetail.status === "pending" || selectedUserOrderDetail.status === "processing" ? (
              <div className="relative overflow-hidden p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl shadow-sm transition-all hover:shadow-md">
                {/* Decorative background accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                  <div className="space-y-1.5 text-left max-w-xl">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-1">
                      <Clock size={11} className="animate-spin-slow" /> Active cancellation window
                    </span>
                    <h5 className="font-black text-neutral-900 dark:text-white text-sm tracking-tight flex items-center gap-1.5">
                      Cancel Your Purchase
                    </h5>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      If you made a mistake or changed your mind, you can stop this order before it is dispatched by our logistics agents.
                    </p>
                  </div>
                  
                  <div className="shrink-0 w-full md:w-auto">
                    {selectedUserOrderDetail.cancelRequest ? (
                      <div className="flex flex-col items-end gap-1 bg-neutral-50 dark:bg-neutral-950 p-3 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/80">
                        <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg ${
                          selectedUserOrderDetail.cancelRequest.status === "pending"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/30 animate-pulse"
                            : selectedUserOrderDetail.cancelRequest.status === "rejected"
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/30"
                              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            selectedUserOrderDetail.cancelRequest.status === "pending"
                              ? "bg-amber-500"
                              : selectedUserOrderDetail.cancelRequest.status === "rejected"
                                ? "bg-rose-500"
                                : "bg-emerald-500"
                          }`} />
                          {selectedUserOrderDetail.cancelRequest.status === "pending" ? (
                            lang === "hi" ? "रद्दीकरण अनुरोध लंबित" : lang === "es" ? "Cancelación Pendiente" : "Cancel Request Pending"
                          ) : selectedUserOrderDetail.cancelRequest.status === "rejected" ? (
                            lang === "hi" ? "order not cancelled by seller" : lang === "es" ? "order not cancelled by seller" : "order not cancelled by seller"
                          ) : (
                            lang === "hi" ? "ऑर्डर रद्द कर दिया गया" : lang === "es" ? "Pedido Cancelado" : "Order Cancelled"
                          )}
                        </span>
                        <p className="text-[9px] text-neutral-400 font-medium text-right">Filed: {selectedUserOrderDetail.cancelRequest.requestedAt}</p>
                      </div>
                    ) : showCancelConfirm ? (
                      <div className="flex flex-col items-stretch gap-3.5 bg-red-500/5 dark:bg-red-500/10 p-5 rounded-2xl border border-red-500/20 max-w-sm w-full md:w-80">
                        <p className="text-[11px] text-red-650 dark:text-red-400 font-bold text-left leading-relaxed">
                          {lang === "hi"
                            ? "क्या आप वाकई इस ऑर्डर को रद्द करना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।"
                            : lang === "es"
                              ? "¿Está seguro de que desea cancelar este pedido? Esta acción no se puede deshacer."
                              : "Are you sure you want to cancel this order? This action cannot be undone."}
                        </p>
                        
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-left">
                            {lang === "hi" ? "रद्दीकरण का कारण:" : lang === "es" ? "Motivo de la cancelación:" : "Reason for cancellation:"}
                          </label>
                          <select
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-[11px] text-neutral-800 dark:text-neutral-200 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all cursor-pointer"
                          >
                            {(CANCELLATION_REASONS[lang] || CANCELLATION_REASONS.en).map((reason) => (
                              <option key={reason} value={reason}>
                                {reason}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            onClick={() => setShowCancelConfirm(false)}
                            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-extrabold text-[10px] rounded-xl uppercase tracking-wider transition-all"
                          >
                            {lang === "hi" ? "नहीं, रखें" : lang === "es" ? "No, mantener" : "No, Keep"}
                          </button>
                          <button
                            onClick={() => {
                              onRequestCancel?.(selectedUserOrderDetail.id, cancelReason);
                              setShowCancelConfirm(false);
                            }}
                            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] rounded-xl uppercase tracking-wider transition-all"
                          >
                            {lang === "hi" ? "हाँ, रद्द करें" : lang === "es" ? "Sí, Cancelar" : "Yes, Cancel"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setShowCancelConfirm(true);
                        }}
                        className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-[0.98] text-white font-extrabold text-[11px] rounded-2xl uppercase tracking-wider shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <XCircle size={14} /> Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : selectedUserOrderDetail.status === "shipped" || selectedUserOrderDetail.status === "in_transit" || selectedUserOrderDetail.status === "out_for_delivery" ? (
              <div className="p-4 bg-neutral-100/50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 rounded-3xl text-left flex items-start gap-3">
                <span className="p-2.5 bg-neutral-200 dark:bg-neutral-900 rounded-2xl text-neutral-450 dark:text-neutral-500 shrink-0">
                  <ShieldAlert size={16} />
                </span>
                <div className="space-y-0.5">
                  <p className="text-[11px] font-black text-neutral-700 dark:text-neutral-300">
                    Cancellation Option Locked
                  </p>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-relaxed">
                    This parcel has already been registered with active priority carriers and is currently traveling. Cancellation is locked; you can register a return claim post-delivery.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Return section */}
            {selectedUserOrderDetail.status === "delivered" ? (
              <div className="relative overflow-hidden p-6 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl shadow-sm transition-all hover:shadow-md">
                {/* Decorative background accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

                {(() => {
                  const orderDateStr = selectedUserOrderDetail.date;
                  const eligible = isWithin7Days(orderDateStr);
                  
                  if (!eligible) {
                    return (
                      <div className="p-4 bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 rounded-3xl text-left flex items-start gap-3">
                        <span className="p-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-2xl text-neutral-400 shrink-0">
                          <AlertCircle size={16} />
                        </span>
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-black text-neutral-600 dark:text-neutral-400">
                            Return Policy Period Expired
                          </p>
                          <p className="text-[10px] text-neutral-450 dark:text-neutral-500 leading-relaxed">
                            Under standard consumer protection guidelines, returns must be logged within 7 days of placement. This purchase is now outside this eligibility frame.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  if (selectedUserOrderDetail.returnRequest) {
                    return (
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 text-left">
                        <div className="space-y-2 max-w-xl">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <Sparkles size={11} className="animate-pulse" /> Return claim logged
                          </span>
                          <h5 className="font-black text-neutral-900 dark:text-white text-sm tracking-tight">
                            Your Return Claim File
                          </h5>
                          <div className="space-y-1.5 text-[11px] text-neutral-650 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 min-w-[280px]">
                            <p className="flex items-center gap-1.5"><span className="text-neutral-400 font-bold uppercase text-[9px]">Reason:</span> {selectedUserOrderDetail.returnRequest.reason}</p>
                            <p className="flex items-start gap-1.5"><span className="text-neutral-400 font-bold uppercase text-[9px] shrink-0 mt-0.5">Notes:</span> <span>{selectedUserOrderDetail.returnRequest.details}</span></p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1.5 shrink-0 w-full md:w-auto">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl ${
                            selectedUserOrderDetail.returnRequest.status === "pending"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/30 animate-pulse"
                              : selectedUserOrderDetail.returnRequest.status === "rejected"
                                ? "bg-rose-500/10 text-rose-500 border border-rose-500/30"
                                : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              selectedUserOrderDetail.returnRequest.status === "pending"
                                ? "bg-amber-500"
                                : selectedUserOrderDetail.returnRequest.status === "rejected"
                                  ? "bg-rose-500"
                                  : "bg-emerald-500"
                            }`} />
                            Return Status: {selectedUserOrderDetail.returnRequest.status}
                          </span>
                          <p className="text-[9px] text-neutral-400 font-medium">Requested on {selectedUserOrderDetail.returnRequest.requestedAt}</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-5 text-left">
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          🛡️ Premium buyer protection active
                        </span>
                        <h5 className="font-black text-neutral-900 dark:text-white text-sm tracking-tight">
                          🔄 File Return & Refund Claim
                        </h5>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                          This order is fully eligible under our 7-Day Return Policy. Our door-pickup service is free of charge. Please provide the reason below to request your pickup.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-neutral-400 dark:text-neutral-500 font-extrabold uppercase tracking-wide block">
                            Reason for Return
                          </label>
                          <select
                            id="return-reason-select"
                            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-850 p-3 rounded-2xl text-xs text-neutral-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all outline-none"
                          >
                            <option value="Defective / Damaged item received">Defective / Damaged item received</option>
                            <option value="Wrong size / Variant shipped">Wrong size / Variant shipped</option>
                            <option value="Product not as described on page">Product not as described on page</option>
                            <option value="Changed my mind / Dissatisfied">Changed my mind / Dissatisfied</option>
                          </select>
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-neutral-400 dark:text-neutral-500 font-extrabold uppercase tracking-wide block">
                            Additional Details / Explanations
                          </label>
                          <input
                            id="return-details-input"
                            type="text"
                            placeholder="e.g. stitches are coming apart, colour faded"
                            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-850 p-3 rounded-2xl text-xs text-neutral-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={() => {
                            const reasonSelect = document.getElementById("return-reason-select") as HTMLSelectElement;
                            const detailsInput = document.getElementById("return-details-input") as HTMLInputElement;
                            const reason = reasonSelect?.value || "Defective item received";
                            const details = detailsInput?.value || "No additional comments";
                            
                            onRequestReturn?.(selectedUserOrderDetail.id, reason, details);
                          }}
                          className="w-full md:w-auto px-6 py-3 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-950 dark:hover:bg-neutral-750 active:scale-[0.98] text-white font-extrabold text-[11px] rounded-2xl uppercase tracking-wider shadow-md hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                        >
                          <Undo2 size={14} /> Submit Return Claim
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : null}
          </div>

          {/* Courier Address and Payment split summaries */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-neutral-100 dark:border-neutral-800 text-xs">
            <div className="border border-neutral-250 dark:border-neutral-800 p-4 rounded-xl space-y-2">
              <span className="font-extrabold text-neutral-400 uppercase tracking-widest text-[10px] block">📍 Delivery address</span>
              <p className="font-extrabold text-neutral-900 dark:text-white">{selectedUserOrderDetail.shippingAddress.name}</p>
              <p className="text-neutral-500 dark:text-neutral-400">{selectedUserOrderDetail.shippingAddress.details}</p>
              <p>{selectedUserOrderDetail.shippingAddress.city}, {selectedUserOrderDetail.shippingAddress.state} - {selectedUserOrderDetail.shippingAddress.pincode}</p>
              <p className="text-neutral-400 pt-1">📞 Contacts Number: {selectedUserOrderDetail.shippingAddress.phone}</p>
            </div>

            <div className="border border-neutral-250 dark:border-neutral-800 p-4 rounded-xl space-y-2">
              <span className="font-extrabold text-neutral-400 uppercase tracking-widest text-[10px] block">💳 billing statement</span>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Purchase Total:</span>
                  <span className="font-bold text-neutral-900 dark:text-white">₹{selectedUserOrderDetail.subtotal.toLocaleString("en-IN")}</span>
                </div>
                {selectedUserOrderDetail.discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Discount Code Applied:</span>
                    <span>-₹{selectedUserOrderDetail.discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-400">Convenience Handling Fee:</span>
                  <span className="font-bold text-neutral-900 dark:text-white">₹46.00</span>
                </div>
                <div className="flex justify-between border-t border-dashed pt-2 font-black text-neutral-950 dark:text-white text-sm">
                  <span>Gross Total Settled:</span>
                  <span className="text-red-500">₹{selectedUserOrderDetail.total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Item List */}
          <div className="p-6 space-y-3">
            <span className="text-[10px] uppercase font-black text-neutral-400 tracking-wider block">
              {t.items}
            </span>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {selectedUserOrderDetail.items.map((item, index) => (
                <div key={index} className="py-4 flex justify-between items-center text-xs gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={item.productImage} 
                      alt={item.productName} 
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 border dark:border-neutral-850" 
                    />
                    <div className="truncate text-left">
                      <p className="font-extrabold text-neutral-900 dark:text-white truncate max-w-[280px]">
                        {item.productName}
                      </p>
                      <p className="text-[10px] text-neutral-450 mt-0.5">
                        Qty: {item.quantity} | Rate: ₹{item.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Secure Invoice statement download at bottom */}
          <div className="p-6 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-150 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left space-y-0.5">
              <span className="text-[9px] uppercase font-black text-emerald-500 tracking-wider block">
                🛡️ Verified Secure Purchase Invoice
              </span>
              <p className="text-[10px] text-neutral-400 font-medium">
                {t.deliveryInfo}
              </p>
            </div>

            <button
              onClick={() => {
                generatePDFInvoice(selectedUserOrderDetail, currentUser?.name || "");
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm"
            >
              <FileText size={14} /> {t.invoice} (PDF)
            </button>
          </div>

        </div>
      ) : (
        /* Standard Order List View (ONLY showing item names and images as requested) */
        <div className="space-y-4">
          <div className="space-y-6">
            {userOrders.map((ord) => (
              <div 
                key={ord.id}
                onClick={() => setSelectedUserOrderDetail(ord)}
                className="border border-neutral-200 dark:border-neutral-850 rounded-2xl bg-white dark:bg-neutral-900 p-5 shadow-sm hover:shadow-md cursor-pointer hover:border-red-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                id={`order-invoice-card-list-${ord.id}`}
              >
                {/* Product details - ONLY show image and product name as requested */}
                <div className="flex-1 space-y-3.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-left">
                    <span className="font-bold text-neutral-400">{t.orderId}:</span>
                    <span className="font-extrabold text-red-500 group-hover:underline">{ord.id}</span>
                    <span className="text-neutral-300 dark:text-neutral-700">|</span>
                    <span className="text-neutral-400 font-semibold">{ord.date}</span>
                    <span className="ml-auto bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[10px]">
                      {ord.status}
                    </span>
                  </div>

                  {/* Purchased items - ONLY name and image show */}
                  <div className="space-y-3 pt-1">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img 
                          src={item.productImage} 
                          alt={item.productName} 
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-150 dark:border-neutral-800 shadow-xs shrink-0 bg-neutral-100 dark:bg-neutral-800" 
                        />
                        <div className="text-left">
                          <p className="font-extrabold text-sm text-neutral-850 dark:text-neutral-150 leading-snug">
                            {item.productName}
                          </p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">Purchased Verified Product</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side helper view trigger */}
                <div className="flex items-center gap-1 shadow-xs border border-neutral-240 dark:border-neutral-800 hover:border-red-500 dark:hover:border-red-500/70 p-2.5 rounded-xl bg-neutral-50/50 dark:bg-neutral-950/20 text-red-500 text-xs font-extrabold shrink-0 self-start sm:self-auto uppercase tracking-wider">
                  <span>View Details</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
