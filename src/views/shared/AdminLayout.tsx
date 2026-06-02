import { Outlet, Link } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-primary flex justify-center text-primary-text font-sans p-6">
      <div className="w-full max-w-[1280px] grid grid-cols-1 md:grid-cols-12 gap-4">
        
        <aside className="md:col-span-3 bg-secondary border border-base-border/5 rounded-3xl p-8 flex flex-col gap-8 h-fit sticky top-6">
          <div className="font-bold tracking-widest font-display text-2xl text-primary-text uppercase">
            AURA <span className="text-accent-500">ADMIN</span>
          </div>
          <nav className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-primary-text/50">
            <Link to="/admin" className="hover:text-primary-text transition-colors">Tableau de bord</Link>
            <Link to="/admin/products" className="hover:text-primary-text transition-colors">Inventaire</Link>
            <Link to="/admin/orders" className="hover:text-primary-text transition-colors">Commandes</Link>
            <Link to="/admin/qr" className="hover:text-accent-500 transition-colors border-t border-base-border/10 pt-4 mt-2">Terminal QR</Link>
          </nav>
          <div className="mt-auto pt-8">
            <Link to="/" className="text-[10px] font-mono tracking-widest uppercase text-primary-text/30 hover:text-primary-text transition-colors flex items-center gap-2">
              ← Retour à la boutique
            </Link>
          </div>
        </aside>

        <main className="md:col-span-9 flex flex-col gap-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
