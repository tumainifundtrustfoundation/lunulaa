import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  CheckCircle2, 
  HelpCircle, 
  Shuffle, 
  Layers, 
  Brain, 
  Award,
  AlertCircle
} from 'lucide-react';
import { DocumentMetadata } from '../types';

interface Flashcard {
  term: string;
  definition: string;
}

interface FlashcardsModalProps {
  doc: DocumentMetadata;
  isOpen: boolean;
  onClose: () => void;
}

export default function FlashcardsModal({ doc, isOpen, onClose }: FlashcardsModalProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedIndices, setLearnedIndices] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback static seed cards depending on the category or document title
  const getFallbackCards = (document: DocumentMetadata): Flashcard[] => {
    const titleLower = document.title.toLowerCase();
    
    if (titleLower.includes('physics') || titleLower.includes('fizikia')) {
      return [
        { term: 'Velocity (Kasi mwelekeo)', definition: 'Kasi ya mwendo wa kitu katika mwelekeo maalum. Ni kipimo cha vector kinachojumuisha mwendokasi na uelekeo.' },
        { term: 'Newton\'s First Law of Motion', definition: 'Kitu kitaendelea kubaki katika hali yake ya utulivu au mwendo wa mstari mnyooka usiobadilika usipolazimishwa na nguvu ya nje (inertia).' },
        { term: 'Acceleration (Mchapuko)', definition: 'Kiwango cha mabadiliko ya kasi kwa kila sekunde. Hupimwa kwa mita kwa kila sekunde ya mraba (m/s²).' },
        { term: 'Electric Current (Mkondo wa Umeme)', definition: 'Kiwango cha mtiririko wa chaji za umeme (kama vile elektroni) kupitia kondakta kwa wakati fulani. Hupimwa kwa Ampea (A).' },
        { term: 'Inertia (Uzembe)', definition: 'Hali ya kitu kupinga mabadiliko yoyote katika hali yake ya utulivu au mwendo wa mstari mnyooka.' },
        { term: 'Momentum (Kani mwendo)', definition: 'Zao la masi ya kitu na kasi yake (p = mv). Ni kipimo cha jinsi ilivyo vigumu kusimamisha kitu kinachotembea.' }
      ];
    } else if (titleLower.includes('math') || titleLower.includes('hesabu') || titleLower.includes('basic mathematics')) {
      return [
        { term: 'Quadratic Equation (Mlinganyo wa Kipeo)', definition: 'Mlinganyo wa kihisabati wenye umbo la ax² + bx + c = 0 ambapo "x" ni kigeuzi kisichojulikana, na "a" si sifuri.' },
        { term: 'Trigonometry (Triki)', definition: 'Tawi la hisabati linaloshughulika na uhusiano kati ya pande na pembe za pembetatu, hasa pembetatu mraba.' },
        { term: 'Probability (Uwezekano)', definition: 'Kipimo cha jinsi tukio fulani linavyoweza kutokea, kuanzia namba 0 (haliwezi kutokea kabisa) hadi 1 (litatokea kwa uhakika).' },
        { term: 'Set (Seti)', definition: 'Mkusanyiko wa vitu au washirika waliofafanuliwa vizuri ambao wana sifa au vigezo vinavyofanana.' },
        { term: 'Pythagoras Theorem', definition: 'Katika pembetatu mraba, mraba wa upande mrefu (hypotenuse) ni sawa na jumla ya miraba ya pande mbili fupi: a² + b² = c².' },
        { term: 'Linear Equation', definition: 'Mlinganyo ambao grafu yake ni mstari mnyooka. Kipeo cha juu cha vigeuzi vilivyomo ni kimoja pekee.' }
      ];
    } else if (titleLower.includes('history') || titleLower.includes('historia')) {
      return [
        { term: 'Sovereignty (Mamlaka Kamili)', definition: 'Mamlaka makuu na ya mwisho ya nchi kujitawala yenyewe bila kuingiliwa na nguvu za nje.' },
        { term: 'Colonialism (Ukoloni)', definition: 'Mfumo ambapo nchi moja yenye nguvu inatawala na kunyonya nchi nyingine kiuchumi, kisiasa, na kijamii.' },
        { term: 'Berlin Conference (1884-1885)', definition: 'Mkutano ulioitishwa na Otto von Bismarck kugawa bara la Afrika miongoni mwa madola ya Ulaya bila idhini ya Waafrika wenyewe.' },
        { term: 'Majimaji Rebellion (1905-1907)', definition: 'Vita vikubwa vya uasi vilivyopiganwa na wenyeji wa kusini mwa Tanganyika dhidi ya utawala wa kikoloni wa Kijerumani.' },
        { term: 'Mercantile Capitalism', definition: 'Awamu ya kwanza ya maendeleo ya ubepari wa Ulaya (karne ya 15-18) uliolenga biashara ya dhahabu, fedha, na bidhaa.' },
        { term: 'Scramble for Africa', definition: 'Ushindani mkali na haraka miongoni mwa mataifa makubwa ya Ulaya kupata na kumiliki maeneo ya kikoloni barani Afrika katika karne ya 19.' }
      ];
    } else {
      // Default general academic flashcards
      return [
        { term: 'Dhana Kuu (Core Concept)', definition: 'Wazo la msingi, nadharia, au mada inayojengwa au kuelezewa kwa kina katika muktadha wa masomo au kazi husika.' },
        { term: 'Mbinu za Kujifunza (Study Methods)', definition: 'Njia na mbinu mbalimbali kama vile kutumia flashcards, kufanya past papers, na kuunda makundi ya majadiliano ili kuelewa somo vizuri.' },
        { term: 'Mitihani ya NECTA', definition: 'Mitihani ya kitaifa inayoratibiwa na Baraza la Mitihani la Tanzania ili kupima na kutathmini uelewa wa wanafunzi katika ngazi tofauti za elimu.' },
        { term: 'Mtaala wa TIE', definition: 'Miongozo na maudhui rasmi ya elimu yaliyotayarishwa na Taasisi ya Elimu Tanzania (TIE) ili kuongoza ujifunzaji mashuleni.' },
        { term: 'Ufaulu wa Kiwango cha Juu', definition: 'Kufikia alama za daraja la kwanza au uelewa bora wa masomo kwa kupitia maandalizi thabiti, mazoezi ya mitihani na msaada wa mifumo ya AI kama Lupanulla.' },
        { term: 'Msaidizi wa AI (Lupanulla AI)', definition: 'Akili ya bandia iliyotengenezwa kusaidia wanafunzi wa Kitanzania kutatua changamoto za masomo na kufupisha mada ngumu.' }
      ];
    }
  };

  useEffect(() => {
    if (isOpen && doc) {
      // Auto-load fallback first so the UI is responsive, then trigger AI generation
      const fallback = getFallbackCards(doc);
      setFlashcards(fallback);
      setCurrentIndex(0);
      setIsFlipped(false);
      setLearnedIndices([]);
      setError(null);
      
      // Generate using Gemini API
      generateAICards(doc);
    }
  }, [isOpen, doc]);

  const generateAICards = async (document: DocumentMetadata) => {
    setIsLoading(true);
    setError(null);
    try {
      const promptText = `Tafadhali tengeneza flashcards 6 za kimasomo zenye dhana muhimu sana (key terms/vocabulary) na maelezo yake (definitions/explanations katika muktadha wa mtaala wa NECTA au shule za Tanzania) kulingana na maelezo ya karatasi ya mtihani/notisi hii:
Kichwa cha habari: ${document.title}
Maelezo: ${document.description}
Somo: ${document.category}
Lebo za Somo: ${document.tags.join(', ')}

Majibu yako yawe katika muundo wa JSON Array pekee, bila maneno mengine ya ziada (no introductions, no markdown comments). Kila kipengele cha orodha kiwe kitu chenye funguo "term" na "definition". Toa maelezo kwa lugha ya Kiswahili fasaha (au Kiingereza kwa dhana za kiufundi za kisayansi).

Mfano wa muundo:
[
  { "term": "Dhana Kuu", "definition": "Maelezo ya kina ya dhana husika..." }
]`;

      const response = await fetch('/api/claude.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system: 'Wewe ni Lupanulla AI, msaidizi bora wa masomo nchini Tanzania kutoka Lupanulla Foundation. Una utaalamu mkubwa wa kutoa na kufupisha mada kuwa flashcards fupi za kujifunzia katika mtaala wa TIE na NECTA. Jibu kwa JSON Array pekee inayoweza kupasuliwa (JSON.parse).',
          messages: [
            { role: 'user', content: promptText }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Imeshindwa kupata majibu kutoka kwa seva ya AI.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.message || data.error);
      }

      let replyText = data.reply.trim();
      // Robust JSON striping
      if (replyText.startsWith('```')) {
        replyText = replyText.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
      }

      try {
        const parsed = JSON.parse(replyText) as Flashcard[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Double-check the structure
          const validated = parsed.map((item: any) => ({
            term: String(item.term || item.word || 'Dhana'),
            definition: String(item.definition || item.translation || 'Maelezo haikupatikana.')
          }));
          setFlashcards(validated);
        }
      } catch (parseErr) {
        console.warn('AI JSON parsing failed, using high-quality static fallbacks.', parseErr);
        // We already have set the fallbacks, so we just let it keep them
      }
    } catch (err: any) {
      console.error('Error generating flashcards with AI:', err);
      // Don't show blocking error since we already loaded fallback cards for a perfect experience
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentCard = flashcards[currentIndex];
  const isCurrentLearned = learnedIndices.includes(currentIndex);
  const progressPercent = flashcards.length > 0 ? Math.round(((currentIndex + 1) / flashcards.length) * 100) : 0;
  const learnedPercent = flashcards.length > 0 ? Math.round((learnedIndices.length / flashcards.length) * 100) : 0;

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setLearnedIndices([]);
  };

  const handleToggleLearned = () => {
    if (isCurrentLearned) {
      setLearnedIndices(prev => prev.filter(i => i !== currentIndex));
    } else {
      setLearnedIndices(prev => [...prev, currentIndex]);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="relative bg-gradient-to-b from-white to-slate-50 border border-slate-200/60 w-full max-w-lg rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in z-[160] text-slate-800">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-2xl">
              <Brain size={20} className="text-cyan-600 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm sm:text-base uppercase text-slate-900 tracking-tight leading-none">
                Msaidizi wa Flashcards
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                <Sparkles size={10} className="text-amber-500" />
                Inaendeshwa na Lupanulla AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* AI Processing Status Indicator */}
        {isLoading && (
          <div className="bg-cyan-50/60 border-y border-cyan-100 px-5 py-2 flex items-center justify-between text-[11px] font-semibold text-cyan-700">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
              Lupanulla AI anaboresha kadi kulingana na notisi yako hivi sasa...
            </span>
            <span className="text-[10px] bg-white border border-cyan-200/50 px-2 py-0.5 rounded-full font-bold">Kasi AI: 3.5-Flash</span>
          </div>
        )}

        {/* Body Area */}
        <div className="p-6 sm:p-8 flex-grow overflow-y-auto flex flex-col justify-between space-y-6">
          
          {/* Note Context Header */}
          <div className="bg-slate-100/50 rounded-2xl p-3 border border-slate-150 text-center">
            <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Mada ya sasa</p>
            <p className="text-xs font-bold text-slate-700 truncate mt-0.5 uppercase">{doc.title}</p>
          </div>

          {currentCard ? (
            <div className="space-y-6 flex-grow flex flex-col justify-center">
              {/* Interactive Flippable Card with 3D Effect */}
              <div 
                className="perspective-1000 w-full h-[220px] sm:h-[240px] cursor-pointer group"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div 
                  className={`relative w-full h-full duration-500 preserve-3d transition-transform ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* FRONT SIDE (Term) */}
                  <div className="absolute inset-0 backface-hidden w-full h-full bg-white border-2 border-slate-150 rounded-[24px] p-6 flex flex-col justify-between shadow-sm group-hover:border-cyan-400 group-hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        <Layers size={11} className="text-slate-400" /> DHANA / TERM
                      </span>
                      {isCurrentLearned && (
                        <span className="text-[9px] font-extrabold bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                          <CheckCircle2 size={10} /> Nimeelewa
                        </span>
                      )}
                    </div>

                    <div className="text-center py-4 px-2">
                      <h4 className="font-display font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight leading-snug">
                        {currentCard.term}
                      </h4>
                    </div>

                    <div className="flex justify-center items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <RotateCw size={11} className="text-slate-400 animate-spin-slow" />
                      Gusa ili kuona maana
                    </div>
                  </div>

                  {/* BACK SIDE (Definition) */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-[24px] p-6 flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg">
                        <HelpCircle size={11} className="text-cyan-400" /> MAANA / DEFINITION
                      </span>
                      {isCurrentLearned && (
                        <span className="text-[9px] font-extrabold bg-green-500/20 text-green-300 border border-green-500/30 px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                          <CheckCircle2 size={10} /> Nimeelewa
                        </span>
                      )}
                    </div>

                    <div className="text-center py-2 overflow-y-auto max-h-[110px] scrollbar-thin scrollbar-thumb-white/10 pr-1">
                      <p className="text-slate-200 text-xs sm:text-sm font-semibold leading-relaxed">
                        {currentCard.definition}
                      </p>
                    </div>

                    <div className="flex justify-center items-center gap-1.5 text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                      <RotateCw size={11} className="text-cyan-400" />
                      Gusa ili kurudi nyuma
                    </div>
                  </div>
                </div>
              </div>

              {/* Deck Navigation Controls */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handlePrev}
                  className="p-3 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-all cursor-pointer text-slate-600 shadow-sm flex items-center justify-center"
                  title="Kadi Iliyopita"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={handleToggleLearned}
                  className={`flex-grow py-3 px-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border shadow-sm ${
                    isCurrentLearned
                      ? 'bg-green-500 hover:bg-green-600 text-white border-green-600'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <CheckCircle2 size={15} className={isCurrentLearned ? 'text-white animate-bounce' : 'text-slate-400'} />
                  {isCurrentLearned ? 'Nimeelewa tayari!' : 'Weka kama Nimeelewa'}
                </button>

                <button
                  onClick={handleNext}
                  className="p-3 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-all cursor-pointer text-slate-600 shadow-sm flex items-center justify-center"
                  title="Kadi Inayofuata"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Progress and Stats Area */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>Maendeleo: Kadi {currentIndex + 1} ya {flashcards.length}</span>
                  <span className="flex items-center gap-1 text-green-600">
                    <Award size={12} />
                    Uelewa: {learnedIndices.length}/{flashcards.length} ({learnedPercent}%)
                  </span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <AlertCircle size={32} className="text-amber-500" />
              <p className="text-xs text-slate-500 font-bold">Kadi za masomo hazikupatikana kwa nyaraka hii.</p>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={handleShuffle}
              disabled={flashcards.length === 0}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 hover:text-slate-900 text-slate-500 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
              title="Changanya Kadi"
            >
              <Shuffle size={12} /> Changanya
            </button>
            <button
              onClick={() => generateAICards(doc)}
              disabled={isLoading}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 hover:text-slate-900 text-slate-500 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
              title="Tengeneza upya na AI"
            >
              <Sparkles size={12} className="text-amber-500" /> Unda upya
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-sm"
          >
            Nimefanya Mazoezi
          </button>
        </div>

      </div>
    </div>
  );
}
