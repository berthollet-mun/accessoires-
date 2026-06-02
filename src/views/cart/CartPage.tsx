import { useCartStore } from '../../store/useCartStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import emptyCartImg from '../../assets/images/empty_cart_illustration_1780418060154.png';

const EmptyCart = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="flex-1 flex flex-col items-center justify-center p-10 h-full w-full"
  >
    <div className="w-64 h-64 md:w-80 md:h-80 mb-8 rounded-full overflow-hidden border border-base-border/5 bg-secondary flex items-center justify-center shadow-2xl relative group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-text/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-2xl"></div>
      <img src={emptyCartImg} alt="Empty Cart" className="w-[120%] h-[120%] object-cover mix-blend-luminosity opacity-80" />
    </div>
    <h1 className="text-4xl md:text-5xl font-display font-light text-primary-text mb-4 text-center">Votre panier est vide</h1>
    <p className="text-primary-text/50 text-sm md:text-base font-mono mb-10 max-w-md text-center">Notre collection singulière n'attend que vous. Explorez nos pièces pour trouver votre prochaine obsession.</p>
    <Link to="/">
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-10 py-4 bg-accent-500 text-primary-text rounded-2xl text-[12px] font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(201,160,91,0.2)] hover:shadow-[0_0_30px_rgba(201,160,91,0.4)] transition-shadow"
      >
        Continuer mes achats
      </motion.button>
    </Link>
  </motion.div>
);

export default function CartPage() {
  const { items, total, removeItem, updateQuantity } = useCartStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();


  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="flex-1 flex flex-col w-full px-4 md:px-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8 pt-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-text mb-2 leading-none">Votre Panier</h1>
          <p className="text-primary-text/50 text-[11px] uppercase tracking-widest font-mono">{items.length} ARTICLES SÉLECTIONNÉS</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-green-500/30 text-green-400 bg-green-500/10 rounded-full text-[10px] font-mono tracking-widest uppercase">
          <Cloud size={12} />
          Synchronisation hors ligne active
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
          {items.map(({ product, quantity }) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              key={product.id} 
              className="flex gap-6 p-6 border border-base-border/5 rounded-[2rem] bg-secondary relative"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 bg-primary rounded-2xl flex items-center justify-center overflow-hidden border border-base-border/5">
                 {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[8px] text-primary-text/40 uppercase font-bold tracking-widest">PAS D'IMAGE</span>
                  )}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.2em] font-mono text-primary-text/40 mb-1">{product.category || 'ÉDITION LIMITÉE'}</div>
                  <h3 className="text-lg font-bold text-primary-text leading-tight">{product.name}</h3>
                  <div className="text-[10px] text-primary-text/50 mt-1 uppercase tracking-widest">Technique / Confort</div>
                </div>
                <button 
                  onClick={() => removeItem(product.id)}
                  className="flex items-center gap-2 text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors w-fit pt-2"
                >
                  <Trash2 size={12} /> SUPPRIMER
                </button>
              </div>
              <div className="flex flex-col items-end justify-between">
                <div className="flex items-center gap-3 bg-primary border border-base-border/10 rounded-full px-2 py-1">
                  <button onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1))} className="w-6 h-6 flex items-center justify-center text-primary-text/50 hover:text-primary-text">-</button>
                  <motion.span 
                    key={quantity}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-[12px] font-mono font-medium text-primary-text w-4 text-center"
                  >
                    {quantity}
                  </motion.span>
                  <button onClick={() => updateQuantity(product.id, quantity + 1)} className="w-6 h-6 flex items-center justify-center text-primary-text/50 hover:text-primary-text">+</button>
                </div>
                <div className="text-lg text-primary-text font-medium">
                  {product.price.toFixed(2)}$
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>

        <div>
          <div className="bg-secondary border border-base-border/5 rounded-[2rem] p-8 lg:p-10 sticky top-24">
            <h2 className="text-3xl font-display font-light text-primary-text mb-8">Récapitulatif</h2>

            <div className="h-48 w-full mb-8 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Articles (HT)', value: total / 1.20, color: '#c9a05b' },
                      { name: 'Taxes (20%)', value: total - (total / 1.20), color: theme === 'dark' ? '#333333' : '#E5E7EB' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {[0, 1].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#c9a05b' : (theme === 'dark' ? '#333333' : '#E5E7EB')} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${value.toFixed(2)}$`}
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#FFFFFF', borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E5E7EB', borderRadius: '8px', color: theme === 'dark' ? '#FFFFFF' : '#1A1A1A', fontSize: '12px' }}
                    itemStyle={{ color: theme === 'dark' ? '#FFFFFF' : '#1A1A1A' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-primary-text/50 font-mono tracking-widest uppercase mb-1">Total</span>
                <span className="text-lg font-bold text-primary-text">{total.toFixed(2)}$</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-4 text-sm font-sans text-primary-text/70">
              <span>Articles (HT)</span>
              <span className="font-medium text-primary-text">{(total / 1.20).toFixed(2)}$</span>
            </div>
            <div className="flex justify-between items-center mb-4 text-sm font-sans text-primary-text/70">
              <span>Taxes (20%)</span>
              <span className="font-medium text-primary-text">{(total - total / 1.20).toFixed(2)}$</span>
            </div>
            <div className="flex justify-between items-center mb-8 text-sm font-sans text-primary-text/70">
              <span>Livraison estimée</span>
              <span className="font-medium text-green-400">OFFERTE</span>
            </div>
            
            <div className="border-t border-base-border/10 pt-6 mb-2">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xl font-bold text-primary-text">Total TTC</span>
                <span className="text-3xl font-bold text-accent-500">{total.toFixed(2)}$</span>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/checkout')}
              className="w-full mt-8 py-5 bg-accent-500 text-primary-text rounded-2xl text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-accent-600 transition-colors flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(201,160,91,0.2)] hover:shadow-[0_0_30px_rgba(201,160,91,0.4)]"
            >
              Passer à la caisse <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <div className="text-center text-[9px] uppercase tracking-[0.15em] font-mono text-primary-text/40 mt-4 leading-relaxed">
              Paiement sécurisé via Stripe & PayPal
            </div>

            <div className="mt-8 border border-base-border/10 bg-primary rounded-xl p-1 flex">
              <input type="text" placeholder="Code privilège" className="flex-1 bg-transparent border-none text-primary-text text-[12px] pl-4 focus:outline-none placeholder:text-primary-text/30" />
              <button className="bg-primary/5 hover:bg-primary/10 border border-base-border/10 text-primary-text/70 text-[10px] px-4 py-2 rounded-lg transition-colors">
                Appliquer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
