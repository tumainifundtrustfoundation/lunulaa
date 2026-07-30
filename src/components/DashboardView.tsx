import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Calendar, 
  BookOpen, 
  FileText, 
  Users, 
  User, 
  Award, 
  Sparkles, 
  Search, 
  ChevronRight, 
  Volume2, 
  Zap, 
  Star,
  Flame,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Compass,
  Globe,
  TrendingUp,
  Clock,
  Bookmark,
  Trash2,
  Info,
  X
} from 'lucide-react';
import { fetchDocuments, fetchUserBookmarks, toggleBookmark } from '../firebase';
import { DocumentMetadata, UserBookmark } from '../types';
import { getUserLevelInfo, XP_LEVELS } from '../utils/xpLevels';
import FocusTimer from './FocusTimer';
import CalendarBanner from './CalendarBanner';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

interface DashboardViewProps {
  onNavigate: (view: string, id?: string) => void;
  userProfile: any;
  language: 'sw' | 'en';
  onAwardPoints: (points: number, minutes: number) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 text-white p-3 py-2.5 rounded-2xl shadow-xl text-xs font-sans space-y-1" id="chart-custom-tooltip">
        <p className="font-bold border-b border-slate-800 pb-1 text-slate-300">{label}</p>
        {payload.map((entry: any, index: number) => {
          const isMinutes = entry.dataKey === 'minutes';
          const name = isMinutes ? 'Muda wa Soma' : 'Pointi (XP)';
          const value = isMinutes ? `${entry.value} dzk` : `${entry.value} XP`;
          const color = isMinutes ? '#06b6d4' : '#f59e0b';
          return (
            <div key={index} className="flex items-center gap-3 justify-between">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
                {name}:
              </span>
              <span className="font-bold" style={{ color: color }}>{value}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function DashboardView({ onNavigate, userProfile, language = 'sw', onAwardPoints }: DashboardViewProps) {
  const [streakCount, setStreakCount] = useState(5);
  const [resultsNumber, setResultsNumber] = useState('');
  const [checkingResults, setCheckingResults] = useState(false);
  const [resultsOutput, setResultsOutput] = useState<string | null>(null);
  const [recentDocs, setRecentDocs] = useState<DocumentMetadata[]>([]);
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [activeLeaderboard, setActiveLeaderboard] = useState<'darasa' | 'mkoa'>('darasa');
  const [showLevelsModal, setShowLevelsModal] = useState(false);

  const userXp = userProfile?.xp !== undefined ? userProfile.xp : 2450;
  const levelInfo = getUserLevelInfo(userXp);

  const [chartData, setChartData] = useState<any[]>([]);
  const [chartFilter, setChartFilter] = useState<'all' | 'minutes' | 'xp'>('all');
  
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    });

    loadRecentDocs();
    loadBookmarks();
    
    const generate30DaysData = () => {
      const data = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const day = d.getDate();
        const monthNamesSw = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nob', 'Des'];
        const label = `${day} ${monthNamesSw[d.getMonth()]}`;
        
        const dayOfWeek = d.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        let studyMinutes = isWeekend 
          ? Math.floor(15 + Math.random() * 35) 
          : Math.floor(40 + Math.random() * 80); 
          
        if (i === 4 || i === 13 || i === 22) {
          studyMinutes = 0;
        }

        const xpEarned = studyMinutes > 0 ? (studyMinutes * 10 + Math.floor(Math.random() * 40)) : 0;
        
        data.push({
          date: label,
          minutes: studyMinutes,
          xp: xpEarned,
        });
      }
      return data;
    };
    
    setChartData(generate30DaysData());

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  const loadBookmarks = async () => {
    if (!userProfile?.uid) return;
    setLoadingBookmarks(true);
    try {
      const data = await fetchUserBookmarks(userProfile.uid);
      setBookmarks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBookmarks(false);
    }
  };

  const handleRemoveBookmark = async (e: React.MouseEvent, bookmark: UserBookmark) => {
    e.stopPropagation();
    if (!userProfile?.uid) return;
    const removed = await toggleBookmark(userProfile.uid, {
      id: bookmark.resourceId,
      type: bookmark.resourceType,
      title: bookmark.resourceTitle
    });
    if (!removed) {
      setBookmarks(prev => prev.filter(b => b.id !== bookmark.id));
    }
  };

  const loadRecentDocs = async () => {
    try {
      const docs = await fetchDocuments({ status: 'approved' });
      setRecentDocs(docs.slice(0, 4));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResultsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = resultsNumber.trim().toUpperCase();
    if (!code) return;
    
    setCheckingResults(true);
    setResultsOutput(null);
    try {
      const response = await fetch('/api/check-necta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candidateCode: code }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.subjects && data.subjects.length > 0) {
          const formattedSubjects = data.subjects.map((s: any) => `- ${s.subject.toUpperCase()}: ${s.grade}`).join('\n');
          setResultsOutput(`Matokeo ya Namba ${data.candidateCode} (${data.examType} ${data.year}):
Mwanafunzi: ${data.studentName}
Kituo/Shule: ${data.schoolName}

Masomo na Daraja (Grades):
${formattedSubjects}

Wastani/Ufaulu: ${data.division} (GPA: ${data.gpa || '0.0'})
Chanzo: ${data.sourceUrl || 'NECTA Database'}
Hali ya Uhakiki: Imethibitishwa mtandaoni kwa ufanisi! 🌐`);
        } else {
          setResultsOutput(`Samahani! Matokeo ya namba ${code} hayakupatikana mtandaoni au hifadhidata ya NECTA. Hakikisha format ni sahihi na umejumuisha mwaka (Mfano: S0101/0001/2023).`);
        }
      } else {
        setResultsOutput(`Namba ${code} haikutambuliwa au imeshindwa kuunganishwa na mfumo wa NECTA kwa sasa.`);
      }
    } catch (err) {
      console.error('Error fetching result on dashboard:', err);
      setResultsOutput(`Hitilafu imetokea wakati wa kuunganisha na mfumo wa NECTA. Tafadhali jaribu tena.`);
    } finally {
      setCheckingResults(false);
    }
  };

  const currentStreakAngle = (streakCount / 7) * 360;

  const totalMinutes = chartData.reduce((sum, item) => sum + item.minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const totalXp = chartData.reduce((sum, item) => sum + item.xp, 0);
  const activeDaysCount = chartData.filter(d => d.minutes > 0).length;
  const averageMinutes = activeDaysCount > 0 ? Math.round(totalMinutes / activeDaysCount) : 0;

  return (
    <div id="dashboard-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50">
      
      {/* ── PWA Install CTA Banner ── */}
      {showInstallBtn && (
        <section className="bg-cyan-600 rounded-3xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-cyan-600/20 border border-cyan-500/30 animate-bounce-subtle">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sparkles size={24} className="text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Weka Lupanulla kwenye Home Screen</h3>
              <p className="text-white/80 text-[10px] sm:text-xs font-medium">Pata uzoefu wa app, notisi za haraka, na soma offline ukiwa na icon yako mwenyewe!</p>
            </div>
          </div>
          <button 
            onClick={handleInstallClick}
            className="bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
          >
            Weka App Sasa
          </button>
        </section>
      )}

      {/* ── Welcome Banner with Floating Ambient Particles ── */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Floating Stars Particle Effect Simulation */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute w-2 h-2 bg-white rounded-full top-1/4 left-1/3 animate-ping"></div>
          <div className="absolute w-1 h-1 bg-white rounded-full top-3/4 left-1/4 animate-pulse"></div>
          <div className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full top-1/2 left-2/3 animate-pulse"></div>
          <div className="absolute w-2 h-2 bg-purple-400 rounded-full top-1/3 left-4/5 animate-ping"></div>
        </div>

        <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider border border-cyan-400/30">
              <Sparkles size={12} className="text-amber-400" />
              Dashibodi ya Mwanafunzi
            </div>
            <button
              onClick={() => setShowLevelsModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-all text-xs font-bold border border-amber-400/30 cursor-pointer shadow-sm"
            >
              <Award size={13} className="text-amber-400" />
              <span>Level {levelInfo.level}: {levelInfo.title}</span>
            </button>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight leading-tight">
            Habari gani, <span className="text-cyan-400">{userProfile?.name || 'Mwanafunzi'}</span>!
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Leo ni siku nzuri ya kujiendeleza kimasomo. Una streak ya siku {streakCount} mfululizo &mdash; endelea hivi hivi kufikia malengo yako!
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
            <button 
              onClick={() => onNavigate('masomo')}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm px-6 py-3 rounded-full transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-1.5"
            >
              <Compass size={16} /> Vinjari Notisi
            </button>
            <button 
              onClick={() => onNavigate('fisimaji')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm px-6 py-3 rounded-full transition-all border border-slate-700/60"
            >
              Uliza Lupanulla AI
            </button>
          </div>
        </div>

        {/* Dynamic Circular Streak Widget */}
        <div className="relative z-10 flex-shrink-0 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center w-56">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="8" fill="transparent" />
              <circle 
                cx="56" 
                cy="56" 
                r="48" 
                stroke="#06b6d4" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray="301.6"
                strokeDashoffset={301.6 - (301.6 * (streakCount / 7))}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <Flame size={32} className="text-amber-500 animate-pulse" />
              <span className="text-2xl font-extrabold font-display leading-none">{streakCount}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">SIKU STREAK</span>
            </div>
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-white">Siku ya {streakCount} ya Elimu</h4>
            <p className="text-[10px] text-slate-400 font-semibold">Soma mada 1 zaidi leo kudumisha streak yako!</p>
          </div>
        </div>
      </section>

      {/* ── Interactive Date & Calendar Planner Banner ── */}
      <CalendarBanner userProfile={userProfile} onNavigate={onNavigate} />

      {/* ── Bookmarks Section (Hifadhi Zangu) ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-extrabold text-xl text-slate-900 uppercase flex items-center gap-2">
            <Bookmark size={20} className="text-cyan-600" />
            Hifadhi Zangu
          </h2>
          <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase">
            {bookmarks.length} Zimehifadhiwa
          </span>
        </div>
        
        {loadingBookmarks ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-100 animate-pulse h-24 rounded-2xl border border-slate-200"></div>
            ))}
          </div>
        ) : bookmarks.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {bookmarks.map(bookmark => (
              <div 
                key={bookmark.id}
                onClick={() => {
                  let viewName: string = bookmark.resourceType;
                  if (viewName === 'document') viewName = 'library';
                  if (viewName === 'news') viewName = 'matangazo';
                  onNavigate(viewName, bookmark.resourceId);
                }}
                className="bg-white border border-slate-200 p-4 rounded-2xl hover:border-cyan-400 hover:shadow-sm cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => handleRemoveBookmark(e, bookmark)}
                    className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase inline-block ${
                    bookmark.resourceType === 'document' ? 'bg-cyan-100 text-cyan-800' :
                    bookmark.resourceType === 'exam' ? 'bg-purple-100 text-purple-800' :
                    bookmark.resourceType === 'news' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {bookmark.resourceType === 'document' ? 'Notisi' : 
                     bookmark.resourceType === 'exam' ? 'Mtihani' : 
                     bookmark.resourceType === 'news' ? 'Habari' : 'Nyingine'}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 pr-6">{bookmark.resourceTitle}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mt-1">
                    <Clock size={10} />
                    {new Date(bookmark.addedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
              <Bookmark size={24} />
            </div>
            <p className="text-slate-400 text-sm font-medium">Hujachagua notisi au mitihani yoyote ya kuhifadhi bado.</p>
            <button 
              onClick={() => onNavigate('masomo')}
              className="text-cyan-600 text-xs font-bold hover:underline mt-1"
            >
              Vinjari masomo sasa &rarr;
            </button>
          </div>
        )}
      </section>

      {/* ── Level & XP Title Progress Card ── */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-950 to-cyan-950 text-white rounded-3xl p-6 shadow-md border border-cyan-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 flex-shrink-0">
              <Award size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-md border border-amber-400/30 uppercase tracking-wider">
                  Kiwango cha Masomo &bull; Level {levelInfo.level}
                </span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-md border border-cyan-400/30">
                  {userXp.toLocaleString()} XP Total
                </span>
              </div>
              <h2 className="text-xl font-display font-extrabold text-white mt-1">
                Kiwango Chako: <span className="text-amber-400">{levelInfo.title}</span>
              </h2>
            </div>
          </div>
          <button
            onClick={() => setShowLevelsModal(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            <Info size={14} /> Angalia Anwani na Viwango Zote
          </button>
        </div>

        {/* Progress bar to next level */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">
              Hatua za kuelekea Level {levelInfo.level < XP_LEVELS.length ? levelInfo.level + 1 : levelInfo.level} ({levelInfo.level < XP_LEVELS.length ? XP_LEVELS[levelInfo.level].title : 'Kiwango cha Juu Barabara'})
            </span>
            <span className="font-bold text-amber-400">
              {levelInfo.progressPercent}% ({levelInfo.currentLevelXp} / {levelInfo.nextLevelXp - levelInfo.minXp} XP)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div 
              className="bg-gradient-to-r from-amber-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-700" 
              style={{ width: `${levelInfo.progressPercent}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            {levelInfo.level < XP_LEVELS.length 
              ? `Unahitaji pointi ${(levelInfo.nextLevelXp - userXp).toLocaleString()} XP zaidi kufungua anwani ya "${XP_LEVELS[levelInfo.level].title}" (Level ${levelInfo.level + 1})!`
              : `Hongera sana! Umefikia kiwango cha juu kabisa cha masomo Lupanulla Elimu Hub!`}
          </p>
        </div>
      </section>

      {/* ── Core Statistics Counters ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-cyan-100 text-cyan-700 rounded-xl flex items-center justify-center mb-3"><BookOpen size={20} /></div>
          <span className="text-2xl font-display font-extrabold text-slate-900 block leading-none">12</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Notisi Nilizosoma</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-3"><FileText size={20} /></div>
          <span className="text-2xl font-display font-extrabold text-slate-900 block leading-none">8</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Past Papers Zilizopakuliwa</span>
        </div>

        <div 
          onClick={() => setShowLevelsModal(true)}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-400 cursor-pointer transition-all group"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center"><Trophy size={20} /></div>
            <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
              Lvl {levelInfo.level}
            </span>
          </div>
          <span className="text-2xl font-display font-extrabold text-slate-900 block leading-none">{userXp.toLocaleString()} XP</span>
          <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mt-1.5 block line-clamp-1">{levelInfo.title}</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-green-100 text-green-700 rounded-xl flex items-center justify-center mb-3"><Award size={20} /></div>
          <span className="text-2xl font-display font-extrabold text-slate-900 block leading-none">#42</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Nafasi yangu Kitaifa</span>
        </div>
      </div>

      {/* ── Visual Study Progress Chart (Recharts) ── */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <h2 className="font-display font-extrabold text-lg text-slate-950 uppercase">Maendeleo ya Masomo (Siku 30)</h2>
            </div>
            <p className="text-slate-500 text-xs font-medium">
              Uchambuzi wa saa ulizojifunza na pointi (XP) ulizozipata ndani ya siku 30 zilizopita.
            </p>
          </div>
          
          {/* Chart Filter Toggles */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 self-stretch sm:self-auto">
            <button
              onClick={() => setChartFilter('all')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${chartFilter === 'all' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Zote mbili
            </button>
            <button
              onClick={() => setChartFilter('minutes')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${chartFilter === 'minutes' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Muda pekee
            </button>
            <button
              onClick={() => setChartFilter('xp')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${chartFilter === 'xp' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              XP pekee
            </button>
          </div>
        </div>

        {/* 30-Day Aggregated Statistics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/10 text-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Jumla ya Muda</span>
              <span className="text-lg font-display font-extrabold text-slate-950">{totalHours} Masaa</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-x border-slate-200/60 pt-3 sm:pt-0 sm:px-4">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Wastani wa Siku</span>
              <span className="text-lg font-display font-extrabold text-slate-950">{averageMinutes} Dakika</span>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 sm:pl-4">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Trophy size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">XP Jumla (Mwezi huu)</span>
              <span className="text-lg font-display font-extrabold text-slate-950">+{totalXp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        {/* Chart Canvas Wrap */}
        <div className="h-72 w-full select-none" id="recharts-container-parent">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                  dy={10}
                />
                
                {/* Secondary Y-Axis for XP / Primary Y-Axis for minutes */}
                {(chartFilter === 'all' || chartFilter === 'minutes') && (
                  <YAxis 
                    yAxisId="left"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#06b6d4', fontSize: 10, fontWeight: 600 }}
                    unit="m"
                  />
                )}
                {(chartFilter === 'all' || chartFilter === 'xp') && (
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#f59e0b', fontSize: 10, fontWeight: 600 }}
                    unit="xp"
                  />
                )}

                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                
                {/* Visual Data series */}
                {(chartFilter === 'all' || chartFilter === 'minutes') && (
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="minutes" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorMinutes)" 
                    name="minutes"
                    activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2 }}
                  />
                )}

                {(chartFilter === 'all' || chartFilter === 'xp') && (
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="xp" 
                    stroke="#f59e0b" 
                    strokeWidth={2.5}
                    dot={{ r: 1.5 }}
                    activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2 }}
                    name="xp"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
              Inapakia takwimu...
            </div>
          )}
        </div>
      </section>

      {/* ── Active Courses, Leaderboard, Kiswahili Fasihi and Results Checker ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Left Content Column: Active courses & Fasihi section */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Study Progress */}
          <div className="space-y-4">
            <h2 className="font-display font-extrabold text-xl text-slate-900 uppercase">Mfululizo wa Masomo Yangu</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div onClick={() => onNavigate('masomo')} className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-cyan-400 hover:shadow-sm cursor-pointer transition-all space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full uppercase">PHYSICS</span>
                    <h3 className="font-bold text-slate-950 text-sm mt-1">Linear Motion</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Form IV</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>Mada imekamilika kwa 60%</span>
                    <span>Sura 3/5</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>

              <div onClick={() => onNavigate('masomo')} className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-cyan-400 hover:shadow-sm cursor-pointer transition-all space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full uppercase">HISTORY</span>
                    <h3 className="font-bold text-slate-950 text-sm mt-1">Colonial Economy</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Form III</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>Mada imekamilika kwa 35%</span>
                    <span>Sura 2/6</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kiswahili Fasihi Featured Highlight Section (Audio styled player widget) */}
          <section className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-3xl border border-teal-100 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-600/10">
              <Volume2 size={32} className="animate-pulse" />
            </div>
            <div className="flex-grow space-y-2 text-center sm:text-left">
              <span className="bg-teal-200 text-teal-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">KISWAHILI FASIHI AUDIO</span>
              <h3 className="font-display font-extrabold text-slate-950 text-lg leading-tight uppercase">Mstahiki Meya (Uchambuzi wa Kitabu)</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xl">
                Sikiliza uchambuzi mkuu wa wahusika, mandhari, fani na maudhui ya mchezo wa kuigiza wa &quot;Mstahiki Meya&quot; na Mwandishi Timothy Arege. Inasaidia sana kujibu maswali ya fasihi andishi NECTA.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-teal-600/10 flex items-center gap-1.5">
                  <Volume2 size={14} /> Sikiliza Sauti (5:42)
                </button>
                <button onClick={() => onNavigate('masomo')} className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all border border-slate-200">
                  Soma Notisi za Kitabu
                </button>
              </div>
            </div>
          </section>

        </div>

        {/* Right Sidebar Column: Pomodoro Study Timer, Results checker, leaderboards */}
        <div className="space-y-8">
          
          {/* Pomodoro Study Timer */}
          <FocusTimer 
            language={language}
            userProfile={userProfile}
            onAwardPoints={onAwardPoints}
          />
          
          {/* NECTA Exam Progress Revision Journal Card */}
          <div className="bg-gradient-to-br from-cyan-900 via-slate-950 to-cyan-950 text-white rounded-3xl p-6 shadow-md border border-cyan-500/20 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
                <CheckCircle size={18} className="text-cyan-400 animate-pulse" />
              </div>
              <h3 className="font-display font-bold text-base uppercase">Maendeleo ya NECTA</h3>
            </div>
            <p className="text-slate-200 text-xs leading-relaxed font-medium">
              Weka rekodi ya Past Papers ulizosoma na kufanyia mazoezi. Fuatilia maendeleo ya kujiandaa na mitihani yako ya kitaifa na uandike masahihisho yako.
            </p>
            <button
              onClick={() => onNavigate('necta-progress')}
              className="w-full py-2.5 text-xs text-center font-bold bg-white text-slate-950 hover:bg-cyan-100 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              Fuatilia Maendeleo Yangu &rarr;
            </button>
          </div>

          {/* Hub ya Vyanzo vya Elimu Quick Callout Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-cyan-500/20 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
                <Globe size={18} />
              </div>
              <h3 className="font-display font-bold text-base uppercase">Vyanzo vya Elimu</h3>
            </div>
            <p className="text-cyan-100/80 text-xs leading-relaxed font-medium">
              Gundua na ufikie tovuti rasmi zilizothibitishwa za serikali, bodi za mitihani ya kitaifa (NECTA), vyuo vikuu, na maktaba huru nchini na kimataifa.
            </p>
            <button
              onClick={() => onNavigate('resources')}
              className="w-full py-2.5 text-xs text-center font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              Fungua Hub &rarr;
            </button>
          </div>

          {/* NECTA Results Checker Form */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><Compass size={18} /></div>
              <h3 className="font-display font-bold text-slate-950 text-base uppercase">Necta Results Checker</h3>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Kagua matokeo ya mitihani ya NECTA (FTNA, CSEE, ACSEE) haraka na kwa urahisi kwa kuandika namba yako ya mtihani ya shule.
            </p>
            
            <form onSubmit={handleResultsSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Andika Namba ya Mtihani</label>
                <input 
                  type="text" 
                  required
                  placeholder="Mfano: S0101/0001/2025" 
                  value={resultsNumber}
                  onChange={(e) => setResultsNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800 placeholder-slate-400 uppercase"
                />
              </div>
              <button 
                type="submit" 
                disabled={checkingResults}
                className="w-full py-2.5 text-xs text-center font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-all shadow-md shadow-cyan-500/15 flex items-center justify-center gap-1.5"
              >
                {checkingResults ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Inatafuta...</span>
                  </>
                ) : (
                  <>
                    <Compass size={14} /> Kagua Matokeo yangu
                  </>
                )}
              </button>
            </form>

            {resultsOutput && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white text-xs font-mono whitespace-pre-wrap leading-relaxed animate-fade-in shadow-inner max-h-60 overflow-y-auto">
                {resultsOutput}
              </div>
            )}
          </div>

          {/* National Leaderboard Rankings podium */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-5 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-36 h-36 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-base uppercase flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                Mashindano ya Wiki
              </h3>
              {/* Small tab selector */}
              <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/50">
                <button 
                  onClick={() => setActiveLeaderboard('darasa')}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${activeLeaderboard === 'darasa' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  Darasa
                </button>
                <button 
                  onClick={() => setActiveLeaderboard('mkoa')}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${activeLeaderboard === 'mkoa' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  Mkoa
                </button>
              </div>
            </div>

            {/* Podium Rank representation */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-cyan-500/40 transition-all">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center font-display font-extrabold text-amber-500 text-sm">#1</span>
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold text-xs">AM</div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Aneth Mwanga</h4>
                    <span className="text-[9px] text-slate-400 font-semibold">Mwanza Sec &bull; 1,840 XP</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full">Kinara</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-cyan-500/40 transition-all">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center font-display font-extrabold text-slate-400 text-sm">#2</span>
                  <div className="w-8 h-8 rounded-full bg-slate-400/10 border border-slate-400/30 text-slate-400 flex items-center justify-center font-bold text-xs">JM</div>
                  <div>
                    <h4 className="font-bold text-xs text-white">John Mapunda</h4>
                    <span className="text-[9px] text-slate-400 font-semibold">Feza Boys &bull; 1,620 XP</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold bg-slate-400/10 text-slate-400 border border-slate-400/20 px-2 py-0.5 rounded-full">Mshindi</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-cyan-500/40 transition-all">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center font-display font-extrabold text-amber-700 text-sm">#3</span>
                  <div className="w-8 h-8 rounded-full bg-amber-700/10 border border-amber-700/30 text-amber-700 flex items-center justify-center font-bold text-xs">SK</div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Salma Kiboko</h4>
                    <span className="text-[9px] text-slate-400 font-semibold">St. Marys &bull; 1,450 XP</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold bg-amber-700/10 text-amber-700 border border-amber-700/20 px-2 py-0.5 rounded-full">Mshindi</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── Levels & Titles System Overview Modal ── */}
      {showLevelsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Award size={22} />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-slate-950 text-base uppercase">Mfumo wa Viwango (XP Levels)</h3>
                  <p className="text-slate-500 text-[11px] font-medium">Anwani na vigezo vya XP vilivyofunguliwa</p>
                </div>
              </div>
              <button
                onClick={() => setShowLevelsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Pointi Zako za Sasa:</span>
                <span className="font-extrabold text-cyan-600 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                  {userXp.toLocaleString()} XP
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Anwani ya Sasa:</span>
                <span className="font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Level {levelInfo.level}: {levelInfo.title}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Viwango Vyote na Vigezo Vyake</h4>
              
              <div className="space-y-2.5">
                {XP_LEVELS.map((item) => {
                  const isUnlocked = userXp >= item.minXp;
                  const isCurrent = levelInfo.level === item.level;

                  return (
                    <div
                      key={item.level}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent 
                          ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20 shadow-sm' 
                          : isUnlocked 
                          ? 'bg-emerald-50/50 border-emerald-200' 
                          : 'bg-slate-50 border-slate-200 opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                          isCurrent 
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                            : isUnlocked 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          Lvl {item.level}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-bold text-xs text-slate-900">{item.title}</h5>
                            {isCurrent && (
                              <span className="text-[9px] bg-amber-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                                Sasa
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {item.minXp.toLocaleString()} - {item.nextLevelXp ? (item.nextLevelXp - 1).toLocaleString() + ' XP' : '+ XP'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        {isUnlocked ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                            ✓ Imefunguliwa
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            Imefungwa ({item.minXp - userXp} XP zaidi)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowLevelsModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
