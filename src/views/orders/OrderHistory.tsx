import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Order } from '../../models/types';
import { useAuth } from '../../hooks/useAuth';
import { OrderDetailModal } from '../../components/OrderDetailModal';
import toast from 'react-hot-toast';

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    async function fetchOrders() {
      if (!session?.user) return;
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (data) setOrders(data);
      setLoading(false);
    }
    fetchOrders();

    if (!session?.user) return;

    // Real-time subscription to notifications
    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload: any) => {
          const newNotif = payload.new;
          toast.success(`${newNotif.title}\n${newNotif.body}`, { duration: 5000 });
          // Optionally refresh orders if it's an order notification
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid': return 'text-green-500 bg-green-500/10 border border-green-500/20';
      case 'shipped': return 'text-blue-500 bg-blue-500/10 border border-blue-500/20';
      case 'delivered': return 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20';
      case 'cancelled': return 'text-red-500 bg-red-500/10 border border-red-500/20';
      case 'pending': return 'text-amber-500 bg-amber-500/10 border border-amber-500/20';
      default: return 'text-primary-text bg-primary/10 border border-base-border/20';
    }
  };

  if (loading) return <div className="text-primary-text/50 font-mono text-[10px] animate-pulse">Chargement des commandes...</div>;

  return (
    <>
      <OrderDetailModal 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-light text-primary-text mb-10 tracking-wide uppercase">Historique des Commandes</h1>
        
        {orders.length === 0 ? (
          <div className="bg-secondary border border-base-border/5 rounded-3xl p-12 text-center text-primary-text/50 font-mono text-[11px] uppercase tracking-widest">
            Aucune commande trouvée.
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map(order => (
              <div 
                key={order.id} 
                className="p-6 border border-base-border/5 rounded-3xl bg-secondary flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:bg-primary/5 transition-colors group"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex flex-col items-center justify-center text-primary-text/40 border border-base-border/10 group-hover:border-accent-500 transition-colors">
                    <span className="text-[9px] uppercase tracking-widest font-bold font-sans">CMD</span>
                    <span className="text-[10px] font-mono">#{order.id.split('-')[0].substring(0, 4)}</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-primary-text mb-1 tracking-widest uppercase">{new Date(order.created_at).toLocaleDateString()}</div>
                    <div className="text-xl font-sans font-medium text-accent-500">{order.total_amount.toFixed(2)}$</div>
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
