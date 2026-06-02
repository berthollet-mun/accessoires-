import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Product } from '../../models/types';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Trash2 } from 'lucide-react';
import { maskProducts, maskProduct } from '../../utils/productMask';

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('0');
  const [imageUrl, setImageUrl] = useState('');
  
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(maskProducts(data));
    setLoading(false);
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('products').insert({
      name,
      price: parseFloat(price),
      category,
      stock_quantity: parseInt(stock, 10),
      image_url: imageUrl || null
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Produit ajouté');
      fetchProducts();
      setName(''); setPrice(''); setCategory(''); setStock('0'); setImageUrl('');
    }
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Produit supprimé');
      fetchProducts();
    }
  };

  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  return (
    <>
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setProductToDelete(null); }}
        onConfirm={executeDelete}
        title="Supprimer le Produit"
        message={`Êtes-vous sûr de vouloir supprimer ${productToDelete?.name} ? Cette action est irréversible et le retirera de l'inventaire.`}
        confirmText="Supprimer"
      />
      
      <div className="flex-1 flex flex-col gap-8">
        
        <div className="bg-gradient-to-r from-secondary to-transparent border border-base-border/5 rounded-[2rem] p-10 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-500/5 to-transparent -z-10"></div>
          
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary-text/40 mb-2">Créer un Actif</h2>
          <h1 className="text-3xl font-display font-light mb-8 text-primary-text">Nouveau Produit</h1>
          
          <form onSubmit={handleAddProduct} className="grid md:grid-cols-2 gap-4 max-w-4xl">
            <input required type="text" placeholder="Nom" className="bg-primary border border-base-border/10 p-4 rounded-xl text-primary-text placeholder:text-primary-text/30 focus:outline-none focus:border-accent-500 text-sm transition-colors" value={name} onChange={e=>setName(e.target.value)} />
            <input required type="number" step="0.01" placeholder="Prix" className="bg-primary border border-base-border/10 p-4 rounded-xl text-primary-text placeholder:text-primary-text/30 focus:outline-none focus:border-accent-500 text-sm transition-colors" value={price} onChange={e=>setPrice(e.target.value)} />
            <input type="text" placeholder="Catégorie" className="bg-primary border border-base-border/10 p-4 rounded-xl text-primary-text placeholder:text-primary-text/30 focus:outline-none focus:border-accent-500 text-sm transition-colors" value={category} onChange={e=>setCategory(e.target.value)} />
            <input required type="number" placeholder="Quantité en Stock" className="bg-primary border border-base-border/10 p-4 rounded-xl text-primary-text placeholder:text-primary-text/30 focus:outline-none focus:border-accent-500 text-sm transition-colors" value={stock} onChange={e=>setStock(e.target.value)} />
            <input type="url" placeholder="URL de l'image (optionnel)" className="md:col-span-2 bg-primary border border-base-border/10 p-4 rounded-xl text-primary-text placeholder:text-primary-text/30 focus:outline-none focus:border-accent-500 text-sm transition-colors" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} />
            <button type="submit" className="md:col-span-2 bg-accent-600 hover:bg-accent-500 text-primary-text py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all mt-4">Créer le Produit</button>
          </form>
        </div>

        <div className="bg-secondary border border-base-border/5 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
          <div className="p-8 border-b border-base-border/5 flex justify-between items-center bg-primary/50 backdrop-blur">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary-text">Données d'Inventaire</span>
            <span className="text-[10px] font-mono text-primary-text/40">{products.length} modèles</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[9px] uppercase tracking-[0.2em] text-primary-text/40 bg-tertiary">
                <tr>
                  <th className="py-4 px-8 font-normal">Modèle</th>
                  <th className="py-4 px-8 font-normal">Prix</th>
                  <th className="py-4 px-8 font-normal">Stock</th>
                  <th className="py-4 px-8 font-normal">Catégorie</th>
                  <th className="py-4 px-8 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[13px]">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="py-4 px-8 font-medium text-primary-text/90 group-hover:text-accent-500 transition-colors flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="w-8 h-8 object-cover bg-primary/5 rounded-md p-1" />
                      ) : (
                        <div className="w-8 h-8 border border-base-border/10 border-dashed rounded-md flex justify-center items-center text-[7px] text-primary-text/30">IMG</div>
                      )}
                      {p.name}
                    </td>
                    <td className="py-4 px-8 font-sans font-medium">${p.price.toFixed(2)}</td>
                    <td className="py-4 px-8 font-mono text-[11px] text-primary-text/70">{p.stock_quantity}</td>
                    <td className="py-4 px-8 font-mono text-[10px] uppercase tracking-widest text-primary-text/40">{p.category}</td>
                    <td className="py-4 px-8 text-right">
                      <button 
                        onClick={() => confirmDelete(p)} 
                        className="text-primary-text/30 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-full"
                        title="Supprimer le produit"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
