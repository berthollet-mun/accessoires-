import { useEffect } from 'react';
import AppRoutes from './routes';
import { syncService } from './services/syncService';
import { useAuth } from './hooks/useAuth';
import { pushNotificationService } from './services/pushNotificationService';
import { useCartStore } from './store/useCartStore';

export default function App() {
  const { session } = useAuth();
  const loadCart = useCartStore(state => state.loadCart);

  useEffect(() => {
    // Init offline sync
    syncService.init();
    // Load cart from IndexedDB
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    if (session?.user) {
      pushNotificationService.register(session.user.id);
    }
  }, [session]);

  return <AppRoutes />;
}
