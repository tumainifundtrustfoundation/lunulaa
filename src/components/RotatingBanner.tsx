import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Crown, 
  Calculator, 
  BookOpen, 
  Calendar,
  MessageSquare,
  Bot
} from 'lucide-react';

interface BannerSlide {
  id: number;
  badge: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  subtitle: string;
  description: string;
  actionText: string;
  targetView: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  bgGradient: string;
  borderColor: string;
}

interface RotatingBannerProps {
  onNavigate: (view: string, id?: string) => void;
}

export default function RotatingBanner({ onNavigate }: RotatingBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const [isHovered, setIsHovered] = useState(false);

  const slides: BannerSlide[] = [
    {
      id: 1,
      badge: "Lupanulla AI 🤖",
      badgeBg: "bg-cyan-500/10 border-cyan-400/20",
      badgeText: "text-cyan-300",
      title: "Msaidizi Mahiri wa Masomo Lupanulla AI",
      subtitle: "Ufafanuzi Hatua kwa Hatua",
      description: "Uliza maswali ya Hesabu, Fizikia, Kemia au Historia ya NECTA na upate majibu ya kina kulingana na mtaala rasmi wa TIE!",
      actionText: "Anza Chat sasa",
      targetView: "fisimaji",
      icon: Bot,
      iconColor: "text-cyan-400",
      bgGradient: "from-slate-950 via-cyan-950 to-slate-900",
      borderColor: "border-cyan-500/20"
    },
    {
      id: 2,
      badge: "Premium 🚀",
      badgeBg: "bg-amber-400/10 border-amber-400/20",
      badgeText: "text-amber-300",
      title: "Jiunge na Lupanulla Premium Leo",
      subtitle: "Notisi zote Bila Kikomo",
      description: "Pata PDF za notisi zote rasmi, miongozo ya mitihani ya NECTA, na mazoezi ya kujipima kwa Tsh 5,000 tu kwa mwezi!",
      actionText: "Jiunge sasa",
      targetView: "premium",
      icon: Crown,
      iconColor: "text-amber-400",
      bgGradient: "from-slate-950 via-amber-950/40 to-slate-900",
      borderColor: "border-amber-400/20"
    },
    {
      id: 3,
      badge: "Kikokotoo GPA 📊",
      badgeBg: "bg-emerald-500/10 border-emerald-400/20",
      badgeText: "text-emerald-300",
      title: "Kikokotoo cha GPA Points",
      subtitle: "Kadiria Kiwango chako cha Ufaulu",
      description: "Kokotoa Pointi na Division zako za mitihani ya NECTA (Form 4 na Form 6) kwa mifumo yote mipya na ya zamani!",
      actionText: "Fungua Kikokotoo",
      targetView: "calculator",
      icon: Calculator,
      iconColor: "text-emerald-400",
      bgGradient: "from-slate-950 via-emerald-950/30 to-slate-900",
      borderColor: "border-emerald-500/20"
    },
    {
      id: 4,
      badge: "Mijadala Forum 💬",
      badgeBg: "bg-indigo-500/10 border-indigo-400/20",
      badgeText: "text-indigo-300",
      title: "Mijadala na Majadiliano ya Masomo",
      subtitle: "Wanafunzi Maelfu Tanzania",
      description: "Uliza maswali magumu, jadiliana na marafiki, na ushiriki mbinu za kujisomea katika mtandao mkubwa wa wanafunzi!",
      actionText: "Ingia Forum",
      targetView: "forum",
      icon: MessageSquare,
      iconColor: "text-indigo-400",
      bgGradient: "from-slate-950 via-indigo-950/40 to-slate-900",
      borderColor: "border-indigo-500/20"
    },
    {
      id: 5,
      badge: "NECTA Papers 📝",
      badgeBg: "bg-rose-500/10 border-rose-400/20",
      badgeText: "text-rose-300",
      title: "Karatasi za Mitihani Iliyopita (Past Papers)",
      subtitle: "Mazoezi Kamili ya Mitihani",
      description: "Mkusanyiko mkubwa wa mitihani ya NECTA iliyopita, majibu yake, na ripoti za wasahihishaji za miaka 20 iliyopita!",
      actionText: "Kagua Mitihani",
      targetView: "mitihani",
      icon: BookOpen,
      iconColor: "text-rose-400",
      bgGradient: "from-slate-950 via-rose-950/30 to-slate-900",
      borderColor: "border-rose-500/20"
    }
  ];

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000); // Rotate every 6 seconds
    return () => clearInterval(interval);
  }, [isHovered, slides.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  // Custom slide variants for left-to-right (and vice versa) motion
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? -400 : 400,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? -400 : 400,
      opacity: 0,
    }),
  };

  const activeSlide = slides[currentIndex];
  const IconComponent = activeSlide.icon;

  return (
    <div 
      id="rotating-event-banner"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onNavigate(activeSlide.targetView)}
      className={`relative rounded-3xl overflow-hidden cursor-pointer border ${activeSlide.borderColor} bg-gradient-to-r ${activeSlide.bgGradient} p-5 sm:p-7 shadow-xl hover:shadow-2xl hover:scale-[1.005] transition-all duration-300 mb-6 select-none group`}
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      {/* Moving progress bar at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900">
        <motion.div 
          key={currentIndex}
          initial={{ width: '0%' }}
          animate={isHovered ? { width: '0%' } : { width: '100%' }}
          transition={{ duration: 6, ease: "linear" }}
          className="h-full bg-cyan-500 rounded-r-full"
        />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        
        {/* Animated Slide Content Box */}
        <div className="flex-grow min-w-0">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 bg-white/10 ${activeSlide.badgeBg} ${activeSlide.badgeText} text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border`}>
                  {activeSlide.badge}
                </span>
                <span className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase">• Tukio Muhimu</span>
              </div>

              <div className="space-y-1">
                <h2 className="text-lg sm:text-2xl font-display font-black text-white leading-tight uppercase tracking-tight">
                  {activeSlide.title}
                </h2>
                <p className="text-cyan-400 text-xs sm:text-sm font-bold tracking-wide uppercase">
                  {activeSlide.subtitle}
                </p>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium max-w-3xl">
                {activeSlide.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right side: Action button & Icon preview */}
        <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 mt-2 md:mt-0">
          
          {/* Visual Indicator of slides */}
          <div className="flex gap-1.5 md:hidden">
            {slides.map((_, idx) => (
              <span 
                key={idx} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-cyan-400 scale-125' : 'bg-slate-700'}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Custom Icon Component */}
            <div className={`hidden sm:flex w-16 h-16 rounded-2xl bg-white/5 border border-white/10 items-center justify-center ${activeSlide.iconColor} group-hover:scale-110 transition-transform duration-300`}>
              <IconComponent size={32} className="stroke-[1.5]" />
            </div>

            {/* Action button */}
            <div className="bg-white hover:bg-slate-100 text-slate-950 font-black text-xs px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-lg flex items-center gap-1.5 uppercase tracking-wider group-hover:scale-105 active:scale-98 transition-all">
              <span>{activeSlide.actionText}</span>
              <ChevronRight size={14} className="stroke-[3] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

        </div>

      </div>

      {/* Manual Slide Navigation Controls */}
      <div className="absolute right-4 top-4 hidden md:flex gap-1.5 z-20">
        <button 
          onClick={handlePrev}
          className="w-8 h-8 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
          title="Nyuma"
        >
          <ChevronLeft size={16} className="stroke-[2.5]" />
        </button>
        
        {/* Visual indicators */}
        <div className="flex items-center gap-1 px-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl text-[10px] font-mono font-bold text-slate-400">
          <span>{currentIndex + 1}</span>
          <span className="opacity-50">/</span>
          <span>{slides.length}</span>
        </div>

        <button 
          onClick={handleNext}
          className="w-8 h-8 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
          title="Mbele"
        >
          <ChevronRight size={16} className="stroke-[2.5]" />
        </button>
      </div>

    </div>
  );
}
