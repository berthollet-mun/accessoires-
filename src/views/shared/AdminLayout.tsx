import { Link, NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Boxes, ChevronLeft, LayoutDashboard, QrCode, ReceiptText, Sparkles } from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Inventaire', icon: Boxes },
  { to: '/admin/orders', label: 'Commandes', icon: ReceiptText },
  { to: '/admin/qr', label: 'Terminal QR', icon: QrCode },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-primary text-primary-text font-sans relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_10%,rgba(201,160,91,0.12),transparent_28%),radial-gradient(circle_at_90%_5%,rgba(255,255,255,0.08),transparent_24%)]"></div>
      <div className="relative z-10 w-full min-h-screen px-4 py-5 lg:px-8 lg:py-8">
        <div className="w-full max-w-[1560px] mx-auto grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-5 lg:gap-7 min-h-[calc(100vh-4rem)]">
          <aside className="admin-shell-card lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] p-6 lg:p-8 flex flex-col gap-8 animate-admin-enter">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link to="/admin" className="font-bold tracking-[0.22em] font-display text-2xl text-primary-text uppercase">
                  AURA <span className="text-accent-500">ADMIN</span>
                </Link>
                <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-primary-text/40">
                  <Sparkles size={12} className="text-accent-500" />
                  Commerce control
                </div>
              </div>
              <div className="hidden lg:flex h-11 w-11 items-center justify-center rounded-2xl border border-base-border/10 bg-primary/40 text-accent-500">
                <BarChart3 size={18} />
              </div>
            </div>

            <nav className="flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.14em]">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${
                      isActive
                        ? 'bg-accent-500 text-inverse shadow-[0_18px_60px_rgba(201,160,91,0.18)]'
                        : 'text-primary-text/50 hover:bg-primary/50 hover:text-primary-text'
                    }`
                  }
                >
                  <Icon size={16} className="transition-transform duration-300 group-hover:scale-110" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-4">
              <div className="rounded-2xl border border-base-border/10 bg-primary/35 p-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-primary-text/40 mb-2">Statut boutique</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary-text">En ligne</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_18px_rgba(34,197,94,0.85)] animate-pulse"></span>
                </div>
              </div>

              <Link to="/" className="text-[10px] font-mono tracking-widest uppercase text-primary-text/35 hover:text-primary-text transition-colors flex items-center gap-2">
                <ChevronLeft size={14} />
                Retour a la boutique
              </Link>
            </div>
          </aside>

          <main className="min-h-[calc(100vh-4rem)] pb-16 animate-admin-enter [animation-delay:80ms] opacity-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
