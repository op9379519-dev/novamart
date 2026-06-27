import { Product, Coupon, Order, SupportTicket, Seller, Address, User } from "../types";

// High quality Unsplash E-Commerce Images mapped to popular Indian Products
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "boAt Nirvanaa 751 ANC Wireless Headphone",
    price: 3999.00,
    originalPrice: 7990.00,
    description: "Experience legendary Indian sound with Hybrid Active Noise Cancellation (up to 33dB), 40mm premium drivers, and ASAP Fast Charge technology. Designed for long listening comfort with soft ergonomic memory foam earcups.",
    sellerId: "seller-1",
    sellerName: "AeroTech Audio India",
    category: "Tech & Gadgets",
    brand: "boAt",
    rating: 4.8,
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800"
    ],
    specifications: {
      "Guarantee / Warranty": "1 Year Official Brand Warranty (Includes hassle-free doorstep pickup & replacement)",
      "ANC Suppression": "Hybrid Active Noise Cancellation (Up to 33dB)",
      "Battery Playback": "Up to 65 Hours with ANC off (ASAP charge: 10 mins = 10 Hours playback)",
      "Sound Profile": "40mm Drivers with boAt Signature Deep Bass",
      "Wireless Version": "Bluetooth v5.0 with Instant Dual-Device Pairing"
    },
    variants: [
      { name: "Color", options: ["Active Black", "Bold Blue", "Gunmetal Grey"] }
    ],
    reviews: [
      { id: "rev-1", productId: "prod-1", buyerName: "Rohan Sharma", rating: 5, comment: "Awesome ANC under 5k! Signature bass works wonderfully.", date: "2026-05-18", status: "approved" },
      { id: "rev-2", productId: "prod-1", buyerName: "Ananya Iyer", rating: 4, comment: "Comforter cushions are really soft. Good battery backup for work.", date: "2026-06-02", status: "approved" }
    ],
    featured: true,
    bestSeller: true
  },
  {
    id: "prod-2",
    name: "Noise ColorFit Ultra 3 Smartwatch (AMOLED)",
    price: 2999.00,
    originalPrice: 5999.00,
    description: "Elegant smartwatch featuring a brilliant 1.96-inch HD AMOLED display, seamless Bluetooth calling, premium functional crown control, and 100+ sports tracking parameters. Fits completely in your premium active lifestyle.",
    sellerId: "seller-2",
    sellerName: "Moderna Retail India",
    category: "Tech & Gadgets",
    brand: "Noise",
    rating: 4.6,
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800"
    ],
    specifications: {
      "Guarantee / Warranty": "1 Year Standard Manufacturer Warranty against hardware & sensor defects",
      "Display Screen": "1.96\" AMOLED (410*502 Pixels, Always-on Display support)",
      "Health Sensors": "Continuous Heart Rate tracker, SpO2 sensor, Sleep Analyzer",
      "Battery Life": "Up to 7 Days on normal use, 2 Days with extensive BT calling",
      "IP Rating": "IP68 Certified Water & Dust Resistant"
    },
    variants: [
      { name: "Strap", options: ["Jet Black Silicone", "Mist Grey Suede", "Rose Gold Chain"] }
    ],
    reviews: [
      { id: "rev-3", productId: "prod-2", buyerName: "Karan Johar", rating: 5, comment: "Brilliant UI and screen is extremely sharp even in direct Indian sunlight.", date: "2026-06-11", status: "approved" }
    ],
    bestSeller: true
  },
  {
    id: "prod-3",
    name: "OnePlus Nord CE 4 Lite 5G (Super Blue)",
    price: 19999.00,
    originalPrice: 22999.00,
    description: "Get flagship clarity with the ultra-efficient 50MP Sony LYT-600 Main Camera with optical image stabilization (OIS). Runs on reliable Snapdragon octa-core system with massive 5500mAh long battery.",
    sellerId: "seller-1",
    sellerName: "AeroTech Audio India",
    category: "Tech & Gadgets",
    brand: "OnePlus",
    rating: 4.9,
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800"
    ],
    specifications: {
      "Guarantee / Warranty": "1 Year National OnePlus India Brand Warranty (For phone), 6 Months Box Chargers Warranty",
      "Main Camera": "50MP Sony LYT-600 OIS + 2MP Portrait Lens, 16MP Selfie Camera",
      "In-Box Adapter": "80W SUPERVOOC extremely fast adapter included",
      "RAM & Processor": "8GB LPDDR4X RAM paired with Snapdragon 695 5G",
      "Screen Type": "120Hz Ultra Bright AMOLED Eye-care display panel"
    },
    variants: [
      { name: "Storage Variant", options: ["128GB Storage", "256GB Storage"] }
    ],
    reviews: [
      { id: "rev-4", productId: "prod-3", buyerName: "Vikram Malhotra", rating: 5, comment: "Camera takes beautiful daylight photos. Under 20k, it's a solid 5G buy.", date: "2026-04-30", status: "approved" }
    ],
    featured: true,
    flashSale: true
  },
  {
    id: "prod-4",
    name: "Philips Elite 2100W Induction Cooktop",
    price: 3499.00,
    originalPrice: 4995.00,
    description: "Specifically customized for healthy Indian household cooking. Offers smart auto presets for Chappati, Deep Fry, Gravy, and Milk boiling. Employs ceramic glass finish touchscreen.",
    sellerId: "seller-3",
    sellerName: "BrewCraft India",
    category: "Home & Smart Living",
    brand: "Philips",
    rating: 4.7,
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800"
    ],
    specifications: {
      "Guarantee / Warranty": "2 Year Comprehensive Service Warranty across any authorized Philips Customer Centers",
      "Heater Output": "2100 Watts Induction Thermal Speed System",
      "Cooking Presets": "Roti/Paratha, Milk Warm, Deep Fry, Manual Temperature Lock",
      "Glass Top Styling": "Premium scratchproof high-temperature induction ceramic plate"
    },
    variants: [
      { name: "Button Panel", options: ["Feather-Touch Panel", "Soft-Press Mechanical Buttons"] }
    ],
    reviews: [],
    flashSale: true
  },
  {
    id: "prod-5",
    name: "Puma Nitro-Comfort Running Sports Shoes",
    price: 4500.00,
    originalPrice: 8999.00,
    description: "Walk and run with endless cushioning comfort. Imbued with active NITRO Foam technology, giving explosive response with high durability. Best traction profile crafted for streets.",
    sellerId: "seller-2",
    sellerName: "Moderna Retail India",
    category: "Apparel & Fashion",
    brand: "Puma",
    rating: 4.5,
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"
    ],
    specifications: {
      "Guarantee / Warranty": "3 Months Brand Manufacturing Warranty",
      "Sole Component": "PUMAGRIP high-traction multi-terrain rubber outsole",
      "Midsole Type": "NITRO Premium lightweight nitrogen-infused foam",
      "Shoe Weight": "Approx. 245 grams for enhanced marathon pace"
    },
    variants: [
      { name: "UK Size", options: ["UK 7", "UK 8", "UK 9", "UK 10"] }
    ],
    reviews: [
      { id: "rev-5", productId: "prod-5", buyerName: "Siddharth Sen", rating: 4, comment: "Fits perfectly. Comfortable foam cushion is really good for afternoon running.", date: "2026-06-19", status: "approved" }
    ]
  },
  {
    id: "prod-6",
    name: "Premium Silk Banarasi Saree (Gold Embroidered)",
    price: 5500.00,
    originalPrice: 12000.00,
    description: "Elegance directly handcrafted by traditional weavers of Banaras. Authentic mulberry silk base interwoven with magnificent gold and silver zari embroidery work. Perfect for weddings and festivals.",
    sellerId: "seller-3",
    sellerName: "BrewCraft India",
    category: "Apparel & Fashion",
    brand: "Saree Heritage",
    rating: 4.4,
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1614009187357-be079f990a51?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800"
    ],
    specifications: {
      "Quality Certificate": "Silk Mark Certified 100% pure premium mulberry silk threads",
      "Zari Composition": "Authentic silver & gold leaf plated zari woven embroidery borders",
      "Length & Pieces": "5.5 Meters drape + 0.8 Meters matching running unstitched blouse piece"
    },
    variants: [
      { name: "Color Theme", options: ["Traditional Crimson Saree", "Royal Emerald Green Saree", "Sunset Golden Saree"] }
    ],
    reviews: []
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  { code: "NOVAMART1000", discountValue: 1000, type: "fixed", expiryDate: "2026-12-31", minOrderValue: 5000, description: "Save ₹1000 flat on Indian purchases above ₹5000" },
  { code: "FESTIVE20", discountValue: 20, type: "percent", expiryDate: "2026-10-15", minOrderValue: 2000, description: "Get 20% off on special items over ₹2000" },
  { code: "VIPWELCOME", discountValue: 15, type: "percent", expiryDate: "2026-08-30", minOrderValue: 0, description: "15% off discount voucher valid for new store sign-ups" }
];

