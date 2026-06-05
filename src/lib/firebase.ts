/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  collection, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  getDoc,
  query,
  orderBy,
  runTransaction
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, Order, AppConfig } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CONFIG } from '../data';

// Determine if we have valid Firebase credentials
const isFirebaseConfigured = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

let app;
let db: any = null;
let auth: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
    auth = getAuth(app);
    console.log("Firebase initialized successfully with credentials!");
  } catch (err) {
    console.error("Failed to initialize Firebase SDK:", err);
  }
} else {
  console.log("Using robust Client-Side standard localStorage for database persistence.");
}

// Ensure initial localStorage seeding
const seedLocalStorageIfNeeded = () => {
  if (!localStorage.getItem('arte_products')) {
    localStorage.setItem('arte_products', JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem('arte_config')) {
    localStorage.setItem('arte_config', JSON.stringify(INITIAL_CONFIG));
  }
  if (!localStorage.getItem('arte_orders')) {
    localStorage.setItem('arte_orders', JSON.stringify([]));
  }
};

// Error handling standard pattern
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// DB Service Export
export const dbService = {
  // Get active products
  getProducts: async (): Promise<Product[]> => {
    seedLocalStorageIfNeeded();
    if (isFirebaseConfigured && db) {
      try {
        const colRef = collection(db, 'products');
        const snap = await getDocs(colRef);
        if (snap.empty) {
          // Seed firestore if empty
          for (const item of INITIAL_PRODUCTS) {
            await setDoc(doc(colRef, item.id), item);
          }
          return INITIAL_PRODUCTS;
        }
        return snap.docs.map(d => d.data() as Product);
      } catch (err) {
        console.warn("Firestore products read failed, returning disk fallback:", err);
      }
    }
    return JSON.parse(localStorage.getItem('arte_products') || '[]');
  },

  // Save product (create or update)
  saveProduct: async (product: Product): Promise<void> => {
    seedLocalStorageIfNeeded();
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'products', product.id);
        await setDoc(docRef, product);
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
      }
    }
    // Fallback
    const products = JSON.parse(localStorage.getItem('arte_products') || '[]');
    const idx = products.findIndex((p: Product) => p.id === product.id);
    if (idx >= 0) {
      products[idx] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem('arte_products', JSON.stringify(products));
  },

  // Delete product
  deleteProduct: async (id: string): Promise<void> => {
    seedLocalStorageIfNeeded();
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'products', id));
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
      }
    }
    // Fallback
    const products = JSON.parse(localStorage.getItem('arte_products') || '[]');
    const filtered = products.filter((p: Product) => p.id !== id);
    localStorage.setItem('arte_products', JSON.stringify(filtered));
  },

  // Get config settings
  getConfig: async (): Promise<AppConfig> => {
    seedLocalStorageIfNeeded();
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'configs', 'main');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return snap.data() as AppConfig;
        } else {
          await setDoc(docRef, INITIAL_CONFIG);
          return INITIAL_CONFIG;
        }
      } catch (err) {
        console.warn("Firestore config read failed, returning disk fallback:", err);
      }
    }
    return JSON.parse(localStorage.getItem('arte_config') || '{}');
  },

  // Save config settings
  saveConfig: async (config: AppConfig): Promise<void> => {
    seedLocalStorageIfNeeded();
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'configs', 'main');
        await setDoc(docRef, config, { merge: true });
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'configs/main');
      }
    }
    // Fallback
    localStorage.setItem('arte_config', JSON.stringify(config));
  },

  // Get orders list
  getOrders: async (): Promise<Order[]> => {
    seedLocalStorageIfNeeded();
    if (isFirebaseConfigured && db) {
      try {
        // Query orders sorted by creation time
        const colRef = collection(db, 'orders');
        const q = query(colRef, orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as Order));
      } catch (err) {
        // Fallback to simpler unsorted fetch if rules are strictly enforced
        try {
          const snap = await getDocs(collection(db, 'orders'));
          return snap.docs.map(d => ({ ...d.data(), id: d.id } as Order));
        } catch (subErr) {
          console.warn("Firestore orders read failed, returning disk fallback:", subErr);
        }
      }
    }
    const orders = JSON.parse(localStorage.getItem('arte_orders') || '[]');
    // Sort descending by date
    return orders.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Create customized order
  createOrder: async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> => {
    seedLocalStorageIfNeeded();
    const createdAt = new Date().toISOString();
    
    if (isFirebaseConfigured && db) {
      try {
        // Generate a transaction to securely compute the next order number
        const cntRef = doc(db, 'configs', 'counters');
        let orderNumber = 1001;
        
        await runTransaction(db, async (transaction) => {
          const cntSnap = await transaction.get(cntRef);
          if (cntSnap.exists()) {
            orderNumber = (cntSnap.data().orderCount || 1000) + 1;
            transaction.update(cntRef, { orderCount: orderNumber });
          } else {
            transaction.set(cntRef, { orderCount: orderNumber });
          }
        });

        const newOrderRef = doc(collection(db, 'orders'));
        const finalOrder: Order = {
          ...orderData,
          id: newOrderRef.id,
          orderNumber,
          createdAt
        };
        
        await setDoc(newOrderRef, finalOrder);
        return finalOrder;
      } catch (err) {
        console.warn("Firestore transaction failed, falling back to simple save pattern:", err);
        // Fallback to simple add
        const id = "ord_" + Math.random().toString(36).substring(2, 9);
        const orderNumber = Math.floor(Math.random() * 9000) + 1000;
        const finalOrder: Order = {
          ...orderData,
          id,
          orderNumber,
          createdAt
        };
        try {
          await setDoc(doc(db, 'orders', id), finalOrder);
          return finalOrder;
        } catch (fallbackErr) {
          handleFirestoreError(fallbackErr, OperationType.WRITE, `orders/${id}`);
        }
      }
    }

    // LocalStorage Fallback
    const orders = JSON.parse(localStorage.getItem('arte_orders') || '[]');
    const orderNumber = orders.length > 0 
      ? Math.max(...orders.map((o: Order) => o.orderNumber)) + 1 
      : 1001;
    
    const id = "ord_" + Math.random().toString(36).substring(2, 9);
    const finalOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      createdAt
    };
    
    orders.push(finalOrder);
    localStorage.setItem('arte_orders', JSON.stringify(orders));
    return finalOrder;
  },

  // Update order (e.g. status)
  updateOrder: async (id: string, updates: Partial<Order>): Promise<void> => {
    seedLocalStorageIfNeeded();
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'orders', id), updates as any);
        return;
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `orders/${id}`);
      }
    }
    // Fallback
    const orders = JSON.parse(localStorage.getItem('arte_orders') || '[]');
    const idx = orders.findIndex((o: Order) => o.id === id);
    if (idx >= 0) {
      orders[idx] = { ...orders[idx], ...updates };
      localStorage.setItem('arte_orders', JSON.stringify(orders));
    }
  }
};

// Auth exports placeholders to keep app building properly
export const authInstance = auth;
export const isConfigured = isFirebaseConfigured;
export const testFirestoreConnection = async () => {
  if (isFirebaseConfigured && db) {
    try {
      const { getDocFromServer } = await import('firebase/firestore');
      await getDocFromServer(doc(db, 'test', 'connection'));
      console.log("Successfully validated connection to Firestore server!");
    } catch (error) {
      console.warn("Firestore getDocFromServer offline or unavailable:", error);
    }
  }
};
testFirestoreConnection();
