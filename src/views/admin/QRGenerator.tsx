import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function QRGenerator() {
  const [url, setUrl] = useState('');
  const [qrCode, setQrCode] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ target_url: url })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setQrCode(data);
      toast.success('QR Code Generated');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      
      <div className="md:col-span-12 bg-white rounded-3xl p-10 flex flex-col justify-center text-inverse mb-4">
        <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-inverse/40 mb-2">QR Terminal</h2>
        <h1 className="text-4xl font-serif italic mb-6">Generate Tag</h1>
        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-inverse/40 mb-2">Target URL or Path</label>
            <input 
              type="text" 
              required 
              value={url} 
              onChange={e=>setUrl(e.target.value)} 
              placeholder="/product/123"
              className="w-full bg-inverse/5 border border-inverse/10 p-4 rounded-xl text-inverse placeholder:text-inverse/40 focus:outline-none focus:border-[#C5A059]" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-inverse text-primary-text px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#C5A059] transition-colors mt-2 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Code'}
          </button>
        </form>
      </div>

      {qrCode && (
        <div className="md:col-span-6 bg-[#121212] border border-base-border/5 rounded-3xl p-8 flex flex-col items-center justify-center">
          <div className="bg-white p-6 justify-center rounded-[2rem] shadow-2xl shadow-black mb-6 border-8 border-base-border/10 outline outline-1 outline-white/5">
             <img src={qrCode.image_url} alt="Generated QR" className="w-48 h-48 md:w-64 md:h-64 object-contain" />
          </div>
          <p className="text-primary-text/40 font-mono text-[10px] break-all max-w-[200px] text-center">{qrCode.target_url}</p>
          <a href={qrCode.image_url} download="qr_code.png" className="mt-8 bg-primary/5 border border-base-border/10 hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-inverse text-primary-text px-6 py-3 rounded-2xl tracking-[0.2em] text-[10px] font-bold uppercase transition-colors">
            Download Image
          </a>
        </div>
      )}
    </div>
  );
}
