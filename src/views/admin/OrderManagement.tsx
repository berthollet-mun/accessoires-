import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, FileText, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { supabase } from '../../config/supabaseClient';
import { Order } from '../../models/types';

type OrderWithProfile = Order & {
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'USD',
});

export default function OrderManagement() {
  const [orders, setOrders] = useState<OrderWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*, profiles(first_name, last_name)').order('created_at', { ascending: false });
    if (data) setOrders(data as OrderWithProfile[]);
    setLoading(false);
  }

  const stats = useMemo(() => {
    const pending = orders.filter(order => order.status === 'pending').length;
    const paid = orders.filter(order => order.status === 'paid').length;
    const revenue = orders.filter(order => order.status !== 'cancelled').reduce((sum, order) => sum + Number(order.total_amount), 0);
    return { pending, paid, revenue };
  }, [orders]);

  const handleValidate = async (orderId: string) => {
    try {
      const { error } = await supabase.rpc('valider_commande', { p_order_id: orderId });
      if (error) throw error;

      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ order_id: orderId }),
      }).catch(console.error);

      const order = orders.find(item => item.id === orderId);
      if (order) {
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-push-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
          body: JSON.stringify({ user_id: order.user_id, title: 'Commande validee', message: `Commande #${orderId.split('-')[0]} payee et validee.` }),
        }).catch(console.error);
      }

      toast.success('Commande validee');
      fetchOrders();
    } catch (err: any) {
      toast.error('Validation echouee: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="admin-panel p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-primary-text/40 font-bold mb-2">Fulfillment center</div>
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-primary-text">Commandes et validations</h1>
          </div>
          <button onClick={fetchOrders} className="admin-action-button">
            <RefreshCw size={14} />
            Actualiser
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="rounded-2xl bg-primary/35 border border-base-border/5 p-4">
            <Clock size={18} className="text-accent-500 mb-5" />
            <div className="text-[10px] uppercase tracking-widest text-primary-text/40">En attente</div>
            <div className="text-3xl font-mono mt-1">{stats.pending}</div>
          </div>
          <div className="rounded-2xl bg-primary/35 border border-base-border/5 p-4">
            <CheckCircle2 size={18} className="text-emerald-300 mb-5" />
            <div className="text-[10px] uppercase tracking-widest text-primary-text/40">Payees</div>
            <div className="text-3xl font-mono mt-1">{stats.paid}</div>
          </div>
          <div className="rounded-2xl bg-primary/35 border border-base-border/5 p-4">
            <FileText size={18} className="text-blue-300 mb-5" />
            <div className="text-[10px] uppercase tracking-widest text-primary-text/40">Revenu</div>
            <div className="text-3xl font-mono mt-1">{currency.format(stats.revenue)}</div>
          </div>
        </div>
      </section>

      <section className="admin-panel overflow-hidden">
        <div className="p-6 border-b border-base-border/5 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-black text-primary-text/40">Order queue</span>
            <div className="text-xl font-display font-bold mt-1 text-primary-text">{orders.length} commandes</div>
          </div>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-primary-text/40 border-b border-base-border/5">
              <tr>
                <th className="pb-4 px-4 font-normal">ID / Date</th>
                <th className="pb-4 px-4 font-normal">Client</th>
                <th className="pb-4 px-4 font-normal">Montant</th>
                <th className="pb-4 px-4 font-normal">Statut</th>
                <th className="pb-4 px-4 font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-primary-text/40">Chargement des commandes...</td>
                </tr>
              ) : orders.length ? orders.map(order => (
                <tr key={order.id} className="hover:bg-primary/5 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-mono text-[10px] text-primary-text">#{order.id.split('-')[0]}</div>
                    <div className="text-[10px] text-primary-text/40 mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="py-4 px-4 font-bold text-primary-text">{order.profiles?.first_name ?? 'Client'} {order.profiles?.last_name ?? ''}</td>
                  <td className="py-4 px-4 text-accent-500 font-mono">{currency.format(Number(order.total_amount))}</td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 rounded-full text-[8px] font-bold tracking-widest uppercase border border-base-border/10 bg-primary/35">
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleValidate(order.id)}
                        className="bg-accent-500 hover:bg-accent-600 text-inverse px-4 py-2 rounded-xl text-[10px] font-bold tracking-[0.18em] uppercase transition-colors"
                      >
                        Valider
                      </button>
                    )}
                    {order.status === 'paid' && order.invoice_url && (
                      <a href={order.invoice_url} target="_blank" rel="noreferrer" className="text-primary-text/50 hover:text-primary-text text-[10px] tracking-widest font-bold uppercase transition-colors underline underline-offset-4 decoration-white/20">Facture</a>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-primary-text/40">Aucune commande pour le moment</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
