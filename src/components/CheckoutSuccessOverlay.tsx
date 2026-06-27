import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, Sparkles, Truck, ArrowRight, MapPin, ShoppingBag, FileText } from "lucide-react";
import { Order } from "../types";

interface CheckoutSuccessOverlayProps {
  order: Order | null;
  onClose: () => void;
  onNavigateToOrders: () => void;
}

export default function CheckoutSuccessOverlay({ order, onClose, onNavigateToOrders }: CheckoutSuccessOverlayProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 selection:bg-red-500/30 selection:text-red-300">
      
      {/* Sparkles / Confetti animation elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(24)].map((_, i) => {
          const size = Math.random() * 8 + 4;
          const left = Math.random() * 100;
          const delay = Math.random() * 2;
          const duration = Math.random() * 3 + 2;
          
          return (
            <motion.div
              key={i}
              className="absolute bg-red-500 rounded-full opacity-40"
              style={{
                width: size,
                height: size,
                left: `${left}%`,
                top: `-5%`,
              }}
              animate={{
                y: ["0vh", "105vh"],
                x: ["0px", `${(Math.random() - 0.5) * 120}px`],
                rotate: [0, 360],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay,
                ease: "linear",
              }}
            />
          );
        })}
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl space-y-6 overflow-hidden"
        id="success-animated-overlay-card"
      >
        {/* Colorful top bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500" />

        {/* Animated Checkmark and Pulse Rings */}
        <div className="relative flex justify-center py-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 z-10"
          >
            <CheckCircle2 size={44} strokeWidth={2.5} />
          </motion.div>

          {/* Radiating pulse animation ring 1 */}
          <motion.div
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            className="absolute top-4 left-1/2 -ml-10 w-20 h-20 rounded-full border-2 border-emerald-500/40 pointer-events-none"
          />

          {/* Radiating pulse animation ring 2 */}
          <motion.div
            animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5, ease: "easeOut" }}
            className="absolute top-4 left-1/2 -ml-10 w-20 h-20 rounded-full border-2 border-emerald-500/20 pointer-events-none"
          />
        </div>

        {/* Text Headers */}
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-1.5 text-[10px] tracking-widest font-black uppercase text-emerald-500"
          >
            <Sparkles size={12} />
            <span>Success Dispatch System</span>
            <Sparkles size={12} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight"
          >
            Order Placed Successfully!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold max-w-sm mx-auto leading-relaxed"
          >
            Aapka order surakshit roop se swikar kar liya gaya hai! Below are the live dispatch metrics under mandated Cash on Delivery (COD) parameters.
          </motion.p>
        </div>

        {/* Order Details Receipt Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-neutral-50 dark:bg-neutral-950/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-850 text-left text-xs space-y-3"
        >
          <div className="flex justify-between border-b border-neutral-100 dark:border-neutral-800/60 pb-2 font-bold text-neutral-400 text-[10px] uppercase tracking-wider">
            <span>Order Reference</span>
            <span className="text-red-500 font-extrabold">{order.id}</span>
          </div>

          <div className="space-y-2 text-neutral-600 dark:text-neutral-300">
            <div className="flex justify-between font-medium">
              <span>Date:</span>
              <span className="font-extrabold text-neutral-800 dark:text-neutral-200">{order.date}</span>
            </div>

            <div className="flex justify-between font-medium">
              <span>Payment Mode:</span>
              <span className="font-black text-xs text-red-500 uppercase tracking-wide">💵 {order.paymentMethod.toUpperCase()}</span>
            </div>

            <div className="flex justify-between font-medium items-start">
              <span className="flex items-center gap-1 text-neutral-400 mt-0.5"><MapPin size={12} /> Destination:</span>
              <span className="font-bold text-neutral-800 dark:text-neutral-200 text-right max-w-[200px] truncate block">
                {order.shippingAddress.street}, {order.shippingAddress.city}
              </span>
            </div>

            <div className="flex justify-between font-medium items-start">
              <span className="flex items-center gap-1 text-neutral-400 mt-0.5"><ShoppingBag size={12} /> Items Count:</span>
              <span className="font-bold text-neutral-800 dark:text-neutral-200 text-right">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items purchased
              </span>
            </div>

            <div className="border-t border-dashed border-neutral-200 dark:border-neutral-800 pt-2 flex justify-between text-sm text-neutral-950 dark:text-white font-black">
              <span>Grand Total Paid (incl. fees):</span>
              <span className="text-lg text-emerald-500 font-black">₹{order.total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </motion.div>

        {/* Animated truck track indicator */}
        <div className="relative h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ left: "-10%" }}
            animate={{ left: "110%" }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 -translate-y-1/2 text-red-500"
          >
            <Truck size={14} className="scale-x-[-1]" />
          </motion.div>
        </div>

        {/* Direct Navigation Button Triggers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <button
            onClick={onNavigateToOrders}
            className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 uppercase text-[10px] tracking-wider"
          >
            <span>Track Order Live</span>
            <ArrowRight size={13} />
          </button>

          <button
            onClick={onClose}
            className="py-3 px-4 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-extrabold rounded-xl transition-all text-[10px] uppercase tracking-wider"
          >
            Continue Shopping
          </button>
        </motion.div>

        {/* Compliant branding credit line */}
        <p className="text-[9px] text-neutral-400 italic">
          🔒 Verification completed under Google Account authorization protocol.
        </p>

      </motion.div>
    </div>
  );
}
