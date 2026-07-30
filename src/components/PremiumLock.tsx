import React from 'react';
import { Crown, Lock, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface PremiumLockProps {
  userProfile: any;
  onNavigate: (view: string, id?: string) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export default function PremiumLock({ 
  userProfile, 
  onNavigate, 
  title = "Kipengele hiki ni cha Premium tu", 
  description = "Jiunge na Lupanulla Premium ili ufungue vipengele vyote bora vya AI na kujifunza kwa ufanisi zaidi bila kikomo.", 
  children 
}: PremiumLockProps) {
  const isPremium = userProfile?.subscription === 'premium' || userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full rounded-3xl overflow-hidden group">
      {/* Blurred background preview of the restricted content */}
      <div className="pointer-events-none select-none filter blur-md opacity-35 transition-all duration-500">
        {children}
      </div>

      {/* Lock Overlay Shield */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[4px] flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
        <div className="max-w-md space-y-6 p-6 sm:p-8 rounded-3xl border border-amber-400/30 bg-slate-900/90 shadow-2xl relative">
          {/* Glowing Aura Effect */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500 to-yellow-500 opacity-20 blur-xl group-hover:opacity-30 transition duration-1000"></div>

          {/* Crown badge */}
          <div className="relative mx-auto w-16 h-16 bg-gradient-to-tr from-amber-400 to-yellow-500 text-amber-950 rounded-full flex items-center justify-center shadow-xl mb-4">
            <Crown size={32} className="animate-pulse" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-950 border border-amber-400 rounded-full flex items-center justify-center">
              <Lock size={12} className="text-amber-400" />
            </div>
          </div>

          <div className="space-y-2 relative">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest border border-amber-400/20">
              <Sparkles size={10} className="text-amber-400 animate-pulse" />
              LUPANULLA PREMIUM REQUIRED
            </span>
            <h3 className="font-display font-extrabold text-white text-lg sm:text-xl uppercase tracking-tight">
              {title}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-semibold">
              {description}
            </p>
          </div>

          <div className="space-y-3 pt-2 relative">
            <button
              onClick={() => onNavigate('premium')}
              className="w-full py-3 px-5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Jiunge na Lupanulla Premium Sasa
              <ArrowRight size={14} />
            </button>
            
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Anza kwa gharama nafuu ya TZS 3,000 tu kwa mwezi!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
