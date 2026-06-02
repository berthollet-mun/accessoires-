import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCartStore } from '../../store/useCartStore';
import { useSearchStore } from '../../store/useSearchStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { ShoppingBag, LogOut, Search, Scan, User, X, Heart, Sun, Moon } from 'lucide-react';
import { supabase } from '../../config/supabaseClient';

export default function MainLayout() {
  const { session, profile } = useAuth();
  const { items } = useCartStore();
  const { searchQuery, setSearchQuery } = useSearchStore();
  const { theme, toggleTheme } = useThemeStore();
  const { items: wishlistItems } = useWishlistStore();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-10 overflow-hidden relative z-10 font-sans bg-primary text-primary-text min-h-screen">
      <nav className="flex justify-between items-center mb-8 pb-4">
        <div className="flex-shrink-0">
          <Link to="/" className="text-xl font-display font-bold tracking-widest text-primary-text flex items-center gap-2 uppercase">
            AURA
          </Link>
        </div>
        
        <div className="hidden md:flex gap-8 text-[11px] font-medium text-primary-text/70 items-center">
          <Link to="/" className="hover:text-primary-text transition-colors">Collections</Link>
          <Link to="/" className="hover:text-primary-text transition-colors">Nouveautés</Link>
          <Link to="/" className="hover:text-primary-text transition-colors">Archives</Link>
          {profile?.role === 'admin' && (
            <Link to="/admin" className="text-accent-500 hover:text-primary-text transition-colors">Admin</Link>
          )}
          <Link to="/scan" className="hover:text-primary-text transition-colors flex items-center gap-1"><Scan size={14}/> Scanner QR</Link>
          <Link to="/wishlist" className="hover:text-primary-text transition-colors flex items-center gap-1 relative">
            <Heart size={14}/> Envies
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-6 text-primary-text/50">
          <div className="relative animate-fade-in flex items-center bg-secondary border border-primary-text/5 rounded-full px-3 py-1.5 focus-within:border-primary-text/20 transition-colors">
            <Search size={14} className="text-primary-text/40" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="rechercher..." 
              className="bg-transparent pl-2 pr-2 text-primary-text text-[12px] w-32 md:w-48 focus:outline-none placeholder:text-primary-text/30"
            />
          </div>
          
          <button onClick={toggleTheme} className="hover:text-primary-text transition-colors" title="Changer le thème">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link to="/cart" className="relative cursor-pointer hover:text-primary-text transition-colors group">
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent-500 text-inverse text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-[0_0_10px_rgba(0,163,255,0.5)] group-hover:bg-primary-text group-hover:text-accent-500 transition-colors">
                {cartCount}
              </span>
            )}
          </Link>
          
          {session ? (
            <div className="flex items-center gap-4">
              <Link to="/orders" className="hover:text-primary-text transition-colors" title="Mes Commandes">
                 <User size={18} />
              </Link>
              <button onClick={handleSignOut} className="hover:text-primary-text transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="hover:text-primary-text transition-colors" title="Se Connecter">
               <User size={18} />
            </Link>
          )}
        </div>
      </nav>

      <main className="flex-1 w-full mx-auto pb-8 overflow-y-auto overflow-x-hidden animate-fade-in-up">
        <Outlet />
      </main>

      <footer className="mt-20 flex flex-col md:flex-row justify-between text-[11px] font-medium text-primary-text/50 border-t border-primary-text/5 pt-12">
        <div className="mb-8 md:mb-0">
          <div className="text-3xl font-display font-bold text-primary-text/10 uppercase mb-4">AURA</div>
          <p className="max-w-[200px] leading-relaxed">
            L'EXCELLENCE AU SERVICE DU QUOTIDIEN.<br/>CONÇU AVEC RIGUEUR, PORTÉ AVEC FIERTÉ.
          </p>
          <div className="mt-8 text-[9px] uppercase tracking-widest text-primary-text/30">
            © 2026 AURA ACCESSORIES. ENGINEERED FOR PRECISION.
          </div>
        </div>
        
        <div className="flex flex-wrap gap-12 md:gap-16">
          <div className="flex flex-col gap-4">
            <span className="text-primary-text uppercase tracking-widest text-[9px] font-bold">Maison</span>
            <Link to="#" className="hover:text-primary-text border-b border-transparent hover:border-primary-text transition-all pb-0.5 w-fit">Durabilité</Link>
            <Link to="#" className="hover:text-primary-text border-b border-transparent hover:border-primary-text transition-all pb-0.5 w-fit">Tissus Techniques</Link>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-primary-text uppercase tracking-widest text-[9px] font-bold">Support</span>
            <Link to="#" className="hover:text-primary-text border-b border-transparent hover:border-primary-text transition-all pb-0.5 w-fit">Livraison</Link>
            <Link to="#" className="hover:text-primary-text border-b border-transparent hover:border-primary-text transition-all pb-0.5 w-fit">Conditions de retour</Link>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-primary-text uppercase tracking-widest text-[9px] font-bold">Légal</span>
            <Link to="#" className="hover:text-primary-text border-b border-transparent hover:border-primary-text transition-all pb-0.5 w-fit">Mentions Légales</Link>
            <Link to="#" className="hover:text-primary-text border-b border-transparent hover:border-primary-text transition-all pb-0.5 w-fit">CGV / CGU</Link>
            <Link to="#" className="hover:text-primary-text border-b border-transparent hover:border-primary-text transition-all pb-0.5 w-fit">Politique de confidentialité</Link>
            <Link to="#" className="hover:text-primary-text border-b border-transparent hover:border-primary-text transition-all pb-0.5 w-fit">Politique de cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
