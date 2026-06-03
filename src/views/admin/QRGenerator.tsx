import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Copy, Download, Link2, QrCode, RefreshCw, Smartphone, Sparkles } from 'lucide-react';

type QRResult = {
  image_url: string;
  target_url: string;
};

const quickTargets = [
  { label: 'Boutique', value: '/' },
  { label: 'Soks', value: '/?category=SOCKS' },
  { label: 'Culottes', value: '/?category=SHORTS' },
  { label: 'Souliers', value: '/?category=FOOTWEAR' },
];

function normalizeTargetUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `${window.location.origin}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

export default function QRGenerator() {
  const [url, setUrl] = useState('/');
  const [qrCode, setQrCode] = useState<QRResult | null>(null);
  const [loading, setLoading] = useState(false);

  const previewUrl = useMemo(() => normalizeTargetUrl(url), [url]);

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Configuration Supabase manquante');
      }

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ target_url: previewUrl }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Generation QR impossible');

      setQrCode(data);
      toast.success('QR code genere');
    } catch (error: any) {
      toast.error(error.message || 'Erreur QR');
    } finally {
      setLoading(false);
    }
  };

  const copyTarget = async () => {
    await navigator.clipboard.writeText(qrCode?.target_url ?? previewUrl);
    toast.success('Lien copie');
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="admin-hero min-h-[300px] p-8 lg:p-10 flex flex-col justify-between overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="text-[10px] uppercase tracking-[0.22em] text-inverse-text/50 font-bold mb-5">Terminal QR</div>
          <h1 className="text-4xl lg:text-6xl font-display font-bold tracking-tight text-inverse-text leading-tight">
            Creez des codes rapides pour rayon, vitrine, livraison et promotions.
          </h1>
        </div>
        <div className="relative z-10 mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickTargets.map(item => (
            <button
              key={item.value}
              type="button"
              onClick={() => setUrl(item.value)}
              className="rounded-2xl border border-black/10 bg-black/[0.04] px-4 py-3 text-left text-inverse-text transition-all hover:bg-black hover:text-white"
            >
              <span className="block text-[10px] uppercase tracking-[0.16em] opacity-55">Lien rapide</span>
              <span className="mt-1 block text-sm font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="grid xl:grid-cols-[minmax(0,1fr)_420px] gap-5">
        <div className="admin-panel p-6 lg:p-8">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-sm uppercase tracking-[0.18em] font-bold text-primary-text">Generation</h2>
              <p className="text-xs text-primary-text/45 mt-1">Collez une page produit, une categorie ou une URL complete.</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-accent-500/12 text-accent-500 flex items-center justify-center">
              <QrCode size={22} />
            </div>
          </div>

          <form onSubmit={handleGenerate} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-primary-text/45">Destination</span>
              <div className="relative">
                <Link2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-text/30" />
                <input
                  type="text"
                  required
                  value={url}
                  onChange={event => setUrl(event.target.value)}
                  placeholder="/product/123"
                  className="w-full bg-primary/55 border border-base-border/10 pl-12 pr-4 py-4 rounded-2xl text-primary-text placeholder:text-primary-text/30 focus:outline-none focus:border-accent-500 transition-colors"
                />
              </div>
            </label>

            <div className="rounded-2xl bg-primary/35 border border-base-border/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.18em] text-primary-text/35 font-bold">Apercu final</div>
                <div className="mt-1 text-sm text-primary-text/70 break-all">{previewUrl}</div>
              </div>
              <button type="button" onClick={copyTarget} className="admin-action-button shrink-0">
                <Copy size={14} />
                Copier
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-accent-600 hover:bg-accent-500 text-primary-text py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.18em] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {loading ? 'Generation...' : 'Generer le code'}
            </button>
          </form>
        </div>

        <div className="admin-panel p-6 lg:p-8 flex flex-col items-center justify-center min-h-[430px]">
          {qrCode ? (
            <>
              <div className="bg-white p-6 rounded-[2rem] shadow-2xl shadow-black/40 border border-white/20 animate-admin-enter">
                <img src={qrCode.image_url} alt="QR code genere" className="w-56 h-56 object-contain" />
              </div>
              <p className="text-primary-text/45 font-mono text-[11px] break-all max-w-[320px] text-center mt-6">{qrCode.target_url}</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <a href={qrCode.image_url} download="aura-qr-code.png" className="admin-action-button">
                  <Download size={14} />
                  Telecharger
                </a>
                <button type="button" onClick={copyTarget} className="admin-action-button">
                  <Copy size={14} />
                  Copier lien
                </button>
              </div>
            </>
          ) : (
            <div className="text-center max-w-sm">
              <div className="mx-auto h-24 w-24 rounded-[2rem] border border-base-border/10 bg-primary/45 flex items-center justify-center text-accent-500 mb-6">
                <Smartphone size={32} />
              </div>
              <h2 className="text-xl font-display font-bold text-primary-text">Pret pour le scan</h2>
              <p className="text-sm text-primary-text/45 mt-3">
                Generez un QR pour envoyer un client directement vers une categorie ou une fiche produit.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-5">
        {[
          ['Rayon physique', 'Imprimez un QR par categorie pour connecter stock boutique et catalogue web.'],
          ['Reseaux sociaux', 'Collez un lien produit dans les stories et suivez les commandes qui suivent.'],
          ['Preparation colis', 'Ajoutez un QR retour boutique dans chaque commande pour relancer le prochain achat.'],
        ].map(([title, text], index) => (
          <div key={title} className="admin-metric p-5 animate-admin-enter opacity-0" style={{ animationDelay: `${index * 80}ms` }}>
            <div className="text-[10px] uppercase tracking-[0.18em] text-accent-500 font-bold">Usage</div>
            <h3 className="text-lg font-display font-bold text-primary-text mt-3">{title}</h3>
            <p className="text-sm text-primary-text/45 mt-3 leading-6">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
