import { initializeApp } from "firebase/app";
import { 
  initializeFirestore,
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import { Product, Coupon, Order, SupportTicket, Seller, User } from "../types";
import { 
  INITIAL_PRODUCTS, 
  INITIAL_COUPONS, 
  INITIAL_SELLERS 
} from "../utils/mockData";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Help function to seed database if it's currently empty or has missing initial items
export async function seedDatabaseIfEmpty() {
  try {
    // 1. Seed Products
    const productsColRef = collection(db, "products");
    const productsSnapshot = await getDocs(productsColRef);
    if (productsSnapshot.empty) {
      console.log("Seeding products to Firestore...");
      for (const p of INITIAL_PRODUCTS) {
        await setDoc(doc(db, "products", p.id), p);
      }
    } else {
      // Seed any missing products to guarantee everything shows up
      const existingIds = new Set(productsSnapshot.docs.map(doc => doc.id));
      for (const p of INITIAL_PRODUCTS) {
        if (!existingIds.has(p.id)) {
          console.log(`Seeding missing product ${p.id} to Firestore...`);
          await setDoc(doc(db, "products", p.id), p);
        }
      }
    }

    // 2. Seed Coupons
    const couponsColRef = collection(db, "coupons");
    const couponsSnapshot = await getDocs(couponsColRef);
    if (couponsSnapshot.empty) {
      console.log("Seeding coupons to Firestore...");
      for (const c of INITIAL_COUPONS) {
        await setDoc(doc(db, "coupons", c.code), c);
      }
    } else {
      // Seed missing coupons
      const existingCodes = new Set(couponsSnapshot.docs.map(doc => doc.id));
      for (const c of INITIAL_COUPONS) {
        if (!existingCodes.has(c.code)) {
          console.log(`Seeding missing coupon ${c.code} to Firestore...`);
          await setDoc(doc(db, "coupons", c.code), c);
        }
      }
    }

    // 3. Seed Sellers
    const sellersColRef = collection(db, "sellers");
    const sellersSnapshot = await getDocs(sellersColRef);
    if (sellersSnapshot.empty) {
      console.log("Seeding sellers to Firestore...");
      for (const s of INITIAL_SELLERS) {
        await setDoc(doc(db, "sellers", s.id), s);
      }
    } else {
      // Seed missing sellers
      const existingIds = new Set(sellersSnapshot.docs.map(doc => doc.id));
      for (const s of INITIAL_SELLERS) {
        if (!existingIds.has(s.id)) {
          console.log(`Seeding missing seller ${s.id} to Firestore...`);
          await setDoc(doc(db, "sellers", s.id), s);
        }
      }
    }
  } catch (error) {
    console.error("Error seeding initial db content:", error);
    handleFirestoreError(error, OperationType.WRITE, "seeding");
  }
}

// Helper function to remove any keys with undefined values recursively (as Firestore does not support undefined values)
function cleanUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item)) as unknown as T;
  }
  if (typeof obj === "object") {
    const cleaned: any = {};
    for (const key of Object.keys(obj as any)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        cleaned[key] = cleanUndefined(val);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// Helpers to write/reset individual records in FireStore
export async function dbSaveProduct(product: Product) {
  try {
    await setDoc(doc(db, "products", product.id), cleanUndefined(product));
  } catch (err) {
    console.error("Firestore dbSaveProduct error:", err);
    handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
  }
}

export async function dbSaveOrder(order: Order) {
  try {
    await setDoc(doc(db, "orders", order.id), cleanUndefined(order));
  } catch (err) {
    console.error("Firestore dbSaveOrder error:", err);
    handleFirestoreError(err, OperationType.WRITE, `orders/${order.id}`);
  }
}

export async function dbSaveUser(user: User) {
  try {
    await setDoc(doc(db, "users", user.id), cleanUndefined(user));
  } catch (err) {
    console.error("Firestore dbSaveUser error:", err);
    handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
  }
}

export async function dbSaveTicket(ticket: SupportTicket) {
  try {
    await setDoc(doc(db, "tickets", ticket.id), cleanUndefined(ticket));
  } catch (err) {
    console.error("Firestore dbSaveTicket error:", err);
    handleFirestoreError(err, OperationType.WRITE, `tickets/${ticket.id}`);
  }
}

export async function dbSaveSeller(seller: Seller) {
  try {
    await setDoc(doc(db, "sellers", seller.id), cleanUndefined(seller));
  } catch (err) {
    console.error("Firestore dbSaveSeller error:", err);
    handleFirestoreError(err, OperationType.WRITE, `sellers/${seller.id}`);
  }
}

export async function dbSaveCoupon(coupon: Coupon) {
  try {
    await setDoc(doc(db, "coupons", coupon.code), cleanUndefined(coupon));
  } catch (err) {
    console.error("Firestore dbSaveCoupon error:", err);
    handleFirestoreError(err, OperationType.WRITE, `coupons/${coupon.code}`);
  }
}

export async function dbDeleteProduct(productId: string) {
  try {
    const { deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "products", productId));
  } catch (err) {
    console.error("Firestore dbDeleteProduct error:", err);
    handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
  }
}


