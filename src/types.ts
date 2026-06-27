export type UserRole = 'customer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  balance: number; // for Loyalty cash/wallet
  loyaltyPoints: number;
  savedAddresses: Address[];
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  email: string;
  houseNo: string;
  building: string;
  street: string;
  city: string;
  state: string;
  zipCode: string; // pincode
  pincode?: string; // compatibility pincode string
  details?: string; // compatibility details string
  landmark: string;
  isDefault: boolean;
}

export interface Seller {
  id: string;
  businessName: string;
  description: string;
  rating: number;
  status: 'pending' | 'approved';
  ownerId: string;
  totalSales: number;
  balance: number;
}

export interface ProductVariant {
  name: string; // e.g. Color, Size
  options: string[]; // e.g. ['Red', 'Blue']
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  sellerId: string;
  sellerName: string;
  category: string;
  brand: string;
  rating: number;
  stock: number;
  images: string[];
  specifications: Record<string, string>;
  variants: ProductVariant[];
  reviews: Review[];
  featured?: boolean;
  bestSeller?: boolean;
  flashSale?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  buyerName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'approved' | 'moderated';
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  variantSelections: Record<string, string>;
  sellerId: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
  items: OrderItem[];
  subtotal: number;
  gst: number;
  discount: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: 'stripe' | 'razorpay' | 'cod' | 'wallet';
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  invoicePdfUrl?: string;
  returnRequest?: ReturnRequest;
  cancelRequest?: CancelRequest;
  shippedFrom?: string;
  currentLocation?: string;
  trackingEvents?: { status: string; location: string; timestamp: string }[];
}

export interface CancelRequest {
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

export interface ReturnRequest {
  reason: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  requestedAt: string;
}

export interface Coupon {
  code: string;
  discountValue: number;
  type: 'fixed' | 'percent';
  expiryDate: string;
  minOrderValue: number;
  description: string;
}

export interface SupportMessage {
  id: string;
  sender: 'user' | 'agent' | 'ai';
  text: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  buyerId: string;
  buyerName: string;
  subject: string;
  status: 'open' | 'closed';
  messages: SupportMessage[];
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalSellers: number;
  totalProducts: number;
}
