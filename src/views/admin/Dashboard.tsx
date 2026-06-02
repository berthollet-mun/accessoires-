import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, lowStock: 0 });

  useEffect(() => {
    async function loadStats() {
      const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { data: orders } = await supabase.from('orders').select('total_amount, status');
      const { count: lowStockCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).lt('stock_quantity', 5);
      
      const revenue = orders?.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total_amount, 0) || 0;

      setStats({
        products: prodCount || 0,
        orders: orders?.length || 0,
        revenue,
        lowStock: lowStockCount || 0
      });
    }
    loadStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[minmax(180px,_auto)]">
      
      {stats.lowStock > 0 && (
        <div className="md:col-span-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">⚠️ Stock faible détecté</span>
            <span className="text-xs">{stats.lowStock} produits ont une quantité en stock inférieure à 5.</span>
          </div>
          <Link to="/admin/products" className="text-[10px] uppercase tracking-widest font-bold px-4 py-2 bg-red-500/10 rounded-full hover:bg-red-500/20 transition-colors">
            Voir l'inventaire
          </Link>
        </div>
      )}
      
      <div className="md:col-span-12 bg-white rounded-3xl p-10 flex flex-col justify-center text-inverse">
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-inverse/40 mb-2">Overview</div>
        <div className="text-4xl font-serif italic mb-6">Store Performance</div>
        
        <div className="grid grid-cols-3 gap-8 border-t border-inverse/10 pt-8 mt-auto">
           <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-inverse/40 mb-1">Total Revenue</div>
            <div className="text-3xl font-mono">${stats.revenue.toFixed(2)}</div>
           </div>
           <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-inverse/40 mb-1">Active Orders</div>
            <div className="text-3xl font-mono">{stats.orders}</div>
           </div>
           <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-inverse/40 mb-1 items-center flex gap-2">
              Live Products
              {stats.lowStock > 0 && (
                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full" title={`${stats.lowStock} products with low stock`}>
                  {stats.lowStock} Low Stock
                </span>
              )}
            </div>
            <div className="text-3xl font-mono">{stats.products}</div>
           </div>
        </div>
      </div>

      <div className="md:col-span-8 bg-[#121212] border border-base-border/5 rounded-3xl p-8 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-12">
          <span className="text-[10px] uppercase tracking-widest text-primary-text/40 font-bold">System Health</span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
        <div>
          <div className="text-3xl font-mono text-primary-text mb-2">99.9%</div>
          <div className="flex gap-1">
            <div className="h-1 flex-1 bg-[#C5A059] rounded-full"></div>
            <div className="h-1 flex-1 bg-[#C5A059] rounded-full"></div>
            <div className="h-1 flex-1 bg-[#C5A059] rounded-full"></div>
            <div className="h-1 flex-1 bg-primary/10 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="md:col-span-4 bg-[#C5A059] rounded-3xl p-8 flex flex-col items-center justify-center text-inverse group cursor-pointer transition-transform hover:scale-[1.02]">
        <div className="w-16 h-16 border-2 border-inverse border-dashed rounded-2xl mb-4 flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h3m-3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <span className="font-black uppercase tracking-[0.2em] text-xs">Admin Config</span>
      </div>

    </div>
  );
}
