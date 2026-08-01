import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Search, 
  X, 
  Sun, 
  Moon, 
  BookOpen, 
  Sliders, 
  Maximize2,
  Minimize2,
  FileText,
  AlertCircle,
  Eye,
  Settings,
  Highlighter,
  Check,
  Sparkles,
  Download,
  Info,
  Flame,
  TrendingUp,
  Award,
  ExternalLink
} from 'lucide-react';
import { formatGoogleDriveUrls } from '../utils/linkAutoDetector';

interface PDFPreviewerProps {
  documentId: string;
  documentTitle: string;
  driveUrl: string;
  category?: string;
  year?: number;
  type?: string;
  onSelectText?: (text: string) => void;
  onSwitchToNotes?: () => void;
  onAddPageNote?: (pageNumber: number) => void;
  pageNotesCount?: number;
  onAddVocabulary?: (word?: string) => void;
  vocabularyCount?: number;
}

interface PageData {
  pageNumber: number;
  title: string;
  content: React.ReactNode;
  rawText: string; // Used for text search feature
}

// ── SUB-COMPONENT 1: CHEMISTRY PRACTICAL SIMULATOR ──
function ChemistryPracticalSimulator() {
  const [volumeAcid, setVolumeAcid] = useState<number>(0);
  const [isTitrating, setIsTitrating] = useState<boolean>(false);
  const [colorState, setColorState] = useState<'yellow' | 'orange' | 'peach' | 'pink'>('yellow');
  const [showMath, setShowMath] = useState<boolean>(false);
  
  // Quiz inputs
  const [ans1, setAns1] = useState<string>('');
  const [ans2, setAns2] = useState<string>('');
  const [feedback, setFeedback] = useState<{status: 'idle' | 'success' | 'fail', msg: string}>({status: 'idle', msg: ''});

  // Kinetic Experiment (Table 1 values)
  const [times, setTimes] = useState<{[key: number]: string}>({
    1: '15',
    2: '28',
    3: '52',
    4: '98',
    5: '185'
  });

  useEffect(() => {
    let interval: any;
    if (isTitrating) {
      interval = setInterval(() => {
        setVolumeAcid(prev => {
          const next = Math.min(25, Number((prev + 0.2).toFixed(1)));
          
          // Color changes based on methyl orange end point (~20.0ml)
          if (next >= 20.2) {
            setColorState('pink');
          } else if (next >= 19.8) {
            setColorState('peach');
          } else if (next >= 18.5) {
            setColorState('orange');
          } else {
            setColorState('yellow');
          }

          if (next >= 25) {
            setIsTitrating(false);
          }
          return next;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isTitrating]);

  const handleCheckAnswers = () => {
    const val1 = parseFloat(ans1);
    const val2 = parseFloat(ans2);
    if (Math.abs(val1 - 0.08) < 0.01 && Math.abs(val2 - 3.2) < 0.1) {
      setFeedback({
        status: 'success',
        msg: 'Hongera sana! Mahesabu yako ni sahihi kabisa. Molarity ya NaOH ni 0.08 M na Concentration ni 3.2 g/dm³!'
      });
    } else {
      setFeedback({
        status: 'fail',
        msg: 'Kuna hitilafu kwenye mahesabu yako. Kumbuka: Molarity ya HCl ni 0.1 M, na uwiano wa mmenyuko ni 1:1. Jaribu tena au bonyeza "Onyesha Njia sahihi".'
      });
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Virtual Lab Simulator</span>
          <h4 className="font-sans font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-tight">Simulator ya Titration & Chemical Kinetics</h4>
          <p className="text-[10px] text-slate-500 leading-snug">Bonyeza vitufe ili kufanya titration na kupima kasi ya mmenyuko wa kemikali.</p>
        </div>
        <Sparkles size={24} className="text-emerald-600 shrink-0 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Titration Visualizer */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
          <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider border-b pb-1">1. Titration ya Acid na Base (Z₁ dhidi ya Z₂)</p>
          
          <div className="flex justify-center items-center gap-6 py-4">
            {/* Burette Graphic */}
            <div className="relative w-10 h-44 bg-slate-200 border-x-2 border-slate-400 rounded-t-lg flex flex-col justify-end overflow-hidden shadow-inner">
              <div 
                style={{ height: `${((25 - volumeAcid) / 25) * 100}%` }}
                className="w-full bg-cyan-400/75 transition-all duration-100 border-t border-cyan-300"
              />
              <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-slate-800">
                {volumeAcid} ml
              </span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-slate-600 uppercase">
                HCl
              </span>
            </div>

            {/* Beaker Graphic */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative w-20 h-20 bg-slate-100 border-b-4 border-x-2 border-slate-400 rounded-b-xl flex flex-col justify-end overflow-hidden shadow-md">
                <div 
                  className={`w-full h-12 transition-all duration-300 ${
                    colorState === 'yellow' ? 'bg-amber-300/80' : 
                    colorState === 'orange' ? 'bg-orange-400/80' : 
                    colorState === 'peach' ? 'bg-rose-400/80' : 
                    'bg-pink-500/80'
                  }`}
                />
                <span className="absolute inset-x-0 bottom-4 text-center text-[8px] font-mono font-bold text-slate-900 uppercase">
                  NaOH + MO
                </span>
              </div>
              <span className="text-[9px] font-mono font-semibold text-slate-500">
                Flask (Z₁)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setIsTitrating(!isTitrating)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                isTitrating ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isTitrating ? 'Simamisha Drop' : 'Dondosha HCl (Acid)'}
            </button>
            <button
              onClick={() => {
                setVolumeAcid(0);
                setColorState('yellow');
                setIsTitrating(false);
              }}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-all"
            >
              Rudisha Upya (Reset)
            </button>
          </div>
        </div>

        {/* Calculation Inputs */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
          <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider border-b pb-1">2. Mahesabu ya Molarity na Concentration</p>
          
          <div className="space-y-3">
            <p className="text-[10px] text-slate-500 font-medium">
              Kutokana na data ya swali, kokotoa concentration ya NaOH:
            </p>
            
            <div className="space-y-2">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase">Molarity ya NaOH (mol/dm³)</label>
                <input
                  type="number"
                  placeholder="Mfano: 0.08"
                  value={ans1}
                  onChange={e => setAns1(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase">Concentration ya NaOH (g/dm³)</label>
                <input
                  type="number"
                  placeholder="Mfano: 3.2"
                  value={ans2}
                  onChange={e => setAns2(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCheckAnswers}
                className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all"
              >
                Hakiki Majibu
              </button>
              <button
                onClick={() => setShowMath(!showMath)}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                {showMath ? 'Ficha Njia' : 'Onyesha Njia'}
              </button>
            </div>

            {feedback.status !== 'idle' && (
              <div className={`p-2.5 rounded-xl text-[10px] font-semibold border ${
                feedback.status === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
              }`}>
                {feedback.msg}
              </div>
            )}
          </div>
        </div>
      </div>

      {showMath && (
        <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3 text-xs font-medium text-slate-700 leading-relaxed animate-fade-in">
          <p className="font-bold text-indigo-950 uppercase text-[10px]">Njia ya Kukokotoa (Step-by-Step Chemistry Guide):</p>
          <ol className="list-decimal pl-5 space-y-2 text-[11px]">
            <li>
              <strong>Tafuta Concentration ya HCl (Z₂) katika g/dm³:</strong>
              <br />Mass = 1.825 g katika 0.5 dm³.
              <br />Conc = <span className="font-mono text-indigo-600">1.825 / 0.5 = 3.65 g/dm³</span>.
            </li>
            <li>
              <strong>Tafuta Molarity ya HCl (Z₂):</strong>
              <br />Molar Mass ya HCl = 1 + 35.5 = 36.5 g/mol.
              <br />Molarity = Conc / Molar Mass = <span className="font-mono text-indigo-600">3.65 / 36.5 = 0.1 mol/dm³</span>.
            </li>
            <li>
              <strong>Tafuta Molarity ya NaOH (Z₁) kwa kutumia M₁V₁ = M₂V₂:</strong>
              <br />Pipette volume (Z₁) = 25.0 cm³, Average Burette volume (Z₂) = 20.0 cm³.
              <br />M_NaOH × 25.0 = 0.1 × 20.0.
              <br />M_NaOH = (0.1 × 20.0) / 25.0 = <span className="font-mono text-indigo-600">0.08 mol/dm³</span>.
            </li>
            <li>
              <strong>Tafuta Concentration ya NaOH katika g/dm³:</strong>
              <br />Molar Mass ya NaOH = 23 + 16 + 1 = 40 g/mol.
              <br />Conc = Molarity × Molar Mass = <span className="font-mono text-indigo-600">0.08 × 40 = 3.2 g/dm³</span>.
            </li>
          </ol>
        </div>
      )}

      {/* Kinetics Simulator Section */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
        <div className="flex justify-between items-center border-b pb-1">
          <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">3. Jaribio la Kinetics: Sodium Thiosulphate (M₁) na HCl (M₂)</p>
          <span className="bg-amber-100 text-amber-800 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">Kasi ya Mmenyuko</span>
        </div>
        
        <p className="text-[10px] text-slate-500 leading-normal">
          Uwekaji wa alama X chini ya beaker. Jaza au tazama muda wa mmenyuko (Time in seconds) kupata Rate (1/t) kwa kila halijoto (Temperature):
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-mono border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-[10px] uppercase">
                <th className="p-2 border border-slate-200 text-left">Jaribio No.</th>
                <th className="p-2 border border-slate-200 text-center">Halijoto (°C)</th>
                <th className="p-2 border border-slate-200 text-center">Muda (Sec)</th>
                <th className="p-2 border border-slate-200 text-right">Kasi Rate (s⁻¹)</th>
              </tr>
            </thead>
            <tbody>
              {[
                {no: 1, temp: 70},
                {no: 2, temp: 60},
                {no: 3, temp: 50},
                {no: 4, temp: 40},
                {no: 5, temp: 'Room Temp'}
              ].map((row, i) => {
                const num = row.no;
                const timeValue = parseFloat(times[num]) || 0;
                const rateValue = timeValue > 0 ? (1 / timeValue).toFixed(4) : '-';
                return (
                  <tr key={i} className="hover:bg-slate-100/50">
                    <td className="p-2 border border-slate-200 text-left font-bold">{row.no}</td>
                    <td className="p-2 border border-slate-200 text-center text-slate-900 font-extrabold">{row.temp}</td>
                    <td className="p-2 border border-slate-200 text-center">
                      <input
                        type="number"
                        value={times[num] || ''}
                        onChange={e => setTimes({...times, [num]: e.target.value})}
                        className="w-16 bg-white border border-slate-200 text-center rounded px-1 py-0.5 font-bold"
                      />
                    </td>
                    <td className="p-2 border border-slate-200 text-right text-indigo-600 font-black">{rateValue}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── SUB-COMPONENT 2: CHINESE LANGUAGE INTERACTIVE ──
function ChineseLanguageInteractive() {
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [selectedMean, setSelectedMean] = useState<string | null>(null);
  const [matches, setMatches] = useState<{[key: string]: string}>({});
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: string}>({});
  const [showResult, setShowResult] = useState<boolean>(false);

  const characterOptions = ['小狗', '书', '超市', '医院'];
  const meaningOptions = ['Hospitali (Hospital)', 'Mbwa mdogo (Puppy)', 'Kitabu (Book)', 'Duka kubwa (Supermarket)'];

  const matchMap: {[key: string]: string} = {
    '小狗': 'Mbwa mdogo (Puppy)',
    '书': 'Kitabu (Book)',
    '超市': 'Duka kubwa (Supermarket)',
    '医院': 'Hospitali (Hospital)'
  };

  const handleMatch = (char: string, mean: string) => {
    if (matchMap[char] === mean) {
      setMatches(prev => ({...prev, [char]: mean}));
    }
    setSelectedChar(null);
    setSelectedMean(null);
  };

  const isMatched = (char: string) => !!matches[char];

  return (
    <div className="space-y-6 text-slate-800">
      <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <span className="bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase">Kadi Mseto (Matching Cards)</span>
          <h4 className="font-sans font-bold text-slate-900 text-xs sm:text-sm uppercase">Unganisha Maneno ya Kichina na Kiswahili</h4>
          <p className="text-[10px] text-slate-500">Gusa kadi ya Kichina kisha uguse tafsiri yake sahihi.</p>
        </div>
      </div>

      {/* Character Board */}
      <div className="grid grid-cols-2 gap-4">
        {/* Chinese Side */}
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">Herufi (Characters)</p>
          <div className="grid grid-cols-1 gap-2">
            {characterOptions.map((char, i) => {
              const matched = isMatched(char);
              const isSel = selectedChar === char;
              return (
                <button
                  key={i}
                  disabled={matched}
                  onClick={() => {
                    setSelectedChar(char);
                    if (selectedMean) handleMatch(char, selectedMean);
                  }}
                  className={`p-3 text-center rounded-xl border-2 font-display text-sm font-extrabold uppercase transition-all ${
                    matched ? 'bg-emerald-50 border-emerald-400 text-emerald-800 opacity-60' :
                    isSel ? 'bg-indigo-600 border-indigo-700 text-white scale-105 shadow-md' :
                    'bg-white border-slate-200 text-slate-800 hover:border-indigo-400 hover:bg-slate-50'
                  }`}
                >
                  {char} {matched && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Translation Side */}
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">Tafsiri (Translations)</p>
          <div className="grid grid-cols-1 gap-2">
            {meaningOptions.map((mean, i) => {
              const matched = Object.values(matches).includes(mean);
              const isSel = selectedMean === mean;
              return (
                <button
                  key={i}
                  disabled={matched}
                  onClick={() => {
                    setSelectedMean(mean);
                    if (selectedChar) handleMatch(selectedChar, mean);
                  }}
                  className={`p-3 text-center rounded-xl border-2 text-xs font-bold transition-all ${
                    matched ? 'bg-emerald-50 border-emerald-400 text-emerald-800 opacity-60' :
                    isSel ? 'bg-indigo-600 border-indigo-700 text-white scale-105 shadow-md' :
                    'bg-white border-slate-200 text-slate-800 hover:border-indigo-400 hover:bg-slate-50'
                  }`}
                >
                  {mean} {matched && '✓'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {Object.keys(matches).length === characterOptions.length && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-2 animate-bounce">
          <p className="font-display font-black text-emerald-900 text-sm">🧧 GŌNGXǏ FĀCÁI! 🧧</p>
          <p className="text-xs text-emerald-800 font-bold">Hongera sana! Umeunganisha kadi zote vizuri kwa asilimia 100%!</p>
        </div>
      )}

      {/* Multiple Choice Section */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider border-b pb-1">Sehemu ya Mitihani ya Mazoezi (Pinyin Quiz)</p>
        
        <div className="space-y-4">
          <div className="space-y-1.5 p-3 bg-white rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-900">1. Zhè ( ) xiǎo gǒu hěn piàoliang. (Huyu mbwa mdogo ni mrembo sana)</p>
            <div className="grid grid-cols-2 gap-2 font-semibold text-[11px]">
              {['A. shuāng (双)', 'B. jiàn (件)', 'C. zhī (只)', 'D. tiáo (条)'].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setQuizAnswers({...quizAnswers, q1: opt})}
                  className={`p-2 rounded-lg text-left border transition-all ${
                    quizAnswers.q1 === opt ? 'bg-indigo-50 border-indigo-500 text-indigo-800 font-bold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 p-3 bg-white rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-900">2. ( ) tiānqì xiàyǔ le, ( ) wǒmen jīntiān bùnéng qù xuéxiào. (Kwa sababu kunanyesha, leo hatuwezi kwenda shule)</p>
            <div className="grid grid-cols-2 gap-2 font-semibold text-[11px]">
              {['A. rúguǒ... dànshì', 'B. yīnwèi... suǒyǐ', 'C. suīrán... dànshì', 'D. búdàn... érqiě'].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setQuizAnswers({...quizAnswers, q2: opt})}
                  className={`p-2 rounded-lg text-left border transition-all ${
                    quizAnswers.q2 === opt ? 'bg-indigo-50 border-indigo-500 text-indigo-800 font-bold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowResult(true)}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all"
        >
          Kagua Majibu ya Maswali
        </button>

        {showResult && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-2 text-xs font-semibold text-blue-900 leading-relaxed">
            <p className="font-bold border-b border-blue-200 pb-1 uppercase text-[10px]">Majibu sahihi (Correct Answers Key):</p>
            <p><strong>Swali la 1:</strong> Jibu sahihi ni <span className="font-bold text-emerald-600">C. zhī (只)</span>. Ni "Classifier" au kiwakilishi cha kundi la wanyama wadogo kama mbwa, paka, ndege.</p>
            <p><strong>Swali la 2:</strong> Jibu sahihi ni <span className="font-bold text-emerald-600">B. yīnwèi... suǒyǐ (因为...所以)</span>. Hii ina maana ya "Kwa sababu... kwa hiyo..." kuelezea uhusiano wa sababu na tokeo (cause and effect).</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SUB-COMPONENT 3: CIVICS INTERACTIVE ──
function CivicsInteractive() {
  const [selectedMatch, setSelectedMatch] = useState<{[key: number]: string}>({});
  const [showSolutions, setShowSolutions] = useState<boolean>(false);

  const listA = [
    {id: 1, text: 'Njia ya uchumba ambapo msichana anapotea nyumbani usiku wa manane kwenda kwa mpenzi wake'},
    {id: 2, text: 'Aina ya uchumba ambapo mvulana anapeleleza na kumvizia msichana anayempenda kwa kujitolea mwenyewe'},
    {id: 3, text: 'Aina ya uchumba inayohusisha mitandao ya kijamii kama Twitter, Facebook na Instagram'}
  ];

  const listB = ['Online relationship', 'Traditional courtship / Bride abduction', 'Self-initiated relationship / Dating'];

  const correctMatches: {[key: number]: string} = {
    1: 'Traditional courtship / Bride abduction',
    2: 'Self-initiated relationship / Dating',
    3: 'Online relationship'
  };

  const handleSelect = (aId: number, bVal: string) => {
    setSelectedMatch(prev => ({...prev, [aId]: bVal}));
  };

  return (
    <div className="space-y-6 text-slate-800">
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <span className="bg-blue-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase">Civics Matching Practice</span>
          <h4 className="font-sans font-bold text-slate-900 text-xs sm:text-sm uppercase">Kuoanisha Mitindo ya Uchumba (Courtship Systems)</h4>
          <p className="text-[10px] text-slate-500">Chagua jibu sahihi la kuoanisha maelezo ya uchumba katika List A na dhana zake katika List B.</p>
        </div>
      </div>

      <div className="space-y-4">
        {listA.map((item, i) => (
          <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
            <p className="text-xs font-bold text-slate-900">({i + 1}) {item.text}</p>
            <div className="flex flex-wrap gap-2">
              {listB.map((val, idx) => {
                const isSel = selectedMatch[item.id] === val;
                const isCorrect = correctMatches[item.id] === val;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(item.id, val)}
                    className={`px-3 py-1 text-[10px] rounded-lg border font-bold transition-all ${
                      isSel ? 
                        (showSolutions && !isCorrect ? 'bg-rose-50 border-rose-500 text-rose-800' : 'bg-blue-600 border-blue-700 text-white') : 
                        'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setShowSolutions(true)}
          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all"
        >
          Kagua na Oanisha Majibu
        </button>
        <button
          onClick={() => {
            setSelectedMatch({});
            setShowSolutions(false);
          }}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all"
        >
          Rudisha (Reset)
        </button>
      </div>

      {showSolutions && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2 text-xs font-semibold text-emerald-900 leading-relaxed">
          <p className="font-bold border-b border-emerald-200 pb-1 uppercase text-[10px]">Maelezo ya Kitaaluma (Academic Civics Reference):</p>
          <p><strong>1. Bride Abduction (Kutorosha mke):</strong> Ni aina ya uchumba wa asili ambapo mwanamke huchukuliwa usiku na kupelekwa kwa mume mtarajiwa kabla ya taratibu za mahari kukamilika, ambayo hivi sasa inaachwa kwa sababu ya ulinzi wa haki za binadamu.</p>
          <p><strong>2. Dating (Self-initiated):</strong> Ni mfumo wa kisasa ambapo wanandoa watarajiwa wanafanya mazungumzo na kuamua wenyewe kuanzisha uchumba bila kupitia wazazi kwanza.</p>
          <p><strong>3. Online relationship (Mitandao ya Kijamii):</strong> Uchumba unaoanzishwa na kuratibiwa kupitia mifumo ya dijitali kama Twitter na Instagram.</p>
        </div>
      )}
    </div>
  );
}

// ── SUB-COMPONENT 4: COMMERCE CALCULATOR ──
function CommerceCalculator() {
  const [cogs, setCogs] = useState<string>('');
  const [avgStock, setAvgStock] = useState<string>('');
  const [turnover, setTurnover] = useState<string>('');
  const [sales, setSales] = useState<string>('');
  const [netProfit, setNetProfit] = useState<string>('');
  const [checked, setChecked] = useState<boolean>(false);
  const [mathHelp, setMathHelp] = useState<boolean>(false);

  const handleCheck = () => {
    setChecked(true);
  };

  const isCogsCorrect = parseFloat(cogs) === 2200000;
  const isAvgStockCorrect = parseFloat(avgStock) === 305750;
  const isTurnoverCorrect = parseFloat(turnover) >= 7.1 && parseFloat(turnover) <= 7.3;
  const isSalesCorrect = parseFloat(sales) === 3300000;
  const isNetProfitCorrect = parseFloat(netProfit) === 650000;

  return (
    <div className="space-y-6 text-slate-800">
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <span className="bg-amber-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase">Financial Ledger Simulator</span>
          <h4 className="font-sans font-bold text-slate-900 text-xs sm:text-sm uppercase">Kikokotoo cha Biashara Kariakoo</h4>
          <p className="text-[10px] text-slate-500">Ingiza majibu ya hesabu za biashara ili kukagua usahihi wake.</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] text-slate-500 font-bold uppercase border-b pb-1">Ingiza Thamani Ulizokokotoa (Tshs):</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase">Cost of Goods Sold (COGS)</label>
            <div className="relative">
              <input
                type="number"
                placeholder="Mfano: 2200000"
                value={cogs}
                onChange={e => setCogs(e.target.value)}
                className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs font-mono font-bold ${
                  checked ? (isCogsCorrect ? 'border-emerald-500 bg-emerald-50/20' : 'border-rose-500 bg-rose-50/20') : 'border-slate-200'
                }`}
              />
              {checked && (
                <span className="absolute right-2 top-1.5 text-[10px] font-bold">
                  {isCogsCorrect ? '✅ 2,200,000' : '❌ Sahihi: 2,200,000'}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase">Average Stock (Stoki wastani)</label>
            <div className="relative">
              <input
                type="number"
                placeholder="Mfano: 305750"
                value={avgStock}
                onChange={e => setAvgStock(e.target.value)}
                className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs font-mono font-bold ${
                  checked ? (isAvgStockCorrect ? 'border-emerald-500 bg-emerald-50/20' : 'border-rose-500 bg-rose-50/20') : 'border-slate-200'
                }`}
              />
              {checked && (
                <span className="absolute right-2 top-1.5 text-[10px] font-bold">
                  {isAvgStockCorrect ? '✅ 305,750' : '❌ Sahihi: 305,750'}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase">Rate of Stock Turnover (Times)</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                placeholder="Mfano: 7.19"
                value={turnover}
                onChange={e => setTurnover(e.target.value)}
                className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs font-mono font-bold ${
                  checked ? (isTurnoverCorrect ? 'border-emerald-500 bg-emerald-50/20' : 'border-rose-500 bg-rose-50/20') : 'border-slate-200'
                }`}
              />
              {checked && (
                <span className="absolute right-2 top-1.5 text-[10px] font-bold">
                  {isTurnoverCorrect ? '✅ 7.19' : '❌ Sahihi: 7.19'}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase">Total Sales (Mauzo)</label>
            <div className="relative">
              <input
                type="number"
                placeholder="Mfano: 3300000"
                value={sales}
                onChange={e => setSales(e.target.value)}
                className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs font-mono font-bold ${
                  checked ? (isSalesCorrect ? 'border-emerald-500 bg-emerald-50/20' : 'border-rose-500 bg-rose-50/20') : 'border-slate-200'
                }`}
              />
              {checked && (
                <span className="absolute right-2 top-1.5 text-[10px] font-bold">
                  {isSalesCorrect ? '✅ 3,300,000' : '❌ Sahihi: 3,300,000'}
                </span>
              )}
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-[9px] font-bold text-slate-500 uppercase">Net Profit (Faida Halisi)</label>
            <div className="relative">
              <input
                type="number"
                placeholder="Mfano: 650000"
                value={netProfit}
                onChange={e => setNetProfit(e.target.value)}
                className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs font-mono font-bold ${
                  checked ? (isNetProfitCorrect ? 'border-emerald-500 bg-emerald-50/20' : 'border-rose-500 bg-rose-50/20') : 'border-slate-200'
                }`}
              />
              {checked && (
                <span className="absolute right-2 top-1.5 text-[10px] font-bold">
                  {isNetProfitCorrect ? '✅ 650,000' : '❌ Sahihi: 650,000'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleCheck}
            className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all"
          >
            Hakiki Hesabu Zangu
          </button>
          <button
            onClick={() => setMathHelp(!mathHelp)}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all"
          >
            {mathHelp ? 'Ficha Njia' : 'Onyesha Njia'}
          </button>
        </div>
      </div>

      {mathHelp && (
        <div className="p-4 bg-amber-50/30 border border-amber-100 rounded-2xl space-y-3 text-xs font-medium text-slate-700 leading-relaxed animate-fade-in">
          <p className="font-bold text-amber-950 uppercase text-[10px]">Hatua za Kukokotoa (Step-by-Step Commerce Formulas):</p>
          <ol className="list-decimal pl-5 space-y-2 text-[11px]">
            <li>
              <strong>Cost of Goods Sold (COGS):</strong>
              <br />Formula: Opening Stock + Net Purchases - Closing Stock.
              <br />COGS = 344,300 + 2,122,900 - 267,200 = <span className="font-mono text-amber-700 font-bold">2,200,000/=</span>
            </li>
            <li>
              <strong>Average Stock (Stoki Wastani):</strong>
              <br />Formula: (Opening Stock + Closing Stock) / 2.
              <br />Average Stock = (344,300 + 267,200) / 2 = <span className="font-mono text-amber-700 font-bold">305,750/=</span>
            </li>
            <li>
              <strong>Rate of Stock Turnover (Mzunguko wa Stoki):</strong>
              <br />Formula: COGS / Average Stock.
              <br />Turnover = 2,200,000 / 305,750 = <span className="font-mono text-amber-700 font-bold">7.19 times</span>
            </li>
            <li>
              <strong>Total Sales (Mauzo):</strong>
              <br />Markup = 50% kwenye Gharama (COGS). Gross Profit = 50% of 2,200,000 = 1,100,000/=.
              <br />Sales = COGS + Gross Profit = 2,200,000 + 1,100,000 = <span className="font-mono text-amber-700 font-bold">3,300,000/=</span>
            </li>
            <li>
              <strong>Net Profit (Faida halisi):</strong>
              <br />Formula: Gross Profit - Expenses.
              <br />Net Profit = 1,100,000 - 450,000 = <span className="font-mono text-amber-700 font-bold">650,000/=</span>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}

export default function PDFPreviewer({ 
  documentId, 
  documentTitle, 
  driveUrl, 
  category, 
  year, 
  type,
  onSelectText,
  onSwitchToNotes,
  onAddPageNote,
  pageNotesCount = 0,
  onAddVocabulary,
  vocabularyCount = 0
}: PDFPreviewerProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchOccurrences, setSearchOccurrences] = useState<number>(0);
  const [showSidebar, setShowSidebar] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowSidebar(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // trigger initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [viewMode, setViewMode] = useState<'interactive' | 'iframe'>(() => {
    return [
      'mock-bio-f4-2026', 'mock-geo-f4-2026', 'mock-chem-f4-2026',
      'mock-math-f4-2026', 'mock-pe-f4-2026', 'mock-chem2-f4-2026',
      'mock-chinese-f4-2026', 'mock-civics-f4-2026', 'mock-commerce-f4-2026',
      'mock-phy-f4-2026', 'necta-phy-f4-2023', 'necta-math-f4-2022',
      'mock-hist-f4-2024', 'chem-practical-handout'
    ].includes(documentId) ? 'interactive' : 'iframe';
  });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  const pageContainerRef = useRef<HTMLDivElement>(null);

  const formattedDrive = useMemo(() => formatGoogleDriveUrls(driveUrl), [driveUrl]);

  const iframeSrcDoc = useMemo(() => {
    const activeUrl = formattedDrive.embedUrl || driveUrl;
    return `
      <!DOCTYPE html>
      <html lang="sw" style="width: 100%; height: 100%; margin: 0; padding: 0;">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
        <title>${documentTitle.replace(/"/g, '&quot;')}</title>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #0f172a;
          }
          .pdf-wrapper {
            width: 100%;
            height: 100%;
            position: relative;
            -webkit-overflow-scrolling: touch;
            overflow: auto;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: 0;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="pdf-wrapper">
          <iframe src="${activeUrl}" allowfullscreen></iframe>
        </div>
      </body>
      </html>
    `;
  }, [formattedDrive, driveUrl, documentTitle]);

  // Toggle fullscreen state
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    try {
      if (!isFullscreen) {
        const elem = pageContainerRef.current?.parentElement?.parentElement;
        if (elem && elem.requestFullscreen) {
          elem.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    } catch (e) {
      console.warn('Native fullscreen not fully supported in iframe context:', e);
    }
  };

  // Keyboard Escape and fullscreenchange event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      if (!isCurrentlyFullscreen && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  // Rotate clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Zoom helpers
  const handleZoomIn = () => setZoom((z) => Math.min(200, z + 25));
  const handleZoomOut = () => setZoom((z) => Math.max(50, z - 25));
  const handleZoomReset = () => setZoom(100);

  // Reset page when document changes
  useEffect(() => {
    setCurrentPage(1);
    setRotation(0);
    setSearchQuery('');
    
    const isSeed = [
      'mock-bio-f4-2026', 'mock-geo-f4-2026', 'mock-chem-f4-2026',
      'mock-math-f4-2026', 'mock-pe-f4-2026', 'mock-chem2-f4-2026',
      'mock-chinese-f4-2026', 'mock-civics-f4-2026', 'mock-commerce-f4-2026',
      'mock-phy-f4-2026', 'necta-phy-f4-2023', 'necta-math-f4-2022',
      'mock-hist-f4-2024', 'chem-practical-handout'
    ].includes(documentId);
    setViewMode(isSeed ? 'interactive' : 'iframe');
  }, [documentId]);

  // High-fidelity page content database
  const documentPages = useMemo((): PageData[] => {
    // 1. Morogoro Biology Mock Exam 2026
    if (documentId === 'mock-bio-f4-2026') {
      return [
        {
          pageNumber: 1,
          title: "Page 1: Instructions & General Info",
          rawText: "PRESIDENT'S OFFICE REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT MOROGORO REGION REGIONAL FORM FOUR MOCK EXAMINATION 2026 BIOLOGY 1 INSTRUCTIONS",
          content: (
            <div className="space-y-6">
              {/* Exam Header */}
              <div className="text-center space-y-2 pb-6 border-b border-slate-300">
                <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">THE UNITED REPUBLIC OF TANZANIA</p>
                <p className="text-xs font-black text-slate-700 tracking-wide uppercase">PRESIDENT'S OFFICE</p>
                <p className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT</p>
                <div className="py-1 bg-cyan-600/10 rounded-xl px-4 inline-block my-2 border border-cyan-500/20">
                  <span className="text-sm font-black text-cyan-800 tracking-wider uppercase">MOROGORO REGION</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">REGIONAL FORM FOUR MOCK EXAMINATION 2026</h2>
                <div className="flex justify-between items-center max-w-md mx-auto pt-2 font-mono text-xs font-bold text-slate-600">
                  <span>033/1 BIOLOGY 1</span>
                  <span>TIME: 3:00 Hours</span>
                </div>
              </div>

              {/* Instructions Panel */}
              <div className="border-2 border-slate-900 rounded-2xl p-5 space-y-4 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-300 pb-2">
                  <Info size={14} className="text-slate-700" /> INSTRUCTIONS / MAELEKEZO
                </h3>
                <ol className="list-decimal pl-5 text-xs text-slate-700 space-y-2.5 font-medium leading-relaxed">
                  <li>
                    This paper consists of sections <strong>A</strong>, <strong>B</strong> and <strong>C</strong> with a total of eleven (11) questions.
                    <br /><span className="text-slate-500 italic">Karatasi hii ina sehemu A, B na C zenye jumla ya maswali kumi na moja (11).</span>
                  </li>
                  <li>
                    Answer <strong>all</strong> questions in sections A and B and <strong>one (1)</strong> question from section C.
                    <br /><span className="text-slate-500 italic">Jibu maswali yote katika sehemu A na B, na swali moja (1) kutoka sehemu C.</span>
                  </li>
                  <li>
                    Except for diagrams, all writing must be in <strong>blue or black</strong> ink.
                    <br /><span className="text-slate-500 italic">Isipokuwa kwa michoro, majibu yote yaandikwe kwa wino wa bluu au mweusi.</span>
                  </li>
                  <li>
                    Calculators, cellular phones and any unauthorized materials are <strong>not allowed</strong> in the examination room.
                    <br /><span className="text-slate-500 italic">Vikokotoo, simu za mkononi na vifaa visivyoruhusiwa haviruhusiwi ndani ya chumba cha mtihani.</span>
                  </li>
                  <li>
                    Write your <strong>Candidate Number</strong> on every page of your answer booklet(s).
                    <br /><span className="text-slate-500 italic">Andika Namba yako ya Mtihani kwenye kila ukurasa wa kijitabu chako cha majibu.</span>
                  </li>
                </ol>
              </div>

              {/* Lupanulla branding watermark */}
              <div className="pt-24 text-center border-t border-dashed border-slate-200">
                <span className="text-[10px] font-black tracking-widest text-cyan-500/40 uppercase">LUPANULLA SMART STUDY PORTAL</span>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">UKURASA WA 1 KATI YA 4</p>
              </div>
            </div>
          )
        },
        {
          pageNumber: 2,
          title: "Page 2: Section A (Questions 1 - 2)",
          rawText: "SECTION A 16 Marks Lamarckism theory Darwinism theory Creation theory Speciation theory Experimental group Control group Variable group Treatment group Meningococcus sp. Plasmodium falciparum Salmonella typhi Mycobacterium tuberculosis Gametogenesis Maturation stage Growth stage Multiplication stage Fertilization stage Test cross Monohybrid cross Dihybrid cross Recipient blood group O AB Agglutination antibodies a and b antigen O Recipient blood group has no antibody Donor blood has no antigen",
          content: (
            <div className="space-y-6">
              <div className="border-b border-slate-300 pb-3">
                <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">033/1 BIOLOGY 1</span>
                <h3 className="font-extrabold text-slate-900 text-sm uppercase mt-0.5">SECTION A (16 Marks)</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">ANSWER ALL QUESTIONS IN THIS SECTION / JIBU MASWALI YOTE SEHEMU HII</p>
              </div>

              {/* Question 1 */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-950">
                  1. For each of the items (i) - (vi), choose the correct answer from among the given alternatives and write its letter in the answer booklet provided. <span className="text-slate-500 font-semibold">(6 Marks)</span>
                </p>

                <div className="space-y-4 pl-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">
                      (i) Which of the following theories of evolution states that organisms acquire characteristics during their lifetime in response to their environment and pass them to their offspring?
                    </p>
                    <div className="grid grid-cols-2 gap-2 font-medium">
                      <span>A. Lamarckism theory</span>
                      <span>B. Darwinism theory</span>
                      <span>C. Creation theory</span>
                      <span>D. Speciation theory</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">
                      (ii) In an experiment, a student set up two groups of plants. Group X was given nitrogen fertilizer while Group Y was not. Which of the following represents Group Y (without fertilizer) in this experiment?
                    </p>
                    <div className="grid grid-cols-2 gap-2 font-medium">
                      <span>A. Experimental group</span>
                      <span>B. Control group</span>
                      <span>C. Variable group</span>
                      <span>D. Treatment group</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">
                      (iii) A patient was admitted to hospital presenting symptoms of high fever, stiff neck, seizures, and delirium. Clinical tests confirmed that the cerebrospinal fluid contained bacteria. Which of the following organisms was likely responsible?
                    </p>
                    <div className="grid grid-cols-2 gap-2 font-medium">
                      <span className="text-indigo-600 font-bold">A. Meningococcus sp.</span>
                      <span>B. Plasmodium falciparum</span>
                      <span>C. Salmonella typhi</span>
                      <span>D. Mycobacterium tuberculosis</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">
                      (iv) Gametogenesis in animals involves stages of cell division and growth. In which stage of gametogenesis do cells undergo rapid mitotic division to increase in number?
                    </p>
                    <div className="grid grid-cols-2 gap-2 font-medium">
                      <span>A. Maturation stage</span>
                      <span>B. Growth stage</span>
                      <span className="text-indigo-600 font-bold">C. Multiplication stage</span>
                      <span>D. Fertilization stage</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">
                      (v) A geneticist wanted to determine whether a black mouse had a homozygous (BB) or heterozygous (Bb) genotype. She crossed the black mouse with a homozygous recessive brown mouse (bb). What type of cross is this?
                    </p>
                    <div className="grid grid-cols-2 gap-2 font-medium">
                      <span>A. Monohybrid cross</span>
                      <span>B. Dihybrid cross</span>
                      <span className="text-indigo-600 font-bold">C. Test cross</span>
                      <span>D. F1 generation cross</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">
                      (vi) If a person of blood group O is transfused with blood from a donor of blood group AB, agglutination occurs. This is because:
                    </p>
                    <div className="grid grid-cols-2 gap-2 font-medium">
                      <span className="text-indigo-600 font-bold">A. Recipient blood has antibodies a and b</span>
                      <span>B. Recipient blood has antigen O</span>
                      <span>C. Recipient blood has no antibody</span>
                      <span>D. Donor blood has no antigen</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pagination footer */}
              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 2 KATI YA 4
              </div>
            </div>
          )
        },
        {
          pageNumber: 3,
          title: "Page 3: Section A Match & Section B (Q3 - Q5)",
          rawText: "SECTION B 54 Marks Spermatogenesis Epididymis Seminiferous tubules Prostate gland Oviduct Fallopian tube Vas deferens Urethra plant classification botanical names instead of local names animal cell solution hypotonic isotonic hypertonic plant cell undergoing plasmolysis",
          content: (
            <div className="space-y-6">
              <div className="border-b border-slate-300 pb-3">
                <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">033/1 BIOLOGY 1</span>
                <h3 className="font-extrabold text-slate-900 text-sm uppercase mt-0.5">SECTION A &amp; B (Questions 2 - 5)</h3>
              </div>

              {/* Question 2 */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-950">
                  2. Match the descriptions of male reproductive system and processes in List A with the corresponding terms in List B by writing the letter of the correct response in your answer booklet. <span className="text-slate-500 font-semibold">(10 Marks)</span>
                </p>

                <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-slate-100 font-black text-slate-800 text-[10px] uppercase tracking-wider py-2 border-b border-slate-300">
                    <div className="col-span-7 px-3">List A: Description</div>
                    <div className="col-span-5 px-3 border-l border-slate-300">List B: Structure</div>
                  </div>
                  <div className="divide-y divide-slate-200">
                    <div className="grid grid-cols-12 py-2">
                      <div className="col-span-7 px-3 font-semibold text-slate-700">(i) Spermatogenesis occurs under stimulation of follicle stimulating hormone (FSH)</div>
                      <div className="col-span-5 px-3 border-l border-slate-200 font-medium text-slate-600">A. Epididymis</div>
                    </div>
                    <div className="grid grid-cols-12 py-2">
                      <div className="col-span-7 px-3 font-semibold text-slate-700">(ii) Sperms acquire motility and are stored temporarily</div>
                      <div className="col-span-5 px-3 border-l border-slate-200 font-medium text-slate-600">B. Seminiferous tubules</div>
                    </div>
                    <div className="grid grid-cols-12 py-2">
                      <div className="col-span-7 px-3 font-semibold text-slate-700">(iii) Secretes alkaline fluid that neutralizes vaginal acidity</div>
                      <div className="col-span-5 px-3 border-l border-slate-200 font-medium text-slate-600">C. Prostate gland</div>
                    </div>
                    <div className="grid grid-cols-12 py-2">
                      <div className="col-span-7 px-3 font-semibold text-slate-700">(iv) Direct site for fertilization where zygote formation takes place</div>
                      <div className="col-span-5 px-3 border-l border-slate-200 font-medium text-slate-600">D. Oviduct / Fallopian tube</div>
                    </div>
                    <div className="grid grid-cols-12 py-2">
                      <div className="col-span-7 px-3 font-semibold text-slate-700"></div>
                      <div className="col-span-5 px-3 border-l border-slate-200 font-medium text-slate-600">E. Vas deferens</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section B Heading */}
              <div className="border-t border-slate-300 pt-4">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase">SECTION B (54 Marks)</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">ANSWER ALL QUESTIONS IN THIS SECTION / JIBU MASWALI YOTE</p>
              </div>

              {/* Question 3 */}
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-950">
                  3. (a) State the three main principles used in modern plant classification. <span className="text-slate-500 font-semibold">(3 Marks)</span>
                </p>
                <p className="font-bold text-slate-950">
                  (b) Give three reasons why modern scientists prefer using botanical names instead of local names. <span className="text-slate-500 font-semibold">(6 Marks)</span>
                </p>
              </div>

              {/* Question 4 */}
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-950">
                  4. (a) Explain what would happen when an animal cell is placed in: <span className="text-slate-500 font-semibold">(6 Marks)</span>
                </p>
                <ol className="list-roman pl-5 font-semibold text-slate-700 space-y-1">
                  <li>Solution I (Hypotonic solution)</li>
                  <li>Solution II (Isotonic solution)</li>
                  <li>Solution III (Hypertonic solution)</li>
                </ol>
                <p className="font-bold text-slate-950 pt-1">
                  (b) Draw a well-labeled diagram of a plant cell undergoing plasmolysis. <span className="text-slate-500 font-semibold">(3 Marks)</span>
                </p>
              </div>

              {/* Question 5 */}
              <div className="space-y-1.5 text-xs">
                <p className="font-bold text-slate-950">
                  5. (a) Name three excretory products in plants and explain how they are eliminated. <span className="text-slate-500 font-semibold">(6 Marks)</span>
                </p>
                <p className="font-bold text-slate-950">
                  (b) Contrast between excretion in plants and excretion in animals. <span className="text-slate-500 font-semibold">(3 Marks)</span>
                </p>
              </div>

              {/* Pagination footer */}
              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 3 KATI YA 4
              </div>
            </div>
          )
        },
        {
          pageNumber: 4,
          title: "Page 4: Section B & C (Q6 - Q11)",
          rawText: "SECTION C 30 Marks carbohydrate metabolism glycogenesis glycogenolysis DNA and RNA growth development plastic bag pollution Tanzania insect successful evolutionary success palaeontology comparative anatomy embryology evidence supporting evolution",
          content: (
            <div className="space-y-6">
              <div className="border-b border-slate-300 pb-3">
                <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">033/1 BIOLOGY 1</span>
                <h3 className="font-extrabold text-slate-900 text-sm uppercase mt-0.5">SECTION B (Continued) &amp; SECTION C (30 Marks)</h3>
              </div>

              {/* Question 6 */}
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-950">
                  6. (a) Describe the role of liver in carbohydrate metabolism, specifically touching on glycogenesis and glycogenolysis. <span className="text-slate-500 font-semibold">(6 Marks)</span>
                </p>
                <p className="font-bold text-slate-950">
                  (b) Explain how insulin regulates blood glucose levels in the human body. <span className="text-slate-500 font-semibold">(3 Marks)</span>
                </p>
              </div>

              {/* Question 7 */}
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-950">
                  7. (a) Outline three differences between DNA and RNA. <span className="text-slate-500 font-semibold">(3 Marks)</span>
                </p>
                <p className="font-bold text-slate-950">
                  (b) Explain how the double helix structure of DNA allows it to replicate itself with high precision. <span className="text-slate-500 font-semibold">(6 Marks)</span>
                </p>
              </div>

              {/* Question 8 */}
              <div className="space-y-2 text-xs pb-4 border-b border-slate-200">
                <p className="font-bold text-slate-950">
                  8. (a) Define the terms 'growth' and 'development' as applied in biology. <span className="text-slate-500 font-semibold">(4 Marks)</span>
                </p>
                <p className="font-bold text-slate-950">
                  (b) Discuss the environmental factors that influence human growth and development. <span className="text-slate-500 font-semibold">(5 Marks)</span>
                </p>
              </div>

              {/* Section C Heading */}
              <div className="pt-2">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase">SECTION C (30 Marks)</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">ANSWER ONE (1) QUESTION FROM THIS SECTION / JIBU SWALI MOJA TU SEHEMU HII</p>
              </div>

              {/* Questions 9, 10, 11 */}
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-950">
                    9. Plastics are a major threat to terrestrial and aquatic ecosystems. Discuss the ecological impacts of plastic bag pollution in Tanzania and suggest four control measures. <span className="text-slate-500 font-semibold">(30 Marks)</span>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-950">
                    10. Class Insecta is the most successful and diverse group of animals on earth. Explain five physiological and structural reasons that contribute to their outstanding evolutionary success. <span className="text-slate-500 font-semibold">(30 Marks)</span>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-950">
                    11. "Evolution is a continuous and slow biological process." Discuss the scientific evidence supporting this statement from palaeontology (fossils), comparative anatomy, and comparative embryology. <span className="text-slate-500 font-semibold">(30 Marks)</span>
                  </p>
                </div>
              </div>

              {/* Pagination footer */}
              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 4 KATI YA 4
              </div>
            </div>
          )
        }
      ];
    }

    // 2. Geography Mock Exam 2026
    if (documentId === 'mock-geo-f4-2026') {
      return [
        {
          pageNumber: 1,
          title: "Page 1: Instructions & Section A (Q1. i-v)",
          rawText: "REGIONAL FORM FOUR MOCK EXAMINATION GEOGRAPHY 2026 INSTRUCTIONS SECTION A Shoreline Shore Coast Coastline Flood plain Permeable rocks Water table Impermeable rocks Sand Aquifer Chalinze temperature Strait Isthmus",
          content: (
            <div className="space-y-6">
              <div className="text-center space-y-2 pb-6 border-b border-slate-300">
                <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">THE UNITED REPUBLIC OF TANZANIA</p>
                <p className="text-xs font-black text-slate-700 tracking-wide uppercase">PRESIDENT'S OFFICE</p>
                <p className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT</p>
                <div className="py-1 bg-cyan-600/10 rounded-xl px-4 inline-block my-2 border border-cyan-500/20">
                  <span className="text-sm font-black text-cyan-800 tracking-wider uppercase">MOROGORO REGION</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">REGIONAL FORM FOUR MOCK EXAMINATION 2026</h2>
                <div className="flex justify-between items-center max-w-md mx-auto pt-2 font-mono text-xs font-bold text-slate-600">
                  <span>013 GEOGRAPHY</span>
                  <span>TIME: 3:00 Hours</span>
                </div>
              </div>

              <div className="border-2 border-slate-900 rounded-2xl p-5 space-y-3 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-300 pb-1.5">
                  <Info size={14} className="text-slate-700" /> INSTRUCTIONS / MAELEKEZO
                </h3>
                <ol className="list-decimal pl-5 text-[11px] text-slate-700 space-y-1.5 font-medium leading-relaxed">
                  <li>This paper consists of section A, B and C with total of Eleven (11) questions.</li>
                  <li>Answer all questions in sections A and B and only two questions from section C.</li>
                  <li>Section A carries 16 marks, section B carries 54 marks and section C carries 30 marks.</li>
                  <li>All writing must be in black or blue ink except drawing which must be in pencil.</li>
                  <li>Map extract of LIWALE (sheet 280/4) is provided.</li>
                </ol>
              </div>

              <div className="space-y-4">
                <div className="border-b border-slate-300 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase">SECTION A: (16 MARKS)</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Answer all questions in this section.</p>
                </div>

                <p className="text-xs font-bold text-slate-950">
                  1. For each of the items (i) - (x), choose the correct answer from among the given alternatives and write its letter in the answer booklet(s) provided:
                </p>

                <div className="space-y-4 pl-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">(i) The land between the high tidal water level and low tidal water levels is called:</p>
                    <div className="grid grid-cols-2 gap-2 font-medium text-[11px] text-slate-600">
                      <span>A. Shoreline</span>
                      <span>B. Shore</span>
                      <span>C. Coast</span>
                      <span className="text-indigo-600 font-bold">D. Coastline</span>
                      <span>E. Flood plain</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">(ii) Kilunga is a form four student who is conducting a study on ground water in her village. She noticed that in some areas rain water easily infiltrates while in others it logs. Suggest the type of rock which Kilunga identified that causes water logging:</p>
                    <div className="grid grid-cols-2 gap-2 font-medium text-[11px] text-slate-600">
                      <span>A. Permeable rocks</span>
                      <span>B. Water table</span>
                      <span className="text-indigo-600 font-bold">C. Impermeable rocks</span>
                      <span>D. Sand</span>
                      <span>E. An aquifer</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">(iii) Find the temperature of Chalinze 500m above sea level if the temperature is 1500m above sea level is 15 °C:</p>
                    <div className="grid grid-cols-2 gap-2 font-medium text-[11px] text-slate-600">
                      <span>A. 24°C</span>
                      <span>B. 25°C</span>
                      <span>C. 26°C</span>
                      <span className="text-indigo-600 font-bold">D. 21°C</span>
                      <span>E. 9°C</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 1 KATI YA 3
              </div>
            </div>
          )
        },
        {
          pageNumber: 2,
          title: "Page 2: Section A (Q1. vi-x) & Question 2",
          rawText: "Sahara Mediterranean weathering Oxidation Soil pH Biogas Ecotourism Matching column uranium sea waves waterfalls suns heat hot springs moving air",
          content: (
            <div className="space-y-6">
              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                  <p className="text-slate-900">(vi) Hot winds with clouds of desert dust blowing from the Sahara Desert northwards across the Mediterranean Sea into Italy is known as:</p>
                  <div className="grid grid-cols-2 gap-2 font-medium text-[11px] text-slate-600">
                    <span>A. Mistral winds</span>
                    <span className="text-indigo-600 font-bold">B. Sirocco winds</span>
                    <span>C. Harmattan winds</span>
                    <span>D. Topographic wind</span>
                    <span>E. Saharan wind</span>
                  </div>
                </div>

                <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                  <p className="text-slate-900">(vii) Which of the following weathering processes involves the change of ferrous state of rocks into ferric state forming a yellow or brown color:</p>
                  <div className="grid grid-cols-2 gap-2 font-medium text-[11px] text-slate-600">
                    <span>A. Hydration</span>
                    <span>B. Exfoliation</span>
                    <span>C. Solution</span>
                    <span>D. Withering</span>
                    <span className="text-indigo-600 font-bold">E. Oxidation</span>
                  </div>
                </div>

                <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                  <p className="text-slate-900">(viii) Mr. Nyorobi is a farmer of Kalaba village. Before preparing his farm, he measures the soil degree of acidity and alkalinity. Which instrument did Mr. Nyorobi use:</p>
                  <div className="grid grid-cols-2 gap-2 font-medium text-[11px] text-slate-600">
                    <span>A. Richter scale</span>
                    <span>B. Magnitude</span>
                    <span className="text-indigo-600 font-bold">C. pH scale</span>
                    <span>D. RF scale</span>
                    <span>E. Seismograph</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-950">
                  2. Match the types of energy sources in LIST A with the corresponding description/type in LIST B by writing the letter of correct response:
                </p>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-[10px] text-slate-800 border border-slate-300 font-medium">
                    <thead>
                      <tr className="bg-slate-100 text-[9px] font-black uppercase text-slate-600">
                        <th className="border border-slate-300 p-2 text-left w-1/2">LIST A (Descriptions)</th>
                        <th className="border border-slate-300 p-2 text-left w-1/2">LIST B (Energy Types)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="border border-slate-300 p-2">(i) The type of power extracted from uranium.</td>
                        <td className="border border-slate-300 p-2">A. Wave energy</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">(ii) The power tapped from sea waves.</td>
                        <td className="border border-slate-300 p-2">B. Solar energy</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">(iii) The power generated from waterfalls.</td>
                        <td className="border border-slate-300 p-2">C. Wind energy</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">(iv) The type of power extracted from sun's heat.</td>
                        <td className="border border-slate-300 p-2">D. Nuclear power</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">(v) The energy extracted from hot springs.</td>
                        <td className="border border-slate-300 p-2">E. Hydroelectric power</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">(vi) The energy generated from moving air.</td>
                        <td className="border border-slate-300 p-2">F. Tide energy / Geothermal power</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 2 KATI YA 3
              </div>
            </div>
          )
        },
        {
          pageNumber: 3,
          title: "Page 3: Section B (Q3 & Q4) & Section C (Q9-11)",
          rawText: "SECTION B Map Extract Liwale town compound bar graph Cocoa Coffee Maize Cotton crescent lake meander SECTION C Manufacturing industry environmental degradation tourism sector income",
          content: (
            <div className="space-y-6">
              <div className="border-b border-slate-300 pb-1">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase">SECTION B: (54 MARKS)</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Answer all questions in this section.</p>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-800">
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-slate-900 font-bold flex justify-between">
                    <span>3. MAP WORK (Liwale Sheet 280/4):</span>
                    <span className="text-indigo-600 font-bold">[15 Marks]</span>
                  </p>
                  <ul className="list-disc pl-5 space-y-1 font-medium text-[11px] text-slate-700">
                    <li>(a) Describe two possible reasons for the growth of Liwale Town.</li>
                    <li>(b) Identify the dominant type of rocks in the mapped area. Give two (2) reasons.</li>
                    <li>(c) Describe any two (2) major factors which account for population distribution.</li>
                    <li>(d) Calculate the area covered by woodland at grid reference 820130 to 870130.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-slate-900 font-bold flex justify-between">
                    <span>4. STATISTICAL DATA PRESENTATION:</span>
                    <span className="text-indigo-600 font-bold">[12 Marks]</span>
                  </p>
                  <p className="text-[11px] text-slate-600">
                    A compound bar graph is provided representing the production of Cocoa, Coffee, Maize, and Cotton from 2006 to 2009.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 font-medium text-[11px] text-slate-700">
                    <li>(a) Identify the type of statistical graph used in displaying these values.</li>
                    <li>(b) Analyze the six procedures involved in constructing such a statistical graph.</li>
                    <li>(c) Use the graph provided to formulate the corresponding table value.</li>
                  </ul>
                </div>

                <div className="border-b border-slate-300 pb-1 pt-2">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase">SECTION C: (30 MARKS)</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Answer any two (2) questions from this section.</p>
                </div>

                <div className="space-y-3 font-medium text-[11px] text-slate-700 pl-2">
                  <p>
                    <span className="font-extrabold text-slate-900 text-xs block mb-1">Question 9: [15 Marks]</span>
                    Apart from the good contributions of manufacturing industries to the economy of a country, manufacturing industries also have a number of negative consequences. Discuss the statement by giving six points.
                  </p>
                  <p>
                    <span className="font-extrabold text-slate-900 text-xs block mb-1">Question 10: [15 Marks]</span>
                    "Poverty is one of the major problems facing developing countries." In the light of this statement, use six points to show the relationship between poverty and environmental degradation in Tanzania.
                  </p>
                  <p>
                    <span className="font-extrabold text-slate-900 text-xs block mb-1">Question 11: [15 Marks]</span>
                    Suggest six ways in which the tourism sector can be used to generate more national income and increase livelihood opportunities in Tanzania.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 3 KATI YA 3
              </div>
            </div>
          )
        }
      ];
    }

    // 3. Chemistry Mock Exam 2026
    if (documentId === 'mock-chem-f4-2026') {
      return [
        {
          pageNumber: 1,
          title: "Page 1: Instructions & Section A (Q1. i-v)",
          rawText: "REGIONAL FORM FOUR MOCK EXAMINATION CHEMISTRY 2026 ATOMIC MASSES H=1 C=12 O=16 Na=23 S=32 Cl=35.5 SECTION A fire safety dry powder endothermic precipitation",
          content: (
            <div className="space-y-6">
              <div className="text-center space-y-2 pb-6 border-b border-slate-300">
                <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">THE UNITED REPUBLIC OF TANZANIA</p>
                <p className="text-xs font-black text-slate-700 tracking-wide uppercase">PRESIDENT'S OFFICE</p>
                <p className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT</p>
                <div className="py-1 bg-rose-600/10 rounded-xl px-4 inline-block my-2 border border-rose-500/20">
                  <span className="text-sm font-black text-rose-800 tracking-wider uppercase">MOROGORO REGION</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">REGIONAL FORM FOUR MOCK EXAMINATION 2026</h2>
                <div className="flex justify-between items-center max-w-md mx-auto pt-2 font-mono text-xs font-bold text-slate-600">
                  <span>021 CHEMISTRY 1</span>
                  <span>TIME: 3:00 Hours</span>
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-2 font-mono text-[10px] text-slate-600">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-center border-b border-slate-200 pb-1 text-[11px]">Chemistry Constants and Data</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span>Atomic masses: H=1, C=12, O=16, Na=23, S=32, Cl=35.5, Ca=40</span>
                  <span>Avogadro's Number: 6.02 × 10²³ particles / mol</span>
                  <span>GMV at STP: 22.4 dm³ / mol</span>
                  <span>1 Faraday = 96,500 Coulombs</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-b border-slate-300 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase">SECTION A: (16 MARKS)</h3>
                </div>

                <p className="text-xs font-bold text-slate-950">
                  1. For each of the items (i) - (x), choose the correct answer from among the given alternatives:
                </p>

                <div className="space-y-4 pl-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">(i) What should be done when concentrated sulphuric acid is accidentally spilled on the skin?</p>
                    <div className="grid grid-cols-2 gap-2 font-medium text-[11px] text-slate-600">
                      <span>A. Rinse with dilute acid</span>
                      <span>B. Rinse with warm water</span>
                      <span className="text-indigo-600 font-bold">C. Wash with running water</span>
                      <span>D. Wash with strong base</span>
                      <span>E. Rub the affected area</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">(ii) As a learner with practical knowledge of fire safety, which among of the following is not the appropriate fire extinguisher to be used to control a fire involving organic materials such as timber, paper and firewood?</p>
                    <div className="grid grid-cols-2 gap-2 font-medium text-[11px] text-slate-600">
                      <span className="text-indigo-600 font-bold">A. Carbon dioxide</span>
                      <span>B. Dry powder</span>
                      <span>C. Sand</span>
                      <span>D. Water</span>
                      <span>E. Foam</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">(iii) Jamila mixed two solutions in a boiling tube at 20°C. After mixing, the temperature decreased to 18°C. What type of reaction does this indicate?</p>
                    <div className="grid grid-cols-2 gap-2 font-medium text-[11px] text-slate-600">
                      <span>A. An exothermic reaction</span>
                      <span>B. Neutralization</span>
                      <span className="text-indigo-600 font-bold">C. An endothermic reaction</span>
                      <span>D. Combustion</span>
                      <span>E. Displacement</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 1 KATI YA 3
              </div>
            </div>
          )
        },
        {
          pageNumber: 2,
          title: "Page 2: Section A (Q1. vi-x) & Question 2 Match",
          rawText: "concentrated sodium chloride graphite electrode empirical formula molecular mass branch of chemistry periodic table group O Period 3 matching hypothesis experiment observations",
          content: (
            <div className="space-y-6">
              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                  <p className="text-slate-900">(vi) An organic compound has an empirical formula CH. The relative molecular mass of the compound is 28. The molecular formula of the compound is:</p>
                  <div className="grid grid-cols-2 gap-2 font-medium text-[11px] text-slate-600">
                    <span>A. C₂H₂</span>
                    <span className="text-indigo-600 font-bold">B. C₂H₄</span>
                    <span>C. C₂H₆</span>
                    <span>D. C₃H₆</span>
                    <span>E. C₃H₇</span>
                  </div>
                </div>

                <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                  <p className="text-slate-900">(vii) In a pharmaceutical research laboratory, scientists are working on developing a new vaccine for a common illness. They analyze physical properties and chemical composition. Which branch of chemistry are they dealing with?</p>
                  <div className="grid grid-cols-2 gap-2 font-medium text-[11px] text-slate-600">
                    <span>A. Physical chemistry</span>
                    <span className="text-indigo-600 font-bold">B. Analytical chemistry</span>
                    <span>C. Biochemistry</span>
                    <span>D. Organic Chemistry</span>
                    <span>E. Inorganic chemistry</span>
                  </div>
                </div>

                <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                  <p className="text-slate-900">(x) Imagine you are told to locate an element with atomic number 18 in the modern periodic table. Where will you place it?</p>
                  <div className="grid grid-cols-2 gap-2 font-medium text-[11px] text-slate-600">
                    <span>A. Group I and Period 1</span>
                    <span>B. Group VII and Period 4</span>
                    <span>C. Group III and Period 3</span>
                    <span>D. Group V and Period 2</span>
                    <span className="text-indigo-600 font-bold">E. Group 0 and Period 3</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-950">
                  2. Match the descriptions of scientific steps in LIST A with the corresponding scientific procedures in LIST B:
                </p>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-[10px] text-slate-800 border border-slate-300 font-medium">
                    <thead>
                      <tr className="bg-slate-100 text-[9px] font-black uppercase text-slate-600">
                        <th className="border border-slate-300 p-2 text-left w-1/2">LIST A (Descriptions of Steps)</th>
                        <th className="border border-slate-300 p-2 text-left w-1/2">LIST B (Procedures)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="border border-slate-300 p-2">(i) A statement of how the results relate to the hypothesis.</td>
                        <td className="border border-slate-300 p-2">A. Conclusion</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">(ii) A series of investigations to test the hypothesis.</td>
                        <td className="border border-slate-300 p-2">B. Data analysis</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">(iii) A statement that identifies an event, fact, or situation.</td>
                        <td className="border border-slate-300 p-2">C. Data collection</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">(iv) A tentative, testable explanation for observations.</td>
                        <td className="border border-slate-300 p-2">D. Hypothesis</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">(v) A step in which the researcher explains the observed data.</td>
                        <td className="border border-slate-300 p-2">E. Observations</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 2 KATI YA 3
              </div>
            </div>
          )
        },
        {
          pageNumber: 3,
          title: "Page 3: Section B & Section C Highlights",
          rawText: "SECTION B charcoal source of fuel Kerosene temperature industrial preparation Sulphur trioxide equilibrium H2 hydrogen gas over water SECTION C fertilizer application Butanol Ethanoic acid But-1-ene Esters",
          content: (
            <div className="space-y-6">
              <div className="border-b border-slate-300 pb-1">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase">SECTION B: (54 MARKS)</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Answer all questions in this section.</p>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-800">
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-slate-900 font-bold flex justify-between">
                    <span>3. FUELS AND TEMPERATURE CALCULATION:</span>
                    <span className="text-indigo-600 font-bold">[9 Marks]</span>
                  </p>
                  <ul className="list-disc pl-5 space-y-1 font-medium text-[11px] text-slate-700">
                    <li>(a) Explain three environmental effects of using charcoal as a source of fuel.</li>
                    <li>(b) Explain three key factors to be considered when choosing a good fuel.</li>
                    <li>(c) Kerosene has a heat value of 43,400 KJ/kg. What volume of kerosene is required to raise the temperature of 20 Litres of water from 24°C to 100°C? [Specific heat capacity of water = 4.18 KJ/kg/K, Density of water = 1000 kg/m³, Density of kerosene = 810 kg/m³]</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-slate-900 font-bold flex justify-between">
                    <span>4. CHEMICAL EQUILIBRIUM:</span>
                    <span className="text-indigo-600 font-bold">[9 Marks]</span>
                  </p>
                  <p className="text-[11px] text-slate-600">
                    In the industrial preparation of Sulphur trioxide, equilibrium is established: <br />
                    <span className="font-mono bg-slate-100 px-2 py-1 rounded inline-block my-1 text-slate-900 font-bold">2SO₂(g) + O₂(g) ⇌ 2SO₃(g) (ΔH = -84.9 KJ/mol)</span>
                  </p>
                  <ul className="list-disc pl-5 space-y-1 font-medium text-[11px] text-slate-700">
                    <li>(i) With reasons, explain why an increase in pressure will yield more SO₃.</li>
                    <li>(ii) How would you adjust the temperature to maximize the proportion of SO₃?</li>
                    <li>(iii) Name the catalyst used to speed up this industrial reaction.</li>
                  </ul>
                </div>

                <div className="border-b border-slate-300 pb-1 pt-2">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase">SECTION C: (30 MARKS)</h3>
                </div>

                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-2 font-medium text-[11px] text-slate-700">
                  <p className="font-bold text-slate-900">10. ORGANIC REACTION SCHEME:</p>
                  <p className="text-slate-600">
                    Ethanoic acid reacts with Butanol in the presence of concentrated sulphuric acid to form Compound A. 
                    Identify:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700 text-[10px]">
                    <li>(a) The structural formula of Compound A (Ester).</li>
                    <li>(b) Write a balanced chemical equation for the combustion of Butanol.</li>
                    <li>(c) State the reaction conditions required to dehydrate Butanol to form But-1-ene.</li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 3 KATI YA 3
              </div>
            </div>
          )
        }
      ];
    }

    // 4. Mathematics Mock Exam 2026
    if (documentId === 'mock-math-f4-2026') {
      return [
        {
          pageNumber: 1,
          title: "Page 1: Section A (Q1 - Q3)",
          rawText: "REGIONAL FORM FOUR MOCK EXAMINATION BASIC MATHEMATICS 2026 SECTION A Traffic lights LCM exact value exponents sets universal set subsets",
          content: (
            <div className="space-y-6">
              <div className="text-center space-y-2 pb-6 border-b border-slate-300">
                <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">THE UNITED REPUBLIC OF TANZANIA</p>
                <p className="text-xs font-black text-slate-700 tracking-wide uppercase">PRESIDENT'S OFFICE</p>
                <p className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT</p>
                <div className="py-1 bg-amber-600/10 rounded-xl px-4 inline-block my-2 border border-amber-500/20">
                  <span className="text-sm font-black text-amber-800 tracking-wider uppercase">MOROGORO REGION</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">REGIONAL FORM FOUR MOCK EXAMINATION 2026</h2>
                <div className="flex justify-between items-center max-w-md mx-auto pt-2 font-mono text-xs font-bold text-slate-600">
                  <span>041 BASIC MATHEMATICS</span>
                  <span>TIME: 3:00 Hours</span>
                </div>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-800">
                <div className="border-b border-slate-300 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase">SECTION A: (60 MARKS)</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Answer all questions in this section.</p>
                </div>

                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-slate-900 font-bold">Question 1: [6 Marks]</p>
                  <p className="font-medium text-slate-700 leading-relaxed text-[11px]">
                    (a) Traffic lights at three different road crossings change after 48, 72 and 108 seconds respectively. If they all change simultaneously at 7:00 a.m., at what time will they change simultaneously again?
                  </p>
                  <p className="font-medium text-slate-700 leading-relaxed text-[11px]">
                    (b) If <span className="font-mono font-bold bg-slate-100 px-1 py-0.5 rounded text-indigo-700">x = 0.567567...</span> and <span className="font-mono font-bold bg-slate-100 px-1 py-0.5 rounded text-indigo-700">y = 0.8333...</span>, find the exact value of <span className="font-mono font-bold">xy²/y</span> as a simplified fraction.
                  </p>
                </div>

                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-slate-900 font-bold">Question 2: [6 Marks]</p>
                  <p className="font-medium text-slate-700 leading-relaxed text-[11px]">
                    (a) If <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">(1/16)^(n+3) × (1/32)^(-5) = 1</span>, find the value of <span className="font-bold text-indigo-700">n</span>.
                  </p>
                  <p className="font-medium text-slate-700 leading-relaxed text-[11px]">
                    (b) Make <span className="font-bold">L</span> the subject of the formula from: <br />
                    <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded block mt-1 w-max">M/N = 1/2 × √( L / (T-L) )</span>
                  </p>
                </div>

                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-slate-900 font-bold">Question 3: [6 Marks]</p>
                  <p className="font-medium text-slate-700 leading-relaxed text-[11px]">
                    (a) Let the universal set <span className="font-mono font-bold bg-slate-100 px-1 rounded">U = {'{a, b, c, d, e, f, g, h}'}</span>, set <span className="font-mono font-bold bg-slate-100 px-1 rounded">A = {'{c, g, f}'}</span> and set <span className="font-mono font-bold bg-slate-100 px-1 rounded">B = {'{b, d, h}'}</span>. Find:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 font-medium text-[11px] text-slate-600">
                    <li>(i) The number of subsets of A.</li>
                    <li>(ii) The set <span className="font-mono font-bold">n(A' ∩ B)</span>.</li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 1 KATI YA 2
              </div>
            </div>
          )
        },
        {
          pageNumber: 2,
          title: "Page 2: Section B (Q11 - Q14)",
          rawText: "SECTION B statistics Marks of students frequency distribution median class mean median longitude parallel of latitude singular matrix simultaneous equations rotation",
          content: (
            <div className="space-y-6">
              <div className="border-b border-slate-300 pb-1">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase">SECTION B: (40 MARKS)</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Answer any two (2) questions from this section.</p>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-800">
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-slate-900 font-bold flex justify-between">
                    <span>Question 11: STATISTICS & CIRCLE GEOMETRY</span>
                    <span className="text-indigo-600 font-bold">[20 Marks]</span>
                  </p>
                  <p className="text-[11px] text-slate-600">
                    The marks of 40 students in a math test are grouped into a frequency distribution table with intervals 20-29, 30-39, etc.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 font-medium text-[11px] text-slate-700">
                    <li>(a) Construct the frequency distribution and locate the median class.</li>
                    <li>(b) Calculate the mean and the median of the student marks.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-slate-900 font-bold flex justify-between">
                    <span>Question 13: MATRICES & TRANSFORMATION</span>
                    <span className="text-indigo-600 font-bold">[20 Marks]</span>
                  </p>
                  <ul className="list-disc pl-5 space-y-1 font-medium text-[11px] text-slate-700">
                    <li>(a) Find the value of y such that the matrix <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">[[y, 4], [3, y-1]]</span> is singular.</li>
                    <li>(b) Solve the simultaneous equations by using matrix method: <br />
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded inline-block mt-1 text-slate-900">2x + y = 7 <br /> 4x + 3y = 17</span>
                    </li>
                    <li>(c) Find the image of the coordinate (3, 5) after a rotation of 270° counterclockwise about the origin.</li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 2 KATI YA 2
              </div>
            </div>
          )
        }
      ];
    }

    // 5. Physical Education Mock Exam 2026
    if (documentId === 'mock-pe-f4-2026') {
      return [
        {
          pageNumber: 1,
          title: "Page 1: Instructions & Section A (Q1. i-x)",
          rawText: "REGIONAL FORM FOUR MOCK EXAMINATION PHYSICAL EDUCATION 2026 SECTION A gymnast giant swing medley relay sprained ankle change over zone blocking skills camping beach volleyball",
          content: (
            <div className="space-y-6">
              <div className="text-center space-y-2 pb-6 border-b border-slate-300">
                <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">THE UNITED REPUBLIC OF TANZANIA</p>
                <p className="text-xs font-black text-slate-700 tracking-wide uppercase">PRESIDENT'S OFFICE</p>
                <p className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT</p>
                <div className="py-1 bg-purple-600/10 rounded-xl px-4 inline-block my-2 border border-purple-500/20">
                  <span className="text-sm font-black text-purple-800 tracking-wider uppercase">MOROGORO REGION</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">REGIONAL FORM FOUR MOCK EXAMINATION 2026</h2>
                <div className="flex justify-between items-center max-w-md mx-auto pt-2 font-mono text-xs font-bold text-slate-600">
                  <span>018 PHYSICAL EDUCATION</span>
                  <span>TIME: 3:00 Hours</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-b border-slate-300 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase">SECTION A: (16 MARKS)</h3>
                </div>

                <p className="text-xs font-bold text-slate-950">
                  1. Choose the correct answer from the given options:
                </p>

                <div className="space-y-4 pl-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">(i) A gymnast swings backward and forward around a horizontal high bar in a full circular path. This skill is termed as:</p>
                    <div className="grid grid-cols-2 gap-2 font-medium text-[11px] text-slate-600">
                      <span>A. Kip</span>
                      <span className="text-indigo-600 font-bold">B. Giant swing</span>
                      <span>C. Cast handstand</span>
                      <span>D. Salto</span>
                      <span>E. Pike hang</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">(iii) During a physical activity session, a student twisted their foot. This resulted in a painful, swollen ligament injury. Identify the correct term for this condition:</p>
                    <div className="grid grid-cols-2 gap-2 font-medium text-[11px] text-slate-600">
                      <span>A. Dislocation</span>
                      <span>B. Fracture</span>
                      <span className="text-indigo-600 font-bold">C. Sprained ankle</span>
                      <span>D. Hamstring strain</span>
                      <span>E. Concussion</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">(ix) Which type of recreational volleyball is played specifically on sand surfaces with fewer players per team?</p>
                    <div className="grid grid-cols-2 gap-2 font-medium text-[11px] text-slate-600">
                      <span>A. Court volleyball</span>
                      <span className="text-indigo-600 font-bold">B. Beach volleyball</span>
                      <span>C. Sitting volleyball</span>
                      <span>D. In-door volleyball</span>
                      <span>E. Mud volleyball</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 1 KATI YA 2
              </div>
            </div>
          )
        },
        {
          pageNumber: 2,
          title: "Page 2: Section B (Q3-Q6) & Section C (Q9)",
          rawText: "SECTION B bonanza preparation safety measures basketball dribbling javelin thrower straight arm hang SECTION C tournament fixture breast stroke table tennis scoring",
          content: (
            <div className="space-y-6">
              <div className="border-b border-slate-300 pb-1">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase">SECTION B: (54 MARKS)</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Answer all questions in this section.</p>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-800">
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-slate-900 font-bold">3. SPORTS SAFETY & BONANZA:</p>
                  <p className="text-[11px] text-slate-700 font-medium">
                    State five primary safety measures a school committee should prepare before starting a physical education bonanza event.
                  </p>
                </div>

                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-slate-900 font-bold">4. BASKETBALL DRIBBBLING SKILLS:</p>
                  <p className="text-[11px] text-slate-700 font-medium">
                    Detail five distinct procedures for executing a low, protective dribble in basketball under active defensive pressure.
                  </p>
                </div>

                <div className="border-b border-slate-300 pb-1 pt-2">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase">SECTION C: (30 MARKS)</h3>
                </div>

                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-2 font-medium text-[11px] text-slate-700">
                  <p className="font-bold text-slate-900">Question 9: TOURNAMENT FIXTURES</p>
                  <p className="text-slate-600">
                    Prepare a complete knockout tournament fixture sheet for an interschool football championship consisting of four competing teams. Illustrate lines of progression.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 2 KATI YA 2
              </div>
            </div>
          )
        }
      ];
    }

    // 7. Chemistry 2 (Actual Practical) Mock Exam 2026
    if (documentId === 'mock-chem2-f4-2026') {
      return [
        {
          pageNumber: 1,
          title: "Page 1: Instructions & Volumetric Analysis (Q1)",
          rawText: "REGIONAL FORM FOUR MOCK EXAMINATION CHEMISTRY 2 ACTUAL PRACTICAL 2026 ATOMIC MASSES H=1 C=12 O=16 Na=23 Cl=35.5 K=39 S=32 Instructions Question 1 sodium hydroxide solution Z1 Z2 methyl orange indicators volumetric",
          content: (
            <div className="space-y-6">
              <div className="text-center space-y-2 pb-6 border-b border-slate-300">
                <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">THE UNITED REPUBLIC OF TANZANIA</p>
                <p className="text-xs font-black text-slate-700 tracking-wide uppercase">PRESIDENT'S OFFICE</p>
                <p className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT</p>
                <div className="py-1 bg-emerald-600/10 rounded-xl px-4 inline-block my-2 border border-emerald-500/20">
                  <span className="text-sm font-black text-emerald-800 tracking-wider uppercase">MOROGORO REGION</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">REGIONAL FORM FOUR MOCK EXAMINATION 2026</h2>
                <div className="flex justify-between items-center max-w-md mx-auto pt-2 font-mono text-xs font-bold text-slate-600">
                  <span>032/2 CHEMISTRY 2</span>
                  <span>TIME: 3:00 Hours</span>
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-2 font-mono text-[10px] text-slate-600">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-center border-b border-slate-200 pb-1 text-[11px]">Instructions / Maelekezo</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>This paper consists of two (2) questions. Answer all the questions.</li>
                  <li>Each question carries twenty five (25) marks.</li>
                  <li>You may use the following atomic masses: H=1, C=12, Na=23, Cl=35.5, K=39, S=32, O=16.</li>
                  <li>G.M.V = 22.4 dm³ or 22400 cm³.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-950 leading-relaxed">
                  1. You are asked to determine the concentration of sodium hydroxide contaminating drinking water source in a certain village. In order to investigate the problem, a sample from the village water source (containing NaOH) has been brought in chemistry laboratory for you to carry out volumetric analysis. You are also given a standard solution of 1.825g of hydrochloric acid dissolved in 0.5dm³ of a solution. Use methyl orange (MO) and litmus papers as indicators.
                </p>

                <div className="border-t border-slate-200 pt-4">
                  <ChemistryPracticalSimulator />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 1 KATI YA 2
              </div>
            </div>
          )
        },
        {
          pageNumber: 2,
          title: "Page 2: Chemical Kinetics Practical (Q2)",
          rawText: "Question 2 kinetics sodium thiosulphate Na2S2O3 0.25 mol/dm3 M1 2M HCl M2 distilled water thermometer stopwatch plain paper marked x Procedure 80C 70C 60C 50C 40C Room temperature Rate 1/t",
          content: (
            <div className="space-y-6">
              <div className="border-b border-slate-300 pb-2">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase">QUESTION 2: CHEMICAL KINETICS (25 MARKS)</h3>
              </div>

              <div className="space-y-4 text-xs font-medium text-slate-700 leading-relaxed">
                <p>
                  <strong>You are provided with the following:</strong>
                  <br /><strong>M1:</strong> A solution of 0.25 mol/dm³ of Sodium thiosulphate (Na₂S₂O₃).
                  <br /><strong>M2:</strong> A solution of 2M HCl.
                  <br />Distilled water, Stopwatch, Thermometer and plain paper marked (x).
                </p>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <p className="font-bold text-slate-900 uppercase text-[10px]">Procedure / Hatua za Kufuata:</p>
                  <p>
                    Place 150cm³ of water in the 250cm³ beaker and use this as your water bath. Heat the water to 80°C. Measure 10cm³ of M1 and 25cm³ of water and pour the content into 100cm³ beaker. Put the beaker with the content into a hot water bath. When the content attain a temperature of 70°C place the beaker on top of mark X on a paper provided. Add 10cm³ of M2 and immediately start the stop watch. Swirl the beaker twice and look vertically on top of the beaker so as to see X through the bottom of the beaker.
                  </p>
                  <p className="text-slate-600">
                    Stop the clock when X is invisible. Record the time taken for X to disappear completely. Repeat the experiment at different temperatures as shown in Table 1 (70°C, 60°C, 50°C, 40°C, Room temperature).
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-slate-900 uppercase text-[10px]">Questions / Maswali ya Swali la 2:</p>
                  <ul className="list-decimal pl-5 space-y-1 text-slate-600 font-medium text-[11px]">
                    <li>(a) Fill Table 1 (done in virtual lab simulator on page 1).</li>
                    <li>(b) Write a balanced chemical equation for the reaction between M1 and M2.</li>
                    <li>(c) Name the chemical substance which cause the solution to cloud letter X.</li>
                    <li>(d) State any three uses of the substance that causes cloudiness in (c) above.</li>
                    <li>(e) Plot a graph of Rate against temperature.</li>
                    <li>(f) What conclusion can you draw from the graph plotted in (e) above?</li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 2 KATI YA 2
              </div>
            </div>
          )
        }
      ];
    }

    // 8. Chinese Language Mock Exam 2026
    if (documentId === 'mock-chinese-f4-2026') {
      return [
        {
          pageNumber: 1,
          title: "Page 1: Instructions & Multiple Choice",
          rawText: "REGIONAL FORM FOUR MOCK EXAMINATION CHINESE LANGUAGE 2026 Instructions Section 1 xiaogou hen piaoliang shuang jian zhi tiao xuexiao chaoshi yinyuan",
          content: (
            <div className="space-y-6">
              <div className="text-center space-y-2 pb-6 border-b border-slate-300">
                <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">THE UNITED REPUBLIC OF TANZANIA</p>
                <p className="text-xs font-black text-slate-700 tracking-wide uppercase">PRESIDENT'S OFFICE</p>
                <p className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT</p>
                <div className="py-1 bg-red-600/10 rounded-xl px-4 inline-block my-2 border border-red-500/20">
                  <span className="text-sm font-black text-red-800 tracking-wider uppercase">MOROGORO REGION</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">REGIONAL FORM FOUR MOCK EXAMINATION 2026</h2>
                <div className="flex justify-between items-center max-w-md mx-auto pt-2 font-mono text-xs font-bold text-slate-600">
                  <span>026 CHINESE LANGUAGE</span>
                  <span>TIME: 3:00 Hours</span>
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-2 font-mono text-[10px] text-slate-600">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-center border-b border-slate-200 pb-1 text-[11px]">Instructions / 注意事项</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-[10px]">
                  <li>本汉语试卷分三部分，共 11 道题。(This paper consists of 3 sections, with 11 questions).</li>
                  <li>试卷中A和B所有试题都必须回答，C选择2试题 (Answer all in Sections A and B, choose 2 in C).</li>
                  <li>请用黑色或蓝色笔作答 (Please write in blue or black ink).</li>
                  <li>禁止携带通讯设备进入考场 (No communication devices allowed).</li>
                </ol>
              </div>

              <div className="space-y-4">
                <div className="border-b border-slate-300 pb-1">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase">第一部分 (Section A - 16 Marks)</h3>
                </div>
                
                <ChineseLanguageInteractive />
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 1 KATI YA 2
              </div>
            </div>
          )
        },
        {
          pageNumber: 2,
          title: "Page 2: Section B (Comprehension & Written)",
          rawText: "Section B 54 Marks Chinese Character translation Wo meitian zaoshang dou hui zai chufang zhunbei zaofan Ta jintian hen gaoxing yinwei mama song geita yige liwu Nainai zai gongyuan li san bu",
          content: (
            <div className="space-y-6">
              <div className="border-b border-slate-300 pb-2">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase">第二部分 (Section B - 54 Marks)</h3>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-800">
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-slate-900 font-bold">三、根据已给出的拼音请标注正确汉字 (Write correct Chinese Characters based on Pinyin):</p>
                  <ul className="space-y-3 pl-2 text-[11px] font-medium text-slate-700">
                    <li className="p-2.5 bg-white rounded-xl border border-slate-100 space-y-1">
                      <p>1. Wǒ měitiān zǎoshàng dōu huì zài chúfáng zhǔnbèi zǎofàn. <br />(我 每天 早上 都会 在 厨房 <strong>zhǔnbèi zǎofàn</strong>)</p>
                      <span className="text-[10px] text-indigo-600 font-bold">Jibu: 准备早饭 (Prepare breakfast)</span>
                    </li>
                    <li className="p-2.5 bg-white rounded-xl border border-slate-100 space-y-1">
                      <p>2. Tā jīntiān hěn gāoxìng, yīnwèi māmā sòng gěitā yígè lǐwù. <br />(他 今天 很 <strong>gāoxìng</strong>, 因为 妈妈 送 给 他 一个 <strong>lǐwù</strong>)</p>
                      <span className="text-[10px] text-indigo-600 font-bold">Jibu: 高兴 (happy), 礼物 (gift)</span>
                    </li>
                    <li className="p-2.5 bg-white rounded-xl border border-slate-100 space-y-1">
                      <p>3. Nǎinai zài gōngyuán lǐ sànbù. <br />(奶奶 在 公园 里 <strong>sànbù</strong>)</p>
                      <span className="text-[10px] text-indigo-600 font-bold">Jibu: 散步 (take a walk)</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-slate-900 font-bold">第三部分：写作 (Section C - Writing Portfolio - 30 Marks)</p>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Chagua mada MOJA na uandike insha fupi ya herufi 60 hadi 80 za Kichina:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 font-medium text-[11px] text-slate-700">
                    <li>
                      <strong>Mada ya 1: 我感冒了 (Nimepata mafua)</strong>
                      <br /><span className="text-[10px] text-slate-400">Tafadhali tumia maneno haya: 冷 (baridi), 起床 (kuamka), 头疼 (kichwa kuuma), 眼睛 (macho), 肚子 (tumbo).</span>
                    </li>
                    <li>
                      <strong>Mada ya 2: 我出生的城市 (Mji niliozaliwa)</strong>
                      <br /><span className="text-[10px] text-slate-400">Tafadhali tumia maneno haya: 很大 (kubwa sana), 博物馆 (makumbusho), 特別 (maalum), 漂亮 (nzuri/mrembo).</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 2 KATI YA 2
              </div>
            </div>
          )
        }
      ];
    }

    // 9. Civics Mock Exam 2026
    if (documentId === 'mock-civics-f4-2026') {
      return [
        {
          pageNumber: 1,
          title: "Page 1: Instructions & Section A",
          rawText: "REGIONAL FORM FOUR MOCK EXAMINATION CIVICS 2026 Instructions Section A Freedom of speech assembly expressions human rights student complaints empathy self-esteem traffic light green Mr Tuya civil servant",
          content: (
            <div className="space-y-6">
              <div className="text-center space-y-2 pb-6 border-b border-slate-300">
                <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">THE UNITED REPUBLIC OF TANZANIA</p>
                <p className="text-xs font-black text-slate-700 tracking-wide uppercase">PRESIDENT'S OFFICE</p>
                <p className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT</p>
                <div className="py-1 bg-blue-600/10 rounded-xl px-4 inline-block my-2 border border-blue-500/20">
                  <span className="text-sm font-black text-blue-800 tracking-wider uppercase">MOROGORO REGION</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">REGIONAL FORM FOUR MOCK EXAMINATION 2026</h2>
                <div className="flex justify-between items-center max-w-md mx-auto pt-2 font-mono text-xs font-bold text-slate-600">
                  <span>011 CIVICS</span>
                  <span>TIME: 3:00 Hours</span>
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-2 font-mono text-[10px] text-slate-600">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-center border-b border-slate-200 pb-1 text-[11px]">Instructions / Maelekezo</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>This paper consists of sections A, B and C with a total of eleven (11) questions.</li>
                  <li>Answer ALL questions in sections A and B, and TWO (2) questions from section C.</li>
                  <li>Section A carries 16 marks, section B carries 54 marks and section C carries 30 marks.</li>
                  <li>All writings must be in blue or black ink.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="border-b border-slate-300 pb-1">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase">SECTION A: (16 MARKS)</h3>
                </div>

                <div className="space-y-3 pl-2 text-xs font-medium text-slate-700">
                  <p className="font-bold text-slate-950">1. Multiple Choice Questions:</p>
                  
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <p className="font-semibold text-slate-900">(i) Before closing the school, the head master called a school assembly and allowed the students to air their complaints. Which type of human right was the head master fulfilling?</p>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 font-medium">
                      <span>A. Freedom of movement</span>
                      <span>B. Freedom of Association</span>
                      <span>C. Freedom of Assembly</span>
                      <span className="text-indigo-600 font-bold">D. Freedom of expression</span>
                      <span>E. Freedom of speech</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <p className="font-semibold text-slate-900">(ii) Mr. Tuya is a civil servant in one of the government departments who uses the department car to supply cow milk to his customers. How can Mr. Tuya be termed?</p>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 font-medium">
                      <span className="text-indigo-600 font-bold">A. Corrupt worker</span>
                      <span>B. An intelligent worker</span>
                      <span>C. Classic entrepreneur</span>
                      <span>D. Classic businessman</span>
                      <span>E. Creative businessman</span>
                    </div>
                  </div>
                </div>

                <CivicsInteractive />
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 1 KATI YA 2
              </div>
            </div>
          )
        },
        {
          pageNumber: 2,
          title: "Page 2: Sections B & C Theory",
          rawText: "SECTION B Section B 54 Marks cultural practices diseases inequality local government authorities functions Tanganyika Zanzibar career development corruption poverty financial services bank private sector SECTION C election globalization reproductive education",
          content: (
            <div className="space-y-6">
              <div className="border-b border-slate-300 pb-2">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase">SECTION B & C (84 MARKS)</h3>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-800">
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-indigo-900 font-bold uppercase text-[10px]">Section B: Short Answer Questions (54 Marks)</p>
                  
                  <div className="space-y-2 text-[11px] font-medium text-slate-700 leading-relaxed">
                    <p><strong>3. Cultural Practices:</strong> Briefly describe six (6) cultural practices which have been linked to diseases, discrimination and inequality in many African societies.</p>
                    <p><strong>4. (a) Local Government Authorities:</strong> Local government authorities play a vital role in development. Show five (5) functions of local government authorities in Tanzania.</p>
                    <p><strong>(b) Union Essentials:</strong> With vivid examples, elaborate on four (4) essentials of the union of Tanganyika and Zanzibar.</p>
                    <p><strong>5. Career Development:</strong> Outline the significance of career development to an individual and to the nation at large (Six points).</p>
                    <p><strong>6. Corruption & Poverty:</strong> How does corruption cause poverty in developing countries? (Six points).</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-indigo-900 font-bold uppercase text-[10px]">Section C: Essay Questions (30 Marks)</p>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Answer any TWO (2) questions from this section:
                  </p>
                  <div className="space-y-2 text-[11px] font-medium text-slate-700 leading-relaxed">
                    <p><strong>9. Democratic Elections:</strong> An election is a process that includes many procedures to get democratic leaders. Elaborate with five (5) points.</p>
                    <p><strong>10. Globalization Impacts:</strong> With examples, explain five (5) negative impacts of globalization on a country like Tanzania.</p>
                    <p><strong>11. Reproductive Health Education:</strong> Although reproductive education is neglected by many people in a community, it plays a significant role in improving the health of women and children. Give five points to substantiate.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 2 KATI YA 2
              </div>
            </div>
          )
        }
      ];
    }

    // 10. Commerce Mock Exam 2026
    if (documentId === 'mock-commerce-f4-2026') {
      return [
        {
          pageNumber: 1,
          title: "Page 1: Instructions & Section A",
          rawText: "REGIONAL FORM FOUR MOCK EXAMINATION COMMERCE 2026 Instructions Section A Inventory ratio Stock levels Rate of stock turnover Stock administration valuation Minor partner Quasi partner Active partner Dormant partner Articles of association Memorandum of association",
          content: (
            <div className="space-y-6">
              <div className="text-center space-y-2 pb-6 border-b border-slate-300">
                <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">THE UNITED REPUBLIC OF TANZANIA</p>
                <p className="text-xs font-black text-slate-700 tracking-wide uppercase">PRESIDENT'S OFFICE</p>
                <p className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT</p>
                <div className="py-1 bg-amber-600/10 rounded-xl px-4 inline-block my-2 border border-amber-500/20">
                  <span className="text-sm font-black text-amber-800 tracking-wider uppercase">MOROGORO REGION</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">REGIONAL FORM FOUR MOCK EXAMINATION 2026</h2>
                <div className="flex justify-between items-center max-w-md mx-auto pt-2 font-mono text-xs font-bold text-slate-600">
                  <span>061 COMMERCE</span>
                  <span>TIME: 3:00 Hours</span>
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-2 font-mono text-[10px] text-slate-600">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-center border-b border-slate-200 pb-1 text-[11px]">Instructions / Maelekezo</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>This paper consists of sections A, B and C with a total of eleven (11) questions.</li>
                  <li>Answer ALL questions in sections A and B, and any TWO (2) questions from section C.</li>
                  <li>All writing must be in blue or black ink.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="border-b border-slate-300 pb-1">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase">SECTION A: (16 MARKS)</h3>
                </div>

                <div className="space-y-3 pl-2 text-xs font-medium text-slate-700">
                  <p className="font-bold text-slate-950">1. Multiple Choice Questions:</p>
                  
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <p className="font-semibold text-slate-900">(i) Assume you are employed by one of the companies in Dar es Salaam, and your task is to determine slow and fast-moving items in store. Which one of the following will help you reach the objective?</p>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 font-medium">
                      <span>A. Inventory ratio</span>
                      <span>B. Stock levels</span>
                      <span className="text-indigo-600 font-bold">C. Rate of stock turnover</span>
                      <span>D. Stock administration</span>
                      <span>E. Stock valuation</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <p className="font-semibold text-slate-900">(x) The transport charge of a small machine which cost Tshs 300,000/= is Tshs 70,000/=. For how much should it be sold to make a profit of 25% of the cost?</p>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 font-medium">
                      <span>A. Tshs 325,000/=</span>
                      <span>B. Tshs 379,000/=</span>
                      <span>C. Tshs 464,000/=</span>
                      <span>D. Tshs 400,000/=</span>
                      <span className="text-indigo-600 font-bold">E. Tshs 375,000/=</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 1 KATI YA 2
              </div>
            </div>
          )
        },
        {
          pageNumber: 2,
          title: "Page 2: Section B Kariakoo Ledger (Q5)",
          rawText: "SECTION B Kariakoo ledger trader Cost of goods sold Average stock Rate of stock turnover Sales Net profit gross profit markup expenses advertising aid to trade sole trader taxation systems SECTION C",
          content: (
            <div className="space-y-6">
              <div className="border-b border-slate-300 pb-2">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase">SECTION B & C (84 MARKS)</h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                  <p className="font-bold text-indigo-950 uppercase text-[10px]">Question 5 (Ledger Calculations of Kariakoo Business):</p>
                  <p className="text-slate-600 font-medium">
                    You are given the following related to a particular business in Kariakoo:
                    <br />• Business stock (31.12.2020) ----------------------------------- 267,200/=
                    <br />• Business stock (01.01.2020) ----------------------------------- 344,300/=
                    <br />• Net purchases ---------------------------------------------------- 2,122,900/=
                    <br />• Gross profit markup ----------------------------------------------- 50%
                    <br />• Expenses for the year -------------------------------------------- 450,000/=
                  </p>
                  <p className="font-semibold text-slate-900 text-[10px]">You are required to help the trader to calculate the following:</p>
                </div>

                <CommerceCalculator />

                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-indigo-900 font-bold uppercase text-[10px]">Section C: Commerce Essays (30 Marks)</p>
                  <div className="space-y-2 text-[11px] font-medium text-slate-700 leading-relaxed">
                    <p><strong>9. Entrepreneurship benefits:</strong> Abuja refused to be an entrepreneur. Provide six (6) reasons to convince Abuja to follow his friend Abuus footsteps.</p>
                    <p><strong>10. Taxation factors:</strong> You were appointed as a tax officer in TRA. Describe six (6) things you would put into consideration before introducing any tax to people or businesses.</p>
                    <p><strong>11. Management Canons:</strong> Support the view that controlling, staffing and directing are key ways towards organization goals by providing six (6) Canons which govern management.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 2 KATI YA 2
              </div>
            </div>
          )
        }
      ];
    }

    // 6. Physics Mock Exam 2026
    if (documentId === 'mock-phy-f4-2026') {
      return [
        {
          pageNumber: 1,
          title: "Page 1: Instructions & Section A (Q1. i-v)",
          rawText: "REGIONAL FORM FOUR MOCK EXAMINATION PHYSICS 1 2026 CONSTANTS g=10 Brass expansivity latent heat specific heat speed of sound Section A micrometer screw gauge cork density copper sulphate pressure of liquid",
          content: (
            <div className="space-y-6">
              <div className="text-center space-y-2 pb-6 border-b border-slate-300">
                <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">THE UNITED REPUBLIC OF TANZANIA</p>
                <p className="text-xs font-black text-slate-700 tracking-wide uppercase">PRESIDENT'S OFFICE</p>
                <p className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT</p>
                <div className="py-1 bg-indigo-600/10 rounded-xl px-4 inline-block my-2 border border-indigo-500/20">
                  <span className="text-sm font-black text-indigo-800 tracking-wider uppercase">MOROGORO REGION</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">REGIONAL FORM FOUR MOCK EXAMINATION 2026</h2>
                <div className="flex justify-between items-center max-w-md mx-auto pt-2 font-mono text-xs font-bold text-slate-600">
                  <span>031 PHYSICS 1</span>
                  <span>TIME: 3:00 Hours</span>
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-2 font-mono text-[10px] text-slate-600">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-center border-b border-slate-200 pb-1 text-[11px]">Physics Constants and Data</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span>Acceleration of gravity (g) = 10 m/s²</span>
                  <span>Speed of sound in air = 340 m/s</span>
                  <span>Specific heat capacity of water = 4,200 J/kg/°C</span>
                  <span>Latent heat of fusion of ice = 330,000 J/kg</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-b border-slate-300 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase">SECTION A: (16 MARKS)</h3>
                </div>

                <p className="text-xs font-bold text-slate-950">
                  1. For each of the items (i) - (x), choose the correct answer:
                </p>

                <div className="space-y-4 pl-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">(i) Which of the following instruments is most suitable for measuring the diameter of a very small metallic ball bearing?</p>
                    <div className="grid grid-cols-2 gap-2 font-medium text-[11px] text-slate-600">
                      <span>A. Vernier caliper</span>
                      <span className="text-indigo-600 font-bold">B. Micrometer screw gauge</span>
                      <span>C. Metre rule</span>
                      <span>D. Measuring tape</span>
                      <span>E. Spherometer</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
                    <p className="text-slate-900">(v) A crane raises a block of mass 20 kg vertically upwards through a height of 10m in 5 seconds. Find the output power developed by the crane: [g = 10 m/s²]</p>
                    <div className="grid grid-cols-2 gap-2 font-medium text-[11px] text-slate-600">
                      <span>A. 200 W</span>
                      <span className="text-indigo-600 font-bold">B. 400 W</span>
                      <span>C. 100 W</span>
                      <span>D. 2,000 W</span>
                      <span>E. 50 W</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 1 KATI YA 2
              </div>
            </div>
          )
        },
        {
          pageNumber: 2,
          title: "Page 2: Section B (Q3 - Q5) Highlights",
          rawText: "SECTION B optical arrangement of camera human eye lens formula magnifying glass metre rule relative velocity simple machine B refrigerator effort",
          content: (
            <div className="space-y-6">
              <div className="border-b border-slate-300 pb-1">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase">SECTION B: (54 MARKS)</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Answer all questions in this section.</p>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-800">
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-slate-900 font-bold">3. OPTICS & LENSES:</p>
                  <ul className="list-disc pl-5 space-y-1 font-medium text-[11px] text-slate-700">
                    <li>(a) Compare the optical arrangement of a photographic camera and a human eye. List two similarities and two differences.</li>
                    <li>(b) A thin converging lens of focal length 5 cm is used as a simple magnifying glass by a reading specialist. Calculate the magnification if the image is formed at the near point (25 cm).</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-slate-900 font-bold">5. MACHINES & MECHANICAL ADVANTAGE:</p>
                  <p className="text-[11px] text-slate-700 font-medium">
                    A simple machine with a velocity ratio (V.R.) of 5 is used to pull a heavy refrigerator of mass 200 kg up an inclined plane. An effort of 500 N is applied. Calculate:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 font-medium text-[11px] text-slate-700">
                    <li>(a) The Mechanical Advantage (M.A.) of the machine.</li>
                    <li>(b) The overall efficiency of the inclined plane machine.</li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
                UKURASA WA 2 KATI YA 2
              </div>
            </div>
          )
        }
      ];
    }

    // 12. Chemistry Practical Solutions - IV Handout (Sir. Donny)
    if (documentId === 'chem-practical-handout') {
      return [
        {
          pageNumber: 1,
          title: "Page 1: Utangulizi & Muhtasari wa Kitabu",
          rawText: "CHEMISTRY PRACTICAL SOLUTIONS - IV COMMON PRACTICALS 1. VOLUMETRIC ANALYSIS 2. RATE OF CHEMICAL REACTION AND EQUILIBRIUM 3. QUALITATIVE ANALYSIS SUBJECT HANDOUT Prepared by Sir. Donny Company Resourceful Learning Centre Page 1",
          content: (
            <div className="space-y-8 py-4 animate-fade-in text-slate-800">
              <div className="text-center space-y-3 pb-8 border-b border-slate-200">
                <div className="mx-auto w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center border border-cyan-500/20 shadow-md mb-2">
                  <Flame size={32} className="animate-pulse" />
                </div>
                <p className="text-[10px] font-black tracking-widest text-cyan-600 uppercase">SIR. DONNY RESOURCEFUL LEARNING CENTRE</p>
                <h1 className="text-2xl font-black text-slate-950 tracking-tight uppercase leading-none text-center">CHEMISTRY PRACTICAL SOLUTIONS - IV</h1>
                <p className="text-xs font-bold text-slate-500 italic max-w-lg mx-auto leading-relaxed text-center">
                  Kitabu cha Majaribio na Masuluhisho ya Kemia kwa Wanafunzi wa Kidato cha Nne (NECTA CSEE Practical Guide)
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Award size={14} className="text-cyan-600" /> COMMON PRACTICALS IN NECTA SYLLABUS
                </h3>
                <ol className="list-decimal pl-5 text-xs font-bold text-slate-700 space-y-2 leading-relaxed">
                  <li>
                    <span className="text-cyan-800 font-extrabold uppercase text-[11px] block">1. Volumetric Analysis (Uchambuzi wa Kiasi / Titration)</span>
                    Kukokotoa molarity, concentration (g/dm³), molar mass ya kiwanja kisichojulikana, namba ya maji ya ukaushaji (Z in Na₂CO₃·ZH₂O), na atomiki masi ya kipengele kisichojulikana.
                  </li>
                  <li>
                    <span className="text-amber-800 font-extrabold uppercase text-[11px] block">2. Rate of Chemical Reaction and Equilibrium (Kasi ya Mmenyuko)</span>
                    Kuchunguza jinsi mkusanyiko (concentration) au joto (temperature) linavyoathiri kasi ya mmenyuko kati ya Sodium Thiosulphate (Na₂S₂O₃) na Hydrochloric Acid (HCl).
                  </li>
                  <li>
                    <span className="text-rose-800 font-extrabold uppercase text-[11px] block">3. Qualitative Analysis (Uchambuzi wa Ubora / Chumvi ya Maabara)</span>
                    Utambuzi wa kimajaribio wa cation na anion katika chumvi rahisi (simple salt containing one cation and one anion) kwa kutumia NaOH, NH₄OH, na vitendanishi vingine.
                  </li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-2xl p-4 bg-gradient-to-br from-cyan-50/20 to-white hover:shadow-sm transition-all space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xs">A</div>
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">Yaliyomo Kwenye Kitabu</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                    Maswali na majibu ya vitendo kutoka Practical 01 hadi Practical 39 yakionyesha hatua zote za maabara na ukokotoaji sahihi.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-gradient-to-br from-indigo-50/20 to-white hover:shadow-sm transition-all space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">B</div>
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">Lengo Kuu la Mwongozo</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                    Kukuwezesha mwanafunzi kupata alama zote 25/25 katika swali la kwanza na la pili la mtihani wa vitendo wa kemia (NECTA Chemistry 2).
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Ukurasa wa 1 • Sir. Donny Company Resourceful Learning Centre
              </div>
            </div>
          )
        },
        {
          pageNumber: 2,
          title: "Page 2: Volumetric Analysis - Practical 01",
          rawText: "Practical 01 Determine the atomic mass of X in XOH Solution G containing 0.05 M sulphuric acid Solution H containing 2 g of XOH in 500cm3 volume of pipette 25cm3 Titration results table Pilot 1 2 3 Final reading 25.20 25.10 24.90 25.00 Mean titre 25.00cm3 Molarity of H = 0.1 M Molar mass of XOH = 40g/mol Atomic mass of X = 23g",
          content: (
            <div className="space-y-6 text-slate-800">
              <div className="border-b border-slate-200 pb-2">
                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-cyan-100 text-cyan-800 rounded-lg">Uchambuzi wa Kiasi (Volumetric Analysis)</span>
                <h2 className="text-base font-black text-slate-900 mt-2 uppercase tracking-tight">PRACTICAL 01: Determining Atomic Mass of X in XOH</h2>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs leading-relaxed font-semibold">
                <p className="text-slate-900"><strong className="text-slate-950 font-black">Yaliyotolewa (Provided Materials):</strong></p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li><strong>Solution G:</strong> 0.05 M Sulphuric Acid (H₂SO₄)</li>
                  <li><strong>Solution H:</strong> 2 g of XOH dissolved in 500 cm³ of solution</li>
                  <li><strong>Indicator:</strong> Methyl Orange (MO)</li>
                  <li><strong>Pipette Volume:</strong> 25 cm³</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Jedwali la Matokeo ya Titration (Table of Results)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse text-xs font-bold text-slate-700">
                    <thead>
                      <tr className="bg-slate-100 border-y border-slate-200 text-slate-900 uppercase tracking-wider text-[10px]">
                        <th className="py-2 px-3 text-left">Titration Number</th>
                        <th className="py-2 px-3">Pilot</th>
                        <th className="py-2 px-3">1</th>
                        <th className="py-2 px-3">2</th>
                        <th className="py-2 px-3">3</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2 px-3 text-left text-slate-900">Final Reading (cm³)</td>
                        <td className="py-2 px-3 bg-slate-50">25.20</td>
                        <td className="py-2 px-3">25.10</td>
                        <td className="py-2 px-3">24.90</td>
                        <td className="py-2 px-3">25.00</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-left text-slate-900">Initial Reading (cm³)</td>
                        <td className="py-2 px-3 bg-slate-50">0.00</td>
                        <td className="py-2 px-3">0.00</td>
                        <td className="py-2 px-3">0.00</td>
                        <td className="py-2 px-3">0.00</td>
                      </tr>
                      <tr className="font-extrabold bg-cyan-50/30 text-cyan-950 border-t border-cyan-100">
                        <td className="py-2 px-3 text-left">Volume Used (cm³)</td>
                        <td className="py-2 px-3 bg-cyan-50/50">25.20</td>
                        <td className="py-2 px-3">25.10</td>
                        <td className="py-2 px-3">24.90</td>
                        <td className="py-2 px-3">25.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-150 rounded-xl space-y-3 bg-white shadow-sm">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b pb-1">Ukokotoaji wa Kati (Mean Titre Volume)</h4>
                  <div className="space-y-1 font-mono text-xs">
                    <p className="font-bold text-slate-700">Mean Titre Volume (V_a) =</p>
                    <div className="flex items-center gap-2 pl-2">
                      <span className="text-lg font-bold">V_a =</span>
                      <div className="text-center font-bold">
                        <div className="border-b border-slate-400 px-2 pb-0.5">25.10 + 24.90 + 25.00</div>
                        <div className="pt-0.5">3</div>
                      </div>
                      <span className="text-slate-900 font-extrabold">= 25.00 cm³</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                    Equation ya mmenyuko: <br />
                    <code className="text-cyan-700 font-extrabold font-mono bg-cyan-50 px-1 py-0.5 rounded">H₂SO₄(aq) + 2XOH(aq) → X₂SO₄(aq) + 2H₂O(l)</code>
                  </p>
                </div>

                <div className="p-4 border border-slate-150 rounded-xl space-y-2 bg-white shadow-sm text-[11px] font-bold text-slate-700">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b pb-1">Ukokotoaji wa Mwisho (Final Calculations)</h4>
                  <ul className="space-y-1.5">
                    <li className="flex justify-between border-b border-slate-50 pb-1">
                      <span>Molarity of Acid (M_a):</span>
                      <span className="font-mono text-slate-900 font-extrabold">0.05 M</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-50 pb-1 text-cyan-800">
                      <span>Molarity of Base H (M_b):</span>
                      <span className="font-mono text-slate-900 font-extrabold">0.10 M</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-50 pb-1">
                      <span>Concentration of H:</span>
                      <span className="font-mono text-slate-900 font-extrabold">4.0 g/dm³</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-50 pb-1">
                      <span>Molar Mass of XOH:</span>
                      <span className="font-mono text-slate-900 font-extrabold">40.0 g/mol</span>
                    </li>
                    <li className="flex justify-between font-extrabold text-slate-950 pt-0.5">
                      <span>Atomic Mass of X:</span>
                      <span className="font-mono bg-amber-400/20 text-amber-950 px-1.5 rounded">23.0 g (Sodium - Na)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Ukurasa wa 2 • Sir. Donny Company Resourceful Learning Centre
              </div>
            </div>
          )
        },
        {
          pageNumber: 3,
          title: "Page 3: Kinetics & Rate of Chemical Reaction",
          rawText: "Practical 18 Rate of chemical reaction with equilibrium TT 0.13M Na2S2O3 Sodium thiosulphate HH 2M HCl Distilled water paper marked X Table of results Exp 1 10ml HH 20ml TT 0ml water Time 20s 1/t 0.05 Exp 2 10ml HH 15ml TT 5ml water Time 24s 1/t 0.04 Exp 3 10ml HH 10ml TT 10ml water Time 34s 1/t 0.03 Exp 4 10ml HH 5ml TT 15ml water Time 50s 1/t 0.02 Graph of 1/t against volume of thiosulphate straight line",
          content: (
            <div className="space-y-6 text-slate-800">
              <div className="border-b border-slate-200 pb-2">
                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 rounded-lg">Kasi ya Mmenyuko (Kinetics)</span>
                <h2 className="text-base font-black text-slate-900 mt-2 uppercase tracking-tight">PRACTICAL 18: Na₂S₂O₃ and HCl Reaction Rate</h2>
              </div>

              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1.5 text-xs font-bold leading-relaxed">
                <p className="text-amber-950">
                  Mmenyuko wa kemia hutoa Sulpfuri ngumu (precipitate) inayofanya mchanganyiko kuwa mzito na kufanya herufi "X" iliyo chini ya chupa kutofahamika tena.
                </p>
                <div className="font-mono text-[10px] text-slate-700 bg-white p-1.5 rounded border border-amber-100">
                  Na₂S₂O₃(aq) + 2HCl(aq) → 2NaCl(aq) + H₂O(l) + S(s) + SO₂(g)
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-950 uppercase">Jedwali la Matokeo (Table of Results)</h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-center border-collapse text-xs font-bold text-slate-700">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-950 uppercase text-[9px]">
                          <th className="py-2 px-1">Exp.</th>
                          <th className="py-2 px-1">HCl (cm³)</th>
                          <th className="py-2 px-1">Na₂S₂O₃ (cm³)</th>
                          <th className="py-2 px-1">Maji (cm³)</th>
                          <th className="py-2 px-1 text-amber-950">Time (s)</th>
                          <th className="py-2 px-1 text-slate-950">1/t (s⁻¹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        <tr>
                          <td className="py-2 px-1">1</td>
                          <td className="py-2 px-1 font-mono">10</td>
                          <td className="py-2 px-1 font-mono text-slate-900">20</td>
                          <td className="py-2 px-1 font-mono">0</td>
                          <td className="py-2 px-1 font-mono font-black text-amber-700">20</td>
                          <td className="py-2 px-1 font-mono text-cyan-600">0.05</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-1">2</td>
                          <td className="py-2 px-1 font-mono">10</td>
                          <td className="py-2 px-1 font-mono text-slate-900">15</td>
                          <td className="py-2 px-1 font-mono">5</td>
                          <td className="py-2 px-1 font-mono font-black text-amber-700">24</td>
                          <td className="py-2 px-1 font-mono text-cyan-600">0.04</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-1">3</td>
                          <td className="py-2 px-1 font-mono">10</td>
                          <td className="py-2 px-1 font-mono text-slate-900">10</td>
                          <td className="py-2 px-1 font-mono">10</td>
                          <td className="py-2 px-1 font-mono font-black text-amber-700">34</td>
                          <td className="py-2 px-1 font-mono text-cyan-600">0.03</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-1">4</td>
                          <td className="py-2 px-1 font-mono">10</td>
                          <td className="py-2 px-1 font-mono text-slate-900">5</td>
                          <td className="py-2 px-1 font-mono">15</td>
                          <td className="py-2 px-1 font-mono font-black text-amber-700">50</td>
                          <td className="py-2 px-1 font-mono text-cyan-600">0.02</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic text-left">
                    Ufafanuzi: Thamani ya 1/t inapungua jinsi mkusanyiko wa Sodium Thiosulphate unavyopungua (mchujo wa maji unavyoongezeka).
                  </p>
                </div>

                <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-950 uppercase tracking-wide text-center">Graph of 1/t against Volume of Na₂S₂O₃</h3>
                  
                  {/* High fidelity SVG Lab Graph Plot */}
                  <div className="relative w-full aspect-square max-w-[200px] mx-auto bg-white border-2 border-slate-800 rounded p-2 shadow-inner font-mono text-[8px] font-black">
                    {/* Y-axis line */}
                    <div className="absolute left-6 top-2 bottom-6 w-0.5 bg-slate-800"></div>
                    {/* X-axis line */}
                    <div className="absolute left-6 right-2 bottom-6 h-0.5 bg-slate-800"></div>

                    {/* Graph grid lines */}
                    <div className="absolute left-6 right-2 top-2 bottom-6 grid grid-cols-4 grid-rows-4 border border-slate-100 pointer-events-none">
                      <div className="border-r border-b border-dashed border-slate-200"></div>
                      <div className="border-r border-b border-dashed border-slate-200"></div>
                      <div className="border-r border-b border-dashed border-slate-200"></div>
                      <div className="border-b border-dashed border-slate-200"></div>
                      <div className="border-r border-b border-dashed border-slate-200"></div>
                      <div className="border-r border-b border-dashed border-slate-200"></div>
                      <div className="border-r border-b border-dashed border-slate-200"></div>
                      <div className="border-b border-dashed border-slate-200"></div>
                      <div className="border-r border-b border-dashed border-slate-200"></div>
                      <div className="border-r border-b border-dashed border-slate-200"></div>
                      <div className="border-r border-b border-dashed border-slate-200"></div>
                      <div className="border-b border-dashed border-slate-200"></div>
                      <div className="border-r border-dashed border-slate-200"></div>
                      <div className="border-r border-dashed border-slate-200"></div>
                      <div className="border-r border-dashed border-slate-200"></div>
                      <div></div>
                    </div>

                    {/* Y Axis Labels */}
                    <div className="absolute left-0 top-1.5 h-full flex flex-col justify-between text-slate-600">
                      <span>0.05</span>
                      <span>0.04</span>
                      <span>0.03</span>
                      <span>0.02</span>
                      <span className="opacity-0">0</span>
                    </div>

                    {/* X Axis Labels */}
                    <div className="absolute left-6 right-2 bottom-0 flex justify-between text-slate-600">
                      <span>5</span>
                      <span>10</span>
                      <span>15</span>
                      <span>20</span>
                    </div>

                    {/* Axis Titles */}
                    <span className="absolute -rotate-90 left-[-16px] top-1/2 -translate-y-1/2 text-cyan-800 font-extrabold uppercase scale-85">1/t (s⁻¹)</span>
                    <span className="absolute bottom-1 right-2 text-amber-800 font-extrabold uppercase scale-85">Vol (cm³)</span>

                    {/* Plotted best fit line */}
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <line x1="38" y1="140" x2="185" y2="28" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" />
                      <circle cx="38" cy="140" r="3.5" fill="#ef4444" stroke="#000" strokeWidth="1" />
                      <circle cx="87" cy="103" r="3.5" fill="#ef4444" stroke="#000" strokeWidth="1" />
                      <circle cx="136" cy="66" r="3.5" fill="#ef4444" stroke="#000" strokeWidth="1" />
                      <circle cx="185" cy="28" r="3.5" fill="#ef4444" stroke="#000" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Ukurasa wa 3 • Sir. Donny Company Resourceful Learning Centre
              </div>
            </div>
          )
        },
        {
          pageNumber: 4,
          title: "Page 4: Qualitative Analysis - Practical 26",
          rawText: "Practical 26 Qualitative analysis Sample S Simple salt containing one cation and one anion Cation present NH4+ Anion present Cl- Ammonium chloride Table of results Experiment Observation Inference a Observe appearance White crystalline Absence of transition b Add water Soluble Insoluble salt absent c Heat sublimation NH4+ may present d Add NaOH turn red litmus paper blue NH4+ confirmed e Add conc H2SO4 White fumes HCl gas Cl- present f Add H2SO4 MnO2 Greenish-yellow gas Cl- confirmed g Add AgNO3 precipitate soluble in ammonia Cl- present",
          content: (
            <div className="space-y-6 text-slate-800">
              <div className="border-b border-slate-200 pb-2">
                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 rounded-lg">Utambuzi wa Chumvi (Qualitative Analysis)</span>
                <h2 className="text-base font-black text-slate-900 mt-2 uppercase tracking-tight">PRACTICAL 26: Identification of unknown Sample S</h2>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-100 px-4 py-2 text-xs font-black text-slate-900 uppercase tracking-wide flex justify-between items-center">
                  <span>Jedwali la Majaribio (Experimental Table)</span>
                  <span className="font-mono text-cyan-800 text-[10px]">SAMPLE S</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-bold text-slate-700 leading-relaxed">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 uppercase text-[9px] text-slate-500 font-bold">
                        <th className="py-2.5 px-3 w-1/3">Jaribio (Experiment)</th>
                        <th className="py-2.5 px-3 w-1/3">Kuangalia (Observation)</th>
                        <th className="py-2.5 px-3 w-1/3 text-slate-950 font-black">Uamuzi (Inference)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      <tr>
                        <td className="py-2 px-3 align-top font-medium">(a) Muonekano (Appearance)</td>
                        <td className="py-2 px-3 align-top font-semibold text-slate-900">- White crystalline substance</td>
                        <td className="py-2 px-3 align-top"><span className="text-slate-500">Absence of transition elements (Fe²⁺, Cu²⁺, etc)</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 align-top font-medium">(b) Kuyeyusha (Solubility in Water)</td>
                        <td className="py-2 px-3 align-top font-semibold text-slate-900">- Sample completely dissolved</td>
                        <td className="py-2 px-3 align-top"><span className="text-slate-500">Soluble salt is present</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 align-top font-medium">(c) Kupasha Joto kavu (Heating in Dry Tube)</td>
                        <td className="py-2 px-3 align-top font-semibold text-slate-900">- White sublimate on cooler parts; ammonia gas smell</td>
                        <td className="py-2 px-3 align-top"><span className="text-amber-700 font-extrabold bg-amber-50 px-1 rounded">NH₄⁺ may be present</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 align-top font-medium">(d) NaOH + Heat</td>
                        <td className="py-2 px-3 align-top font-semibold text-slate-900">- Ammonia gas turns damp red litmus paper blue</td>
                        <td className="py-2 px-3 align-top"><span className="text-emerald-700 font-extrabold bg-emerald-50 px-1 rounded">NH₄⁺ present confirmed</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 align-top font-medium">(e) Conc. H₂SO₄ + Warm</td>
                        <td className="py-2 px-3 align-top font-semibold text-slate-900">- Colourless gas giving white fumes with NH₃ (HCl gas)</td>
                        <td className="py-2 px-3 align-top"><span className="text-amber-700 font-extrabold bg-amber-50 px-1 rounded">Cl⁻ may be present</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 align-top font-medium">(f) Conc. H₂SO₄ + MnO₂</td>
                        <td className="py-2 px-3 align-top font-semibold text-slate-900">- Greenish-yellow gas with pungent smell (Cl₂ gas)</td>
                        <td className="py-2 px-3 align-top"><span className="text-emerald-700 font-extrabold bg-emerald-50 px-1 rounded">Cl⁻ present confirmed</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-emerald-950 uppercase">Conclusion for Sample S:</h4>
                  <p className="text-[11px] text-emerald-900 font-semibold leading-relaxed">
                    The Cation is <strong>NH₄⁺</strong> (Ammonium) and the Anion is <strong>Cl⁻</strong> (Chloride). <br />
                    The chemical formula of the salt is <strong className="font-mono text-xs">NH₄Cl</strong> (<span className="underline decoration-double">Ammonium chloride</span>).
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm flex-shrink-0">
                  UTAMBUZI KAMILI ✅
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Ukurasa wa 4 • Sir. Donny Company Resourceful Learning Centre
              </div>
            </div>
          )
        }
      ];
    }

    // Default template for other documents (e.g., Physics, Maths, History or any other PDF file)
    const titleUpper = documentTitle.toUpperCase();
    const docCategory = category || 'Elimu Hub Study Resource';
    const docYear = year || 2024;
    const docType = type || 'Past Paper';

    return [
      {
        pageNumber: 1,
        title: "Page 1: Instructions & General Info",
        rawText: `LUPANULLA ELIMU HUB EXAM PREVIEW ${titleUpper} INSTRUCTIONS`,
        content: (
          <div className="space-y-6">
            <div className="text-center space-y-2 pb-6 border-b border-slate-300">
              <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">THE UNITED REPUBLIC OF TANZANIA</p>
              <p className="text-xs font-black text-slate-700 tracking-wide uppercase">LUPANULLA FOUNDATION STUDY PORTAL</p>
              <div className="py-1 bg-cyan-600/10 rounded-xl px-4 inline-block my-2 border border-cyan-500/20">
                <span className="text-sm font-black text-cyan-800 tracking-wider uppercase">{docCategory}</span>
              </div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">{titleUpper}</h2>
              <div className="flex justify-between items-center max-w-md mx-auto pt-2 font-mono text-xs font-bold text-slate-600">
                <span>{docType} - {docYear}</span>
                <span>TIME: 3:00 Hours</span>
              </div>
            </div>

            <div className="border-2 border-slate-900 rounded-2xl p-5 space-y-4 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-300 pb-2">
                <Info size={14} className="text-slate-700" /> INSTRUCTIONS / MAELEKEZO
              </h3>
              <ol className="list-decimal pl-5 text-xs text-slate-700 space-y-2 font-medium leading-relaxed">
                <li>This document has been compiled and optimized by Lupanulla AI for dynamic browser previews.</li>
                <li>Answer all required academic exercises or exam questions outlined.</li>
                <li>Use the toolbar above to search for keywords, zoom, or toggle comfortable sepia/night reading modes.</li>
                <li>Click the "Download PDF" button to download the full, pristine PDF file from the cloud folder.</li>
              </ol>
            </div>

            <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4 flex gap-3 text-xs text-cyan-800 mt-6">
              <Sparkles className="text-cyan-500 flex-shrink-0" size={16} />
              <div className="space-y-1">
                <p className="font-black">💡 NOTISI MAHIRI ZIMEANDALIWA!</p>
                <p className="font-semibold leading-relaxed text-slate-600">
                  Unaweza pia kufungua tab ya pili ya "Notisi Mahiri (Smart Notes)" kupitia tab iliyo juu ili kusoma muhtasari fupi wenye uwezo wa kuweka highlights na maelezo yako ya kibinafsi.
                </p>
              </div>
            </div>

            <div className="pt-20 text-center border-t border-dashed border-slate-200">
              <span className="text-[9px] font-black tracking-widest text-cyan-500/40 uppercase">LUPANULLA ELIMU HUB</span>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">PAGE 1 OF 3</p>
            </div>
          </div>
        )
      },
      {
        pageNumber: 2,
        title: "Page 2: Exam Questions & Core Concepts",
        rawText: `SECTION A COMPULSORY QUESTIONS STUDY CONCEPTS`,
        content: (
          <div className="space-y-6">
            <div className="border-b border-slate-300 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase">SECTION A (Core Academic Content)</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">COMPULSORY QUESTIONS / MASWALI YA LAZIMA</p>
            </div>

            <div className="space-y-6 text-xs text-slate-700 font-semibold leading-relaxed">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[9px] bg-cyan-100 text-cyan-800 font-black px-2 py-0.5 rounded uppercase">QUESTION 1</span>
                <p className="text-slate-900 font-bold">Describe the main theoretical models associated with this topic, specifically detailing: </p>
                <ul className="list-disc pl-5 font-medium space-y-1 text-slate-600">
                  <li>Key definitions and scientific postulates.</li>
                  <li>How this applies in solving practical physics or mathematical problems in Tanzania.</li>
                  <li>Common misconceptions and how to avoid them in national NECTA exams.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[9px] bg-cyan-100 text-cyan-800 font-black px-2 py-0.5 rounded uppercase">QUESTION 2</span>
                <p className="text-slate-900 font-bold">Contrast and compare the primary systems described in the syllabus. Give clear, labeled diagrams where necessary to illustrate the structural differences.</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[9px] bg-cyan-100 text-cyan-800 font-black px-2 py-0.5 rounded uppercase">QUESTION 3</span>
                <p className="text-slate-900 font-bold">A laboratory experiment was conducted with varying parameters. Discuss the expected results, variables, control mechanisms and graph trends.</p>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
              PAGE 2 OF 3
            </div>
          </div>
        )
      },
      {
        pageNumber: 3,
        title: "Page 3: Extended & Essay Questions",
        rawText: `SECTION B ESSAY QUESTIONS DETAILED SOLUTIONS`,
        content: (
          <div className="space-y-6">
            <div className="border-b border-slate-300 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase">SECTION B (Extended Essays)</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">CHOOSE AND ANSWER ONE QUESTION / JIBU SWALI MOJA TU SEHEMU HII</p>
            </div>

            <div className="space-y-4 text-xs font-semibold leading-relaxed">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[9px] bg-purple-100 text-purple-800 font-black px-2 py-0.5 rounded uppercase">QUESTION 4 (ESSAY)</span>
                <p className="text-slate-900 font-bold">Analyze the socio-economic and scientific implications of technological advancements in the Tanzanian community. Formulate five key arguments and justify with realistic case studies.</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[9px] bg-purple-100 text-purple-800 font-black px-2 py-0.5 rounded uppercase">QUESTION 5 (ESSAY)</span>
                <p className="text-slate-900 font-bold">Formulate a comprehensive plan for resource management in secondary schools. Address funding, material quality, and student motivation strategies.</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-xs text-amber-800">
              <Info className="text-amber-600 flex-shrink-0" size={16} />
              <p className="font-medium">
                <strong>Msaada wa Lupanulla AI:</strong> Je, unaona ugumu kupata majibu sahihi au kufanya marekebisho (marking scheme) ya karatasi hii? Bonyeza kitufe cha "Tengeneza Flashcards" au fungua "Notisi Mahiri" ili kupata msaada wa haraka sasa.
              </p>
            </div>

            <div className="pt-10 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase">
              PAGE 3 OF 3
            </div>
          </div>
        )
      }
    ];
  }, [documentId, documentTitle, category, year, type]);

  // Handle Search highlight inside the rawText of pages
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchOccurrences(0);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    let count = 0;
    documentPages.forEach((page) => {
      const text = page.rawText.toLowerCase();
      let pos = text.indexOf(query);
      while (pos !== -1) {
        count++;
        pos = text.indexOf(query, pos + 1);
      }
    });
    setSearchOccurrences(count);
  }, [searchQuery, documentPages]);

  // Capture text selection in the document viewer
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && onSelectText) {
      const selected = selection.toString().trim();
      if (selected.length > 0) {
        onSelectText(selected);
      }
    }
  };

  // Active styles based on theme selection
  const themeClasses = {
    light: 'bg-white text-slate-800 shadow-slate-100 border-slate-200',
    sepia: 'bg-[#fbf0db] text-[#5c4033] shadow-amber-100/30 border-[#eadaa6]',
    dark: 'bg-slate-900 text-slate-100 shadow-slate-950/40 border-slate-800'
  };

  const wrapperThemeClasses = {
    light: 'bg-slate-100/80',
    sepia: 'bg-[#f4ebd0]',
    dark: 'bg-slate-950'
  };

  const renderActivePage = () => {
    const page = documentPages.find(p => p.pageNumber === currentPage);
    if (!page) return <div className="text-center py-10">Page not found</div>;
    return page.content;
  };

  return (
    <div className={`flex flex-col bg-white overflow-hidden relative transition-all duration-300 ${
      isFullscreen 
        ? 'fixed inset-0 z-[9999] h-screen w-screen rounded-none border-0 shadow-none' 
        : 'border border-slate-200 rounded-3xl shadow-sm h-[740px]'
    }`}>
      
      {/* Upper Navigation / Toolbar inside the PDF Reader */}
      <div className="bg-slate-900 text-slate-100 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 z-10">
        
        {/* Left Side: Name and Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500/10 text-cyan-400 rounded-lg flex items-center justify-center border border-cyan-500/20 shrink-0">
            <BookOpen size={16} />
          </div>
          <div>
            <h4 className="font-sans font-black text-xs text-white max-w-[160px] sm:max-w-[280px] truncate leading-tight uppercase">
              {documentTitle}
            </h4>
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase mt-0.5">
              <span>Smart PDF Previewer</span>
              <span>•</span>
              <span className="text-cyan-400">Ver. 2026 HD</span>
            </div>
          </div>
        </div>

        {/* Middle: Render View Toggle (Interactive vs. direct iframe) */}
        <div className="flex bg-slate-800 p-1 rounded-xl text-[10px] font-bold uppercase tracking-wider shrink-0 border border-slate-700">
          <button
            onClick={() => setViewMode('interactive')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'interactive' ? 'bg-cyan-500 text-slate-950 shadow-sm font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={12} /> Interactive HD Reader
          </button>
          <button
            onClick={() => setViewMode('iframe')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'iframe' ? 'bg-cyan-500 text-slate-950 shadow-sm font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye size={12} /> Direct PDF File
          </button>
        </div>

        {/* Right side: Toolbar Action Buttons */}
        <div className="flex items-center gap-2">
          {viewMode === 'interactive' && (
            <>
              {/* Sidebar toggle */}
              <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className={`p-2 rounded-lg transition-all border ${
                  showSidebar ? 'bg-slate-800 border-slate-700 text-cyan-400' : 'bg-transparent border-transparent text-slate-400 hover:text-white'
                }`}
                title="Toggle Sidebar Pages"
              >
                <FileText size={15} />
              </button>

              {/* Zoom Controls */}
              <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 overflow-hidden text-xs">
                <button 
                  onClick={handleZoomOut} 
                  className="p-2 text-slate-400 hover:text-white border-r border-slate-700 hover:bg-slate-700"
                  title="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>
                <button 
                  onClick={handleZoomReset}
                  className="px-2 font-mono text-[10px] font-extrabold text-slate-300 hover:text-white"
                  title="Reset Zoom to 100%"
                >
                  {zoom}%
                </button>
                <button 
                  onClick={handleZoomIn} 
                  className="p-2 text-slate-400 hover:text-white border-l border-slate-700 hover:bg-slate-700"
                  title="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>
              </div>

              {/* Rotate */}
              <button 
                onClick={handleRotate}
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
                title="Rotate Page Clockwise"
              >
                <RotateCw size={13} />
              </button>

              {/* Themes */}
              <div className="flex bg-slate-800 rounded-lg border border-slate-700 p-0.5">
                {(['light', 'sepia', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                      theme === t 
                        ? 'bg-slate-700 text-cyan-400 shadow-sm font-black' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={`Reading Theme: ${t.toUpperCase()}`}
                  >
                    {t === 'light' && <Sun size={12} />}
                    {t === 'sepia' && <span className="font-mono text-[9px] font-black uppercase">S</span>}
                    {t === 'dark' && <Moon size={12} />}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* New Tab, Note & Fullscreen Controls - ALWAYS visible */}
          <div className="flex items-center gap-1.5 ml-1 border-l border-slate-800 pl-2">
            {onAddPageNote && (
              <button
                onClick={() => onAddPageNote(currentPage)}
                className="p-2 bg-emerald-600/90 hover:bg-emerald-600 border border-emerald-500 text-white rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider shadow-sm cursor-pointer"
                title={`Weka notisi kwenye ukurasa wa ${currentPage}`}
              >
                <FileText size={13} className="text-emerald-200" />
                <span className="hidden sm:inline">Note Uk. {currentPage}</span>
                {pageNotesCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 font-black text-[9px] rounded-full">
                    {pageNotesCount}
                  </span>
                )}
              </button>
            )}

            {onAddVocabulary && (
              <button
                onClick={() => onAddVocabulary()}
                className="p-2 bg-purple-600/90 hover:bg-purple-600 border border-purple-500 text-white rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider shadow-sm cursor-pointer"
                title="Fungua msamiati au hifadhi neno lililochaguliwa"
              >
                <BookOpen size={13} className="text-purple-200" />
                <span className="hidden sm:inline">Msamiati</span>
                {vocabularyCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-purple-950 text-purple-200 font-black text-[9px] rounded-full">
                    {vocabularyCount}
                  </span>
                )}
              </button>
            )}

            {/* Open in New Tab / Google Drive Button */}
            <a 
              href={formattedDrive.directUrl || driveUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider"
              title={formattedDrive.isDrive ? "Fungua faili hili kwenye Google Drive" : "Fungua PDF kwenye Kichupo Kipya"}
            >
              <ExternalLink size={13} className="text-cyan-400" />
              <span className="hidden sm:inline">{formattedDrive.isDrive ? 'Google Drive' : 'Kichupo Kipya'}</span>
            </a>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-lg transition-all border flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider ${
                isFullscreen 
                  ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-black' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title={isFullscreen ? "Exit Fullscreen (Escape / Skrini Ndogo)" : "Fullscreen (Skrini Nzima)"}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span className="hidden sm:inline">{isFullscreen ? 'Skrini Ndogo' : 'Skrini Nzima'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {viewMode === 'iframe' ? (
          <div className="w-full h-full bg-slate-900 relative flex flex-col items-center justify-center p-0 sm:p-4">
            <iframe 
              srcDoc={iframeSrcDoc}
              className="w-full h-full border-0"
              title={documentTitle}
              allowFullScreen
            ></iframe>
            
            {/* Responsive floating hint widget */}
            <div className={`absolute left-4 right-4 bg-slate-950/95 border border-slate-800 p-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xl backdrop-blur-sm z-10 animate-fade-in ${isMobile ? 'bottom-4' : 'top-4 max-w-md md:max-w-none'}`}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-cyan-500/10 text-cyan-400 rounded-lg flex items-center justify-center border border-cyan-500/20 shrink-0">
                  <Info size={12} />
                </div>
                <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                  {isMobile 
                    ? 'Je, PDF inachelewa au inaonekana vibaya? Unaweza kuifungua moja kwa moja au kusoma kama Notisi Mahiri.'
                    : 'Hali ya Direct Preview: Inapakia kutoka Google Drive. Ikishindwa kuonekana au unataka kuandika highlights, bofya "Interactive HD Reader" juu au "Smart Notes".'
                  }
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
                <a 
                  href={(() => {
                    if (driveUrl.includes('https://docs.google.com/viewer?url=')) {
                      const extracted = driveUrl.split('https://docs.google.com/viewer?url=')[1]?.split('&embedded=true')[0];
                      if (extracted) {
                        return decodeURIComponent(extracted);
                      }
                    }
                    return driveUrl;
                  })()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-initial text-center py-1.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[10px] uppercase rounded-xl transition-all shadow-lg cursor-pointer"
                >
                  Fungua Kwenye Tab Mpya
                </a>
                {onSwitchToNotes && (
                  <button 
                    onClick={onSwitchToNotes}
                    className="flex-1 md:flex-initial py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-extrabold text-[10px] uppercase rounded-xl transition-all cursor-pointer"
                  >
                    Notisi Mahiri
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Left Page-List Sidebar */}
            {showSidebar && (
              <div className="w-56 bg-slate-50 border-r border-slate-200 overflow-y-auto shrink-0 flex flex-col p-4 gap-3">
                <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">Karatasi &bull; Kurasa {documentPages.length}</span>
                <div className="space-y-2">
                  {documentPages.map((page) => (
                    <div
                      key={page.pageNumber}
                      onClick={() => setCurrentPage(page.pageNumber)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        currentPage === page.pageNumber
                          ? 'bg-cyan-50 border-cyan-400 shadow-sm text-cyan-900'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <FileText size={13} className={currentPage === page.pageNumber ? 'text-cyan-600' : 'text-slate-400'} />
                        <span className="text-[10px] font-extrabold uppercase truncate tracking-tight">{page.title}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-semibold mt-1">Ukurasa {page.pageNumber}</div>
                    </div>
                  ))}
                </div>

                {/* Annotation guide info box */}
                <div className="mt-auto bg-cyan-50/50 border border-cyan-100 rounded-xl p-3 text-[10px] font-medium leading-relaxed text-cyan-800 space-y-1">
                  <span className="font-extrabold uppercase text-[9px] tracking-wide block">💡 TIP YA MSOMAJI:</span>
                  <p>Unaweza kuchagua maandishi yoyote ndani ya mtihani kisha bofya <strong>"Highlight"</strong> au <strong>"Annotate"</strong> kwenye upande wa kulia ili kuhifadhi nota zako za kujisomea.</p>
                </div>
              </div>
            )}

            {/* Central Work Space (Document Page Canvas) */}
            <div className={`flex-1 overflow-auto p-6 flex flex-col items-center ${wrapperThemeClasses[theme]} transition-colors duration-300 relative`}>
              
              {/* Floating Inline Search Bar within Viewer */}
              <div className="absolute top-4 right-4 z-10 flex items-center bg-slate-950/90 backdrop-blur-md rounded-xl p-1.5 shadow-xl border border-slate-800 max-w-xs text-white">
                <Search size={14} className="text-slate-400 ml-1.5" />
                <input
                  type="text"
                  placeholder="Tafuta neno kwenye mtihani..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 outline-none text-[10px] px-2 py-1 w-32 focus:w-44 transition-all placeholder-slate-500 text-white"
                />
                {searchQuery && (
                  <div className="flex items-center gap-1 text-[9px] font-mono font-black text-cyan-400 shrink-0 pr-1 border-l border-slate-800 pl-1.5">
                    <span>{searchOccurrences}</span>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-white/10"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>

              {/* Simulated Paper Sheet */}
              <div 
                ref={pageContainerRef}
                onMouseUp={handleTextSelection}
                onTouchEnd={handleTextSelection}
                style={{ 
                  zoom: isMobile ? `${zoom}%` : undefined,
                  transform: !isMobile ? `scale(${zoom / 100}) rotate(${rotation}deg)` : (rotation ? `rotate(${rotation}deg)` : undefined),
                  transformOrigin: 'top center'
                }}
                className={`w-full max-w-[620px] min-h-[500px] sm:min-h-[720px] p-4 sm:p-12 rounded-3xl border shadow-xl transition-all duration-300 relative overflow-hidden select-text leading-relaxed font-sans ${themeClasses[theme]}`}
              >
                {/* Lupanulla Watermark Backdrop */}
                <div className="absolute inset-0 flex flex-col items-center justify-around pointer-events-none overflow-hidden select-none opacity-[0.035] dark:opacity-[0.02] z-0">
                  <div className="text-slate-900 dark:text-white font-sans font-black text-2xl tracking-[0.2em] uppercase rotate-[-30deg] text-center whitespace-nowrap">
                    HATMILIKI YA LUPANULLA ELIMU HUB
                  </div>
                  <div className="text-slate-900 dark:text-white font-sans font-black text-2xl tracking-[0.2em] uppercase rotate-[-30deg] text-center whitespace-nowrap">
                    LUPANULLA ELIMU HUB • EXAM PREVIEW
                  </div>
                  <div className="text-slate-900 dark:text-white font-sans font-black text-2xl tracking-[0.2em] uppercase rotate-[-30deg] text-center whitespace-nowrap">
                    HATMILIKI YA LUPANULLA ELIMU HUB
                  </div>
                </div>

                {/* Search overlay indicator if results are found */}
                {searchQuery && searchOccurrences > 0 && (
                  <div className="absolute top-4 left-4 bg-yellow-500/15 border border-yellow-500 text-yellow-800 text-[9px] font-bold px-2 py-1 rounded-md z-10">
                    🔍 {searchOccurrences} matches highlighted
                  </div>
                )}

                {/* Highlight text highlight rendering fallback */}
                <div className="prose prose-slate max-w-none relative z-10">
                  {renderActivePage()}
                </div>
              </div>

              {/* Spacing padding to account for zoom heights */}
              <div className="h-20 shrink-0" />
            </div>

            {/* Floating Navigation Controls on Document Bottom */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-slate-800 text-white rounded-2xl p-2.5 flex items-center gap-4 shadow-2xl backdrop-blur-md z-10">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg disabled:opacity-40 transition-all text-slate-300 hover:text-white cursor-pointer"
                title="Ukurasa Uliotangulia"
              >
                <ChevronLeft size={16} />
              </button>
              
              <span className="font-mono text-xs font-extrabold text-slate-200 tracking-wider">
                PAGE {currentPage} OF {documentPages.length}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(documentPages.length, prev + 1))}
                disabled={currentPage === documentPages.length}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg disabled:opacity-40 transition-all text-slate-300 hover:text-white cursor-pointer"
                title="Ukurasa Unaofuata"
              >
                <ChevronRight size={16} />
              </button>

              {onAddPageNote && (
                <button
                  onClick={() => onAddPageNote(currentPage)}
                  className="ml-1 py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm cursor-pointer border border-emerald-500"
                  title={`Weka notisi kwenye Ukurasa wa ${currentPage}`}
                >
                  <FileText size={12} />
                  + Note Uk. {currentPage}
                </button>
              )}

              {onAddVocabulary && (
                <button
                  onClick={() => onAddVocabulary()}
                  className="ml-1 py-1 px-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm cursor-pointer border border-purple-500"
                  title="Fungua msamiati au hifadhi neno"
                >
                  <BookOpen size={12} />
                  Msamiati ({vocabularyCount})
                </button>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
