import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  BookOpen, 
  WifiOff, 
  Users, 
  Bot, 
  FileText, 
  Gift, 
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WelcomeNotificationProps {
  onNavigate: (view: string, id?: string) => void;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

export default function WelcomeNotification({ onNavigate, isOpenExternal, onCloseExternal }: WelcomeNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // If controlled externally, use that prop
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
      return;
    }

    // Check localStorage to see if user has dismissed or seen it
    const dismissed = localStorage.getItem('lupa_welcome_notification_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000); // Friendly delay after page loads
      return () => clearTimeout(timer);
    } else {
      setHasDismissed(true);
    }
  }, [isOpenExternal]);

  const handleDismiss = (dontShowAgain = false) => {
    setIsOpen(false);
    if (onCloseExternal) {
      onCloseExternal();
    }
    if (dontShowAgain) {
      localStorage.setItem('lupa_welcome_notification_dismissed', 'true');
      setHasDismissed(true);
    }
  };

  const handleStartLearning = () => {
    handleDismiss(false); // keep it dismissible but navigate
    onNavigate('masomo');
  };

  const benefits = [
    {
      icon: <BookOpen className="text-cyan-500 shrink-0" size={20} />,
      title: "Notisi na Vitabu Vya Bure",
      description: "Notisi kamili na vitabu kulingana na mtaala wa Tanzania (Primary, O-Level na A-Level) vilivyoratibiwa kwa usomaji rahisi."
    },
    {
      icon: <WifiOff className="text-emerald-500 shrink-0" size={20} />,
      title: "Kusoma Offline (Bila Internet)",
      description: "Shukrani kwa Service Worker wetu, unaweza kusawazisha masomo uyapendayo na kuendelea kusoma au kufanya mazoezi ukiwa nje ya mtandao kikamilifu."
    },
    {
      icon: <Users className="text-indigo-500 shrink-0" size={20} />,
      title: "Kuwaunganisha Walimu, Wanafunzi na Wadau",
      description: "Lupanulla ni jukwaa bunifu linalowakutanisha walimu na wanafunzi ili kubadilishana maarifa, uzoefu, maswali, na fursa mbalimbali za kitaaluma."
    },
    {
      icon: <Bot className="text-purple-500 shrink-0" size={20} />,
      title: "Lupa+ AI (Msaidizi FisiMaji)",
      description: "Msaidizi wako binafsi wa akili mnemba wa kukusaidia kutatua hesabu magumu, kutafsiri, kufanya muhtasari, na kutoa mwongozo wa masomo saa 24/7."
    },
    {
      icon: <FileText className="text-red-500 shrink-0" size={20} />,
      title: "Past Papers & NECTA Mocks",
      description: "Maelfu ya mitihani iliyopita na mitihani ya majaribio (Mock Exams) kutoka mikoa yote nchini ikiwa na majibu sahihi ya kukuandaa kufaulu kwa alama A."
    }
  ];

  return (
    <>
      {/* Floating help pill shown only if dismissed, allowing users to re-open the welcome hub */}
      {hasDismissed && isOpenExternal === undefined && (
        <motion.button
          id="reopen-welcome-pill"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-[40] bg-white text-slate-800 border border-slate-200/80 px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer group hover:bg-slate-50"
        >
          <Sparkles size={14} className="text-cyan-500 animate-pulse group-hover:rotate-12 transition-transform" />
          <span>Kuhusu Lupanulla</span>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleDismiss(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div 
              id="welcome-notification-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden text-slate-800 z-10 max-h-[90vh] flex flex-col"
            >
              {/* Top rainbow line */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-emerald-400 via-indigo-500 to-purple-600"></div>
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4 pt-2 shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-cyan-100 text-cyan-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider flex items-center gap-1">
                      <Sparkles size={12} className="animate-pulse" /> Karibu Lupanulla Elimu Hub
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider flex items-center gap-1">
                      <Gift size={12} /> 100% Bure & Kidijitali
                    </span>
                  </div>
                  <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 leading-tight uppercase mt-2">
                    Gundua Faida za Kipekee za Lupanulla!
                  </h2>
                </div>
                <button 
                  onClick={() => handleDismiss(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 p-2.5 rounded-full transition-colors shrink-0 cursor-pointer"
                  title="Funga"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Benefits List */}
              <div className="flex-grow overflow-y-auto space-y-4 my-2 pr-2 scrollbar-thin">
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-bold">
                  Lupanulla ni mfumo dhabiti wa kisasa wa elimu nchini Tanzania ulioundwa kurahisisha ujifunzaji, kutoa nyenzo bora za mitihani, na kuunganisha jamii yote ya wasomaji na fursa mpya:
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {benefits.map((b, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all flex gap-3 items-start group"
                    >
                      <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-150 group-hover:scale-105 transition-transform">
                        {b.icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-sans font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                          {b.title}
                          <CheckCircle2 size={13} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-bold">
                          {b.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer Quote or Slogan */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-50 to-indigo-50 border border-cyan-100/50 flex items-center justify-between gap-4 mt-2">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-cyan-950 flex items-center gap-1">
                      <TrendingUp size={14} className="text-cyan-600" /> Malengo Yetu Kuu (Vision & Mission)
                    </p>
                    <p className="text-[11px] text-cyan-900/80 leading-relaxed font-semibold italic">
                      "Kuwaunganisha watu (walimu, wanafunzi na wasio wanafunzi katika ujifunzaji na fursa)."
                    </p>
                  </div>
                  <Heart size={20} className="text-red-500 shrink-0 fill-red-500 animate-pulse" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 shrink-0">
                <button 
                  onClick={handleStartLearning}
                  className="flex-grow bg-slate-950 hover:bg-slate-900 text-white font-black text-xs py-3.5 px-6 rounded-xl transition-all uppercase tracking-wider text-center flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-slate-950/10"
                >
                  <span>Anza Kujifunza Sasa</span>
                  <ArrowRight size={14} className="animate-pulse" />
                </button>
                <button 
                  onClick={() => handleDismiss(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs py-3.5 px-6 rounded-xl transition-all uppercase tracking-wider text-center border border-slate-200 w-full sm:w-auto cursor-pointer"
                >
                  Usionyeshe tena
                </button>
                <button 
                  onClick={() => handleDismiss(false)}
                  className="bg-white hover:bg-slate-50 text-slate-500 font-extrabold text-xs py-3.5 px-6 rounded-xl transition-all uppercase tracking-wider text-center border border-slate-200 w-full sm:w-auto cursor-pointer"
                >
                  Funga
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
