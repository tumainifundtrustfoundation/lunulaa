import React, { useState } from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  Flag, 
  Tag, 
  User, 
  Clock, 
  Filter,
  CheckCircle
} from 'lucide-react';

interface Reply {
  id: string;
  author: string;
  role: 'student' | 'teacher' | 'admin';
  content: string;
  createdAt: number;
  votes: number;
  isBestAnswer?: boolean;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  role: 'student' | 'teacher' | 'admin';
  category: 'masomo' | 'vyuo' | 'ushauri' | 'maisha' | 'michezo';
  tags: string[];
  createdAt: number;
  replies: Reply[];
  votes: number;
  views: number;
  userVote?: 'up' | 'down';
}

interface ForumViewProps {
  language: 'sw' | 'en';
  userProfile: any;
}

export default function ForumView({ language, userProfile }: ForumViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'masomo' | 'vyuo' | 'ushauri' | 'maisha'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);

  // New Post Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'masomo' | 'vyuo' | 'ushauri' | 'maisha' | 'michezo'>('masomo');
  const [newTags, setNewTags] = useState('');

  // New Reply State
  const [replyText, setReplyText] = useState('');

  // Seed Data
  const [posts, setPosts] = useState<ForumPost[]>([
    {
      id: '1',
      title: 'Jinsi ya kusoma Practical ya Chemistry (Titration) kwa Kidato cha Nne',
      content: 'Habari wakuu, nina changamoto katika kufanya volumetric analysis practical. Kila nikijaribu kuhesabu titrations naona napata alama tofauti na mwalimu wangu. Nini siri ya kupata "concordant readings" sahihi kwenye mitihani ya NECTA?',
      author: 'Amani Mtanzania',
      role: 'student',
      category: 'masomo',
      tags: ['Chemistry', 'CSEE', 'Practical'],
      createdAt: Date.now() - 3600000 * 2, // 2 hours ago
      votes: 18,
      views: 124,
      replies: [
        {
          id: 'r1',
          author: 'Mwalimu Juma',
          role: 'teacher',
          content: 'Siri kuu ya titration ni usafi wa vifaa vyako na uangalifu wakati wa kudondosha Acid (kutoka kwenye burette) kwenda kwenye Base (pipetted into conical flask). Hakikisha unatikisa conical flask (swirling) kila sekunde, na ukiona rangi inaanza kubadilika kuwa "faint pink" basi punguza kasi na uweke tone moja moja. Concordant readings lazima zitofautiane kwa ±0.1 cm³ pekee.',
          createdAt: Date.now() - 3600000 * 1,
          votes: 12,
          isBestAnswer: true
        },
        {
          id: 'r2',
          author: 'Neema Mwakalindile',
          role: 'student',
          content: 'Nashukuru sana Mwalimu Juma, ushauri wako umenisaidia na mimi nilikuwa napata shida hii!',
          createdAt: Date.now() - 1800000,
          votes: 3
        }
      ]
    },
    {
      id: '2',
      title: 'Maombi ya Mikopo ya Elimu ya Juu HESLB 2026 yamefunguliwa?',
      content: 'Wadau naombeni muongozo. Kuna taarifa kuwa mfumo wa maombi ya mkopo HESLB kwa wanafunzi wa mwaka wa kwanza umeanza kufanya kazi leo. Je, ni nyaraka gani muhimu zinatakiwa ili nisiandikiwe "invalid attachments"?',
      author: 'George Mrema',
      role: 'student',
      category: 'vyuo',
      tags: ['HESLB', 'Chuo', 'Mikopo'],
      createdAt: Date.now() - 3600000 * 12,
      votes: 34,
      views: 412,
      replies: [
        {
          id: 'r3',
          author: 'Msimamizi Lupanulla',
          role: 'admin',
          content: 'Ndiyo George, dirisha limefunguliwa rasmi leo! Nyaraka kuu tano (5) zinazohitajiwa na lazima ziwe certified na mamlaka husika ni:\n1. Birth Certificate (kutoka RITA au ZCSRA)\n2. Cheti cha Kidato cha Nne (CSEE Certificate)\n3. Cheti cha Kidato cha Sita (ACSEE) au Diploma\n4. National ID / NIDA Number\n5. Death certificates za wazazi (kama ni yatima). Hakikisha unapakia faili zenye ubora, zisisomeke kwa kufifia (blurry).',
          createdAt: Date.now() - 3600000 * 10,
          votes: 24,
          isBestAnswer: true
        }
      ]
    },
    {
      id: '3',
      title: 'Njia bora ya kukariri Formula za Fizikia (Form I - IV)',
      content: 'Kuna mtu mwenye mbinu mbadala au "mnemonic" za kusaidia kukariri formula nyingi za Fizikia kuanzia Kinematics hadi Ohm`s Law? Wakati mwingine nakumbuka formula lakini nachanganya alama au "SI units".',
      author: 'Sofia Salim',
      role: 'student',
      category: 'ushauri',
      tags: ['Physics', 'Tips', 'Formula'],
      createdAt: Date.now() - 3600000 * 24,
      votes: 14,
      views: 98,
      replies: []
    }
  ]);

  const dict = {
    sw: {
      header: 'Jukwaa la Jamii',
      subHeader: 'Uliza maswali, shirikiana na wanafunzi, wasiliana na walimu na badilishana uzoefu wa kimasomo.',
      searchPlaceholder: 'Tafuta mada, maswali au maelezo...',
      newPostBtn: 'Anzisha Mada Mpya',
      all: 'Zote',
      masomo: 'Masomo & Mitaala',
      vyuo: 'Vyuo na Vyeti',
      ushauri: 'Ushauri wa Masomo',
      maisha: 'Maisha ya Shule',
      michezo: 'Burudani & Michezo',
      votes: 'Kura',
      views: 'Mionekano',
      replies: 'Majibu',
      addPostTitle: 'Andika kichwa cha mada yako...',
      addPostDesc: 'Eleza kwa kina changamoto au swali lako hapa ili upate majibu ya haraka...',
      categoryLabel: 'Kundi la Mada',
      tagsLabel: 'Lebo (Tags) - tenga kwa koma',
      cancel: 'Ghairi',
      publish: 'Chapisha Mada',
      writeReply: 'Andika jibu lako la kitaaluma hapa...',
      submitReply: 'Tuma Jibu',
      bestAnswer: 'Jibu Bora Teule',
      markBest: 'Weka kama Jibu Bora',
      roleStudent: 'Mwanafunzi',
      roleTeacher: 'Mwalimu',
      roleAdmin: 'Msimamizi',
      back: 'Rudi kwenye Orodha',
      reported: 'Umetoa taarifa ya ukiukwaji wa maadili kwenye mada hii.'
    },
    en: {
      header: 'Community Forum',
      subHeader: 'Ask questions, collaborate with fellow students, connect with teachers and share academic tips.',
      searchPlaceholder: 'Search topics, questions or discussions...',
      newPostBtn: 'Start New Topic',
      all: 'All',
      masomo: 'Subjects & Curriculum',
      vyuo: 'Colleges & Admissions',
      ushauri: 'Academic Mentorship',
      maisha: 'School Life',
      michezo: 'Sports & Entertainment',
      votes: 'Votes',
      views: 'Views',
      replies: 'Replies',
      addPostTitle: 'Enter topic title...',
      addPostDesc: 'Explain your question or problem in detail to get fast help...',
      categoryLabel: 'Category',
      tagsLabel: 'Tags - separate by comma',
      cancel: 'Cancel',
      publish: 'Publish Topic',
      writeReply: 'Write your academic response here...',
      submitReply: 'Submit Reply',
      bestAnswer: 'Selected Best Answer',
      markBest: 'Mark as Best Answer',
      roleStudent: 'Student',
      roleTeacher: 'Teacher',
      roleAdmin: 'Administrator',
      back: 'Back to Board',
      reported: 'You have reported this post for content moderation.'
    }
  }[language];

  const filteredPosts = posts.filter(post => {
    const matchesTab = activeTab === 'all' || post.category === activeTab;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const handleVotePost = (id: string, dir: 'up' | 'down') => {
    setPosts(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (p.userVote === dir) {
        // Undo vote
        const diff = dir === 'up' ? -1 : 1;
        return { ...p, votes: p.votes + diff, userVote: undefined };
      } else {
        // Change vote or set vote
        let diff = dir === 'up' ? 1 : -1;
        if (p.userVote) {
          // Changed direction, need double weight
          diff *= 2;
        }
        return { ...p, votes: p.votes + diff, userVote: dir };
      }
    }));

    if (selectedPost && selectedPost.id === id) {
      setTimeout(() => {
        const found = posts.find(p => p.id === id);
        if (found) setSelectedPost(found);
      }, 50);
    }
  };

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const tagsArray = newTags.split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newPost: ForumPost = {
      id: String(posts.length + 1),
      title: newTitle.trim(),
      content: newContent.trim(),
      author: userProfile?.name || 'Mtumiaji Lupanulla',
      role: userProfile?.role || 'student',
      category: newCategory,
      tags: tagsArray.length > 0 ? tagsArray : ['General'],
      createdAt: Date.now(),
      votes: 1,
      views: 5,
      replies: []
    };

    setPosts([newPost, ...posts]);
    setShowNewPostModal(false);
    // Reset Form
    setNewTitle('');
    setNewContent('');
    setNewCategory('masomo');
    setNewTags('');
  };

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedPost) return;

    const newReply: Reply = {
      id: `reply-${Date.now()}`,
      author: userProfile?.name || 'Mtumiaji Lupanulla',
      role: userProfile?.role || 'student',
      content: replyText.trim(),
      createdAt: Date.now(),
      votes: 0
    };

    const updatedPosts = posts.map(p => {
      if (p.id !== selectedPost.id) return p;
      return { ...p, replies: [...p.replies, newReply] };
    });

    setPosts(updatedPosts);
    setReplyText('');
    
    const matched = updatedPosts.find(p => p.id === selectedPost.id);
    if (matched) setSelectedPost(matched);
  };

  const handleMarkBestAnswer = (postId: string, replyId: string) => {
    const updated = posts.map(p => {
      if (p.id !== postId) return p;
      const updatedReplies = p.replies.map(r => {
        return { ...r, isBestAnswer: r.id === replyId };
      });
      return { ...p, replies: updatedReplies };
    });

    setPosts(updated);
    const matched = updated.find(p => p.id === postId);
    if (matched) setSelectedPost(matched);
  };

  const handleReportPost = () => {
    alert(dict.reported);
  };

  return (
    <div className="space-y-6">
      
      {/* Forum Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
            <MessageSquare size={28} className="text-cyan-400" />
            {dict.header}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {dict.subHeader}
          </p>
        </div>
        <button 
          onClick={() => setShowNewPostModal(true)}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md shadow-cyan-500/20 uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0"
        >
          <PlusCircle size={16} />
          {dict.newPostBtn}
        </button>
      </div>

      {selectedPost ? (
        /* Detailed View of a Forum Post */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
          {/* Post Heading Info */}
          <div className="flex justify-between items-start">
            <button 
              onClick={() => setSelectedPost(null)}
              className="text-cyan-600 hover:text-cyan-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1 bg-cyan-50 px-3 py-1.5 rounded-lg"
            >
              &larr; {dict.back}
            </button>
            <button 
              onClick={handleReportPost}
              className="text-red-500 hover:text-red-600 text-[10px] font-bold uppercase flex items-center gap-1.5 border border-red-150 rounded-lg px-2.5 py-1.5 bg-red-50/25"
            >
              <Flag size={12} /> Flag
            </button>
          </div>

          <div className="flex gap-4 items-start">
            {/* Voting Component */}
            <div className="flex flex-col items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 w-12">
              <button 
                onClick={() => handleVotePost(selectedPost.id, 'up')}
                className={`text-slate-400 hover:text-cyan-600 transition-colors ${selectedPost.userVote === 'up' ? 'text-cyan-600 font-bold' : ''}`}
              >
                <ThumbsUp size={18} />
              </button>
              <span className="font-extrabold text-xs text-slate-800">{selectedPost.votes}</span>
              <button 
                onClick={() => handleVotePost(selectedPost.id, 'down')}
                className={`text-slate-400 hover:text-red-500 transition-colors ${selectedPost.userVote === 'down' ? 'text-red-500 font-bold' : ''}`}
              >
                <ThumbsDown size={18} />
              </button>
            </div>

            {/* Post Content */}
            <div className="flex-1 space-y-3">
              <span className="inline-block bg-cyan-100 text-cyan-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                {dict[selectedPost.category]}
              </span>
              <h2 className="text-xl font-display font-black text-slate-900 leading-tight">
                {selectedPost.title}
              </h2>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-bold">
                <span className="flex items-center gap-1 text-slate-600">
                  <User size={13} /> {selectedPost.author} 
                  <span className="text-[8px] bg-slate-200 px-1 py-0.1 rounded text-slate-500 font-extrabold uppercase ml-1">
                    {dict[`role${selectedPost.role.charAt(0).toUpperCase() + selectedPost.role.slice(1)}` as keyof typeof dict]}
                  </span>
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-0.5"><Clock size={12} /> {new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                <span>&bull;</span>
                <span>{selectedPost.views} {dict.views}</span>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap pt-2">
                {selectedPost.content}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {selectedPost.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] text-slate-400 bg-slate-100 border border-slate-200/60 rounded px-2 py-0.5 font-bold">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Replies Section */}
          <div className="border-t border-slate-150 pt-6 space-y-6">
            <h3 className="font-display font-bold text-slate-900 text-base uppercase tracking-tight flex items-center gap-2">
              <MessageCircle size={18} className="text-cyan-500" />
              {dict.replies} ({selectedPost.replies.length})
            </h3>

            {selectedPost.replies.map((reply) => (
              <div 
                key={reply.id} 
                className={`p-5 rounded-2xl border transition-all ${
                  reply.isBestAnswer 
                    ? 'border-green-500 bg-green-500/5 shadow-sm' 
                    : 'border-slate-150 bg-slate-50/50'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs ${
                      reply.role === 'teacher' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {reply.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        {reply.author}
                        <span className="text-[8px] bg-slate-200/80 text-slate-500 px-1 py-0.1 rounded font-extrabold uppercase">
                          {dict[`role${reply.role.charAt(0).toUpperCase() + reply.role.slice(1)}` as keyof typeof dict]}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold">{new Date(reply.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {reply.isBestAnswer && (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                      <CheckCircle2 size={12} /> {dict.bestAnswer}
                    </span>
                  )}

                  {!reply.isBestAnswer && (userProfile?.role === 'teacher' || userProfile?.role === 'admin') && (
                    <button
                      onClick={() => handleMarkBestAnswer(selectedPost.id, reply.id)}
                      className="text-slate-400 hover:text-green-600 text-[10px] font-bold uppercase tracking-wider border border-dashed border-slate-300 rounded px-2.5 py-1 hover:bg-green-50 transition-colors"
                    >
                      {dict.markBest}
                    </button>
                  )}
                </div>

                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap pl-1">
                  {reply.content}
                </p>
              </div>
            ))}

            {/* Write a Reply Form */}
            <form onSubmit={handleAddReply} className="space-y-3 pt-2">
              <textarea
                required
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={dict.writeReply}
                className="w-full border border-slate-200 rounded-2xl p-4 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all uppercase tracking-wider"
              >
                {dict.submitReply}
              </button>
            </form>

          </div>
        </div>
      ) : (
        /* Forum List View */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Side categories switcher */}
          <div className="space-y-2 lg:col-span-1">
            <h3 className="font-display font-extrabold text-slate-400 text-[10px] uppercase tracking-widest pl-2 mb-2 flex items-center gap-1.5">
              <Filter size={11} /> {language === 'sw' ? 'MAKUNDI' : 'CATEGORIES'}
            </h3>
            <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 whitespace-nowrap lg:whitespace-normal">
              {(['all', 'masomo', 'vyuo', 'ushauri', 'maisha'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all ${
                    activeTab === tab 
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  {dict[tab === 'all' ? 'all' : tab]}
                </button>
              ))}
            </div>
          </div>

          {/* Posts list panel */}
          <div className="space-y-4 lg:col-span-3">
            
            {/* Search Input Bar */}
            <div className="relative">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dict.searchPlaceholder}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-sm"
              />
              <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
            </div>

            {/* Dynamic posts loop */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-6">
                <p className="text-slate-400 font-bold uppercase text-xs tracking-wider">HAKUNA MAUDHUI</p>
                <p className="text-slate-500 text-sm mt-1">Hakuna mada au majadiliano yanayolingana na uchujaji wako bado.</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div 
                  key={post.id}
                  onClick={() => {
                    // Increment view counts
                    post.views += 1;
                    setSelectedPost(post);
                  }}
                  className="bg-white border border-slate-200 hover:border-cyan-400 hover:shadow-md rounded-2xl p-5 sm:p-6 transition-all cursor-pointer flex gap-4 items-start"
                >
                  {/* Small Voting view */}
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="hidden sm:flex flex-col items-center gap-0.5 bg-slate-50 border border-slate-150 rounded-xl p-1.5 w-11 flex-shrink-0"
                  >
                    <button 
                      onClick={() => handleVotePost(post.id, 'up')}
                      className={`text-slate-400 hover:text-cyan-600 ${post.userVote === 'up' ? 'text-cyan-600 font-black' : ''}`}
                    >
                      <ThumbsUp size={14} />
                    </button>
                    <span className="font-extrabold text-[11px] text-slate-700">{post.votes}</span>
                    <button 
                      onClick={() => handleVotePost(post.id, 'down')}
                      className={`text-slate-400 hover:text-red-500 ${post.userVote === 'down' ? 'text-red-500 font-black' : ''}`}
                    >
                      <ThumbsDown size={14} />
                    </button>
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="bg-cyan-50 text-cyan-700 border border-cyan-100 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                        {dict[post.category]}
                      </span>
                      {post.replies.some(r => r.isBestAnswer) && (
                        <span className="bg-green-50 text-green-700 border border-green-100 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-0.5">
                          <CheckCircle size={8} /> SOLVED
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-slate-950 text-base sm:text-lg leading-snug hover:text-cyan-600 transition-colors truncate">
                      {post.title}
                    </h3>

                    <p className="text-slate-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[10px] text-slate-400 font-bold border-t border-slate-50">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-600">{post.author}</span>
                        <span>&bull;</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-0.5 text-cyan-600"><MessageSquare size={10} /> {post.replies.length} {dict.replies}</span>
                      </div>
                      <div className="flex gap-1">
                        {post.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 text-[9px]">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

          </div>

        </div>
      )}

      {/* New Post Modal Form */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-slate-950/65 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="font-display font-black text-slate-900 text-lg sm:text-xl uppercase flex items-center gap-1.5">
                <PlusCircle size={22} className="text-cyan-500" />
                {dict.newPostBtn}
              </h2>
              <button 
                onClick={() => setShowNewPostModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePublishPost} className="space-y-4 text-xs sm:text-sm font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-extrabold uppercase text-[10px] tracking-wide block">{dict.addPostTitle}</label>
                <input 
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Kichwa cha Mada..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-extrabold uppercase text-[10px] tracking-wide block">{dict.categoryLabel}</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <option value="masomo">{dict.masomo}</option>
                    <option value="vyuo">{dict.vyuo}</option>
                    <option value="ushauri">{dict.ushauri}</option>
                    <option value="maisha">{dict.maisha}</option>
                    <option value="michezo">{dict.michezo}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-extrabold uppercase text-[10px] tracking-wide block">{dict.tagsLabel}</label>
                  <input 
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="NECTA, Biology, Form3"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 font-extrabold uppercase text-[10px] tracking-wide block">{dict.addPostDesc}</label>
                <textarea 
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Mada yako kwa kirefu..."
                  className="w-full border border-slate-200 rounded-2xl p-4 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="flex-1 py-3 text-slate-700 hover:bg-slate-50 bg-slate-100 border border-slate-200 text-xs font-extrabold uppercase tracking-wide rounded-xl transition-all"
                >
                  {dict.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black uppercase tracking-wide rounded-xl transition-all shadow-md shadow-cyan-500/10"
                >
                  {dict.publish}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Minimal X component for inline close
function X({ size, className }: { size?: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
