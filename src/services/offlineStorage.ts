import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { CartItem } from '../models/types';

interface LuxeDB extends DBSchema {
  cart: {
    key: string;
    value: CartItem;
  };
  sync_queue: {
    key: string;
    value: {
      id: string;
      action: 'ORDER_CREATE';
      payload: any;
      created_at: number;
    }
  };
}

let dbPromise: Promise<IDBPDatabase<LuxeDB>> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<LuxeDB>('luxe-store', 1, {
      upgrade(db) {
        db.createObjectStore('cart', { keyPath: 'product.id' });
        db.createObjectStore('sync_queue', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
};

export const offlineStorage = {
  async getCart(): Promise<CartItem[]> {
    const db = await getDB();
    return db.getAll('cart');
  },
  async saveCartItem(item: CartItem) {
    const db = await getDB();
    await db.put('cart', item);
  },
  async removeCartItem(productId: string) {
    const db = await getDB();
    await db.delete('cart', productId);
  },
  async clearCart() {
    const db = await getDB();
    await db.clear('cart');
  },
  async queueAction(action: 'ORDER_CREATE', payload: any) {
    const db = await getDB();
    await db.put('sync_queue', {
      id: crypto.randomUUID(),
      action,
      payload,
      created_at: Date.now()
    });
  },
  async getSyncQueue() {
    const db = await getDB();
    return db.getAll('sync_queue');
  },
  async removeSyncItem(id: string) {
    const db = await getDB();
    await db.delete('sync_queue', id);
  }
};
