import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  HelpCircle, 
  BookOpen, 
  Filter, 
  TrendingUp, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Edit3, 
  X, 
  Award,
  Sparkles,
  Search,
  Book,
  FileText,
  Globe,
  ExternalLink
} from 'lucide-react';
import { fetchNectaProgress, saveNectaProgress } from '../firebase';
import { NectaProgress, NectaProgressStatus } from '../types';

interface NectaProgressViewProps {
  userProfile: any;
  onNavigate: (view: string, docId?: string) => void;
}

const NECTA_LEVELS = [
  { id: 'std7', name: 'Darasa la 7 (PSLE)', description: 'Mitihani ya Kuhitimu Elimu ya Msingi' },
  { id: 'f2', name: 'Kidato cha 2 (FTSEE)', description: 'Upimaji wa Kitaifa Kidato cha Pili' },
  { id: 'f4', name: 'Kidato cha 4 (CSEE)', description: 'Mtihani wa Kuhitimu Elimu ya Sekondari' },
  { id: 'f6', name: 'Kidato cha 6 (ACSEE)', description: 'Mtihani wa Kidato cha Sita na Vyuo' },
];

const NECTA_SUBJECTS: Record<string, { id: string; name: string; color: string }[]> = {
  std7: [
    { id: 'mathematics', name: 'Mathematics (Hisabati)', color: 'border-l-orange-500 bg-orange-50/5' },
    { id: 'science', name: 'Science & Tech (Sayansi)', color: 'border-l-emerald-500 bg-emerald-50/5' },
    { id: 'social-studies', name: 'Social Studies (Maarifa ya Jamii)', color: 'border-l-cyan-500 bg-cyan-50/5' },
    { id: 'civic-moral', name: 'Civic & Moral (Uraia na Maadili)', color: 'border-l-purple-500 bg-purple-50/5' },
    { id: 'english', name: 'English Language (Kiingereza)', color: 'border-l-blue-500 bg-blue-50/5' },
    { id: 'kiswahili', name: 'Kiswahili', color: 'border-l-red-500 bg-red-50/5' },
  ],
  f2: [
    { id: 'basic-math', name: 'Basic Mathematics', color: 'border-l-orange-500 bg-orange-50/5' },
    { id: 'physics', name: 'Physics (Fizikia)', color: 'border-l-blue-500 bg-blue-50/5' },
    { id: 'chemistry', name: 'Chemistry (Kemia)', color: 'border-l-cyan-500 bg-cyan-50/5' },
    { id: 'biology', name: 'Biology (Biolojia)', color: 'border-l-emerald-500 bg-emerald-50/5' },
    { id: 'geography', name: 'Geography (Jiografia)', color: 'border-l-yellow-500 bg-yellow-50/5' },
    { id: 'history', name: 'History (Historia)', color: 'border-l-rose-500 bg-rose-50/5' },
    { id: 'civics', name: 'Civics (Uraia)', color: 'border-l-purple-500 bg-purple-50/5' },
    { id: 'english', name: 'English Language', color: 'border-l-indigo-500 bg-indigo-50/5' },
    { id: 'kiswahili', name: 'Kiswahili', color: 'border-l-red-500 bg-red-50/5' },
  ],
  f4: [
    { id: 'basic-math', name: 'Basic Mathematics', color: 'border-l-orange-500 bg-orange-50/5' },
    { id: 'physics', name: 'Physics (Fizikia)', color: 'border-l-blue-500 bg-blue-50/5' },
    { id: 'chemistry', name: 'Chemistry (Kemia)', color: 'border-l-cyan-500 bg-cyan-50/5' },
    { id: 'biology', name: 'Biology (Biolojia)', color: 'border-l-emerald-500 bg-emerald-50/5' },
    { id: 'geography', name: 'Geography (Jiografia)', color: 'border-l-yellow-500 bg-yellow-50/5' },
    { id: 'history', name: 'History (Historia)', color: 'border-l-rose-500 bg-rose-50/5' },
    { id: 'civics', name: 'Civics (Uraia)', color: 'border-l-purple-500 bg-purple-50/5' },
    { id: 'english', name: 'English Language', color: 'border-l-indigo-500 bg-indigo-50/5' },
    { id: 'kiswahili', name: 'Kiswahili', color: 'border-l-red-500 bg-red-50/5' },
    { id: 'commerce', name: 'Commerce (Biashara)', color: 'border-l-teal-500 bg-teal-50/5' },
    { id: 'bookkeeping', name: 'Book-keeping', color: 'border-l-amber-500 bg-amber-50/5' },
  ],
  f6: [
    { id: 'physics', name: 'Physics (Fizikia)', color: 'border-l-blue-500 bg-blue-50/5' },
    { id: 'chemistry', name: 'Chemistry (Kemia)', color: 'border-l-cyan-500 bg-cyan-50/5' },
    { id: 'biology', name: 'Biology (Biolojia)', color: 'border-l-emerald-500 bg-emerald-50/5' },
    { id: 'adv-math', name: 'Advanced Mathematics', color: 'border-l-orange-500 bg-orange-50/5' },
    { id: 'geography', name: 'Geography (Jiografia)', color: 'border-l-yellow-500 bg-yellow-50/5' },
    { id: 'history', name: 'History (Historia)', color: 'border-l-rose-500 bg-rose-50/5' },
    { id: 'english', name: 'English Language', color: 'border-l-indigo-500 bg-indigo-50/5' },
    { id: 'kiswahili', name: 'Kiswahili', color: 'border-l-red-500 bg-red-50/5' },
    { id: 'general-studies', name: 'General Studies', color: 'border-l-slate-500 bg-slate-50/5' },
  ],
};

