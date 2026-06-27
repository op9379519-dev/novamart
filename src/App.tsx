import React, { useState, useEffect } from "react";
import Navigation from "./components/Navigation";
import CustomerCatalog from "./components/CustomerCatalog";
import CartCheckout from "./components/CartCheckout";
import CustomerDashboard from "./components/CustomerDashboard";
import SellerDashboard from "./components/SellerDashboard";
import AdminPanel from "./components/AdminPanel";
import AdminLogin from "./components/AdminLogin";
import GoogleLoginModal from "./components/GoogleLoginModal";
import UserOrdersPage from "./components/UserOrdersPage";
import UserSupportPage from "./components/UserSupportPage";
import LanguageSettingsPage from "./components/LanguageSettingsPage";
import CheckoutSuccessOverlay from "./components/CheckoutSuccessOverlay";
import SearchResultsPage from "./components/SearchResultsPage";
import SupportChatBox from "./components/SupportChatBox";
import WishlistModal from "./components/WishlistModal";

import {
  Product,
  Coupon,
  Order,
  SupportTicket,
  Seller,
  User,
  OrderItem,
  Address
} from "./types";

import {
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  INITIAL_SELLERS,
  INITIAL_TICKETS,
  CURRENT_USER,
  getSavedState,
  saveState
} from "./utils/mockData";

import { collection, onSnapshot } from "firebase/firestore";
import { 
  db, 
  seedDatabaseIfEmpty, 
  dbSaveProduct, 
  dbSaveOrder, 
  dbSaveUser, 
  dbSaveTicket, 
  dbSaveSeller, 
  dbSaveCoupon,
  dbDeleteProduct,
  handleFirestoreError,
  OperationType
} from "./lib/firebase";

