import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { Product } from '../../models/types';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { openDB } from 'idb';
import { ProductDetailSkeleton } from '../../components/SkeletonLoader';
import { ImageLightbox } from '../../components/ImageLightbox';
import { ZoomIn, Bell, Heart } from 'lucide-react';
import { maskProduct } from '../../utils/productMask';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLightboxOpen, setLightboxOpen] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const addItem = useCartStore(state => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProduct() {
      if (!id) {
        setLoading(false);
        return;
      }

      const db = await openDB('luxe-store-cache', 1, {
        upgrade(db) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
      });

      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');

        const { data } = await response.json() as { data?: Product };
        if (data) {
          const masked = maskProduct(data);
          setProduct(masked);
          await db.put('products', masked);
        }
      } catch {
        const cached = await db.get('products', id);
        setProduct(cached ? maskProduct(cached) : null);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  if (loading) return <ProductDetailSkeleton />;
  if (!product) return <div className="text-primary-text/50 text-center font-mono">Produit non trouvé</div>;

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success('Ajouté au panier');
  };

  const handleNotifyMe = async () => {
    if (!session?.user) {
      toast.error('Veuillez vous connecter pour être notifié(e)');
      return;
    }
    setNotifying(true);
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: session.user.id,
        title: `M'avertir : ${product.name}`,
        body: `L'utilisateur a demandé une notification lorsque le produit AURA-${product.id.substring(0, 6).toUpperCase()} sera de nouveau en stock.`
      });
      if (error) throw error;
      toast.success("Nous vous notifierons lorsqu'il sera disponible !");
    } catch (e: any) {
      toast.error(e.message || 'Échec de la notification');
    } finally {
      setNotifying(false);
    }
  };

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <>
      <ImageLightbox 
        isOpen={isLightboxOpen} 
        onClose={() => setLightboxOpen(false)} 
        imageUrl={product.image_url} 
        alt={product.name} 
      />
      <div className="flex-1 flex flex-col md:flex-row h-full min-h-[600px] bg-primary rounded-[2rem] overflow-hidden relative border border-base-border/5">
        {/* Background ambient lighting */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_left,_var(--tw-gradient-stops))] from-accent-500/10 via-primary to-primary -z-10 pointer-events-none"></div>

        <div className="w-full md:w-3/5 md:h-auto h-96 relative flex items-center justify-center p-0 bg-secondary group">
          {product.image_url ? (
            <>
              <button 
                onClick={() => setLightboxOpen(true)}
                className="absolute top-6 right-6 z-20 text-primary-text/40 hover:text-primary-text bg-primary/5 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-base-border/10"
              >
                <ZoomIn size={20} />
              </button>
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover animate-fade-in cursor-pointer hover:scale-105 transition-transform duration-500" 
                onClick={() => setLightboxOpen(true)}
              />
            </>
          ) : (
          <div className="text-primary-text/20 tracking-widest text-[10px] font-bold uppercase">AUCUNE IMAGE DISPONIBLE</div>
        )}
      </div>

      <div className="w-full md:w-2/5 p-10 lg:p-16 flex flex-col justify-center relative z-10">
        <div className="mb-6 inline-block px-4 py-1.5 bg-primary/5 border border-base-border/10 text-primary-text text-[9px] font-bold tracking-[0.2em] rounded-full uppercase shadow-lg w-fit backdrop-blur-sm">
          Édition Limitée
        </div>
        
        <p className="text-primary-text/40 text-[10px] uppercase tracking-[0.2em] font-mono mb-2">AURA-{product.id.substring(0,6).toUpperCase()}</p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-light text-primary-text mb-6 leading-[1.1]">{product.name}</h1>
        
        <p className="text-primary-text/50 text-sm leading-relaxed mb-10 font-sans max-w-sm">
          {product.description || 'Essentiel premium méticuleusement conçu. Élevez votre quotidien avec un confort inégalé et un design intemporel.'}
        </p>

        <div className="flex items-end gap-4 mb-12">
          <span className="text-3xl font-sans font-medium text-primary-text">
            {product.price.toFixed(2)}$
          </span>
          <span className="text-[10px] text-primary-text/30 uppercase tracking-[0.1em] font-mono mb-1">
            (Stock: {product.stock_quantity})
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {isOutOfStock ? (
            <button 
              onClick={handleNotifyMe}
              disabled={notifying}
              className="flex-1 py-4 border border-base-border/20 text-primary-text rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
            >
              <Bell size={14} />
              {notifying ? "Création de l'alerte..." : 'Me Notifier de la Disponibilité'}
            </button>
          ) : (
            <>
              <button 
                onClick={() => { handleAddToCart(); navigate('/checkout'); }}
                className="flex-1 py-4 border border-accent-500 text-accent-500 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-accent-500 hover:text-primary-text transition-all shadow-[0_0_15px_rgba(0,163,255,0.2)] hover:shadow-[0_0_25px_rgba(0,163,255,0.5)]"
              >
                Acheter Maintenant
              </button>
              <button 
                onClick={handleAddToCart}
                className="w-14 items-center justify-center flex border border-base-border/20 text-primary-text rounded-full hover:bg-primary/10 transition-colors"
                title="Ajouter au Panier"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              </button>
              <button 
                onClick={() => toggleWishlist(product)}
                className={`w-14 items-center justify-center flex border border-base-border/20 rounded-full hover:bg-primary/10 transition-colors ${isInWishlist(product.id) ? 'text-accent-500' : 'text-primary-text'}`}
                title="Ajouter aux envies"
              >
                <Heart size={16} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
