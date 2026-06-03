import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, ArrowRight, Boxes, DollarSign, PackageCheck, ReceiptText, ShoppingBag, Users } from 'lucide-react';

import { supabase } from '../../config/supabaseClient';
import { Product } from '../../models/types';
import { getCategoryLabel, sortCategories } from '../../utils/categories';

type OrderRow = {
  id: string;
  user_id: string | null;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  created_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

type DashboardState = {
  products: Product[];
  orders: OrderRow[];
  customers: number;
};

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'USD',
});

const categoryColors = ['#c9a05b', '#f2f2f2', '#78716c', '#60a5fa', '#34d399', '#f87171'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardState>({ products: [], orders: [], customers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const [productsResult, ordersResult, customersResult] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*, profiles(first_name, last_name)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);

      setData({
        products: (productsResult.data ?? []) as Product[],
        orders: (ordersResult.data ?? []) as OrderRow[],
        customers: customersResult.count ?? 0,
      });
      setLoading(false);
    }

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const paidOrders = data.orders.filter(order => order.status !== 'cancelled');
    const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const pendingOrders = data.orders.filter(order => order.status === 'pending').length;
    const lowStockProducts = data.products.filter(product => product.stock_quantity <= 5);
    const stockUnits = data.products.reduce((sum, product) => sum + product.stock_quantity, 0);
    const averageOrder = paidOrders.length ? revenue / paidOrders.length : 0;

    return {
      revenue,
      averageOrder,
      pendingOrders,
      lowStockProducts,
      stockUnits,
      conversionPulse: data.products.length && data.orders.length ? Math.min(98, 64 + data.orders.length * 3) : 64,
    };
  }, [data]);

  const categoryData = useMemo(() => {
    const categories = sortCategories(Array.from(new Set(data.products.map(product => product.category).filter(Boolean))) as string[]);
    return categories.map(category => ({
      name: getCategoryLabel(category),
      value: data.products.filter(product => product.category === category).length,
    }));
  }, [data.products]);

  const salesData = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      return {
        key,
        label: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        revenue: 0,
        orders: 0,
      };
    });

    data.orders.forEach(order => {
      const key = new Date(order.created_at).toISOString().slice(0, 10);
      const day = days.find(item => item.key === key);
      if (day && order.status !== 'cancelled') {
        day.revenue += Number(order.total_amount);
        day.orders += 1;
      }
    });

    return days;
  }, [data.orders]);

  const recentOrders = data.orders.slice(0, 5);

  const statCards = [
    { label: 'Revenu total', value: currency.format(stats.revenue), icon: DollarSign, tone: 'text-accent-500' },
    { label: 'Commandes', value: data.orders.length.toString(), icon: ReceiptText, tone: 'text-blue-300' },
    { label: 'Produits actifs', value: data.products.length.toString(), icon: Boxes, tone: 'text-emerald-300' },
    { label: 'Clients', value: data.customers.toString(), icon: Users, tone: 'text-purple-300' },
  ];

  if (loading) {
    return (
      <div className="grid gap-5">
        <div className="h-72 rounded-[2rem] admin-skeleton"></div>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="h-36 rounded-3xl admin-skeleton"></div>
          <div className="h-36 rounded-3xl admin-skeleton"></div>
          <div className="h-36 rounded-3xl admin-skeleton"></div>
          <div className="h-36 rounded-3xl admin-skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="admin-hero overflow-hidden p-8 lg:p-10 min-h-[320px] flex flex-col justify-between">
        <div className="relative z-10 max-w-3xl">
          <div className="text-[10px] uppercase tracking-[0.22em] text-inverse-text/50 font-bold mb-5">AURA commerce cockpit</div>
          <h1 className="text-4xl lg:text-6xl font-display font-bold tracking-tight text-inverse-text leading-tight">
            Tableau de bord clair pour piloter ventes, stock et operations.
          </h1>
        </div>
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-inverse-text/45">Panier moyen</div>
            <div className="text-2xl font-mono text-inverse-text mt-1">{currency.format(stats.averageOrder)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-inverse-text/45">En attente</div>
            <div className="text-2xl font-mono text-inverse-text mt-1">{stats.pendingOrders}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-inverse-text/45">Unites stock</div>
            <div className="text-2xl font-mono text-inverse-text mt-1">{stats.stockUnits}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-inverse-text/45">Pulse</div>
            <div className="text-2xl font-mono text-inverse-text mt-1">{stats.conversionPulse}%</div>
          </div>
        </div>
      </section>

      {stats.lowStockProducts.length > 0 && (
        <section className="admin-alert flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-primary-text">Stock faible detecte</div>
              <div className="text-xs text-primary-text/50">{stats.lowStockProducts.length} produit(s) avec 5 unites ou moins.</div>
            </div>
          </div>
          <Link to="/admin/products" className="admin-action-button">
            Corriger le stock
            <ArrowRight size={14} />
          </Link>
        </section>
      )}

      <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div key={card.label} className="admin-metric p-5 animate-admin-enter opacity-0" style={{ animationDelay: `${index * 70}ms` }}>
            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] uppercase tracking-[0.18em] text-primary-text/45 font-bold">{card.label}</span>
              <card.icon size={18} className={card.tone} />
            </div>
            <div className="text-3xl font-mono text-primary-text">{card.value}</div>
          </div>
        ))}
      </section>

      <section className="grid xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] gap-5">
        <div className="admin-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm uppercase tracking-[0.18em] font-bold text-primary-text">Ventes 7 jours</h2>
              <p className="text-xs text-primary-text/45 mt-1">Revenu et volume de commandes</p>
            </div>
            <ShoppingBag size={18} className="text-accent-500" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#c9a05b" stopOpacity={0.75} />
                    <stop offset="95%" stopColor="#c9a05b" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.35)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.35)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14 }} />
                <Area type="monotone" dataKey="revenue" stroke="#c9a05b" fill="url(#revenueGradient)" strokeWidth={3} animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm uppercase tracking-[0.18em] font-bold text-primary-text">Categories</h2>
              <p className="text-xs text-primary-text/45 mt-1">Repartition catalogue</p>
            </div>
            <PackageCheck size={18} className="text-accent-500" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} innerRadius={58} outerRadius={95} dataKey="value" paddingAngle={4} animationDuration={900}>
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.name} fill={categoryColors[index % categoryColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid xl:grid-cols-[minmax(340px,0.75fr)_minmax(0,1.25fr)] gap-5">
        <div className="admin-panel p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm uppercase tracking-[0.18em] font-bold text-primary-text">Stock sensible</h2>
            <Link to="/admin/products" className="text-[10px] uppercase tracking-widest text-accent-500 hover:text-primary-text transition-colors">Inventaire</Link>
          </div>
          <div className="flex flex-col gap-3">
            {(stats.lowStockProducts.length ? stats.lowStockProducts : data.products.slice(0, 4)).map(product => (
              <div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl bg-primary/35 border border-base-border/5 p-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-primary-text truncate">{product.name}</div>
                  <div className="text-[10px] uppercase tracking-widest text-primary-text/35 mt-1">{getCategoryLabel(product.category)}</div>
                </div>
                <div className={`text-sm font-mono ${product.stock_quantity <= 5 ? 'text-red-400' : 'text-primary-text/60'}`}>{product.stock_quantity}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-panel p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm uppercase tracking-[0.18em] font-bold text-primary-text">Commandes recentes</h2>
            <Link to="/admin/orders" className="text-[10px] uppercase tracking-widest text-accent-500 hover:text-primary-text transition-colors">Voir tout</Link>
          </div>
          {recentOrders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] uppercase tracking-widest text-primary-text/35">
                  <tr>
                    <th className="py-3 font-normal">Commande</th>
                    <th className="py-3 font-normal">Client</th>
                    <th className="py-3 font-normal">Montant</th>
                    <th className="py-3 font-normal">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td className="py-4 font-mono text-primary-text/70">#{order.id.split('-')[0]}</td>
                      <td className="py-4 text-primary-text/75">{order.profiles?.first_name ?? 'Client'} {order.profiles?.last_name ?? ''}</td>
                      <td className="py-4 text-accent-500 font-mono">{currency.format(Number(order.total_amount))}</td>
                      <td className="py-4">
                        <span className="rounded-full bg-primary/50 border border-base-border/10 px-3 py-1 text-[10px] uppercase tracking-widest text-primary-text/60">{order.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="min-h-44 flex items-center justify-center text-sm text-primary-text/40 border border-base-border/5 rounded-2xl">Aucune commande pour le moment</div>
          )}
        </div>
      </section>
    </div>
  );
}
