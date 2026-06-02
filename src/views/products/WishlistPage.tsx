import React from 'react';
import { useWishlistStore } from '../../store/useWishlistStore';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { maskProducts } from '../../utils/productMask';

export default function WishlistPage() {
  const { items, toggleWishlist, isInWishlist } = useWishlistStore();
  
  const maskedItems = maskProducts(items);

  return (
    <div className="flex-1 flex flex-col pt-4 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-light text-primary-text tracking-wide uppercase">Ma Liste d'Envies</h1>
      </div>

      {items.length === 0 ? (
        <div className="bg-secondary border border-base-border/5 rounded-[2rem] p-12 text-center flex flex-col items-center">
          <Heart size={48} className="text-primary-text/20 mb-6" />
          <p className="text-primary-text/50 text-[11px] font-mono uppercase tracking-widest">Votre liste d'envies est vide.</p>
          <Link to="/" className="mt-8 px-8 py-3 border border-base-border/20 text-primary-text rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/10 transition-colors">
            Explorer la boutique
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(350px,_auto)]">
          {maskedItems.map((product) => (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={product.id} 
              className="bg-secondary border border-base-border/5 rounded-[2rem] overflow-hidden flex flex-col transition-all hover:border-base-border/10 hover:shadow-2xl hover:shadow-accent-500/5 group cursor-pointer relative"
            >
              <button 
                onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                className="absolute top-6 right-6 z-20 text-primary-text/40 hover:text-accent-500 transition-colors"
                title="Retirer de la liste d'envies"
              >
                <Heart size={16} fill={isInWishlist(product.id) ? "currentColor" : "none"} className={isInWishlist(product.id) ? "text-accent-500" : ""} />
              </button>
              <Link to={`/product/${product.id}`} className="flex-1 flex flex-col p-6 h-full relative z-10">
                <div className="absolute top-0 left-0">
                  <span className="px-3 py-1 bg-primary/5 border border-base-border/10 text-primary-text/90 text-[9px] font-bold uppercase tracking-[0.2em] rounded-full shadow-lg backdrop-blur-sm">Limité</span>
                </div>
                <div className="flex-1 flex items-center justify-center my-6 relative w-full h-48 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-text/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full blur-xl scale-75"></div>
                  {product.image_url ? (
                     <img src={product.image_url} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="text-primary-text/20 text-[10px] font-bold uppercase tracking-widest border border-base-border/10 border-dashed w-16 h-16 rounded-xl flex items-center justify-center">Pas d'Img</div>
                  )}
                </div>
                <div className="mt-auto">
                  <div className="text-[9px] font-mono text-primary-text/40 uppercase tracking-[0.2em] mb-1">AURA-{product.id.substring(0,6).toUpperCase()}</div>
                  <h3 className="text-xs font-bold text-primary-text uppercase tracking-widest max-w-[80%] leading-relaxed">{product.name}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
