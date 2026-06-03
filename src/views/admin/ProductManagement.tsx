import React, { useEffect, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { ConfirmModal } from '../../components/ConfirmModal';
import { supabase } from '../../config/supabaseClient';
import { Product } from '../../models/types';
import { CATEGORY_OPTIONS, getCategoryLabel } from '../../utils/categories';
import { maskProducts } from '../../utils/productMask';

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<string>(CATEGORY_OPTIONS[0].value);
  const [stock, setStock] = useState('0');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(maskProducts(data));
    setLoading(false);
  }

  function handleImageFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(file ? URL.createObjectURL(file) : '');
  }

  async function uploadProductImage() {
    if (!imageFile) return imageUrl || null;

    const safeName = imageFile.name.replace(/[^a-z0-9.-]/gi, '-').toLowerCase();
    const filePath = `products/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    return data.publicUrl;
  }

  function resetForm() {
    setName('');
    setDescription('');
    setPrice('');
    setCategory(CATEGORY_OPTIONS[0].value);
    setStock('0');
    setImageUrl('');
    setImageFile(null);
    setImagePreview('');
  }

  const handleAddProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const publicImageUrl = await uploadProductImage();
      const { error } = await supabase.from('products').insert({
        name,
        description: description || null,
        price: parseFloat(price),
        category,
        stock_quantity: parseInt(stock, 10),
        image_url: publicImageUrl,
      });

      if (error) throw error;

      toast.success('Produit ajoute');
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || "Echec de l'ajout du produit");
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Produit supprime');
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
        message={`Supprimer ${productToDelete?.name} de l'inventaire ?`}
        confirmText="Supprimer"
      />

      <div className="flex-1 flex flex-col gap-8">
        <div className="bg-gradient-to-r from-secondary to-transparent border border-base-border/5 rounded-[2rem] p-10 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-500/5 to-transparent -z-10"></div>

          <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary-text/40 mb-2">Creer un actif</h2>
          <h1 className="text-3xl font-display font-light mb-8 text-primary-text">Nouveau Produit</h1>

          <form onSubmit={handleAddProduct} className="grid md:grid-cols-2 gap-4 max-w-5xl">
            <input required type="text" placeholder="Nom" className="bg-primary border border-base-border/10 p-4 rounded-xl text-primary-text placeholder:text-primary-text/30 focus:outline-none focus:border-accent-500 text-sm transition-colors" value={name} onChange={event => setName(event.target.value)} />
            <input required type="number" step="0.01" placeholder="Prix" className="bg-primary border border-base-border/10 p-4 rounded-xl text-primary-text placeholder:text-primary-text/30 focus:outline-none focus:border-accent-500 text-sm transition-colors" value={price} onChange={event => setPrice(event.target.value)} />
            <select required className="bg-primary border border-base-border/10 p-4 rounded-xl text-primary-text focus:outline-none focus:border-accent-500 text-sm transition-colors" value={category} onChange={event => setCategory(event.target.value)}>
              {CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value} className="bg-primary text-primary-text">{option.label}</option>
              ))}
            </select>
            <input required type="number" placeholder="Quantite en stock" className="bg-primary border border-base-border/10 p-4 rounded-xl text-primary-text placeholder:text-primary-text/30 focus:outline-none focus:border-accent-500 text-sm transition-colors" value={stock} onChange={event => setStock(event.target.value)} />
            <textarea placeholder="Description" className="md:col-span-2 min-h-28 bg-primary border border-base-border/10 p-4 rounded-xl text-primary-text placeholder:text-primary-text/30 focus:outline-none focus:border-accent-500 text-sm transition-colors resize-none" value={description} onChange={event => setDescription(event.target.value)} />

            <label className="md:col-span-2 border border-base-border/10 border-dashed bg-primary/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer hover:border-accent-500/50 transition-colors">
              <div className="w-20 h-20 rounded-lg bg-primary border border-base-border/10 overflow-hidden flex items-center justify-center text-primary-text/30">
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus size={24} />
                )}
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary-text">Image depuis l'appareil</div>
                <div className="text-xs text-primary-text/40 mt-1">{imageFile ? imageFile.name : 'JPEG, PNG ou WEBP'}</div>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
            </label>

            <input type="url" placeholder="URL image de secours (optionnel)" className="md:col-span-2 bg-primary border border-base-border/10 p-4 rounded-xl text-primary-text placeholder:text-primary-text/30 focus:outline-none focus:border-accent-500 text-sm transition-colors" value={imageUrl} onChange={event => setImageUrl(event.target.value)} />
            <button type="submit" disabled={saving} className="md:col-span-2 bg-accent-600 hover:bg-accent-500 text-primary-text py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all mt-4 disabled:opacity-50">
              {saving ? 'Creation...' : 'Creer le Produit'}
            </button>
          </form>
        </div>

        <div className="bg-secondary border border-base-border/5 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
          <div className="p-8 border-b border-base-border/5 flex justify-between items-center bg-primary/50 backdrop-blur">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary-text">Donnees d'inventaire</span>
            <span className="text-[10px] font-mono text-primary-text/40">{loading ? '...' : products.length} modeles</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[9px] uppercase tracking-[0.2em] text-primary-text/40 bg-tertiary">
                <tr>
                  <th className="py-4 px-8 font-normal">Modele</th>
                  <th className="py-4 px-8 font-normal">Prix</th>
                  <th className="py-4 px-8 font-normal">Stock</th>
                  <th className="py-4 px-8 font-normal">Categorie</th>
                  <th className="py-4 px-8 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[13px]">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="py-4 px-8 font-medium text-primary-text/90 group-hover:text-accent-500 transition-colors flex items-center gap-3">
                      {product.image_url ? (
                        <img src={product.image_url} alt="" className="w-8 h-8 object-cover bg-primary/5 rounded-md p-1" />
                      ) : (
                        <div className="w-8 h-8 border border-base-border/10 border-dashed rounded-md flex justify-center items-center text-[7px] text-primary-text/30">IMG</div>
                      )}
                      {product.name}
                    </td>
                    <td className="py-4 px-8 font-sans font-medium">${product.price.toFixed(2)}</td>
                    <td className="py-4 px-8 font-mono text-[11px] text-primary-text/70">{product.stock_quantity}</td>
                    <td className="py-4 px-8 font-mono text-[10px] uppercase tracking-widest text-primary-text/40">{getCategoryLabel(product.category)}</td>
                    <td className="py-4 px-8 text-right">
                      <button
                        onClick={() => confirmDelete(product)}
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