export default function App() {
  // Sync state with simulated localStorage database keys
  const [products, setProducts] = useState<Product[]>(() => getSavedState("products", INITIAL_PRODUCTS));
  const [coupons, setCoupons] = useState<Coupon[]>(() => getSavedState("coupons", INITIAL_COUPONS));
  const [orders, setOrders] = useState<Order[]>(() => getSavedState("orders", INITIAL_ORDERS));
  const [sellers, setSellers] = useState<Seller[]>(() => getSavedState("sellers", INITIAL_SELLERS));
  const [tickets, setTickets] = useState<SupportTicket[]>(() => getSavedState("tickets", INITIAL_TICKETS));
  const [currentUser, setCurrentUser] = useState<User | null>(() => getSavedState("currentUser", null));
  const [cartItems, setCartItems] = useState<OrderItem[]>(() => getSavedState("cartItems", []));
  const [wishlist, setWishlist] = useState<string[]>(() => getSavedState("wishlist", ["prod-1", "prod-2"]));
  const [users, setUsers] = useState<User[]>(() => {
    const list = getSavedState("users", []);
    if (list.length === 0) {
      return [CURRENT_USER];
    }
    return list;
  });

  const [activeView, setActiveView] = useState<string>("catalog");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [theme] = useState<"light" | "dark">("dark");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState<boolean>(false);
  const [currentLang, setCurrentLang] = useState<"en" | "hi" | "es">(() => getSavedState("currentLang", "en"));
  const [justPlacedOrder, setJustPlacedOrder] = useState<Order | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => getSavedState("isAdminAuthenticated", false));

  // Initialize and subscribe to Firestore collections for true server persistence
  useEffect(() => {
    // 1. Check/seed standard collection documents on first boot
    seedDatabaseIfEmpty();

    // 2. Real-time products listener with offline fallback
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Product);
      });
      if (items.length > 0) {
        // Merge with INITIAL_PRODUCTS to guarantee everything shows up even if deleted or missing from db
        const itemIds = new Set(items.map(item => item.id));
        const merged = [...items];
        INITIAL_PRODUCTS.forEach(p => {
          if (!itemIds.has(p.id)) {
            merged.push(p);
          }
        });
        setProducts(merged);
      } else {
        // If snapshot arrives empty, trigger DB seed and use default
        setProducts(INITIAL_PRODUCTS);
        seedDatabaseIfEmpty();
      }
    }, (error) => {
      console.warn("Firestore products stream offline:", error.message);
      handleFirestoreError(error, OperationType.LIST, "products");
    });

    // 3. Real-time coupons listener with offline fallback
    const unsubCoupons = onSnapshot(collection(db, "coupons"), (snapshot) => {
      const items: Coupon[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Coupon);
      });
      if (items.length > 0) {
        // Merge with INITIAL_COUPONS to guarantee everything shows up
        const itemCodes = new Set(items.map(item => item.code));
        const merged = [...items];
        INITIAL_COUPONS.forEach(c => {
          if (!itemCodes.has(c.code)) {
            merged.push(c);
          }
        });
        setCoupons(merged);
      } else {
        setCoupons(INITIAL_COUPONS);
        seedDatabaseIfEmpty();
      }
    }, (error) => {
      console.warn("Firestore coupons stream offline:", error.message);
      handleFirestoreError(error, OperationType.LIST, "coupons");
    });

    // 4. Real-time orders listener with offline fallback
    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Order);
      });
      // Sort orders descending to display new ones first
      items.sort((a, b) => b.id.localeCompare(a.id));
      setOrders(items);
    }, (error) => {
      console.warn("Firestore orders stream offline:", error.message);
      handleFirestoreError(error, OperationType.LIST, "orders");
    });

    // 5. Real-time sellers listener with offline fallback
    const unsubSellers = onSnapshot(collection(db, "sellers"), (snapshot) => {
      const items: Seller[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Seller);
      });
      if (items.length > 0) {
        setSellers(items);
      } else {
        seedDatabaseIfEmpty();
      }
    }, (error) => {
      console.warn("Firestore sellers stream offline:", error.message);
      handleFirestoreError(error, OperationType.LIST, "sellers");
    });

    // 6. Real-time tickets listener
    const unsubTickets = onSnapshot(collection(db, "tickets"), (snapshot) => {
      const items: SupportTicket[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as SupportTicket);
      });
      setTickets(items);
    }, (error) => {
      console.warn("Firestore tickets stream offline:", error.message);
      handleFirestoreError(error, OperationType.LIST, "tickets");
    });

    // 7. Real-time users listener
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const items: User[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as User);
      });
      if (items.length > 0) {
        setUsers(items);
      }
    }, (error) => {
      console.warn("Firestore users stream offline:", error.message);
      handleFirestoreError(error, OperationType.LIST, "users");
    });

    return () => {
      unsubProducts();
      unsubCoupons();
      unsubOrders();
      unsubSellers();
      unsubTickets();
      unsubUsers();
    };
  }, []);

  // Sync language selection immediately back to LocalStorage
  useEffect(() => { saveState("currentLang", currentLang); }, [currentLang]);
  useEffect(() => { saveState("isAdminAuthenticated", isAdminAuthenticated); }, [isAdminAuthenticated]);

  // Sync state modifications directly back to LocalStorage
  useEffect(() => { saveState("products", products); }, [products]);
  useEffect(() => { saveState("coupons", coupons); }, [coupons]);
  useEffect(() => { saveState("orders", orders); }, [orders]);
  useEffect(() => { saveState("sellers", sellers); }, [sellers]);
  useEffect(() => { saveState("tickets", tickets); }, [tickets]);
  useEffect(() => { saveState("currentUser", currentUser); }, [currentUser]);
  useEffect(() => { saveState("cartItems", cartItems); }, [cartItems]);
  useEffect(() => { saveState("wishlist", wishlist); }, [wishlist]);
  useEffect(() => { saveState("users", users); }, [users]);

  // Keep all customer database records fully synchronised when the session updates
  useEffect(() => {
    if (currentUser) {
      setUsers((prev) => {
        const exists = prev.some((u) => u.id === currentUser.id);
        if (!exists) {
          return [currentUser, ...prev];
        }
        return prev.map((u) => u.id === currentUser.id ? currentUser : u);
      });
      // Sync currentUser immediately to Firestore!
      dbSaveUser(currentUser);
    }
  }, [currentUser]);

  // Sync dark theme with standard tailwind document class list
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.backgroundColor = "#171717";
    } else {
      root.classList.remove("dark");
      root.style.backgroundColor = "#f5f5f5";
    }
  }, [theme]);

  // Handlers for cart operation
  const handleAddToCart = (product: Product, selectedVariants: Record<string, string>) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    const existingIndex = cartItems.findIndex((item) => item.productId === product.id);
    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
    } else {
      const newItem: OrderItem = {
        productId: product.id,
        productName: product.name,
        productImage: product.images[0],
        price: product.price,
        quantity: 1,
        variantSelections: selectedVariants,
        sellerId: product.sellerId
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    const updated = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    setCartItems(updated);
  };

  const handleRemoveCartItem = (productId: string) => {
    const filtered = cartItems.filter((item) => item.productId !== productId);
    setCartItems(filtered);
  };

  const handleClearCart = () => setCartItems([]);

  const handleBuyNow = (product: Product, selectedVariants: Record<string, string>) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    handleAddToCart(product, selectedVariants);
    setActiveView("cart");
  };

  const handleToggleWishlist = (product: Product) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    if (wishlist.includes(product.id)) {
      setWishlist(wishlist.filter((id) => id !== product.id));
    } else {
      setWishlist([...wishlist, product.id]);
    }
  };

  // Perform checkout transaction simulation
  const handleCheckoutComplete = (checkoutData: {
    items: OrderItem[];
    subtotal: number;
    gst: number;
    discount: number;
    total: number;
    shippingAddress: Address;
    paymentMethod: 'stripe' | 'razorpay' | 'cod' | 'wallet';
  }) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      id: orderId,
      buyerId: currentUser?.id || "anonymous",
      buyerName: currentUser?.name || "Verified Client",
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      items: checkoutData.items,
      subtotal: checkoutData.subtotal,
      gst: checkoutData.gst,
      discount: checkoutData.discount,
      total: checkoutData.total,
      shippingAddress: checkoutData.shippingAddress,
      paymentMethod: checkoutData.paymentMethod,
      paymentStatus: "paid",
      invoicePdfUrl: "#"
    };

    // Save order logic completed without loyalty points addition

    // Decrement inventory stock counts
    setProducts((prevProd) =>
      prevProd.map((p) => {
        const matchingItem = checkoutData.items.find((item) => item.productId === p.id);
        if (matchingItem) {
          const updatedProd = { ...p, stock: Math.max(0, p.stock - matchingItem.quantity) };
          dbSaveProduct(updatedProd); // Write inventory decrement back to Firestore!
          return updatedProd;
        }
        return p;
      })
    );

    setOrders([newOrder, ...orders]);
    dbSaveOrder(newOrder); // Save new live order to Firestore!
    setCartItems([]);
    
    // Trigger beautiful full-screen checkout success animation screen
    setJustPlacedOrder(newOrder);
  };

  // Corporate gift cards loaded
  const handleApplyGiftCard = (amount: number) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        balance: prev.balance + amount
      };
      dbSaveUser(updated); // Save updated balance live to Firestore!
      return updated;
    });
  };

  // Role simulations changed (Reviewer utility)
  const handleRoleChange = (role: User["role"]) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        role: role
      };
      dbSaveUser(updated); // Save role modification to Firestore!
      return updated;
    });
  };

  // Support messages filed
  const handleAddNewSupportTicket = (subject: string, initialMessage: string) => {
    const ticketId = `TCK-${Math.floor(100 + Math.random() * 900)}`;
    const newTicket: SupportTicket = {
      id: ticketId,
      buyerId: currentUser?.id || "guest-id",
      buyerName: currentUser?.name || "Guest Customer",
      subject: subject,
      status: "open",
      createdAt: new Date().toISOString().split("T")[0],
      messages: [
        { id: `msg-1-${Date.now()}`, sender: "user", text: initialMessage, timestamp: "Just Now" },
        { id: `msg-2-${Date.now()}`, sender: "ai", text: `Hello ${currentUser?.name || "Om"}! The NovaMart enterprise system received your audit file concerning "${subject}". A verified brand operator or support bot will respond to you within 3 sentences block.`, timestamp: "Just Now" }
      ]
    };
    setTickets([newTicket, ...tickets]);
    dbSaveTicket(newTicket); // Save tickets live to Firestore!
  };

  // Return request submitted
  const handleSubmittingReturnRequest = (orderId: string, itemIdx: number, reason: string, details: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.id === orderId) {
          const updatedOrd = {
            ...ord,
            returnRequest: {
              reason,
              details: `Initial validation success. Refund auto assigned for ${ord.items[itemIdx]?.productName}. Waiting for pickup.`,
              status: "pending" as const,
              requestedAt: new Date().toISOString().split("T")[0]
            }
          };
          dbSaveOrder(updatedOrd); // Sync return request status with Firestore!
          return updatedOrd;
        }
        return ord;
      })
    );
  };

  const handleRequestCancel = (orderId: string, reason: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.id === orderId) {
          const updatedOrd = {
            ...ord,
            cancelRequest: {
              requestedAt: new Date().toISOString().split("T")[0],
              status: "pending" as const,
              reason: reason
            }
          };
          dbSaveOrder(updatedOrd); // Sync cancellation status with Firestore!
          return updatedOrd;
        }
        return ord;
      })
    );
  };

  const handleRequestReturnFull = (orderId: string, reason: string, details: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.id === orderId) {
          const updatedOrd = {
            ...ord,
            returnRequest: {
              reason,
              details: details || "Awaiting pickup evaluation",
              status: "pending" as const,
              requestedAt: new Date().toISOString().split("T")[0]
            }
          };
          dbSaveOrder(updatedOrd); // Sync return status with Firestore!
          return updatedOrd;
        }
        return ord;
      })
    );
  };

  // Add review rating
  const handleSubmittingReview = (productId: string, rating: number, comment: string) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === productId) {
          const freshReview = {
            id: `rev-custom-${Date.now()}`,
            productId,
            buyerName: currentUser?.name || "Verified Customer",
            rating,
            comment,
            date: new Date().toISOString().split("T")[0],
            status: "approved" as const
          };
          const updatedProduct = {
            ...p,
            reviews: [freshReview, ...p.reviews]
          };
          dbSaveProduct(updatedProduct); // Sync reviews directly to Firestore!
          return updatedProduct;
        }
        return p;
      })
    );
  };

  // Seller Dashboard triggers
  const handleAddProductBySeller = (newProd: Product) => {
    setProducts([newProd, ...products]);
    dbSaveProduct(newProd); // Sync seller new product addition to Firestore!
  };

  const handleEditProductBySeller = (editProd: Product) => {
    setProducts(products.map((p) => (p.id === editProd.id ? editProd : p)));
    dbSaveProduct(editProd); // Sync seller edited product to Firestore!
  };

  const handleDeleteProductBySeller = (prodId: string) => {
    setProducts(products.filter((p) => p.id !== prodId));
    dbDeleteProduct(prodId); // Delete live product document from Firestore!
  };

  const handleUpdateOrderStatusBySeller = (orderId: string, status: Order["status"]) => {
    setOrders((prevOrd) =>
      prevOrd.map((ord) => {
        if (ord.id === orderId) {
          const finishedRefund = status === "returned" ? "refunded" as const : ord.paymentStatus;
          const updatedOrd = { ...ord, status, paymentStatus: finishedRefund };
          dbSaveOrder(updatedOrd); // Save status progression back to Firestore!
          return updatedOrd;
        }
        return ord;
      })
    );
  };

  const handleApplyForVerificationBySeller = (bizName: string, bizDesc: string) => {
    const updatedSellers = sellers.map((sel) => {
      if (sel.ownerId === "user-seller-1") {
        const updatedSeller = {
          ...sel,
          businessName: bizName,
          description: bizDesc,
          status: "pending" as const
        };
        dbSaveSeller(updatedSeller); // Sync application state to Firestore!
        return updatedSeller;
      }
      return sel;
    });
    setSellers(updatedSellers);
  };

  // Admin triggers
  const handleApproveSellerByAdmin = (sellerId: string) => {
    const updatedSellers = sellers.map((s) => {
      if (s.id === sellerId) {
        const approvedSeller = { ...s, status: "approved" as const };
        dbSaveSeller(approvedSeller); // Sync seller approval with Firestore!
        return approvedSeller;
      }
      return s;
    });
    setSellers(updatedSellers);
    alert(`Success: Seller certified live inside NovaMart directories!`);
  };

  const handleModifyUserBalanceByAdmin = (userId: string, amount: number) => {
    if (currentUser && userId === currentUser.id) {
      const updatedSession = { ...currentUser, balance: currentUser.balance + amount };
      setCurrentUser(updatedSession);
      dbSaveUser(updatedSession);
    } else {
      const targetUser = users.find((u) => u.id === userId);
      if (targetUser) {
        const updatedUser = { ...targetUser, balance: targetUser.balance + amount };
        dbSaveUser(updatedUser);
      }
    }
  };

  const handleAddNewCouponByAdmin = (newCoupon: Coupon) => {
    setCoupons([newCoupon, ...coupons]);
    dbSaveCoupon(newCoupon); // Save new promo coupon to Firestore!
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    // If the order was not cancelled, but is now set to cancelled, return items to stock
    const oldOrder = orders.find((o) => o.id === updatedOrder.id);
    if (oldOrder && oldOrder.status !== "cancelled" && updatedOrder.status === "cancelled") {
      setProducts((prevProd) =>
        prevProd.map((p) => {
          const matchingItem = updatedOrder.items.find((item) => item.productId === p.id);
          if (matchingItem) {
            const updatedProd = { ...p, stock: p.stock + matchingItem.quantity };
            dbSaveProduct(updatedProd); // Write inventory increment back to Firestore!
            return updatedProd;
          }
          return p;
        })
      );
    }
    setOrders((prev) => prev.map((o) => o.id === updatedOrder.id ? updatedOrder : o));
    dbSaveOrder(updatedOrder); // Save updated logistics logs live to Firestore!
  };

  return (
    <div className="min-h-screen text-neutral-800 dark:text-neutral-100 transition-colors duration-300 bg-neutral-100 dark:bg-neutral-950 font-sans" id="app-root-shell">
      
      {/* Dynamic Header / Nav Panel */}
      <Navigation
        currentUser={currentUser}
        onNavigate={setActiveView}
        activeView={activeView}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim()) {
            setActiveView("search-results");
          } else if (activeView === "search-results") {
            setActiveView("catalog");
          }
        }}
        onOpenProfileCenter={() => {}}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          setIsAdminAuthenticated(false);
          setActiveView("catalog");
        }}
        onOpenWishlist={() => setIsWishlistModalOpen(true)}
      />

      {/* Main Core Content Stage */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-opacity duration-300" id="main-content-layout">
        
        {activeView === "catalog" && (
          <CustomerCatalog
            products={products}
            searchQuery={searchQuery}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
            orders={orders}
          />
        )}

        {activeView === "search-results" && (
          <SearchResultsPage
            products={products}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
            onBackToCatalog={() => setActiveView("catalog")}
          />
        )}

        {activeView === "cart" && (
          <CartCheckout
            cartItems={cartItems}
            coupons={coupons}
            currentUser={currentUser}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onCheckoutComplete={handleCheckoutComplete}
            onApplyGiftCard={handleApplyGiftCard}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

        {activeView === "orders" && currentUser && (
          <CustomerDashboard
            orders={orders}
            currentUser={currentUser}
            tickets={tickets}
            onAddNewSupportTicket={handleAddNewSupportTicket}
            onSubmittingReturnRequest={handleSubmittingReturnRequest}
            onSubmittingReview={handleSubmittingReview}
          />
        )}

        {activeView === "seller-dashboard" && (
          <SellerDashboard
            products={products}
            orders={orders}
            sellers={sellers}
            onAddProduct={handleAddProductBySeller}
            onEditProduct={handleEditProductBySeller}
            onDeleteProduct={handleDeleteProductBySeller}
            onUpdateOrderStatus={handleUpdateOrderStatusBySeller}
            onApplyForVerification={handleApplyForVerificationBySeller}
          />
        )}

        {activeView === "admin-panel" && (
          !isAdminAuthenticated ? (
            <AdminLogin 
              onLoginSuccess={() => {
                setIsAdminAuthenticated(true);
              }}
              lang={currentLang}
            />
          ) : (
            <AdminPanel
              users={users}
              sellers={sellers}
              products={products}
              orders={orders}
              coupons={coupons}
              onApproveSeller={handleApproveSellerByAdmin}
              onDeleteProduct={handleDeleteProductBySeller}
              onModifyUserBalance={handleModifyUserBalanceByAdmin}
              onAddNewCoupon={handleAddNewCouponByAdmin}
              onLockSession={() => setIsAdminAuthenticated(false)}
              onAddProduct={handleAddProductBySeller}
              onEditProduct={handleEditProductBySeller}
              onUpdateOrder={handleUpdateOrder}
            />
          )
        )}

        {activeView === "my-orders" && currentUser && (
          <UserOrdersPage
            orders={orders}
            currentUser={currentUser}
            lang={currentLang}
            onRequestCancel={handleRequestCancel}
            onRequestReturn={handleRequestReturnFull}
          />
        )}

        {activeView === "user-support" && currentUser && (
          <UserSupportPage
            orders={orders}
            currentUser={currentUser}
            lang={currentLang}
          />
        )}

        {activeView === "language-settings" && (
          <LanguageSettingsPage
            currentLang={currentLang}
            onLanguageChange={(newLang) => {
              setCurrentLang(newLang);
              saveState("currentLang", newLang);
            }}
          />
        )}

      </main>

      {/* Footer Branding Notes (Anti-tech indicators, respectful margins) */}
      <footer className="border-t py-10 text-xs text-neutral-400 dark:border-neutral-900 bg-white dark:bg-neutral-900/40 text-center space-y-2 mt-16" id="marketplace-footer">
        <p className="font-bold text-neutral-900 dark:text-white text-sm">
          NovaMart Enterprise Systems Ltd
        </p>
        <p>Copyright © 2026. All rights secured. 18% GST auto calculations, automated courier handoffs, and instant buyer protection protocols.</p>
        <div className="flex justify-center gap-4 text-red-500 font-semibold pt-2">
          <button onClick={() => setActiveView("catalog")} className="hover:underline">Catalog</button>
          <span>•</span>
          <button onClick={() => { handleRoleChange("seller"); setActiveView("seller-dashboard"); }} className="hover:underline">Seller Hub</button>
          <span>•</span>
          <button onClick={() => { handleRoleChange("admin"); setActiveView("admin-panel"); }} className="hover:underline">Audit Panel</button>
        </div>
      </footer>

      {/* Google Sign-In & Multi-lingual Complaints Slide-over Center */}
      <GoogleLoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginSuccess={(verifiedUser) => {
          setCurrentUser(verifiedUser);
          setActiveView("catalog");
        }}
      />

      <WishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        wishlist={wishlist}
        products={products}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
      />

      {justPlacedOrder && (
        <CheckoutSuccessOverlay
          order={justPlacedOrder}
          onClose={() => setJustPlacedOrder(null)}
          onNavigateToOrders={() => {
            setJustPlacedOrder(null);
            setActiveView("my-orders");
          }}
        />
      )}

      {/* Floating AI Customer Support Chatbox */}
      <SupportChatBox />

    </div>
  );
}