export const INITIAL_SELLERS: Seller[] = [
  { id: "seller-1", businessName: "AeroTech Audio India", description: "Premium Indian music products, certified headphones, gaming speakers, and premium keyboards.", rating: 4.8, status: "approved", ownerId: "user-seller-1", totalSales: 0, balance: 0 },
  { id: "seller-2", businessName: "Moderna Retail India", description: "Classy designer smartwatches, high luxury clothing items, and Indian custom wear collections.", rating: 4.6, status: "approved", ownerId: "user-seller-2", totalSales: 0, balance: 0 },
  { id: "seller-3", businessName: "BrewCraft India", description: "Carefully sourced lifestyle essentials, high technology home stoves, and premium traditional sarees.", rating: 4.7, status: "approved", ownerId: "user-seller-3", totalSales: 0, balance: 0 },
  { id: "seller-4", businessName: "FutureWear Athletics", description: "Advanced eco-friendly bio-mesh activewear and high-durability trail footwear.", rating: 0, status: "pending", ownerId: "user-seller-4", totalSales: 0, balance: 0 }
];

export const INITIAL_ADDRESSES: Address[] = [];

export const CURRENT_USER: User = {
  id: "cust-1",
  name: "Om Rupchandani",
  email: "omrupchandani6@gmail.com",
  role: "customer",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
  balance: 0.00, // Loyalty wallet in ₹ cleared
  loyaltyPoints: 0,
  savedAddresses: INITIAL_ADDRESSES
};

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_TICKETS: SupportTicket[] = [];

