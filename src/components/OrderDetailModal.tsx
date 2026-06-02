import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../config/supabaseClient';
import { OrderTimeline } from './OrderTimeline';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../models/types';
import { maskProduct } from '../utils/productMask';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailModal = ({ order, onClose }: OrderDetailModalProps) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setLoading(true);
      const fetchItems = async () => {
        const { data } = await supabase
          .from('order_items')
          .select('*, products(name, image_url, price, category)')
          .eq('order_id', order.id);
        
        if (data) {
          const maskedItems = data.map(item => ({
            ...item,
            products: maskProduct(item.products as any)
          }));
          setItems(maskedItems);
        }
        setLoading(false);
      };
      fetchItems();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [order]);

  return (
    <AnimatePresence>
      {order && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-inverse/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-primary border-l border-base-border/10 z-50 overflow-y-auto flex flex-col shadow-2xl"
          >
            <div className="p-8 border-b border-base-border/5 flex items-center justify-between sticky top-0 bg-primary/90 backdrop-blur z-10">
              <div>
                <h2 className="text-xl font-display font-light text-primary-text tracking-widest uppercase">Détails de la Commande</h2>
                <div className="text-[10px] text-primary-text/40 font-mono tracking-widest uppercase mt-1">
                  #{order.id.split('-')[0]}
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/5 text-primary-text/50 hover:bg-primary/10 hover:text-primary-text transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 flex-1 flex flex-col gap-10">
              <div className="bg-secondary border border-base-border/5 p-6 rounded-3xl">
                <h3 className="text-[10px] font-bold text-primary-text uppercase tracking-[0.2em] mb-8">Statut de Suivi</h3>
                <OrderTimeline status={order.status} />
              </div>

              <div>
                <h3 className="text-[10px] font-bold text-primary-text uppercase tracking-[0.2em] mb-4">Articles ({items.length})</h3>
                {loading ? (
                  <div className="text-[10px] font-mono text-primary-text/50 animate-pulse uppercase tracking-widest">Chargement des articles...</div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-4 bg-primary/5 border border-base-border/5 rounded-2xl">
                        <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center p-2 border border-base-border/5">
                          {item.products.image_url ? (
                            <img src={item.products.image_url} alt={item.products.name} className="object-contain w-full h-full mix-blend-screen" />
                          ) : (
                            <div className="text-[8px] text-primary-text/20">PAS D'IMG</div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="text-[11px] font-bold text-primary-text">{item.products.name}</h4>
                          <div className="text-[9px] text-primary-text/40 font-mono uppercase tracking-[0.1em] mt-1 mb-2">
                            {item.products.category}
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-primary-text/60">Qté: {item.quantity}</span>
                            <span className="text-accent-500 font-medium">{(item.products.price * item.quantity).toFixed(2)}$</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 border-t border-base-border/5 bg-secondary mt-auto">
              <div className="flex justify-between items-end mb-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-text/50">Total Payé</span>
                <span className="text-2xl font-sans font-medium text-primary-text">{order.total_amount.toFixed(2)}$</span>
              </div>
              {order.invoice_url && (
                <a 
                  href={order.invoice_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="block w-full py-4 text-center border border-base-border/20 text-primary-text rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/10 transition-colors"
                >
                  Télécharger la Facture
                </a>
              )}
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
