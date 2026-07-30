import React, { useState, useMemo } from 'react';
import { 
  Book, 
  Search, 
  Filter,
  CheckCircle, 
  Sparkles,
  Bookmark,
  ChevronDown
} from 'lucide-react';
import { KAMUSI_WORDS_1000, DictionaryWord } from '../data/kamusiData';

export default function KamusiView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('Zote');
  const [selectedLetter, setSelectedLetter] = useState<string>('Zote');
  const [visibleCount, setVisibleCount] = useState<number>(24);

  const subjects = useMemo(() => {
    const list = Array.from(new Set(KAMUSI_WORDS_1000.map(w => w.subject)));
    return ['Zote', ...list.sort()];
  }, []);

  const alphabet = useMemo(() => {
    return ['Zote', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
  }, []);

  const filteredWords = useMemo(() => {
    return KAMUSI_WORDS_1000.filter(item => {
      // Subject Filter
      if (selectedSubject !== 'Zote' && item.subject !== selectedSubject) {
        return false;
      }

      // Letter Filter
      if (selectedLetter !== 'Zote' && !item.word.toUpperCase().startsWith(selectedLetter)) {
        return false;
      }

      // Search Filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          item.word.toLowerCase().includes(q) ||
          item.translation.toLowerCase().includes(q) ||
          item.definition.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [searchQuery, selectedSubject, selectedLetter]);

  const visibleWords = useMemo(() => {
    return filteredWords.slice(0, visibleCount);
  }, [filteredWords, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 24);
  };

  return (
    <div id="kamusi-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50 max-w-5xl mx-auto pb-16">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-cyan-700 via-indigo-900 to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-cyan-500/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-extrabold uppercase tracking-wider border border-cyan-400/20">
              <Book size={14} /> Kamusi Kuu ya Taaluma
            </span>
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles size={12} /> Msamiati: {KAMUSI_WORDS_1000.length.toLocaleString()} Maneno
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-display font-black uppercase tracking-tight text-white">
            Kamusi ya Masomo Lupanulla
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-2xl font-medium">
            Tafuta maana, tafsiri rasmi ya Kiswahili, na mifano ya matumizi ya msamiati zaidi ya <strong className="text-cyan-300 font-bold">1,000</strong> katika masomo ya Sayansi, Hisabati, Jamii, na Lugha kwa mtaala wa NECTA.
          </p>
        </div>
      </section>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Tafuta msamiati au tafsiri (Mfano: Velocity, Photosynthesis, Equation, Mfumo)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(24);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-slate-800 placeholder-slate-400 shadow-inner transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setVisibleCount(24);
              }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-slate-400 hover:text-slate-700"
            >
              Futa
            </button>
          )}
        </div>

        {/* Subject Filter Pills */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Filter size={13} className="text-cyan-600" /> Chagua Somo:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  setSelectedSubject(sub);
                  setVisibleCount(24);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  selectedSubject === sub 
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Alphabet Filter (A-Z) */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Tafuta kwa Herufi ya Kuanzia (A - Z):
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => {
                  setSelectedLetter(letter);
                  setVisibleCount(24);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                  selectedLetter === letter 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header Summary */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
          Yalioonekana: <span className="text-slate-900 font-extrabold">{filteredWords.length.toLocaleString()}</span> kati ya {KAMUSI_WORDS_1000.length.toLocaleString()} maneno
        </p>
        {(selectedSubject !== 'Zote' || selectedLetter !== 'Zote' || searchQuery !== '') && (
          <button
            onClick={() => {
              setSelectedSubject('Zote');
              setSelectedLetter('Zote');
              setSearchQuery('');
              setVisibleCount(24);
            }}
            className="text-xs font-extrabold text-cyan-600 hover:underline"
          >
            Onyesha Yote
          </button>
        )}
      </div>

      {/* Dictionary Word Cards Grid */}
      <div className="space-y-6">
        {visibleWords.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleWords.map((item, idx) => (
                <div 
                  key={`${item.word}-${idx}`} 
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-cyan-400 hover:shadow-md transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-extrabold">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200/50 uppercase tracking-wider">
                        {item.subject}
                      </span>
                      <Bookmark size={14} className="text-slate-300 group-hover:text-cyan-500 transition-colors" />
                    </div>

                    <div>
                      <h3 className="font-display font-black text-slate-950 text-base sm:text-lg uppercase tracking-tight leading-tight group-hover:text-cyan-700 transition-colors">
                        {item.word}
                      </h3>
                      <p className="font-bold text-cyan-700 text-xs sm:text-sm mt-0.5">
                        {item.translation}
                      </p>
                    </div>

                    <p className="text-slate-600 text-xs leading-relaxed pt-1 font-medium">
                      {item.definition}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-600 leading-relaxed font-medium">
                    <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] block mb-0.5">Mfano wa Matumizi:</span>
                    &quot;{item.example}&quot;
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredWords.length && (
              <div className="text-center pt-6">
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-extrabold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                >
                  <span>Onyesha Maneno Zaidi (+24)</span>
                  <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center py-16 space-y-3 shadow-sm">
            <Book size={36} className="mx-auto text-slate-300" />
            <h4 className="font-extrabold text-slate-900 text-sm uppercase">Hakuna msamiati uliopatikana</h4>
            <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed font-medium">
              Jaribu kubadilisha herufi, kuteua somo lingine au kufuta neno ulilotafuta. Msaidizi wetu **Lupanulla AI** yupo tayari kukusaidia na tafsiri yoyote pia!
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