// LocalStorage and SessionStorage helpers to simulate robust local database state with session expiration
export function getSavedState<T>(key: string, defaultData: T): T {
  if (typeof window === "undefined") return defaultData;

  // Use sessionStorage for session-only keys (currentUser, isAdminAuthenticated) so closing the tab/window auto-logs them out
  const isSessionKey = key === "currentUser" || key === "isAdminAuthenticated";
  const storage = isSessionKey ? sessionStorage : localStorage;

  const saved = storage.getItem(`novamartv5_${key}`);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Auto-restore any missing default items to guarantee everyone sees all premium products
      if (key === "products" && Array.isArray(parsed) && Array.isArray(defaultData)) {
        const existingIds = new Set(parsed.map((p: any) => p.id));
        const merged = [...parsed];
        let changed = false;
        for (const item of defaultData) {
          if (!existingIds.has(item.id)) {
            merged.push(item);
            changed = true;
          }
        }
        if (changed) {
          storage.setItem(`novamartv5_${key}`, JSON.stringify(merged));
          return merged as unknown as T;
        }
      }
      if (key === "coupons" && Array.isArray(parsed) && Array.isArray(defaultData)) {
        const existingCodes = new Set(parsed.map((c: any) => c.code));
        const merged = [...parsed];
        let changed = false;
        for (const item of defaultData) {
          if (!existingCodes.has(item.code)) {
            merged.push(item);
            changed = true;
          }
        }
        if (changed) {
          storage.setItem(`novamartv5_${key}`, JSON.stringify(merged));
          return merged as unknown as T;
        }
      }
      if (key === "sellers" && Array.isArray(parsed) && Array.isArray(defaultData)) {
        const existingIds = new Set(parsed.map((s: any) => s.id));
        const merged = [...parsed];
        let changed = false;
        for (const item of defaultData) {
          if (!existingIds.has(item.id)) {
            merged.push(item);
            changed = true;
          }
        }
        if (changed) {
          storage.setItem(`novamartv5_${key}`, JSON.stringify(merged));
          return merged as unknown as T;
        }
      }
      return parsed;
    } catch (e) {
      console.error(e);
    }
  }
  // Store default if not initialized
  storage.setItem(`novamartv5_${key}`, JSON.stringify(defaultData));
  return defaultData;
}

export function saveState<T>(key: string, data: T): void {
  if (typeof window !== "undefined") {
    const isSessionKey = key === "currentUser" || key === "isAdminAuthenticated";
    const storage = isSessionKey ? sessionStorage : localStorage;
    storage.setItem(`novamartv5_${key}`, JSON.stringify(data));
  }
}
