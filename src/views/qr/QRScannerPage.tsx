import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';

export default function QRScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    }, false);

    scanner.render(
      (result) => {
        scanner.clear();
        setScanResult(result);
        // Attempt to navigate if it's a path within our app (e.g. /product/123)
        // If it's full URL, we redirect
        try {
          const url = new URL(result);
          if (url.origin === window.location.origin) {
            navigate(url.pathname);
          } else {
             window.location.href = result;
          }
        } catch {
           navigate(result); // Assume it's a relative path
        }
      },
      (err) => {
        // Ignoring standard scanning errors (no code found)
      }
    );

    return () => {
      scanner.clear().catch(e => console.error(e));
    };
  }, [navigate]);

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[500px]">
      <div className="w-full max-w-md bg-[#121212] border border-base-border/5 rounded-3xl p-8 flex flex-col items-center">
        <div className="w-16 h-16 border-2 border-base-border/10 border-dashed rounded-2xl mb-6 flex items-center justify-center text-primary-text/50">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h3m-3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tighter text-primary-text mb-2 text-center">Scan Product</h1>
        <p className="text-xs text-primary-text/40 mb-8 uppercase tracking-widest font-mono text-center">Instantly add to cart</p>
        
        <div className="w-full bg-[#050505] border border-base-border/5 rounded-[2rem] overflow-hidden p-2">
          <div id="reader" className="w-full text-[#050505] [&_video]:rounded-2xl [&_button]:bg-white [&_button]:text-inverse [&_button]:px-4 [&_button]:py-2 [&_button]:rounded-xl [&_button]:text-[10px] [&_button]:font-bold [&_button]:uppercase [&_button]:tracking-widest [&_select]:border-none [&_select]:bg-primary/5 [&_select]:text-primary-text [&_select]:text-[10px] [&_select]:uppercase [&_select]:p-2 [&_select]:rounded-lg"></div>
        </div>
        
        {scanResult && (
          <div className="mt-8 p-4 border border-[#C5A059]/20 rounded-xl bg-[#C5A059]/10 text-center text-[#C5A059] text-[10px] uppercase tracking-widest font-bold">
            Processing: {scanResult}
          </div>
        )}
      </div>
    </div>
  );
}
