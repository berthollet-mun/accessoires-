import { offlineStorage } from './offlineStorage';
import { supabase } from '../config/supabaseClient';
import toast from 'react-hot-toast';

export const syncService = {
  async syncPendingOrders() {
    if (!navigator.onLine) return;

    try {
      const queue = await offlineStorage.getSyncQueue();
      if (queue.length === 0) return;

      for (const item of queue) {
        if (item.action === 'ORDER_CREATE') {
          const { user_id, cartItems, total_amount } = item.payload;
          
          // 1. Create order
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({ user_id, total_amount })
            .select()
            .single();

          if (orderError) throw orderError;

          // 2. Create order items
          const orderItemsData = cartItems.map((ci: any) => ({
            order_id: order.id,
            product_id: ci.product.id,
            quantity: ci.quantity,
            unit_price: ci.product.price,
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsData);

          if (itemsError) throw itemsError;

          // Remove from queue if successful
          await offlineStorage.removeSyncItem(item.id);
        }
      }
      toast.success('Offline orders synced successfully');
    } catch (error) {
      console.error('Error syncing:', error);
      toast.error('Failed to sync some offline data');
    }
  },

  init() {
    window.addEventListener('online', this.syncPendingOrders);
    // Attempt sync on startup
    this.syncPendingOrders();
  }
};
