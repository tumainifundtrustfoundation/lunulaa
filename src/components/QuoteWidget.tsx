import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Copy, Check, Quote } from 'lucide-react';

interface QuoteItem {
  swahili: string;
  english: string;
  author: string;
  role: string;
}

const TANZANIAN_QUOTES: QuoteItem[] = [
  {
    swahili: "Elimu si njia ya kujipatia maisha mazuri ya baadaye tu, bali ni chombo cha ukombozi wa fikra na maendeleo ya jamii yetu.",
    english: "Education is not only a way of securing a good future; it is a tool for mental liberation and community development.",
    author: "Mwalimu Julius Kambarage Nyerere",
    role: "Baba wa Taifa la Tanzania"
  },
  {
    swahili: "Mwanafunzi mwenye bidii ni lulu katika jamii; juhudi zake za sasa ndizo zitakazojenga taifa imara la kesho.",
    english: "A diligent student is a pearl in society; their current efforts are what will build a strong nation tomorrow.",
    author: "Shaaban Robert",
    role: "Mwandishi na Mshairi Mashuhuri wa Kiswahili"
  },
  {
    swahili: "Jitihada haziachi patupu. Kila tone la jasho unalomwaga leo kwenye vitabu litazaa matunda ya dhahabu hapo kesho.",
    english: "Effort never goes unrewarded. Every drop of sweat you pour on books today will bear golden fruits tomorrow.",
    author: "Methali ya Kiswahili",
    role: "Hekima ya Jadi"
  },
  {
    swahili: "Wanafunzi wa kike na wa kiume, simamieni ndoto zenu kwa ujasiri. Elimu ndiyo ufunguo wa kipekee utakaowafungulia milango yote duniani.",
    english: "Female and male students, stand by your dreams with courage. Education is the unique key that will unlock all doors for you in the world.",
    author: "Mh. Samia Suluhu Hassan",
    role: "Rais wa Jamhuri ya Muungano wa Tanzania"
  },
  {
    swahili: "Kuvumilia changamoto za masomo leo kutakuletea utamu wa mafanikio ya kesho. Mvumilivu hula mbivu.",
    english: "Enduring the challenges of studying today will bring you the sweetness of tomorrow's success. Patience pays.",
    author: "Methali ya Kiswahili",
    role: "Hekima ya Kiswahili"
  },
  {
    swahili: "Ushindani katika ulimwengu wa sasa hauhitaji nguvu za mwili pekee, bali unahitaji maarifa, ubunifu, na utayari wa kujifunza kila siku.",
    english: "Competition in today's world requires not only physical strength, but knowledge, creativity, and the willingness to learn every day.",
    author: "Benjamin William Mkapa",
    role: "Rais wa Awamu ya Tatu, Tanzania"
  },
  {
    swahili: "Kalamu na karatasi vina nguvu ya kubadilisha hatma ya maskini kuwa tajiri wa busara na kiongozi bora wa baadaye.",
    english: "The pen and paper have the power to change the destiny of the poor into a wealthy person of wisdom and a great leader of tomorrow.",
    author: "Shaaban Robert",
    role: "Baba wa Fasihi ya Kiswahili"
  },
  {
    swahili: "Elimu ni mwanga unaomulika njia ya mafanikio; asiye na elimu yuko gizani mchana kweupe.",
    english: "Education is a light that illuminates the path to success; he who lacks education is in darkness even in broad daylight.",
    author: "Hekima ya Watanzania",
    role: "Msemo wa Busara"
  },
  {
    swahili: "Kujisomea na kupata maarifa mapya ndiyo nguzo kuu ya uhuru wa kweli wa mwanadamu.",
    english: "To study and acquire new knowledge is the main pillar of true human freedom.",
    author: "Mwalimu Julius K. Nyerere",
    role: "Baba wa Taifa"
  },
  {
    swahili: "Heka heka za kukesha na kusoma kwa bidii si mateso, bali ni uwekezaji makini wa dhahabu kwa ajili ya maisha yako ya baadaye.",
    english: "The hustle of staying up late and studying hard is not suffering, but a serious golden investment for your future life.",
    author: "Msemo wa Wanafunzi Tanzania",
    role: "Hekima ya Shule"
  }
];

export default function QuoteWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  // Set a random quote on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * TANZANIAN_QUOTES.length);
    setCurrentIndex(randomIndex);
  }, []);

  const handleRefresh = () => {
    setIsSpinning(true);
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * TANZANIAN_QUOTES.length);
    } while (nextIndex === currentIndex && TANZANIAN_QUOTES.length > 1);

    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setIsSpinning(false);
      setCopied(false);
    }, 400); // Small delay for the spinning transition feel
  };

  const handleCopy = () => {
    const current = TANZANIAN_QUOTES[currentIndex];
    const textToCopy = `"${current.swahili}" — ${current.author} (${current.role})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const current = TANZANIAN_QUOTES[currentIndex];

  return (
    <div 
      id="portal-quote-widget" 
      className="bg-gradient-to-br from-teal-50/80 via-emerald-50/40 to-white dark:from-slate-900/60 dark:to-slate-950 border border-emerald-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden transition-all duration-300"
    >
      {/* Background elegant large quote symbol for design rhythm */}
      <div className="absolute right-6 bottom-4 text-emerald-500/5 pointer-events-none select-none">
        <Quote size={140} className="stroke-[1.5]" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4 max-w-4xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles size={12} className="animate-pulse" /> Nukuu ya Siku / Quote of the Day
            </span>
          </div>

          <div className="space-y-3">
            {/* Swahili Quote in serif font for deep traditional vibe */}
            <h3 className="font-serif italic font-medium text-lg sm:text-xl text-slate-900 dark:text-slate-100 leading-relaxed">
              “{current.swahili}”
            </h3>
            
            {/* English Translation */}
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-sans italic leading-relaxed">
              “{current.english}”
            </p>
          </div>

          <div className="pt-2">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {current.author}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
              {current.role}
            </p>
          </div>
        </div>

        {/* Dynamic Action Buttons */}
        <div className="flex sm:flex-row md:flex-col gap-2 self-start md:self-center">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Soma Nukuu Nyingine"
          >
            <RefreshCw size={14} className={`${isSpinning ? 'animate-spin' : ''}`} />
            <span>Nyingine</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 border rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
              copied 
                ? 'bg-emerald-600 text-white border-emerald-600' 
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 border border-slate-200 dark:border-slate-800'
            }`}
            title="Nakili Nukuu"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Imenakiliwa!' : 'Nakili'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
