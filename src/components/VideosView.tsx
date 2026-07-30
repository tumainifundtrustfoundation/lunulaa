import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Search, 
  Filter, 
  X, 
  Sparkles, 
  Eye, 
  Clock, 
  User, 
  Compass, 
  CheckCircle,
  AlertCircle,
  Plus,
  Loader,
  ShieldAlert,
  Tv,
  Wand2
} from 'lucide-react';
import { fetchVideos, saveVideo } from '../firebase';
import { Video } from '../types';
import { autoDetectLinkMetadata, extractYouTubeId as extractYtIdUtil } from '../utils/linkAutoDetector';

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }
  if (url.trim().length === 11) {
    return url.trim();
  }
  return null;
}

interface VideosViewProps {
  onNavigate: (view: string, id?: string) => void;
  userProfile: any;
}

export default function VideosView({ onNavigate, userProfile }: VideosViewProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  // Suggested Video Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Physics');
  const [newLevel, setNewLevel] = useState('O-Level');
  const [newTeacher, setNewTeacher] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDuration, setNewDuration] = useState('15:00');
  const [saving, setSaving] = useState(false);
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  const handleAutoDetectYouTube = async (urlStr?: string) => {
    const targetUrl = urlStr || newUrl;
    if (!targetUrl || !targetUrl.trim()) return;

    setAutoDetecting(true);
    setAddError(null);
    try {
      const meta = await autoDetectLinkMetadata(targetUrl);
      if (meta.title && meta.title !== 'Nyenzo ya Masomo') {
        setNewTitle(meta.title);
      }
      if (meta.category) {
        setNewSubject(meta.category);
      }
      if (meta.type) {
        if (meta.type.includes('Form 5') || meta.type.includes('Form 6') || meta.type.includes('A-Level')) {
          setNewLevel('A-Level');
        } else if (meta.type.includes('Primary') || meta.type.includes('Std')) {
          setNewLevel('Primary');
        } else {
          setNewLevel('O-Level');
        }
      }
      if (meta.authorName && (!newTeacher || newTeacher.trim() === '')) {
        setNewTeacher(meta.authorName);
      }
    } catch (err) {
      console.warn('YouTube auto detect error:', err);
    } finally {
      setAutoDetecting(false);
    }
  };

  const defaultVideos: Video[] = [
    {
      id: 'vid-physics-all',
      title: 'ALL OF PHYSICS explained in 14 Minutes (Muhtasari wa Fizikia Nzima)',
      subject: 'Physics',
      level: 'O-Level',
      teacher: 'Wacky Science',
      duration: '14:06',
      youtubeId: 'ZAqIoDhornk',
      views: 3120,
      createdAt: Date.now() + 100000
    },
    {
      id: 'vid-physics-intro',
      title: 'Physics - Basic Introduction (Utangulizi wa Msingi wa Fizikia)',
      subject: 'Physics',
      level: 'O-Level',
      teacher: 'The Organic Chemistry Tutor',
      duration: '30:00',
      youtubeId: 'b1t41Q3xRM8',
      views: 2450,
      createdAt: Date.now() + 90000
    },
    {
      id: 'vid-math-vectors',
      title: 'VECTORS Top 10 Must Knows (Mambo 10 Muhimu ya Vectors - Ultimate Study Guide)',
      subject: 'Mathematics',
      level: 'O-Level',
      teacher: 'JensenMath',
      duration: '18:30',
      youtubeId: 'l9ioZA9brtc',
      views: 1890,
      createdAt: Date.now() + 80000
    },
    {
      id: 'vid-math-prob',
      title: 'Probability Top 10 Must Knows (Mambo 10 Muhimu ya Probabiliti - Ultimate Study Guide)',
      subject: 'Mathematics',
      level: 'O-Level',
      teacher: 'JensenMath',
      duration: '22:15',
      youtubeId: 'LgLgexX7iTs',
      views: 1720,
      createdAt: Date.now() + 70000
    }
  ];

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const fetched = await fetchVideos();
      let baseVideos = fetched.length > 0 ? fetched : defaultVideos;
      
      // Ensure all requested high-quality featured lessons are present
      const featuredLessons: Video[] = [
        {
          id: 'vid-physics-all',
          title: 'ALL OF PHYSICS explained in 14 Minutes (Muhtasari wa Fizikia Nzima)',
          subject: 'Physics',
          level: 'O-Level',
          teacher: 'Wacky Science',
          duration: '14:06',
          youtubeId: 'ZAqIoDhornk',
          views: 3120,
          createdAt: Date.now() + 100000
        },
        {
          id: 'vid-physics-intro',
          title: 'Physics - Basic Introduction (Utangulizi wa Msingi wa Fizikia)',
          subject: 'Physics',
          level: 'O-Level',
          teacher: 'The Organic Chemistry Tutor',
          duration: '30:00',
          youtubeId: 'b1t41Q3xRM8',
          views: 2450,
          createdAt: Date.now() + 90000
        },
        {
          id: 'vid-math-vectors',
          title: 'VECTORS Top 10 Must Knows (Mambo 10 Muhimu ya Vectors - Ultimate Study Guide)',
          subject: 'Mathematics',
          level: 'O-Level',
          teacher: 'JensenMath',
          duration: '18:30',
          youtubeId: 'l9ioZA9brtc',
          views: 1890,
          createdAt: Date.now() + 80000
        },
        {
          id: 'vid-math-prob',
          title: 'Probability Top 10 Must Knows (Mambo 10 Muhimu ya Probabiliti - Ultimate Study Guide)',
          subject: 'Mathematics',
          level: 'O-Level',
          teacher: 'JensenMath',
          duration: '22:15',
          youtubeId: 'LgLgexX7iTs',
          views: 1720,
          createdAt: Date.now() + 70000
        }
      ];

      // Merge to ensure no duplicates based on youtubeId
      let mergedList = [...baseVideos];
      for (const lesson of featuredLessons) {
        if (!mergedList.some(v => v.youtubeId === lesson.youtubeId)) {
          mergedList.unshift(lesson);
        }
      }

      // Filter out any broken mock/placeholder videos
      const mockIds = ['8_z6gD5pUoo', 'b_X6fO3_Ooo', 'c_D2f_S_Poo', 'd_Z2o_P_Qoo'];
      mergedList = mergedList.filter(
        v => !mockIds.includes(v.youtubeId) && 
             !v.youtubeId.endsWith('_Ooo') && 
             !v.youtubeId.endsWith('_Poo') && 
             !v.youtubeId.endsWith('_Qoo')
      );

      setVideos(mergedList);
    } catch (e) {
      console.error(e);
      // Fallback with mock filter
      const mockIds = ['8_z6gD5pUoo', 'b_X6fO3_Ooo', 'c_D2f_S_Poo', 'd_Z2o_P_Qoo'];
      const filteredDefaults = defaultVideos.filter(v => !mockIds.includes(v.youtubeId));
      setVideos(filteredDefaults);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter(v => {
    const matchesSearch = !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || (v.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubj = !selectedSubject || v.subject === selectedSubject;
    return matchesSearch && matchesSubj;
  });

  const subjects = Array.from(new Set(videos.map(v => v.subject).filter(Boolean)));

  const handleOpenAddVideo = () => {
    if (!userProfile) {
      window.dispatchEvent(new CustomEvent('open-login-modal'));
      alert('Tafadhali ingia au jiunge kwenye akaunti yako ya Lupanulla kwanza ili uweze kuongeza video za masomo.');
      return;
    }
    setShowAddModal(true);
  };

  const handleAddVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(false);

    if (!newTitle.trim()) {
      setAddError('Tafadhali weka jina au mada ya video hii.');
      return;
    }
    const ytId = extractYouTubeId(newUrl);
    if (!ytId) {
      setAddError('Kiungo cha YouTube si sahihi au umbizo lake halikutambuliwa. Hakikisha ni kiungo cha video ya YouTube.');
      return;
    }

    try {
      setSaving(true);
      const thumbnail = `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
      
      const payload = {
        title: newTitle.trim(),
        subject: newSubject,
        level: newLevel,
        teacher: newTeacher.trim() || userProfile?.name || 'Mwl. Mwema',
        duration: newDuration || '15:00',
        youtubeId: ytId,
        thumbnailUrl: thumbnail,
        views: 0
      };

      await saveVideo(payload);
      setAddSuccess(true);
      
      // Clear fields
      setNewTitle('');
      setNewUrl('');
      setNewTeacher('');
      setNewDuration('15:00');
      
      // Reload videos list
      await loadVideos();

      setTimeout(() => {
        setShowAddModal(false);
        setAddSuccess(false);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setAddError(err.message || 'Kuna hitilafu iliyotokea wakati wa kuhifadhi video.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="videos-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50">
      
      {/* Header section */}
      <section className="bg-gradient-to-r from-red-600 via-red-800 to-indigo-950 p-6 sm:p-10 rounded-3xl text-white shadow-lg relative overflow-hidden border border-red-500/10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 space-y-3 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-red-200 text-xs font-bold uppercase tracking-wider border border-white/10">
            <Play size={12} className="fill-current" />
            Lupa+ Video Classrooms
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold uppercase leading-none">Darasani (Video Tutorials)</h1>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Sikiliza na utazame walimu hodari na mabingwa wa masomo nchini Tanzania wakieleza mada ngumu, wakisuluhisha maswali ya mitihani ya NECTA kwa urahisi, na kufanya majaribio ya maabara kwa njia ya video.
          </p>
        </div>
      </section>

      {/* Categories Search bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Tafuta video za Physics, Chemistry, Biology, Practical..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/40 text-slate-800 placeholder-slate-400"
            />
          </div>
          <button
            type="button"
            onClick={handleOpenAddVideo}
            className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-2xl transition-all uppercase flex items-center justify-center gap-1.5 shadow-md shrink-0 cursor-pointer"
          >
            <Plus size={16} /> Pendekeza / Weka Video
          </button>
        </div>

        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            <button 
              onClick={() => setSelectedSubject('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${!selectedSubject ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Vyote
            </button>
            {subjects.map(sub => (
              <button 
                key={sub}
                onClick={() => setSelectedSubject(sub || '')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedSubject === sub ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Videos List Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-600">
          <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Inapakua Orodha ya Video...</p>
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredVideos.map((vid) => (
            <div 
              key={vid.id} 
              onClick={() => setActiveVideo(vid)}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-44 bg-black flex items-center justify-center overflow-hidden">
                <img src={vid.thumbnailUrl || `https://images.unsplash.com/photo-1628126235206-5260b9ea6441?q=80&w=2070&auto=format&fit=crop`} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
                <div className="absolute inset-0 bg-black/25"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform"><Play size={20} className="fill-current ml-0.5" /></div>
                </div>
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-bold font-mono">{vid.duration || '10:00'}</span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] text-red-600 font-extrabold uppercase tracking-wider block">{vid.subject} &bull; {vid.level}</span>
                  <h3 className="font-bold text-slate-950 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">{vid.title}</h3>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3 text-[10px] text-slate-400 font-bold">
                  <span>{vid.teacher || 'Mwalimu'}</span>
                  <span className="flex items-center gap-0.5"><Eye size={12} /> {vid.views || 0} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center py-16 space-y-2">
          <Play size={36} className="mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-900 text-sm">Hakuna Video Iliyopatikana</h3>
          <p className="text-slate-400 text-xs max-w-xs mx-auto">Jaribu kufuta vichujio vyako au utafute neno jingine.</p>
        </div>
      )}

      {/* YOUTUBE EMBED IFRAME PLAYER MODAL OVERLAY */}
      {activeVideo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setActiveVideo(null)}></div>
          
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col z-[210] animate-fade-in text-white">
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all z-20"
            >
              <X size={20} />
            </button>

            {/* Embed 16:9 responsive frame */}
            <div className="relative pb-[56.25%] h-0 bg-black">
              <iframe 
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId || 'dQw4w9WgXcQ'}?autoplay=1`}
                title={activeVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <div className="p-6 space-y-2">
              <span className="text-xs text-red-500 font-extrabold uppercase tracking-wider block">{activeVideo.subject} &bull; {activeVideo.level}</span>
              <h2 className="font-display font-extrabold text-lg sm:text-xl uppercase leading-snug">{activeVideo.title}</h2>
              <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold pt-1">
                <span>Mwalimu: {activeVideo.teacher}</span>
                <span>•</span>
                <span>Muda: {activeVideo.duration}</span>
                <span>•</span>
                <span>Kusomwa: {activeVideo.views} mara</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / SUGGEST VIDEO MODAL OVERLAY */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          
          <div className="relative bg-white border border-slate-200 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col z-[210] animate-fade-in text-slate-800">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all z-20 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="p-6 border-b border-slate-100 bg-red-50/50 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                <Tv size={20} />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-base text-slate-950 uppercase tracking-tight">Pendekeza Video Mpya</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hifadhi video ya masomo kwa kutumia kiungo cha YouTube pekee</p>
              </div>
            </div>

            <form onSubmit={handleAddVideoSubmit} className="p-6 space-y-4">
              {addError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              {addSuccess && (
                <div className="p-3 bg-green-50 border border-green-100 text-green-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
                  <CheckCircle size={16} className="shrink-0" />
                  <span>Video imehifadhiwa kikamilifu na kupakiwa kwenye darasa!</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kichwa cha Video / Mada (Title)</label>
                <input 
                  type="text" 
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Mfano: Newton's Laws of Motion - Form 3 Solved Problems" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Somo (Subject)</label>
                  <select 
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-700 cursor-pointer"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Advanced Mathematics">Advanced Mathematics</option>
                    <option value="Geography">Geography</option>
                    <option value="History">History</option>
                    <option value="English">English</option>
                    <option value="Kiswahili">Kiswahili</option>
                    <option value="Civics">Civics</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ngazi ya Elimu (Level)</label>
                  <select 
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-700 cursor-pointer"
                  >
                    <option value="Primary">Primary</option>
                    <option value="O-Level">O-Level (Form 1-4)</option>
                    <option value="A-Level">A-Level (Form 5-6)</option>
                    <option value="University">Chuo Kikuu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jina la Mwalimu (Teacher)</label>
                  <input 
                    type="text" 
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    placeholder="Mwl. Joshua (Optional)" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Muda wa Video (e.g. 12:40)</label>
                  <input 
                    type="text" 
                    required
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="15:00" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kiungo cha YouTube (YouTube Link)</label>
                  <button
                    type="button"
                    onClick={() => handleAutoDetectYouTube(newUrl)}
                    disabled={!newUrl || autoDetecting}
                    className="text-[10px] text-red-600 hover:text-red-700 font-extrabold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 cursor-pointer disabled:opacity-50"
                  >
                    {autoDetecting ? <Loader size={11} className="animate-spin" /> : <Wand2 size={11} />}
                    <span>Utambuzi wa Jina &amp; Somo (Auto-Detect)</span>
                  </button>
                </div>
                <input 
                  type="url" 
                  required
                  value={newUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewUrl(val);
                    if (val && val.length > 15) {
                      handleAutoDetectYouTube(val);
                    }
                  }}
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-800"
                />
              </div>

              <button 
                type="submit"
                disabled={saving || addSuccess}
                className="w-full py-3 mt-2 text-xs font-extrabold bg-red-600 hover:bg-red-500 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl transition-all shadow-md uppercase flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    <span>Inahifadhi Video...</span>
                  </>
                ) : (
                  <>
                    <span>HIFADHI VIDEO MPYA</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
