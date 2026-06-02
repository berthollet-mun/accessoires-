import { create } from 'zustand';
import { offlineStorage } from '../services/offlineStorage';
import { CartItem, Product } from '../models/types';
import { maskProduct } from '../utils/productMask';

interface CartState {
  items: CartItem[];
  loadCart: () => Promise<void>;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  
  loadCart: async () => {
    let items = await offlineStorage.getCart();
    items = items.map(item => ({...item, product: maskProduct(item.product)}));
    const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    set({ items, total });
  },
  
  addItem: async (product: Product, quantity: number = 1) => {
    const { items } = get();
    const existing = items.find(i => i.product.id === product.id);
    const newItem = { product, quantity: existing ? existing.quantity + quantity : quantity };
    
    await offlineStorage.saveCartItem(newItem);
    await get().loadCart();
  },
  
  updateQuantity: async (productId: string, quantity: number) => {
    const { items } = get();
    const existing = items.find(i => i.product.id === productId);
    if (!existing) return;
    
    if (quantity <= 0) {
      await offlineStorage.removeCartItem(productId);
    } else {
      await offlineStorage.saveCartItem({ product: existing.product, quantity });
    }
    await get().loadCart();
  },
  
  removeItem: async (productId: string) => {
    await offlineStorage.removeCartItem(productId);
    await get().loadCart();
  },
  
  clearCart: async () => {
    await offlineStorage.clearCart();
    await get().loadCart();
  }
}));
