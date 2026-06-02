import { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { syncService } from '../../services/syncService';
import { offlineStorage } from '../../services/offlineStorage';
import { supabase } from '../../config/supabaseClient';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/ConfirmModal';

export default function CheckoutPage() {
  const { items, total, clearCart, removeItem } = useCartStore();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isClearModalOpen, setClearModalOpen] = useState(false);

  if (items.length === 0) return <div className="text-primary-text/50 text-[10px] font-mono uppercase mt-10">Le panier est vide.</div>;

  const handleCheckout = async () => {
    if (!session?.user) return;
    setLoading(true);

    try {
      if (navigator.onLine) {
        // Direct Checkout
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({ user_id: session.user.id, total_amount: total })
          .select()
          .single();

        if (orderError) throw orderError;

        const orderItemsData = items.map(ci => ({
          order_id: order.id,
          product_id: ci.product.id,
          quantity: ci.quantity,
          unit_price: ci.product.price,
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
        if (itemsError) throw itemsError;

        // Trigger Edge Function for validation
         await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-order`, {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
           },
           body: JSON.stringify({ order_id: order.id })
         });

        toast.success('Commande passée avec succès !');
      } else {
        // Offline Checkout
        await offlineStorage.queueAction('ORDER_CREATE', {
          user_id: session.user.id,
          cartItems: items,
          total_amount: total
        });
        toast.success('Commande sauvegardée hors connexion. Se synchronisera lors du retour en ligne.');
      }

      await clearCart();
      navigate('/orders');
    } catch (error: any) {
      toast.error('Échec de la commande : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Panier vidé');
  };

  return (
    <>
      <ConfirmModal 
        isOpen={isClearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirm={handleClearCart}
        title="Vider le Panier"
        message="Êtes-vous sûr de vouloir retirer tous les articles de votre panier ?"
        confirmText="Vider le Panier"
      />
      <div className="flex-1 flex flex-col pt-4">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-light text-primary-text tracking-wide">PANIER D'ACHATS</h1>
          <button 
            onClick={() => setClearModalOpen(true)}
            className="text-[10px] uppercase tracking-widest font-bold text-primary-text/50 hover:text-red-500 transition-colors border border-base-border/10 hover:border-red-500/50 px-4 py-2 rounded-full"
          >
            Tout Vider
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        
        {/* Cart Items List */}
        <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map(item => (
            <div key={item.product.id} className="bg-secondary border border-base-border/5 rounded-3xl p-6 relative group flex flex-col shadow-xl">
              <button 
                onClick={() => removeItem(item.product.id)}
                className="absolute top-4 right-4 text-primary-text/30 hover:text-red-400 transition-colors z-10 w-8 h-8 flex items-center justify-center bg-primary/5 rounded-full"
                title="Retirer l'article"
              >
                ✕
              </button>
              
              <div className="relative mb-6">
                <div className="absolute top-0 left-0">
                   <div className="px-3 py-1 bg-primary/5 border border-base-border/10 text-primary-text/90 text-[8px] font-bold uppercase tracking-[0.2em] rounded-full backdrop-blur-sm">Édition Limitée</div>
                </div>
                <div className="w-full h-40 flex items-center justify-center rounded-xl overflow-hidden mt-8 mb-4">
                  {item.product.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-16 h-16 border border-base-border/10 border-dashed rounded-full flex items-center justify-center text-primary-text/20 text-[9px]">PAS D'IMG</div>
                  )}
                </div>
              </div>

              <div className="mt-auto">
                <p className="text-[10px] text-primary-text/40 uppercase tracking-widest font-mono mb-1">AURA-{item.product.id.substring(0,6).toUpperCase()}</p>
                <h3 className="text-sm font-bold text-primary-text mb-4 leading-relaxed">{item.product.name}</h3>

                <div className="grid grid-cols-2 gap-4 text-[9px] uppercase tracking-widest text-primary-text/50 mb-6 border-b border-base-border/5 pb-4">
                  <div>
                    <span className="block mb-1">Quantité</span>
                    <span className="text-primary-text font-mono">{item.quantity}</span>
                  </div>
                  <div>
                    <span className="block mb-1">Catégorie</span>
                    <span className="text-primary-text font-mono">{item.product.category}</span>
                  </div>
                </div>

                <div className="text-xl font-sans font-medium text-accent-500">
                  {(item.product.price * item.quantity).toFixed(2)}$
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="sticky top-10">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-primary-text/50 font-bold mb-8 justify-end">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              PAIEMENT SÉCURISÉ
            </div>
            
            <div className="space-y-6 text-[11px] font-mono tracking-widest text-primary-text/60 uppercase">
              <div className="flex justify-between items-center border-b border-base-border/10 pb-4">
                <span>TVA (20%)</span>
                <span>{(total * 0.20).toFixed(2)}$</span>
              </div>
              <div className="flex justify-between items-center border-b border-base-border/10 pb-4">
                <span>Total HT</span>
                <span>{(total * 0.80).toFixed(2)}$</span>
              </div>
              <div className="flex justify-between items-center pt-2 text-primary-text text-base">
                <span className="font-sans font-bold">Total TTC</span>
                <span className="font-sans font-bold text-xl">{total.toFixed(2)}$</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={loading}
              className="mt-12 w-full max-w-[200px] ml-auto block px-8 py-4 bg-accent-600 hover:bg-accent-500 text-primary-text font-bold text-[10px] uppercase tracking-[0.2em] rounded-full transition-all shadow-[0_0_20px_rgba(0,163,255,0.3)] hover:shadow-[0_0_30px_rgba(0,163,255,0.6)] disabled:opacity-50"
            >
              {loading ? 'Traitement...' : 'Passer la Commande'}
            </button>

            {!navigator.onLine && (
              <div className="mt-8 p-4 bg-accent-500/10 border border-accent-500/20 rounded-2xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></div>
                <p className="text-[9px] text-accent-500 font-mono tracking-widest uppercase">Vous êtes hors ligne. La commande sera mise en attente.</p>
              </div>
            )}
            
            <div className="mt-12 pt-8 border-t border-base-border/10 flex items-center justify-between text-primary-text/40 hover:text-primary-text transition-colors cursor-pointer text-[10px] font-bold tracking-widest uppercase">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                DIRECT CONTACT
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    </>
  );
}
