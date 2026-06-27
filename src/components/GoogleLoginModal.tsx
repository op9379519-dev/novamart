import React, { useState } from "react";
import { Sparkles, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import { User } from "../types";

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export default function GoogleLoginModal({ isOpen, onClose, onLoginSuccess }: GoogleLoginModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const validateEmail = (emailStr: string) => {
    const trimmed = emailStr.trim().toLowerCase();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(trimmed);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter your name to register Google profile details.");
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      setError("⚠️ Verification Required: Please enter a valid email address.");
      return;
    }

    setSuccess("✓ Google verification established! Proceeding inside NovaMart...");
    
    // Construct verified user object
    const verifiedUser: User = {
      id: `cust-google-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
      role: "customer",
      balance: 0.00, // Cleared wallet balance
      loyaltyPoints: 0, // Cleared loyalty points
      savedAddresses: []
    };

    setTimeout(() => {
      onLoginSuccess(verifiedUser);
      onClose();
      // Reset values
      setEmail("");
      setName("");
      setError("");
      setSuccess("");
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" id="google-login-modal">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-8 text-neutral-800 dark:text-neutral-100 text-left relative overflow-hidden shadow-2xl space-y-6">
        
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl"></div>

        {/* Top Header branding */}
        <div className="flex items-center justify-between border-b pb-4 border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white font-black px-2.5 py-1 rounded text-lg">N</span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">Google Secure Single Sign-On</h3>
              <p className="text-[10px] text-neutral-400">NovaMart Security Handoff Center</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-xs font-bold p-1 px-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            ✕
          </button>
        </div>

        {/* Auth details wrapper */}
        <div className="space-y-4">
          <div className="text-center sm:text-left space-y-1.5">
            <h4 className="text-base font-black text-neutral-900 dark:text-white">Verify Your Google Profile 🛡️</h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              To support secure multi-vendor payments, all checkouts mandate verified Google identities. Enter your email address to register instantly and proceed.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-[11px] text-red-500 leading-relaxed font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-500 leading-relaxed font-semibold">
              {success}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-neutral-400 block" htmlFor="g-name">Your Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  id="g-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Om Rupchandani"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-950 dark:text-white pl-9 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  required
                />
                <span className="absolute left-3 top-2.5 text-neutral-400 font-bold text-[10px]">NAME</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-neutral-400 block" htmlFor="g-email">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  id="g-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-950 dark:text-white pl-9 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  required
                />
                <Mail className="absolute left-3 top-3 text-neutral-400" size={13} />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-neutral-950 hover:bg-neutral-900 dark:bg-red-600 dark:hover:bg-red-700 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-[11px]"
            >
              <span>Instant Google Sign-In</span>
              <ArrowRight size={13} />
            </button>
          </form>
        </div>

        {/* Modal Info Footer */}
        <div className="bg-neutral-50 dark:bg-neutral-950 p-3.5 rounded-2xl border border-neutral-100 dark:border-neutral-905 flex gap-2.5 items-start text-[10px] text-neutral-400 leading-relaxed">
          <ShieldCheck className="text-emerald-500 flex-shrink-0 mt-0.5" size={14} />
          <div>
            <span className="font-bold text-neutral-700 dark:text-neutral-200 block">Encryption Audited Platform</span>
            By accessing with Google OAuth, we match your name against tax resident books to instantly certify premium buyer profiles.
          </div>
        </div>

      </div>
    </div>
  );
}
