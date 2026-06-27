import React, { useState, useRef, useEffect } from "react";
import { ShoppingCart, Heart, Search, Store, ShieldCheck, User as UserIcon, Lock, ShoppingBag, AlertTriangle, Globe, LogOut, Mic, MicOff } from "lucide-react";
import { User, UserRole } from "../types";

interface NavigationProps {
  currentUser: User | null;
  onNavigate: (view: string) => void;
  activeView: string;
  cartCount: number;
  wishlistCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenProfileCenter: () => void;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  onOpenWishlist?: () => void;
}

export default function Navigation({
  currentUser,
  onNavigate,
  activeView,
  cartCount,
  wishlistCount,
  searchQuery,
  onSearchChange,
  onOpenProfileCenter,
  onOpenLoginModal,
  onLogout,
  onOpenWishlist
}: NavigationProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      const rec = new SpeechRecognitionAPI();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-IN";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setLocalQuery(transcript);
          onSearchChange(transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [onSearchChange]);

  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) {
      alert("Voice search is not supported or was blocked by browser policies. Try using Google Chrome, Safari, or Microsoft Edge!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Speech recognition start issue:", err);
      }
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-300 border-neutral-200/80 bg-white/90 dark:border-neutral-800/80 dark:bg-neutral-900/90" id="header-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate("catalog")}
              className="flex items-center gap-2 font-sans font-extrabold text-2xl tracking-tight text-neutral-900 dark:text-white"
              id="logo-brand-button"
            >
              <span className="bg-red-600 text-white px-2.5 py-1 rounded font-black transform hover:scale-105 transition-transform duration-200">N</span>
              <span>Nova<span className="text-red-500 font-medium">Mart</span></span>
            </button>

            {/* Quick View Links (Removed Track Orders and Support Assistant as requested) */}
            <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
              <button
                onClick={() => onNavigate("catalog")}
                className={`transition-colors hover:text-red-500 ${activeView === "catalog" ? "text-red-500" : ""}`}
                id="nav-catalog-marketplace"
              >
                Marketplace
              </button>
            </nav>
          </div>



          {/* Action Icons */}
          <div className="flex items-center gap-2.5">
            
            {/* Wishlist */}
            <button
              onClick={() => {
                if (onOpenWishlist) {
                  onOpenWishlist();
                } else if (!currentUser) {
                  onOpenLoginModal();
                } else {
                  onNavigate("my-orders");
                }
              }}
              className="p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all relative"
              title="Starred Wishlist"
              id="wishlist-btn"
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <button
              onClick={() => onNavigate("cart")}
              className="p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all relative"
              title="Shopping Cart"
              id="cart-btn"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="h-5 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-1"></div>

            {/* User Session Profile Handler (Google Sign In required for checkout) */}
            <div className="relative" ref={dropdownRef}>
              {!currentUser ? (
                <button
                  onClick={onOpenLoginModal}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wide transition-all shadow-md shadow-red-600/10"
                  id="google-login-trigger"
                >
                  <Lock size={12} />
                  <span>Secure LogIn</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1 bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-800 transition-all"
                    id="user-profile-center-trigger"
                  >
                    <img src={currentUser.avatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-red-500" />
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-black text-neutral-800 dark:text-white truncate max-w-[85px]">{currentUser.name}</p>
                      <p className="text-[9px] uppercase font-bold text-red-500 tracking-wider">Verified Identity</p>
                    </div>
                  </button>

                  {/* Dropdown Menu Popup - Directly satisfies "profile pe click kaaru toh udar option aana chaiye" */}
                  {isDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl py-2 z-50 text-xs font-sans text-left animate-in fade-in duration-100"
                      id="profile-actions-dropdown"
                    >
                      <div className="px-4 py-2 border-b border-neutral-150 dark:border-neutral-800">
                        <p className="font-extrabold text-neutral-900 dark:text-white truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{currentUser.email}</p>
                      </div>

                      <div className="p-1.5 space-y-0.5 font-sans">
                        <button
                          onClick={() => {
                            onNavigate("admin-panel");
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
                            activeView === "admin-panel" || activeView === "admin-panel-login"
                              ? "bg-red-600 text-white" 
                              : "text-neutral-700 dark:text-neutral-250 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }`}
                          id="nav-profile-admin-panel"
                        >
                          <ShieldCheck size={14} className={activeView === "admin-panel" || activeView === "admin-panel-login" ? "text-white" : "text-red-500"} />
                          <span>🛡️ Admin Panel</span>
                        </button>

                        <button
                          onClick={() => {
                            onNavigate("my-orders");
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
                            activeView === "my-orders" 
                              ? "bg-red-600 text-white" 
                              : "text-neutral-700 dark:text-neutral-250 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }`}
                        >
                          <ShoppingBag size={14} />
                          <span>🛍️ My Orders</span>
                        </button>

                        <button
                          onClick={() => {
                            onNavigate("user-support");
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
                            activeView === "user-support" 
                              ? "bg-red-600 text-white" 
                              : "text-neutral-700 dark:text-neutral-250 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }`}
                        >
                          <AlertTriangle size={14} />
                          <span>⚠️ Support & Complaints</span>
                        </button>

                        <button
                          onClick={() => {
                            onNavigate("language-settings");
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all ${
                            activeView === "language-settings" 
                              ? "bg-red-600 text-white" 
                              : "text-neutral-700 dark:text-neutral-250 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }`}
                        >
                          <Globe size={14} />
                          <span>🌐 Language Change</span>
                        </button>

                        <div className="my-1 border-t border-neutral-150 dark:border-neutral-800"></div>

                        <button
                          onClick={() => {
                            onLogout();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-red-500 hover:bg-red-500/10 transition-all text-left"
                        >
                          <LogOut size={14} />
                          <span>🚪 Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>



      </div>
    </header>
  );
}
