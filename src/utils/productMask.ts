import { Product } from '../models/types';

const SOCK_IMAGES = [
  'https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1574880949577-baebd05d7626?auto=format&fit=crop&q=80&w=1000',
];

const NAMES = [
  'Chaussettes Techniques Premium',
  'Sous-vêtement Confort Absolu',
  'Mi-Bas Laine Mérinos',
  'Chaussettes Invisibles Sport'
];

export function maskProduct(p: Product): Product {
    if (!p) return p;
    // Check if it needs masking
    const needsMasking = /Montre|Tourbillon|Chronoswiss|Gear|Skeltec|Opus|Cowboy|Space/i.test(p.name) || 
                    /CH-/i.test(p.name);
                    
    if (!needsMasking && p.image_url) return p;

    // Deterministic override based on ID or Name
    const hashStr = p.id || p.name;
    const hash = hashStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    return {
        ...p,
        name: needsMasking ? NAMES[hash % NAMES.length] : p.name,
        category: needsMasking ? 'Équipement Premium' : p.category,
        image_url: SOCK_IMAGES[hash % SOCK_IMAGES.length]
    };
}

export function maskProducts(products: Product[]): Product[] {
    return products.map(maskProduct);
}
