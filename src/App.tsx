import { useEffect, useState } from 'react';
import AppRoutes from './routes';
import { syncService } from './services/syncService';
import { useAuth } from './hooks/useAuth';
import { pushNotificationService } from './services/pushNotificationService';
import { useCartStore } from './store/useCartStore';

export default function App() {
  const { session } = useAuth();
  const [booting, setBooting] = useState(true);
  const loadCart = useCartStore(state => state.loadCart);

  useEffect(() => {
    // Init offline sync
    syncService.init();
    // Load cart from IndexedDB
    loadCart();
    const timer = window.setTimeout(() => setBooting(false), 650);
    return () => window.clearTimeout(timer);
  }, [loadCart]);

  useEffect(() => {
    if (session?.user) {
      pushNotificationService.register(session.user.id);
    }
  }, [session]);

  if (booting) {
    return (
      <div className="aura-boot">
        <div className="flex flex-col items-center gap-6">
          <div className="text-3xl font-display font-bold tracking-[0.35em]">AURA</div>
          <div className="aura-boot__bar"></div>
        </div>
      </div>
    );
  }

  return <AppRoutes />;
}