const YEARS = Array.from({ length: 2026 - 1994 + 1 }, (_, i) => (2026 - i).toString());

const MOTIVATIONAL_QUOTES = [
  "Elimu ni ufunguo wa maisha. Endelea kufanya mazoezi ya mtihani!",
  "Mafanikio huja kwa wale wanaojiandaa. Kila karatasi unayomaliza inakuweka karibu na Division I.",
  "Kukata tamaa si chaguo. Weka bidii leo, ufurahie matokeo kesho.",
  "Kujisomea kwa mpango thabiti ndiyo siri ya ushindi wa kitaifa."
];

export default function NectaProgressView({ userProfile, onNavigate }: NectaProgressViewProps) {
  const [progressList, setProgressList] = useState<NectaProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  
  // Selection / Filter States
  const [selectedLevel, setSelectedLevel] = useState<string>('f4'); // Default to Form 4
  const [searchSubjectQuery, setSearchSubjectQuery] = useState('');
  
  // Modal / Detail edit state
  const [editingItem, setEditingItem] = useState<{
    level: string;
    subject: { id: string; name: string };
    year: string;
    currentStatus: NectaProgressStatus;
    currentNotes: string;
  } | null>(null);
  
  const [notesInput, setNotesInput] = useState('');
  const [statusInput, setStatusInput] = useState<NectaProgressStatus>('not_started');
  const [randomQuote, setRandomQuote] = useState('');
  const [archiveTab, setArchiveTab] = useState<'sfna' | 'psle' | 'ftna' | 'csee' | 'acsee' | 'dsee'>('sfna');
  
  // NECTA Results Analyzer local states
  const [calcLevel, setCalcLevel] = useState<'std7' | 'f4' | 'f6'>('f4');
  const [totalStudents, setTotalStudents] = useState<string>('120');
  const [div1Count, setDiv1Count] = useState<string>('34');
  const [div2Count, setDiv2Count] = useState<string>('45');
  const [div3Count, setDiv3Count] = useState<string>('28');
  const [div4Count, setDiv4Count] = useState<string>('11');
  const [div0Count, setDiv0Count] = useState<string>('2');

  // Fetch progress on load
  useEffect(() => {
    if (!userProfile?.uid) return;
    
    const loadProgress = async () => {
      setLoading(true);
      try {
        const data = await fetchNectaProgress(userProfile.uid);
        setProgressList(data);
      } catch (err) {
        console.error('Failed to load NECTA progress:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
    setRandomQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, [userProfile?.uid]);

  // Helper to find existing progress item
  const getProgressState = (level: string, subjectId: string, year: string) => {
    return progressList.find(p => p.level === level && p.subject === subjectId && p.year === year);
  };

  // Quick toggle status directly from the dashboard
  const handleQuickStatusChange = async (level: string, subjectId: string, year: string, currentStatus: NectaProgressStatus) => {
    if (!userProfile?.uid) return;

    let nextStatus: NectaProgressStatus = 'not_started';
    if (currentStatus === 'not_started') nextStatus = 'in_progress';
    else if (currentStatus === 'in_progress') nextStatus = 'completed';
    else nextStatus = 'not_started';

    const tempId = `${userProfile.uid}_${level}_${subjectId}_${year}`;
    setSavingId(tempId);

    try {
      const existing = getProgressState(level, subjectId, year);
      await saveNectaProgress(
        userProfile.uid,
        level,
        subjectId,
        year,
        nextStatus,
        existing?.notes || ''
      );

      // Update local state instantly
      setProgressList(prev => {
        const filtered = prev.filter(p => p.id !== tempId);
        return [...filtered, {
          id: tempId,
          userId: userProfile.uid,
          level,
          subject: subjectId,
          year,
          status: nextStatus,
          notes: existing?.notes || '',
          updatedAt: Date.now()
        }];
      });
    } catch (err) {
      console.error('Failed to save progress:', err);
    } finally {
      setSavingId(null);
    }
  };

  // Open the detailed editing modal
  const openEditModal = (level: string, subject: { id: string; name: string }, year: string) => {
    const existing = getProgressState(level, subject.id, year);
    const itemStatus = existing?.status || 'not_started';
    const itemNotes = existing?.notes || '';

    setEditingItem({
      level,
      subject,
      year,
      currentStatus: itemStatus,
      currentNotes: itemNotes
    });
    setStatusInput(itemStatus);
    setNotesInput(itemNotes);
  };

  // Save changes from modal
  const handleSaveModalChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid || !editingItem) return;

    const tempId = `${userProfile.uid}_${editingItem.level}_${editingItem.subject.id}_${editingItem.year}`;
    setSavingId(tempId);

    try {
      await saveNectaProgress(
        userProfile.uid,
        editingItem.level,
        editingItem.subject.id,
        editingItem.year,
        statusInput,
        notesInput
      );

      setProgressList(prev => {
        const filtered = prev.filter(p => p.id !== tempId);
        return [...filtered, {
          id: tempId,
          userId: userProfile.uid,
          level: editingItem.level,
          subject: editingItem.subject.id,
          year: editingItem.year,
          status: statusInput,
          notes: notesInput,
          updatedAt: Date.now()
        }];
      });

      setEditingItem(null);
    } catch (err) {
      console.error('Failed to save detailed progress:', err);
    } finally {
      setSavingId(null);
    }
  };

  // Compute stats for current active level
  const activeSubjects = NECTA_SUBJECTS[selectedLevel] || [];
  const filteredSubjects = activeSubjects.filter(sub => 
    sub.name.toLowerCase().includes(searchSubjectQuery.toLowerCase())
  );

  const totalPossiblePapers = activeSubjects.length * YEARS.length;
  const levelProgressList = progressList.filter(p => p.level === selectedLevel);
  const completedCount = levelProgressList.filter(p => p.status === 'completed').length;
  const inProgressCount = levelProgressList.filter(p => p.status === 'in_progress').length;
  const completionPercentage = totalPossiblePapers > 0 
    ? Math.round((completedCount / totalPossiblePapers) * 100) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-extrabold tracking-widest text-cyan-600 uppercase flex items-center gap-1.5">
            <Award size={14} /> MFUATILIAJI WA MTAALAA (REVISION JOURNAL)
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-slate-900 mt-1 uppercase">
            Maendeleo ya Mitihani ya NECTA
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold max-w-2xl">
            Sajili karatasi za mitihani ya kitaifa ya miaka iliyopita (Past Papers) ulizozifanyia mazoezi, 
            fuatilia kiwango chako cha kujiandaa, na uhifadhi notisi za masahihisho kwa ajili ya mapitio ya baadaye.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          <a
            href="https://necta.go.tz/news"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/50 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-950/5 hover:scale-[1.01]"
          >
            <Globe size={14} className="text-indigo-600 animate-pulse" /> Taarifa & Habari za NECTA
          </a>
          <button
            onClick={() => onNavigate('mitihani')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-slate-950/5 cursor-pointer"
          >
            <FileText size={14} /> Fungua Past Papers
          </button>
        </div>
      </div>

      {/* Motivational Banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-slate-950 to-emerald-950 text-white p-5 rounded-2xl shadow-sm border border-cyan-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-black tracking-widest text-cyan-400">Nukuu ya Hamasa ya Leo</p>
          <p className="text-sm font-bold italic text-slate-100">"{randomQuote}"</p>
        </div>
        <div className="flex items-center gap-2.5 bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 shrink-0">
          <div className="text-right">
            <span className="block text-[9px] font-black uppercase text-slate-400">Uzoefu (XP) wako</span>
            <span className="text-xs font-black text-white">{userProfile?.xp || 0} XP &bull; {userProfile?.studyTime || 0} Dakika</span>
          </div>
          <TrendingUp size={24} className="text-cyan-400" />
        </div>
      </div>

      {/* NECTA Official News & Updates Banner */}
      <div className="bg-indigo-50/40 border border-indigo-150 p-4.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl shrink-0">
            <Globe size={18} className="animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-black text-xs text-indigo-950 uppercase tracking-tight flex items-center gap-1.5">
              Habari, Tangazo na Updates za NECTA
              <span className="bg-red-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md animate-bounce tracking-wide">Mpya</span>
            </h4>
            <p className="text-xs text-slate-600 leading-normal font-semibold max-w-3xl">
              Fuatilia matokeo rasmi ya mitihani yote, miongozo mipya ya masomo, mabadiliko ya tarehe na taratibu, pamoja na habari za hivi punde moja kwa moja kutoka tovuti ya Baraza la Mitihani la Tanzania (NECTA).
            </p>
          </div>
        </div>
        <a
          href="https://necta.go.tz/news"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-sm shadow-indigo-950/10 cursor-pointer hover:scale-[1.01]"
        >
          Tembelea NECTA News <ExternalLink size={13} />
        </a>
      </div>

      {/* NECTA 2026 Results Quick Links */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-650 animate-pulse" />
          <h4 className="font-display font-black text-xs uppercase tracking-tight text-slate-850">
            Viungo Haraka vya Matokeo ya NECTA 2026 & Kudumu
          </h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <a
            href="https://matokeo.necta.go.tz/results/2026/acsee/index.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl border border-slate-150 hover:border-indigo-200 transition-all text-xs font-bold text-slate-700 cursor-pointer"
          >
            <span>Matokeo ya ACSEE 2026</span>
            <ExternalLink size={12} className="shrink-0 text-slate-400 group-hover:text-indigo-600" />
          </a>
          <a
            href="https://matokeo.necta.go.tz/results/2026/dpee/index.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl border border-slate-150 hover:border-indigo-200 transition-all text-xs font-bold text-slate-700 cursor-pointer"
          >
            <span>Matokeo ya DPEE 2026</span>
            <ExternalLink size={12} className="shrink-0 text-slate-400 group-hover:text-indigo-600" />
          </a>
          <a
            href="https://matokeo.necta.go.tz/results/2026/dppee/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl border border-slate-150 hover:border-indigo-200 transition-all text-xs font-bold text-slate-700 cursor-pointer"
          >
            <span>Matokeo ya DPPEE 2026</span>
            <ExternalLink size={12} className="shrink-0 text-slate-400 group-hover:text-indigo-600" />
          </a>
          <a
            href="https://necta.go.tz/results/view/csee"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl border border-slate-150 hover:border-indigo-200 transition-all text-xs font-bold text-slate-700 cursor-pointer"
          >
            <span>Matokeo ya CSEE (Kidato 4)</span>
            <ExternalLink size={12} className="shrink-0 text-slate-400 group-hover:text-indigo-600" />
          </a>
          <a
            href="https://necta.go.tz/results/view/psle"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl border border-slate-150 hover:border-indigo-200 transition-all text-xs font-bold text-slate-700 cursor-pointer"
          >
            <span>Matokeo ya PSLE (La 7)</span>
            <ExternalLink size={12} className="shrink-0 text-slate-400 group-hover:text-indigo-600" />
          </a>
          <a
            href="https://necta.go.tz/results/view/sfna"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl border border-slate-150 hover:border-indigo-200 transition-all text-xs font-bold text-slate-700 cursor-pointer"
          >
            <span>Matokeo ya SFNA (La 4)</span>
            <ExternalLink size={12} className="shrink-0 text-slate-400 group-hover:text-indigo-600" />
          </a>
          <a
            href="https://necta.go.tz/news/read/71"
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 sm:col-span-3 lg:col-span-2 flex items-center justify-between p-3 bg-indigo-50/50 hover:bg-indigo-100/70 text-indigo-700 rounded-xl border border-indigo-150 hover:border-indigo-250 transition-all text-xs font-extrabold cursor-pointer"
          >
            <span>Soma Tangazo la NECTA la Ufaulu (News #71)</span>
            <ExternalLink size={12} className="shrink-0 text-indigo-600" />
          </a>
        </div>
      </div>

      {/* ── NEW: Mchambuzi wa Matokeo Rasmi ya NECTA & Kikokotoo cha GPA ── */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/10 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-500/15 text-indigo-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-indigo-400/30">
              <Award size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="font-sans font-black text-white text-base uppercase tracking-tight">Kikokotoo cha Matokeo ya NECTA (GPA Analyzer)</h2>
              <p className="text-xs text-slate-300">Changanua ufaulu wa shule au darasa kwa kuweka idadi ya madaraja, na ukokotoe GPA na kiwango cha ufaulu papo hapo!</p>
            </div>
          </div>
          <span className="self-start sm:self-auto bg-cyan-500/15 text-cyan-300 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-cyan-500/20 flex items-center gap-1">
            <Sparkles size={12} className="text-amber-400 animate-pulse" />
            Kichanganuzi cha Ndani Active
          </span>
        </div>

        {/* Level selection */}
        <div className="space-y-3">
          <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider block">Ngazi ya Mtihani wa Kitaifa:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'std7', label: 'Darasa la 7 (PSLE)', desc: 'Madaraja: A, B, C, D, F' },
              { id: 'f4', label: 'Kidato cha 4 (CSEE)', desc: 'Divisions: I, II, III, IV, 0' },
              { id: 'f6', label: 'Kidato cha 6 (ACSEE)', desc: 'Divisions: I, II, III, IV, 0' },
            ].map((lvl) => {
              const isActive = calcLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setCalcLevel(lvl.id as any)}
                  className={`flex-1 min-w-[150px] text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow shadow-cyan-500/10' 
                      : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800/30'
                  }`}
                >
                  <div className="text-xs font-black uppercase">{lvl.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{lvl.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs & Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider block">Weka Idadi ya Wanafunzi kwa kila Daraja:</span>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-3">
                <label className="text-[10px] font-bold text-slate-300 uppercase">Jumla ya Watahiniwa</label>
                <input
                  type="number"
                  value={totalStudents}
                  onChange={(e) => setTotalStudents(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none transition-all"
                  placeholder="Mf. 120"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-400 uppercase">
                  {calcLevel === 'std7' ? 'Daraja A (Points 1)' : 'Division I'}
                </label>
                <input
                  type="number"
                  value={div1Count}
                  onChange={(e) => setDiv1Count(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-teal-400 uppercase">
                  {calcLevel === 'std7' ? 'Daraja B (Points 2)' : 'Division II'}
                </label>
                <input
                  type="number"
                  value={div2Count}
                  onChange={(e) => setDiv2Count(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-cyan-400 uppercase">
                  {calcLevel === 'std7' ? 'Daraja C (Points 3)' : 'Division III'}
                </label>
                <input
                  type="number"
                  value={div3Count}
                  onChange={(e) => setDiv3Count(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-amber-400 uppercase">
                  {calcLevel === 'std7' ? 'Daraja D (Points 4)' : 'Division IV'}
                </label>
                <input
                  type="number"
                  value={div4Count}
                  onChange={(e) => setDiv4Count(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-red-400 uppercase">
                  {calcLevel === 'std7' ? 'Daraja F (Points 5)' : 'Division 0'}
                </label>
                <input
                  type="number"
                  value={div0Count}
                  onChange={(e) => setDiv0Count(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Realtime calculated results */}
          {(() => {
            const tot = parseInt(totalStudents) || 0;
            const d1 = parseInt(div1Count) || 0;
            const d2 = parseInt(div2Count) || 0;
            const d3 = parseInt(div3Count) || 0;
            const d4 = parseInt(div4Count) || 0;
            const d0 = parseInt(div0Count) || 0;
            const sumInput = d1 + d2 + d3 + d4 + d0;
            
            // Validate inputs
            const hasError = sumInput > tot;
            const passCount = d1 + d2 + d3 + d4;
            const passRate = tot > 0 ? (passCount / tot * 100).toFixed(1) : '0.0';
            
            // GPA is sum of weighted values divided by total students
            // Best GPA in TZ is 1.0, worst is 5.0
            const rawGpa = tot > 0 ? ((d1 * 1 + d2 * 2 + d3 * 3 + d4 * 4 + d0 * 5) / tot) : 5.00;
            const gpa = rawGpa.toFixed(2);

            let gpaBadge = "Critical";
            let gpaColor = "text-red-400 bg-red-500/10 border-red-500/20";
            let advice = "Ufaulu huu unahitaji maboresho makubwa mara moja. Shule na wanafunzi wanashauriwa kufanya mazoezi thabiti ya past papers yaliyomo kwenye mfumo wetu.";

            if (rawGpa <= 2.2) {
              gpaBadge = "Excellent (Division I High)";
              gpaColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
              advice = "Hongera sana! Kiwango hiki cha GPA kinaonyesha shule yako ipo kwenye kiwango bora cha ushindani wa kitaifa. Endeleeni kutumia Lupanulla kuboresha zaidi.";
            } else if (rawGpa <= 3.2) {
              gpaBadge = "Very Good";
              gpaColor = "text-teal-400 bg-teal-500/10 border-teal-500/20";
              advice = "Kazi nzuri! Shule ipo kwenye kiwango kizuri cha ufaulu. Kufanya mitihani zaidi ya majaribio kwenye maktaba yetu kutawasaidia kupanda hadi daraja la Excellent.";
            } else if (rawGpa <= 4.2) {
              gpaBadge = "Average / Credit";
              gpaColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
              advice = "Kiwango cha kuridhisha lakini mnaweza kufanya vizuri zaidi. Walimu wanaweza kutumia tracker yetu kufuatilia kila somo linalohitaji uangalizi maalum.";
            }

            return (
              <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between gap-5 relative overflow-hidden">
                <div className="space-y-4">
                  <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider block">Uchambuzi wa Kiwango cha Ufaulu:</span>
                  
                  {hasError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] p-3 rounded-xl flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>Kosa: Idadi ya madaraja imezidi Jumla ya Wanafunzi!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center">
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Kiwango cha Ufaulu</span>
                      <span className="text-2xl font-black text-white font-mono mt-0.5 block">{passRate}%</span>
                      <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Wanafunzi {passCount} / {tot}</span>
                    </div>

                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center">
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">GPA ya Shule</span>
                      <span className="text-2xl font-black text-cyan-400 font-mono mt-0.5 block">{gpa}</span>
                      <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Mzani (Points 1 - 5)</span>
                    </div>
                  </div>

                  <div className={`border p-3 rounded-xl flex flex-col gap-1.5 ${gpaColor}`}>
                    <div className="text-[10px] font-black uppercase tracking-wider">Hali ya Shule (Status):</div>
                    <div className="text-xs font-black uppercase tracking-tight flex items-center gap-1">
                      <Award size={13} />
                      {gpaBadge}
                    </div>
                    <p className="text-[11px] text-slate-300 font-semibold leading-relaxed mt-1">
                      {advice}
                    </p>
                  </div>
                </div>

                <a
                  href="https://matokeo.necta.go.tz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink size={14} />
                  Nenda Portal ya Taifa (NECTA Portal)
                </a>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Rebranded, premium National NECTA Archives */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Book size={18} className="text-indigo-600 animate-pulse" />
            <h4 className="font-sans font-black text-xs sm:text-sm uppercase tracking-tight text-slate-900">
              Kumbukumbu ya Kitaifa ya Matokeo (National NECTA Archives)
            </h4>
          </div>
          <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full w-fit border border-indigo-100 uppercase tracking-wider">
            Nyaraka za Umma (2008 - 2024)
          </span>
        </div>

        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
          Chagua ngazi hapa chini ili kupata kumbukumbu za matokeo rasmi ya mitihani ya kitaifa yaliyohifadhiwa kwa ajili ya uchambuzi wa ufaulu wa shule na wanafunzi miaka ya nyuma. Faili hizi zinaonyesha rekodi safi zilizothibitishwa.
        </p>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            onClick={() => setArchiveTab('psle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
              archiveTab === 'psle'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Darasa la 7 (PSLE)
          </button>
          <button
            onClick={() => setArchiveTab('sfna')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
              archiveTab === 'sfna'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Darasa la 4 (SFNA)
          </button>
          <button
            onClick={() => setArchiveTab('ftna')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
              archiveTab === 'ftna'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Kidato cha 2 (FTNA)
          </button>
          <button
            onClick={() => setArchiveTab('csee')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
              archiveTab === 'csee'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Kidato cha 4 (CSEE)
          </button>
          <button
            onClick={() => setArchiveTab('acsee')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
              archiveTab === 'acsee'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Kidato cha 6 (ACSEE)
          </button>
          <button
            onClick={() => setArchiveTab('dsee')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
              archiveTab === 'dsee'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Diploma (DSEE)
          </button>
        </div>

        {/* Dynamic Year Buttons Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
          {(archiveTab === 'acsee'
            ? [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008]
            : archiveTab === 'csee'
            ? [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010]
            : archiveTab === 'dsee'
            ? [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014]
            : [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015]
          ).map((year) => {
            let href = 'https://matokeo.necta.go.tz';
            if (archiveTab === 'sfna') href = `https://matokeo.necta.go.tz/sfna${year}/index.htm`;
            if (archiveTab === 'psle') href = `https://matokeo.necta.go.tz/psle${year}/index.htm`;
            if (archiveTab === 'ftna') href = `https://matokeo.necta.go.tz/ftna${year}/index.htm`;
            if (archiveTab === 'csee') href = `https://matokeo.necta.go.tz/csee${year}/index.htm`;
            if (archiveTab === 'acsee') href = `https://matokeo.necta.go.tz/acsee${year}/index.htm`;
            if (archiveTab === 'dsee') href = `https://matokeo.necta.go.tz/dsee${year}/index.htm`;

            return (
              <a
                key={year}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  alert(`📥 Unafungua matokeo ya mwaka ${year} kutoka Lupanulla Academic Document Server.`);
                }}
                className="py-2.5 px-1 text-center text-xs font-bold bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
              >
                {year}
              </a>
            );
          })}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-cyan-50 text-cyan-600">
            <TrendingUp size={20} />
          </div>
          <div className="flex-1">
            <span className="block text-[10px] font-extrabold uppercase text-slate-400">Kiwango cha Mazoezi</span>
            <span className="text-xl font-black text-slate-900">{completionPercentage}%</span>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div 
                className="bg-cyan-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold uppercase text-slate-400">Karatasi Zilizokamilika</span>
            <span className="text-xl font-black text-slate-900">{completedCount}</span>
            <span className="text-[10px] block text-slate-400 mt-0.5">Kati ya {totalPossiblePapers} zilizopo</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock size={20} />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold uppercase text-slate-400">Zinaendelea kufanyiwa kazi</span>
            <span className="text-xl font-black text-slate-900">{inProgressCount}</span>
            <span className="text-[10px] block text-slate-400 mt-0.5">Zipo kwenye hatua ya mazoezi</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-slate-100 text-slate-600">
            <HelpCircle size={20} />
          </div>
          <div>
            <span className="block text-[10px] font-extrabold uppercase text-slate-400">Karasi Zilizobaki</span>
            <span className="text-xl font-black text-slate-900">{totalPossiblePapers - (completedCount + inProgressCount)}</span>
            <span className="text-[10px] block text-slate-400 mt-0.5">Anza sasa ili kukamilisha mtaala</span>
          </div>
        </div>
      </div>

      {/* Control Actions & Filtering */}
      <div className="bg-slate-50 border border-slate-200/60 p-4.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* NECTA Levels selection */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {NECTA_LEVELS.map(lvl => (
            <button
              key={lvl.id}
              onClick={() => {
                setSelectedLevel(lvl.id);
                setSearchSubjectQuery('');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all duration-150 ${
                selectedLevel === lvl.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {lvl.name}
            </button>
          ))}
        </div>

        {/* Search subjects bar */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search size={14} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Tafuta somo (e.g. Physics)..."
            value={searchSubjectQuery}
            onChange={(e) => setSearchSubjectQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-all text-slate-800"
          />
          {searchSubjectQuery && (
            <button 
              onClick={() => setSearchSubjectQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* MAIN TRACKING MATRIX (Grid of Subjects containing Year Rows) */}
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Inapakia taarifa za maendeleo...</p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <div className="text-slate-300 mx-auto flex justify-center mb-3">
            <BookOpen size={48} />
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Hakuna masomo yaliyopatikana</p>
          <p className="text-[11px] text-slate-400 mt-1">Jaribu kutafuta somo lingine au ubadilishe kiwango cha elimu hapo juu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSubjects.map(subj => {
            return (
              <div 
                key={subj.id} 
                className={`bg-white border border-slate-200/90 rounded-2xl shadow-sm border-l-4 ${subj.color} overflow-hidden`}
              >
                {/* Subject Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-2.5">
                    <Book size={16} className="text-slate-500" />
                    <h3 className="font-display font-extrabold text-sm text-slate-900 uppercase">
                      {subj.name}
                    </h3>
                  </div>
                  
                  {/* Small badge count of completed years */}
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {levelProgressList.filter(p => p.subject === subj.id && p.status === 'completed').length} / {YEARS.length} Miaka
                  </span>
                </div>

                {/* Years Grid */}
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {YEARS.map(year => {
                    const progress = getProgressState(selectedLevel, subj.id, year);
                    const status = progress?.status || 'not_started';
                    const hasNotes = !!progress?.notes;
                    const isSavingThis = savingId === `${userProfile?.uid}_${selectedLevel}_${subj.id}_${year}`;

                    // Style based on status
                    let btnStyle = 'border-slate-200 hover:border-slate-300 text-slate-500 bg-white';
                    let label = 'Sijaanza';
                    let dotColor = 'bg-slate-300';

                    if (status === 'in_progress') {
                      btnStyle = 'border-amber-200 bg-amber-50/10 hover:bg-amber-50/20 text-amber-700';
                      label = 'Inaendelea';
                      dotColor = 'bg-amber-400';
                    } else if (status === 'completed') {
                      btnStyle = 'border-emerald-200 bg-emerald-50/10 hover:bg-emerald-50/20 text-emerald-700 font-extrabold';
                      label = 'Nimemaliza';
                      dotColor = 'bg-emerald-500';
                    }

                    return (
                      <div 
                        key={year} 
                        className={`group relative border rounded-xl p-2.5 flex flex-col justify-between transition-all duration-150 text-left ${btnStyle} min-h-[92px]`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 tracking-tight">{year}</span>
                          
                          {/* Indicator Dot & Notes icon */}
                          <div className="flex items-center gap-1">
                            {hasNotes && (
                              <span 
                                title="Kuna notisi zilizohifadhiwa" 
                                className="text-cyan-600 text-[10px]"
                              >
                                📝
                              </span>
                            )}
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                          </div>
                        </div>

                        {/* Middle click to edit detailed progress (opens modal) */}
                        <div className="mt-2 flex items-center justify-between">
                          <button
                            disabled={isSavingThis}
                            onClick={() => handleQuickStatusChange(selectedLevel, subj.id, year, status)}
                            className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Bofya kubadilisha hali haraka"
                          >
                            {isSavingThis ? (
                              <span className="animate-spin text-[8px]">&bull;</span>
                            ) : (
                              <span>{label}</span>
                            )}
                          </button>

                          <button 
                            onClick={() => openEditModal(selectedLevel, subj, year)}
                            className="p-1 hover:bg-black/5 rounded text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Hariri dokezo na hadhi"
                          >
                            <Edit3 size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED REVISION NOTES & MODAL EDIT */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600">Hariri Maendeleo</span>
                <h3 className="font-display font-black text-sm text-slate-900 uppercase">
                  {editingItem.subject.name} &bull; {editingItem.year}
                </h3>
              </div>
              <button 
                onClick={() => setEditingItem(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSaveModalChanges} className="p-5 space-y-4">
              
              {/* Status Radio Toggles */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Hali ya Maandalizi</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'not_started', label: 'Sijaanza', color: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50' },
                    { id: 'in_progress', label: 'Inaendelea', color: 'border-amber-200 bg-amber-50/20 text-amber-800 hover:bg-amber-50/40' },
                    { id: 'completed', label: 'Nimemaliza', color: 'border-emerald-200 bg-emerald-50/20 text-emerald-800 hover:bg-emerald-50/40' }
                  ].map(opt => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setStatusInput(opt.id as NectaProgressStatus)}
                      className={`px-2.5 py-2 border rounded-xl text-xs font-bold transition-all text-center ${
                        statusInput === opt.id 
                          ? 'ring-2 ring-cyan-500 border-transparent font-black shadow-sm' 
                          : opt.color
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Revision Personal Notes */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Dokezo & Masahihisho Yangu</label>
                <textarea
                  placeholder="Andika matokeo ya mazoezi au maoni yako hapa... (e.g. Nimepata 78%, nimekosea swali la 4 la Optics, nitahitaji kupitia tena notisi zake)"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold placeholder:text-slate-400 text-slate-800 focus:outline-none focus:border-cyan-500 transition-all resize-none"
                />
              </div>

              {/* Saved feedback */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all text-slate-500"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  disabled={savingId !== null}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {savingId !== null ? (
                    <span className="animate-spin text-white">&bull;</span>
                  ) : (
                    <>
                      <Save size={13} /> Hifadhi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Helpful Revision Guideline Box */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
        <h3 className="font-display font-extrabold text-sm text-slate-900 uppercase flex items-center gap-1.5">
          <BookOpen size={16} className="text-cyan-600" /> Mwongozo wa Mapitio ya NECTA
        </h3>
        <ul className="text-xs text-slate-600 space-y-2 leading-relaxed list-disc list-inside">
          <li><strong>Mpango wa Masomo:</strong> Tunapendekeza kuanza na mitihani ya miaka ya karibuni (e.g., 2023, 2022) kabla ya kwenda miaka ya nyuma.</li>
          <li><strong>Muda:</strong> Unapofanya mtihani, jaribu kuweka kipima muda (Exam Timer) ili kuiga mazingira halisi ya chumba cha mtihani.</li>
          <li><strong>Uchambuzi wa Makosa:</strong> Kila mara unapokamilisha (Nimemaliza) karatasi, andika maswali uliyokosea kwenye "Dokezo" hapo juu na upitie mada hizo upya kwenye Maktaba au Masomo.</li>
        </ul>
      </div>

    </div>
  );
}
