import React from 'react';
import { Target, Compass, Users, Sparkles, GraduationCap } from 'lucide-react';

export default function VisionMission() {
  return (
    <section id="vision-mission" className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white border border-slate-800 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10 space-y-8">
        {/* Header Title with Custom Icon */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-black uppercase tracking-widest border border-cyan-500/20">
            <Sparkles size={12} className="animate-pulse" />
            <span>Kuhusu Lupanulla Elimu Hub</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-white leading-tight">
            Dira na Dhamira Yetu
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
            Soma falsafa yetu kuu inayoweka msingi thabiti wa mapinduzi ya kidijitali katika sekta ya elimu na kuleta fursa sawa kwa kila mmoja.
          </p>
        </div>

        {/* Vision & Mission Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch pt-4">
          
          {/* Card 1: Dira (Vision) */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-cyan-500/30 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center border border-cyan-500/20 shadow-md">
                <Compass size={24} className="group-hover:rotate-45 transition-transform duration-500" />
              </div>
              <div className="space-y-2">
                <span className="text-cyan-400 font-extrabold text-xs uppercase tracking-widest block">DIRA YETU (VISION)</span>
                <h3 className="text-lg sm:text-xl font-display font-black text-white uppercase">Ulimwengu wa Ujifunzaji Huria</h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Kuwa jukwaa nambari moja nchini Tanzania linalobadilisha jinsi elimu inavyotolewa na kupatikana kwa kutumia teknolojia, ili kuwezesha ujifunzaji usio na mipaka na kuboresha maisha ya kila mtu.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-900/50 flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
              <GraduationCap size={14} />
              <span>Elimu bora bila ubaguzi</span>
            </div>
          </div>

          {/* Card 2: Dhamira (Mission) - Prominent and exactly as requested */}
          <div className="bg-gradient-to-b from-indigo-950/40 to-slate-950/40 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-indigo-500/40 transition-all group flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-md">
                <Target size={24} className="group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="space-y-2">
                <span className="text-indigo-400 font-extrabold text-xs uppercase tracking-widest block">DHAMIRA YETU (MISSION)</span>
                <h3 className="text-lg sm:text-xl font-display font-black text-white uppercase">Kuunganisha Kupitia Ujuzi</h3>
                <p className="text-cyan-200 text-sm sm:text-base leading-relaxed font-semibold italic border-l-2 border-indigo-500 pl-3">
                  "Kuwaunganisha watu (walimu, wanafunzi na wasio wanafunzi katika ujifunzaji na fursa)."
                </p>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pt-1">
                  Tunafanya kazi hii kwa kuweka mazingira wezeshi ya ushirikiano, kutoa vifaa na maktaba kubwa ya past papers, masomo, na nyenzo za kisasa kabisa ambazo zinafuta kabisa umbali kati ya kiu ya maarifa na fursa za kufanikiwa.
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-900/50 flex items-center gap-1.5 text-xs text-indigo-400 font-bold relative z-10">
              <Users size={14} />
              <span>Jamii iliyounganishwa kiujuzi</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
