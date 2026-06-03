import { useEffect, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Product } from '../../models/types';
import { Link } from 'react-router-dom';
import { openDB } from 'idb';
import { ProductCardSkeleton } from '../../components/SkeletonLoader';
import { useSearchStore } from '../../store/useSearchStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { maskProducts } from '../../utils/productMask';

const fallbackProductImage = 'https://images.unsplash.com/photo-1548074902-86ee6dd529fa?auto=format&fit=crop&q=80&w=1000';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { searchQuery, categoryFilter, setCategoryFilter, priceSort, setPriceSort, priceRange, setPriceRange } = useSearchStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    async function fetchProducts() {
      // Offline-first approach for products
      const db = await openDB('luxe-store-cache', 1, {
        upgrade(db) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
      });

      try {
        if (!navigator.onLine) throw new Error('Offline');

        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');

        const { data } = await response.json() as { data?: Product[] };
        const masked = maskProducts(data ?? []);
        setProducts(masked);
        // Update cache
        const tx = db.transaction('products', 'readwrite');
        masked.forEach(p => tx.store.put(p));
        await tx.done;
        setLoadError(null);
      } catch (error) {
        const cached = await db.getAll('products');
        const masked = maskProducts(cached);
        setProducts(masked);
        setLoadError(masked.length ? null : error instanceof Error ? error.message : 'Impossible de charger les produits');
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  let filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (p.category ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter ? p.category === categoryFilter : true;
    const matchPrice = priceRange ? (p.price >= (priceRange.min || 0) && p.price <= (priceRange.max || 999999)) : true;
    return matchSearch && matchCategory && matchPrice;
  });

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const num = value ? parseFloat(value) : (type === 'min' ? 0 : 999999);
    const current = priceRange || { min: 0, max: 999999 };
    // Only update if value is a valid number or empty
    if (value === '' || !isNaN(num)) {
      setPriceRange({ ...current, [type]: value === '' ? (type === 'min' ? 0 : 999999) : num });
    }
  };

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    if (event.currentTarget.src !== fallbackProductImage) {
      event.currentTarget.src = fallbackProductImage;
    }
  };

  if (priceSort === 'asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (priceSort === 'desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="flex-1 flex flex-col gap-12">
      
      {/* Hero Banner Box */}
      {searchQuery === '' && (
        <div className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-between rounded-3xl overflow-hidden group">
          <div className="absolute inset-0 bg-base-900/50 -z-10 mix-blend-multiply"></div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-500/10 to-transparent -z-10"></div>
        
          <div className="relative z-10 px-12 md:px-24 flex flex-col items-start w-full md:w-3/5">
            <div className="mb-6 px-4 py-1.5 bg-primary/5 border border-base-border/10 text-primary-text text-[10px] font-bold tracking-[0.2em] rounded-full uppercase shadow-lg shadow-black/20">Édition Limitée : 100 Pièces</div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-display uppercase tracking-[0.05em] font-medium mb-6 leading-snug text-primary-text max-w-xl">
              Trouvez votre ajustement parfait. <br/>Craquez pour nos biens premium.
            </h1>
            <button className="px-8 py-4 bg-accent-500 text-inverse rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-inverse transition-all">
              Acheter maintenant
            </button>
          </div>

          {/* Hero Image (We use the first product as featured) */}
          {products[0]?.image_url ? (
            <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full items-center justify-center p-12 pointer-events-none">
              <img src={products[0].image_url} alt="Featured" onError={handleImageError} className="w-full h-full max-h-[500px] object-cover rounded-[2rem] drop-shadow-2xl opacity-90" />
            </div>
          ) : null}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 gap-6">
        <div className="flex flex-wrap gap-4">
          <span 
            onClick={() => setCategoryFilter(null)}
            className={`text-[11px] font-bold uppercase tracking-widest cursor-pointer pb-1 border-b ${!categoryFilter ? 'text-primary-text border-base-border' : 'text-primary-text/50 border-transparent hover:text-primary-text transition-colors'}`}
          >
            Tout Voir
          </span>
          {categories.map(cat => (
            <span 
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-[11px] font-bold uppercase tracking-widest cursor-pointer pb-1 border-b ${categoryFilter === cat ? 'text-primary-text border-base-border' : 'text-primary-text/50 border-transparent hover:text-primary-text transition-colors'}`}
            >
              {cat}
            </span>
          ))}
        </div>
        
        <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest text-primary-text/40">Prix:</span>
            <input 
              type="number" 
              placeholder="Min" 
              className="bg-transparent border border-base-border/20 text-primary-text text-[10px] p-2 rounded-lg w-16 focus:outline-none focus:border-accent-500 transition-colors placeholder:text-primary-text/30"
              value={priceRange?.min === 0 ? '' : priceRange?.min || ''}
              onChange={(e) => handlePriceChange('min', e.target.value)}
            />
            <span className="text-primary-text/40 text-[10px]">-</span>
            <input 
              type="number" 
              placeholder="Max" 
              className="bg-transparent border border-base-border/20 text-primary-text text-[10px] p-2 rounded-lg w-16 focus:outline-none focus:border-accent-500 transition-colors placeholder:text-primary-text/30"
              value={priceRange?.max === 999999 ? '' : priceRange?.max || ''}
              onChange={(e) => handlePriceChange('max', e.target.value)}
            />
          </div>
          <select 
            value={priceSort || ''}
            onChange={(e) => setPriceSort(e.target.value ? e.target.value as 'asc' | 'desc' : null)}
            className="bg-transparent border border-base-border/20 text-primary-text text-[11px] font-mono p-2 rounded-lg focus:outline-none appearance-none cursor-pointer hover:border-base-border/40 transition-colors"
          >
            <option value="" className="bg-primary text-primary-text">Trier par</option>
            <option value="asc" className="bg-primary text-primary-text">Prix: Croissant</option>
            <option value="desc" className="bg-primary text-primary-text">Prix: Décroissant</option>
          </select>
          <div className="text-[11px] text-primary-text/40 font-mono">{loading ? '...' : filteredProducts.length} ARTICLES</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(350px,_auto)]">
        {loading ? (
          <>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </>
        ) : loadError ? (
          <div className="md:col-span-2 lg:col-span-4 min-h-[220px] border border-base-border/10 rounded-2xl flex items-center justify-center text-center px-6">
            <div className="max-w-md">
              <p className="text-primary-text text-sm font-bold uppercase tracking-[0.18em] mb-3">Produits indisponibles</p>
              <p className="text-primary-text/50 text-xs leading-relaxed">
                La connexion a la base de donnees Supabase doit etre corrigee dans Vercel.
              </p>
            </div>
          </div>
        ) : filteredProducts.map((product, idx) => (
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            key={product.id} 
            className="bg-secondary border border-base-border/5 rounded-[2rem] overflow-hidden flex flex-col transition-all hover:border-base-border/10 hover:shadow-2xl hover:shadow-accent-500/5 group cursor-pointer relative"
          >
            <div className="absolute top-6 left-6 z-20">
              <span className="px-3 py-1 bg-primary/20 border border-base-border/10 text-primary-text text-[9px] font-bold uppercase tracking-[0.2em] rounded-full shadow-lg backdrop-blur-md">Limité</span>
            </div>
            <button 
              onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
              className="absolute top-6 right-6 z-20 text-primary-text/40 hover:text-accent-500 transition-colors"
            >
              <Heart size={16} fill={isInWishlist(product.id) ? "currentColor" : "none"} className={isInWishlist(product.id) ? "text-accent-500" : ""} />
            </button>
            <Link to={`/product/${product.id}`} className="flex-1 flex flex-col p-6 h-full relative z-10 pt-16">
              <div className="flex-1 flex items-center justify-center relative w-full aspect-[4/5] rounded-xl overflow-hidden mb-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-text/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full blur-xl scale-75"></div>
                {product.image_url ? (
                   <img src={product.image_url} alt={product.name} onError={handleImageError} className="object-cover object-center w-full h-full group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="text-primary-text/20 text-[10px] font-bold uppercase tracking-widest border border-base-border/10 border-dashed w-16 h-16 rounded-xl flex items-center justify-center">Pas d'Img</div>
                )}
              </div>
              <div className="mt-auto">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-[9px] font-mono text-primary-text/40 uppercase tracking-[0.2em]">AURA-{product.id.substring(0,6).toUpperCase()}</div>
                  <div className="text-[10px] font-medium text-accent-500">{product.price.toFixed(2)}$</div>
                </div>
                <h3 className="text-xs font-bold text-primary-text uppercase tracking-widest leading-relaxed max-w-full text-ellipsis overflow-hidden whitespace-nowrap mb-4">{product.name}</h3>
                
                <button 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    useCartStore.getState().addItem(product);
                  }}
                  className="w-full py-2.5 bg-primary/20 hover:bg-accent-500 hover:text-inverse text-primary-text text-[9px] font-bold uppercase tracking-[0.2em] rounded-lg transition-all border border-base-border/20 flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={12} />
                  <span>Ajouter au panier</span>
                </button>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
    </div>
  );
}
