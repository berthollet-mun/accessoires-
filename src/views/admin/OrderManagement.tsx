import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Order } from '../../models/types';
import toast from 'react-hot-toast';

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*, profiles(first_name, last_name)').order('created_at', { ascending: false });
    if (data) setOrders(data);
  }

  const handleValidate = async (orderId: string) => {
    try {
      const { error } = await supabase.rpc('valider_commande', { p_order_id: orderId });
      if (error) throw error;
      
      // Call edge functions
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ order_id: orderId })
      }).catch(console.error);

      // Trigger push via backend
      const order = orders.find(o => o.id === orderId);
      if (order) {
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-push-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
          body: JSON.stringify({ user_id: order.user_id, title: "Order Validated", message: `Order #${orderId.split('-')[0]} has been paid and validated.` })
        }).catch(console.error);
      }

      toast.success('Order Validated successfully');
      fetchOrders();
    } catch (err: any) {
      toast.error('Validation failed: ' + err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="md:col-span-12 bg-[#121212] border border-base-border/5 rounded-3xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-base-border/5 flex justify-between items-center bg-[#C5A059] text-inverse">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-black">Fulfillment Center</span>
            <div className="text-xl font-serif italic mt-1">Order Queue</div>
          </div>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-primary-text/40 border-b border-base-border/5">
              <tr>
                <th className="pb-4 px-4 font-normal">ID / Date</th>
                <th className="pb-4 px-4 font-normal">Customer</th>
                <th className="pb-4 px-4 font-normal">Amount</th>
                <th className="pb-4 px-4 font-normal">Status</th>
                <th className="pb-4 px-4 font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((o: any) => (
                <tr key={o.id} className="hover:bg-primary/5 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-mono text-[10px] text-primary-text">#{o.id.split('-')[0]}</div>
                    <div className="text-[10px] text-primary-text/40 mt-1">{new Date(o.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="py-4 px-4 font-bold text-primary-text">{o.profiles?.first_name} {o.profiles?.last_name}</td>
                  <td className="py-4 px-4 text-[#C5A059] font-serif italic">${o.total_amount.toFixed(2)}</td>
                  <td className="py-4 px-4">
                     <span className="px-2 py-1 rounded-md text-[8px] font-bold tracking-widest uppercase border border-base-border/10 bg-primary/5">
                      {o.status}
                     </span>
                  </td>
                  <td className="py-4 px-4">
                    {o.status === 'pending' && (
                      <button 
                        onClick={() => handleValidate(o.id)}
                        className="bg-white hover:bg-[#C5A059] text-inverse px-4 py-2 rounded-xl text-[10px] font-bold tracking-[0.2em] uppercase transition-colors"
                      >
                        Validate
                      </button>
                    )}
                    {o.status === 'paid' && o.invoice_url && (
                      <a href={o.invoice_url} target="_blank" rel="noreferrer" className="text-primary-text/50 hover:text-primary-text text-[10px] tracking-widest font-bold uppercase transition-colors underline underline-offset-4 decoration-white/20">Invoice</a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
