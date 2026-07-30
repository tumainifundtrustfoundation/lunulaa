import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Heart, 
  Award,
  Compass,
  User,
  DollarSign,
  Share2,
  ExternalLink,
  Sparkles,
  CheckCircle,
  TrendingUp,
  ShieldCheck,
  Percent,
  HelpCircle,
  MessageCircle,
  Bookmark
} from 'lucide-react';
import { fetchAnnouncements, fetchWebsiteNews, toggleBookmark, fetchUserBookmarks } from '../firebase';
import { Announcement, WebsiteNews, UserBookmark } from '../types';

/**
 * MhuniWalking Component
 * Animates a character walking from left to right
 */
function MhuniWalking() {
  return (
    <div className="absolute bottom-0 left-0 w-full h-12 pointer-events-none overflow-hidden z-0">
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '120%' }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className="flex items-center gap-2 text-cyan-200/40"
      >
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, 0],
              y: [0, -5, 0]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <User size={32} strokeWidth={3} />
          </motion.div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Mhuni mtaalam</span>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Google AdSense Component
 * Simulates a Google AdSense Unit with safe script loading and interactive styling
 */
export function GoogleAdSenseUnit({ slot, adFormat = 'auto', className = '' }: { slot: string, adFormat?: string, className?: string }) {
  const [adSize, setAdSize] = useState<'responsive' | 'square' | 'vertical'>('responsive');
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // 1. Safe loading of Google AdSense official script if not already present
    const existingScript = document.querySelector('script[src*="adsbygoogle"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-mock-lupanulla';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // 2. Mock activation trigger
    const timer = setTimeout(() => {
      setAdLoaded(true);
      try {
        // Real AdSense triggers:
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        // Silent catch for dev/sandboxed iframe environment
      }
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const getAdDimensionsClass = () => {
    switch (adSize) {
      case 'square': return 'h-64 max-w-sm';
      case 'vertical': return 'h-[450px] w-64';
      default: return 'h-32 w-full';
    }
  };

  return (
    <div className={`bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-4 flex flex-col justify-between overflow-hidden relative transition-all ${getAdDimensionsClass()} ${className}`}>
      {/* Ad Label */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          Sponsored Tangazo • Google AdSense
        </span>
        <div className="flex gap-1.5">
          <button 
            onClick={() => setAdSize('responsive')}
            className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${adSize === 'responsive' ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
          >
            Responsive
          </button>
          <button 
            onClick={() => setAdSize('square')}
            className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${adSize === 'square' ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
          >
            Kipepeo
          </button>
          <button 
            onClick={() => setAdSize('vertical')}
            className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${adSize === 'vertical' ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
          >
            Mnara
          </button>
        </div>
      </div>

      {/* Ad Unit Core Area */}
      <div className="flex-grow flex items-center justify-center text-center relative z-10 px-2">
        {!adLoaded ? (
          <div className="space-y-1 animate-pulse">
            <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inatafuta tangazo sahihi...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Actual AdSense container representation for live validation */}
            <ins 
              className="adsbygoogle"
              style={{ display: 'block', textAlign: 'center' }}
              data-ad-client="ca-pub-mock-lupanulla"
              data-ad-slot={slot}
              data-ad-format={adFormat}
              data-full-width-responsive="true"
            />
            
            {/* High fidelity simulation layout for previewing */}
            <Sparkles className="w-5 h-5 text-amber-500 mx-auto animate-bounce" />
            <h5 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
              Vitabu Vipya vya NECTA Kidato cha 4 &amp; 6
            </h5>
            <p className="text-[10px] text-slate-500 leading-snug">
              Pakua sasa mapitio yote ya mitihani ya miaka 10 iliyopita kwa bei nafuu kupitia Airtel Money.
            </p>
            <span className="inline-block mt-1 text-[9px] font-bold text-cyan-600 uppercase tracking-widest hover:underline cursor-pointer">
              Soma Zaidi &rarr;
            </span>
          </div>
        )}
      </div>

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"></div>
    </div>
  );
}

export default function MatangazoView({ userProfile }: { userProfile: any }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [news, setNews] = useState<WebsiteNews[]>([]);
  const [activeTab, setActiveTab] = useState<'news' | 'announcements'>('news');
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [affAmbassadorName, setAffAmbassadorName] = useState('');
  const [ambassadorJoined, setAmbassadorJoined] = useState(false);
  const [stats, setStats] = useState({ clicks: 42, signups: 7, earnings: 35000 });
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const defaultAnnouncements: Announcement[] = [
    {
      id: 'ann-1',
      title: 'HESLB Yafungua Rasmi Maombi ya Mikopo ya Elimu ya Juu 2026/2027',
      desc: 'Bodi ya Mikopo ya Wanafunzi wa Elimu ya Juu (HESLB) imetangaza rasmi kufunguliwa kwa mfumo wa maombi ya mikopo kwa ajili ya wanafunzi wanaotarajia kujiunga na vyuo vikuu na vyuo vya kati nchini Tanzania. Tafadhali pakia cheti chako cha kuzaliwa tayari.',
      createdAt: Date.now()
    },
    {
      id: 'ann-2',
      title: 'Kalenda ya Mitihani ya NECTA kwa Shule za Sekondari na Msingi Yasasishwa',
      desc: 'Baraza la Mitihani la Tanzania (NECTA) limetoa ratiba rasmi ya kufanya mitihani ya kumaliza elimu ya sekondari Kidato cha Nne (CSEE) na Kidato cha Pili (FTNA) kwa mwaka 2026. Angalia kitengo cha mitihani kujiandaa.',
      createdAt: Date.now() - 3600000 * 12
    },
    {
      id: 'ann-3',
      title: 'Mafunzo Maalum ya AI (Lupanulla) Kupitia WhatsApp Sasa Yapo Wazi',
      desc: 'Lupanulla imezindua group maalum la WhatsApp ambapo wanafunzi wanapata usaidizi wa haraka kutoka kwa msaidizi wetu mahiri wa kijasusi kutatua maswali magumu ya Sayansi na Hesabu.',
      createdAt: Date.now() - 3600000 * 48
    }
  ];

  useEffect(() => {
    loadAnnouncements();
    loadBookmarks();
  }, [userProfile?.uid]);

  const loadBookmarks = async () => {
    if (!userProfile?.uid) {
      const stored = localStorage.getItem('lupa_bookmarks');
      if (stored) {
        setBookmarkedIds(JSON.parse(stored));
      }
      return;
    }
    
    try {
      const bookmarks = await fetchUserBookmarks(userProfile.uid);
      setBookmarkedIds(bookmarks.map(b => b.resourceId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleBookmark = async (id: string, title: string, type: string) => {
    if (!userProfile?.uid) {
      let updated: string[];
      if (bookmarkedIds.includes(id)) {
        updated = bookmarkedIds.filter(i => i !== id);
      } else {
        updated = [...bookmarkedIds, id];
      }
      setBookmarkedIds(updated);
      localStorage.setItem('lupa_bookmarks', JSON.stringify(updated));
      return;
    }

    try {
      const isBookmarked = await toggleBookmark(userProfile.uid, {
        id,
        title,
        type: 'news' // for news/announcements
      });
      
      if (isBookmarked) {
        setBookmarkedIds(prev => [...prev, id]);
      } else {
        setBookmarkedIds(prev => prev.filter(i => i !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const fetched = await fetchAnnouncements();
      setAnnouncements(fetched.length > 0 ? fetched : defaultAnnouncements);
      
      try {
        const fetchedNews = await fetchWebsiteNews();
        // Only show approved news to the public!
        const approvedNews = fetchedNews.filter(n => n.status === 'approved');
        approvedNews.sort((a, b) => b.createdAt - a.createdAt);
        setNews(approvedNews);
      } catch (err) {
        console.warn('Failed to load website news for public view:', err);
      }
    } catch (e) {
      console.error(e);
      setAnnouncements(defaultAnnouncements);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const affiliateUrl = `https://lupanulla.co.tz/ref?code=LUPANULLA_AMB_${affAmbassadorName || 'STUDENT'}`;
    navigator.clipboard.writeText(affiliateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleJoinAmbassador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!affAmbassadorName.trim()) return;
    setAmbassadorJoined(true);
    // Simulate initial stats setup
    setStats({
      clicks: Math.floor(Math.random() * 20),
      signups: 0,
      earnings: 0
    });
  };

  return (
    <div id="matangazo-view" className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-200 max-w-5xl mx-auto px-1">
      
      {/* 1. Breaking News Ticker Banner */}
      <div className="bg-cyan-950 text-cyan-300 border border-cyan-800/50 rounded-2xl py-2 px-4 overflow-hidden flex items-center shadow-sm text-xs gap-3">
        <span className="font-black uppercase tracking-wider bg-cyan-600 text-slate-950 px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0">
          <Megaphone size={12} className="animate-bounce" /> TANGAZO JIPYA:
        </span>
        <div className="relative flex-grow overflow-hidden h-5">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: [20, 0, 0, -20], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              times: [0, 0.1, 0.9, 1],
              ease: "easeInOut"
            }}
            className="font-semibold truncate uppercase tracking-tight text-[11px]"
          >
            HESLB Imefungua maombi ya Mikopo! Hakikisha unapakia vyeti vilivyothibitishwa sasa.
          </motion.div>
        </div>
      </div>

      {/* 2. Primary Announcements Banner */}
      <section className="bg-gradient-to-r from-cyan-700 via-cyan-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-cyan-500/10 text-center sm:text-left">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <MhuniWalking />
        <div className="relative z-10 space-y-3">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/25 text-cyan-200 text-xs font-black uppercase tracking-widest border border-cyan-500/20"
          >
            <Sparkles size={12} className="text-cyan-400" /> Lupanulla Foundations
          </motion.span>
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold uppercase tracking-tight leading-none">
            Kuhusu Sisi &amp; Matangazo
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-2xl font-medium">
            Soma matangazo ya hivi karibuni, jiunge na mfumo wetu wa uwakilishi (Affiliation) wa kupata mapato, na ufurahie masomo popote ulipo hata nje ya mtandao.
          </p>
        </div>
      </section>

      {/* 3. Main Grid layout: News list on left, Sidebar and Ads on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* News & Announcements Area (Animated Staggered Entry) */}
        <div className="lg:col-span-8 space-y-6">
          {/* TAB HEADERS */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 pb-px gap-2">
            <button
              onClick={() => setActiveTab('news')}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'news'
                  ? 'border-cyan-600 text-cyan-600 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <Globe size={14} className={activeTab === 'news' ? "animate-pulse text-cyan-500" : ""} />
              Habari Tanzania ({news.length})
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'announcements'
                  ? 'border-cyan-600 text-cyan-600 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <Megaphone size={14} />
              Matangazo ya Lupanulla ({announcements.length})
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-cyan-600">
              <div className="w-8 h-8 border-3 border-current border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-black uppercase tracking-widest animate-pulse">Inapakua Taarifa za Hivi Karibuni...</p>
            </div>
          ) : activeTab === 'news' ? (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="space-y-6"
            >
              {news.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-10 text-center text-xs text-slate-400 font-medium border-2 border-dashed border-slate-200 dark:border-slate-800">
                  Hakuna habari mpya zilizothibitishwa kwa sasa. Tafadhali wasiliana na admin au subiri kidogo.
                </div>
              ) : (
                news.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                    }}
                    whileHover={{ y: -3, scale: 1.005 }}
                    className="bg-white dark:bg-slate-950 border-2 border-slate-150 dark:border-slate-900 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group text-left"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-600 group-hover:bg-gradient-to-b group-hover:from-cyan-500 group-hover:to-indigo-600 transition-colors"></div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <Clock size={12} className="text-cyan-500" />
                        <span>{new Date(item.createdAt).toLocaleDateString('sw-TZ')}</span>
                        <span>•</span>
                        <span>Chanzo: <strong className="text-cyan-600 dark:text-cyan-400">{item.source}</strong></span>
                      </div>
                      <span className="self-start text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900/30">
                        Habari ya Elimu
                      </span>
                    </div>

                    <h4 className="font-display font-extrabold text-slate-950 dark:text-white text-base sm:text-lg leading-snug group-hover:text-cyan-600 transition-colors">
                      {item.title}
                    </h4>
                    
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mt-2 font-semibold">
                      {item.content}
                    </p>

                    {item.relevanceExplanation && (
                      <div className="mt-3.5 bg-amber-500/5 border border-amber-500/10 rounded-2xl p-3.5 text-[11px] sm:text-xs text-amber-900 dark:text-amber-300 font-semibold leading-relaxed">
                        <span className="font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">Kwanini hii ni muhimu kwa Lupanulla:</span>
                        {item.relevanceExplanation}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-4 border-t border-slate-100 dark:border-slate-900 pt-3">
                      {item.url ? (
                        <a 
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-cyan-600 hover:text-cyan-500 flex items-center gap-1"
                        >
                          Soma Chanzo Kamili <ExternalLink size={12} />
                        </a>
                      ) : (
                        <div />
                      )}
                      
                      <div className="flex gap-4 items-center">
                        <button 
                          onClick={() => handleToggleBookmark(item.id, item.title, 'news')}
                          className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                            bookmarkedIds.includes(item.id) ? 'text-amber-500' : 'text-slate-400 hover:text-cyan-500'
                          }`}
                        >
                          <Bookmark size={12} fill={bookmarkedIds.includes(item.id) ? "currentColor" : "none"} />
                          {bookmarkedIds.includes(item.id) ? 'Imehifadhiwa' : 'Hifadhi'}
                        </button>

                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${item.title}\n\nSoma zaidi kwenye tovuti ya Lupanulla Elimu Hub.`);
                            alert('Kichwa cha habari kimenakiliwa! Waambie marafiki zako.');
                          }}
                          className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-cyan-500 flex items-center gap-1 cursor-pointer"
                        >
                          <Share2 size={12} />
                          Sambaza
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15 }
                }
              }}
              className="space-y-6"
            >
              {announcements.map((ann, i) => (
                <motion.div
                  key={ann.id}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                  }}
                  whileHover={{ y: -3, scale: 1.005 }}
                  className="bg-white dark:bg-slate-950 border-2 border-slate-150 dark:border-slate-900 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group text-left"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-600 group-hover:bg-gradient-to-b group-hover:from-cyan-500 group-hover:to-indigo-600 transition-colors"></div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <Clock size={12} className="text-cyan-500" />
                      <span>{new Date(ann.createdAt).toLocaleDateString('sw-TZ')}</span>
                      <span>•</span>
                      <span>Notisi Muhimu</span>
                    </div>
                    <span className="self-start text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                      Imehakikishwa
                    </span>
                  </div>

                  <h4 className="font-display font-extrabold text-slate-950 dark:text-white text-base sm:text-lg leading-snug group-hover:text-cyan-600 transition-colors">
                    {ann.title}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mt-2 font-semibold">
                    {ann.desc}
                  </p>

                  <div className="flex justify-end mt-4 border-t border-slate-100 dark:border-slate-900 pt-3 gap-4">
                    <button 
                      onClick={() => handleToggleBookmark(ann.id, ann.title, 'news')}
                      className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                        bookmarkedIds.includes(ann.id) ? 'text-amber-500' : 'text-slate-400 hover:text-cyan-500'
                      }`}
                    >
                      <Bookmark size={12} fill={bookmarkedIds.includes(ann.id) ? "currentColor" : "none"} />
                      {bookmarkedIds.includes(ann.id) ? 'Imehifadhiwa' : 'Hifadhi'}
                    </button>

                    <button 
                      onClick={() => {
                        // Copy news text or share
                        navigator.clipboard.writeText(`${ann.title}\n\nSoma zaidi Lupanulla Elimu Hub.`);
                        alert('Kichwa cha habari kimenakiliwa! Waambie marafiki zako.');
                      }}
                      className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-cyan-500 flex items-center gap-1 cursor-pointer"
                    >
                      <Share2 size={12} />
                      Sambaza Habari
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* 4. Google AdSense Inline Banner - Styled perfectly to fit page rhythm */}
          <div className="pt-4">
            <GoogleAdSenseUnit slot="adsense-inline-middle" adFormat="horizontal" />
          </div>

          {/* 5. Lupanulla Affiliation Ambassador Hub */}
          <div className="bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950 border border-indigo-900/30 rounded-3xl p-6 text-white shadow-lg space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl"></div>
            
            <div className="space-y-2 relative z-10">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                <DollarSign size={10} /> Mpango wa Ubia (Affiliation)
              </span>
              <h3 className="text-lg sm:text-xl font-display font-extrabold uppercase">
                Kuwa Balozi wa Lupanulla &amp; Pata Mapato!
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed font-semibold">
                Sasa unaweza kualika wanafunzi wenzako kujiunga na Lupanulla Premium. Kila mwanafunzi anayejiunga kwa kutumia kiungo (link) chako, utapata <span className="text-cyan-400 font-bold">20% ya kamisheni</span> papo hapo kupitia M-Pesa au Tigopesa!
              </p>
            </div>

            {/* Simulated Live Dashboard for Affiliation tracking */}
            {!ambassadorJoined ? (
              <form onSubmit={handleJoinAmbassador} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h5 className="text-xs font-black text-slate-200 uppercase tracking-wider">
                  Anza Hapa - Jisajili kama Balozi
                </h5>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input 
                    type="text" 
                    value={affAmbassadorName}
                    onChange={(e) => setAffAmbassadorName(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                    placeholder="INGIZA JINA LAKO LA UBASHIRI (mfano: JUMA8)"
                    className="flex-grow bg-slate-950 border-2 border-slate-800 focus:border-cyan-600 text-xs font-bold text-white rounded-xl px-4 py-3 placeholder:text-slate-600 focus:outline-none uppercase"
                  />
                  <button 
                    type="submit"
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 shrink-0 transition-colors"
                  >
                    Jiunge Bure &rarr;
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-normal">
                  *Hakuna ada yoyote ya kujisajili. Unaweza kutoa kipato chako mara tu kitakapofika Tsh 10,000.
                </p>
              </form>
            ) : (
              <div className="space-y-4 animate-fade-in">
                
                {/* Ambassador Stats Panel */}
                <div className="grid grid-cols-3 gap-3.5 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl text-center">
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Mibofyo (Clicks)</p>
                    <p className="text-lg font-black text-cyan-400">{stats.clicks}</p>
                  </div>
                  <div className="space-y-1 border-x border-slate-800">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Waliounga (Signups)</p>
                    <p className="text-lg font-black text-emerald-400">{stats.signups}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Kamisheni (Earnings)</p>
                    <p className="text-lg font-black text-amber-400">Tsh {stats.earnings.toLocaleString()}</p>
                  </div>
                </div>

                {/* Tracking Link Box */}
                <div className="bg-slate-950 border-2 border-slate-800 p-3.5 rounded-xl space-y-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                    Kiungo Chako Maalum cha Kushiriki (Affiliate URL):
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={`https://lupanulla.co.tz/ref?code=LUPANULLA_AMB_${affAmbassadorName}`}
                      className="flex-grow bg-slate-900 text-[11px] font-mono font-bold text-slate-300 rounded-lg px-3 focus:outline-none select-all truncate border border-slate-800"
                    />
                    <button 
                      onClick={handleCopyLink}
                      className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider shrink-0 flex items-center gap-1 border border-cyan-500/20"
                    >
                      {copiedLink ? <CheckCircle size={14} className="text-cyan-400" /> : 'Nakili'}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {copiedLink && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[10px] text-emerald-400 font-black flex items-center gap-1 uppercase"
                      >
                        <CheckCircle size={10} /> Link imekopowa! Tuma kwa marafiki au weka kwenye status yako!
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Dynamic simulation buttons */}
                <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900 pt-3">
                  <span>Balozi: <strong className="text-indigo-400">@{affAmbassadorName}</strong></span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setStats(prev => ({ ...prev, clicks: prev.clicks + 1 }))}
                      className="text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-2 py-1 rounded"
                    >
                      + Simula Mbonyezo (Click)
                    </button>
                    <button 
                      onClick={() => setStats(prev => ({ clicks: prev.clicks + 1, signups: prev.signups + 1, earnings: prev.earnings + 5000 }))}
                      className="text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-2 py-1 rounded"
                    >
                      + Simula Premium Sale (+5000)
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Sidebar Info & Google AdSense columns */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* About Lupanulla Card */}
          <div className="bg-white dark:bg-slate-950 border-2 border-slate-150 dark:border-slate-900 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="font-display font-black text-slate-950 dark:text-white text-sm uppercase flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-900">
              <Heart size={16} className="text-red-500 animate-pulse" />
              Lupanulla Foundation
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-semibold">
              Lupanulla Elimu Hub ni jukwaa namba moja la kidijitali Tanzania linalounganisha mtaala mzima wa elimu - notisi, mitihani ya NECTA, video za masomo, na msaidizi wa AI (Lupanulla AI) ili kurahisisha na kuboresha ufaulu wa wanafunzi nchini.
            </p>
            
            <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-900 pt-5 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-cyan-600 shrink-0" />
                <div className="flex flex-col">
                  <a href="mailto:lupanulla.co.tz@hotmail.com" className="hover:text-cyan-600 hover:underline truncate">
                    Msaada: lupanulla.co.tz@hotmail.com
                  </a>
                  <a href="mailto:lupanulla.co.tz@gmail.com" className="hover:text-cyan-600 hover:underline truncate text-[10px] text-slate-400">
                    Admin: lupanulla.co.tz@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-cyan-600 shrink-0" />
                <a href="tel:0699479032" className="hover:text-cyan-600 hover:underline">
                  0699479032 / +255 699 479 032
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle size={16} className="text-emerald-500 shrink-0" />
                <a 
                  href="https://wa.me/255699479032" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1 hover:underline hover:text-emerald-500"
                >
                  WhatsApp: 0699479032
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-cyan-600 shrink-0" />
                <span>Dar es Salaam, Tanzania</span>
              </div>
            </div>
          </div>

          {/* AdSense Square Unit in Sidebar */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Toleo la Udhamini</h4>
            <GoogleAdSenseUnit slot="adsense-sidebar-square" className="shadow-sm" />
          </div>

          {/* Quick FAQ / Ambassador Info */}
          <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-display font-bold text-xs uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              <HelpCircle size={14} className="text-indigo-500" /> Maswali na Majibu ya Ubia
            </h4>
            
            <div className="space-y-3 text-[11px] font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
              <div className="space-y-1">
                <p className="text-slate-900 dark:text-slate-200 font-bold">1. Je, malipo yanafanyikaje?</p>
                <p>Kila mwisho wa wiki, tunakusanya miamala yote iliyotokana na kiungo chako na kukutumia kamisheni yako moja kwa moja kwenye namba yako ya simu.</p>
              </div>
              <div className="space-y-1 border-t border-slate-200 dark:border-slate-800 pt-2.5">
                <p className="text-slate-900 dark:text-slate-200 font-bold">2. Ninaweza kujiunga nikiwa mwanafunzi?</p>
                <p>Ndiyo, balozi zetu wengi ni wanafunzi wanaojipatia pesa ya ziada ya kununua bando na vifaa vya shule.</p>
              </div>
            </div>
          </div>

          {/* Tall AdSense Skyscraper in Sidebar */}
          <div className="hidden lg:block space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Matangazo ya Biashara</h4>
            <GoogleAdSenseUnit slot="adsense-sidebar-tall" className="mx-auto" />
          </div>

        </div>

      </div>

    </div>
  );
}
