import React, { useEffect, useState } from 'react';
import { Sparkles, Heart, ShieldCheck, HelpCircle } from 'lucide-react';

interface AdSenseWidgetProps {
  slotId?: string; // Optional custom slot ID
  clientId?: string; // Optional custom client ID
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function AdSenseWidget({
  slotId,
  clientId,
  format = 'auto',
  responsive = true,
  className = '',
  style
}: AdSenseWidgetProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Read from environment variables with fallback
  const adClientId = clientId || (import.meta as any).env?.VITE_ADSENSE_CLIENT_ID || 'ca-pub-4209377418042440'; // primary publisher ID
  const adSlotId = slotId || (import.meta as any).env?.VITE_ADSENSE_SLOT_ID || '8026110038'; // fallback slot ID

  useEffect(() => {
    // 1. Check if the script is already loaded
    const scriptSrc = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClientId}`;
    let script = document.querySelector(`script[src="${scriptSrc}"]`) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onerror = () => {
        console.warn('AdSense script failed to load. Displaying professional platform support placeholder.');
        setHasError(true);
      };
      script.onload = () => {
        setIsLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      setIsLoaded(true);
    }

    // 2. Initialize AdSense
    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (err) {
      console.warn('AdSense initialization error (this is normal in development, preview, or with AdBlockers):', err);
      // We do not treat this as fatal to keep the experience clean, but we show a beautiful backup
    }
  }, [adClientId, adSlotId]);

  // If there's an error loading the script, or we are in development/iframe where AdSense may be blocked,
  // we render a beautiful, highly polished banner supporting the Lupanulla Elimu Hub.
  const isDevOrBlocked = !isLoaded || hasError || window.location.hostname.includes('localhost') || window.location.hostname.includes('run.app');

  if (isDevOrBlocked) {
    return (
      <div 
        className={`bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-cyan-500/20 relative overflow-hidden group select-none ${className}`}
        style={style}
      >
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-4 translate-x-4">
          <Sparkles size={160} className="text-cyan-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider font-mono">
                Sponsor & Ads
              </span>
              <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider font-mono flex items-center gap-0.5">
                <ShieldCheck size={10} /> Verified Safe
              </span>
            </div>
            
            <h4 className="font-display font-black text-sm uppercase tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              Saidia Lupanulla Elimu Hub Platform
            </h4>
            
            <p className="text-cyan-100/70 text-xs leading-relaxed max-w-2xl font-medium">
              Kuona matangazo ya Google AdSense na washirika wetu rasmi hutusaidia kugharamia mitambo, kuendeleza mtaala mzima wa elimu, notisi za bure, na kuongeza maswali mapya ya mitihani ya NECTA.
            </p>
          </div>

          <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch md:items-center gap-2">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-2.5 text-center flex flex-col justify-center min-w-[120px]">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Ad Client ID</span>
              <span className="font-mono text-xs text-slate-200 font-extrabold truncate max-w-[110px] mt-0.5">{adClientId}</span>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-2.5 text-center flex flex-col justify-center min-w-[120px]">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Ad Slot ID</span>
              <span className="font-mono text-xs text-slate-200 font-extrabold truncate max-w-[110px] mt-0.5">{adSlotId}</span>
            </div>
          </div>
        </div>

        {/* Small subtle footer representing operations */}
        <div className="border-t border-slate-800/55 pt-3 mt-4 flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-semibold gap-2">
          <div className="flex items-center gap-1">
            <Heart size={10} className="text-rose-500 fill-rose-500 animate-pulse" />
            <span>Asante kwa kuunga mkono maendeleo ya elimu Tanzania</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-800/20 px-2 py-0.5 rounded border border-slate-800">
            <HelpCircle size={10} />
            <span>Responsive Ad Unit - Google Partner</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`adsense-container my-6 text-center overflow-hidden ${className}`} style={style}>
      <p className="text-[9px] text-slate-405 font-bold uppercase tracking-wider mb-1">MATANGAZO / ADVERTISEMENT</p>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px', ...style }}
        data-ad-client={adClientId}
        data-ad-slot={adSlotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
