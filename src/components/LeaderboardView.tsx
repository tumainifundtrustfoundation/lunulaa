import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Award, 
  Sparkles, 
  TrendingUp, 
  Search, 
  CheckCircle, 
  Star, 
  Users, 
  Share2, 
  Copy, 
  Wallet, 
  ArrowUpRight,
  TrendingDown,
  Gift,
  HelpCircle
} from 'lucide-react';

interface LeaderboardUser {
  rank: number;
  name: string;
  level: number;
  xp: number;
  streak: number;
  region: string;
  avatarBg: string;
  isCurrentUser?: boolean;
}

interface Achievement {
  id: string;
  title: string;
  desc: string;
  xpReward: number;
  icon: string;
  isUnlocked: boolean;
  unlockedDate?: string;
}

interface LeaderboardViewProps {
  language: 'sw' | 'en';
  userProfile: any;
}

export default function LeaderboardView({ language, userProfile }: LeaderboardViewProps) {
  const [filterLevel, setFilterLevel] = useState<'kitaifa' | 'mikoa'>('kitaifa');
  const [searchName, setSearchName] = useState('');
  const [copied, setCopied] = useState(false);

  // Leaderboard lists
  const leaderboardData: LeaderboardUser[] = React.useMemo(() => {
    const rawList: LeaderboardUser[] = [
      { rank: 0, name: 'Emanuel Sokoine', level: 18, xp: 9840, streak: 24, region: 'Dar es Salaam', avatarBg: 'bg-emerald-500' },
      { rank: 0, name: 'Devota Mbowe', level: 16, xp: 8710, streak: 18, region: 'Arusha', avatarBg: 'bg-blue-500' },
      { rank: 0, name: 'Baraka Msigwa', level: 15, xp: 7920, streak: 12, region: 'Mwanza', avatarBg: 'bg-indigo-500' },
      { rank: 0, name: userProfile?.name || 'Mimi (Mwanafunzi)', level: userProfile?.xp ? Math.max(12, Math.floor(userProfile.xp / 450)) : 12, xp: userProfile?.xp !== undefined ? userProfile.xp : 5400, streak: 5, region: 'Dodoma', avatarBg: 'bg-purple-600', isCurrentUser: true },
      { rank: 0, name: 'Farida Karume', level: 11, xp: 4890, streak: 9, region: 'Zanzibar', avatarBg: 'bg-amber-500' },
      { rank: 0, name: 'Siza Mwansasu', level: 10, xp: 4120, streak: 6, region: 'Mbeya', avatarBg: 'bg-red-500' },
      { rank: 0, name: 'Hamisi Kigwangalla', level: 9, xp: 3590, streak: 4, region: 'Tabora', avatarBg: 'bg-pink-500' }
    ];

    const sorted = [...rawList].sort((a, b) => b.xp - a.xp);
    return sorted.map((user, idx) => ({
      ...user,
      rank: idx + 1
    }));
  }, [userProfile]);

  // Achievement badges
  const [achievements] = useState<Achievement[]>([
    { id: '1', title: 'NECTA Champ', desc: 'Soma andiko au notisi 10 za kujiandaa na mitihani.', xpReward: 500, icon: '🏆', isUnlocked: true, unlockedDate: '2026-06-20' },
    { id: '2', title: 'AI Explorer', desc: 'Uliza Lupanulla AI zaidi ya maswali 15 ya kitaaluma.', xpReward: 350, icon: '🤖', isUnlocked: true, unlockedDate: '2026-07-01' },
    { id: '3', title: 'Perfect Streak', desc: 'Fanya marudio na soma kila siku kwa siku 5 mfululizo.', xpReward: 1000, icon: '🔥', isUnlocked: true, unlockedDate: '2026-07-08' },
    { id: '4', title: 'Kitovu Contributor', desc: 'Shiriki na changia majibu sahihi 5 kwenye Jukwaa la Jamii.', xpReward: 800, icon: '✍️', isUnlocked: false }
  ]);

  // Referral system state
  const referralLink = `https://lupanulla.co.tz/join?ref=${userProfile?.uid?.substring(0, 6) || 'LUP882'}`;
  const totalReferrals = 3;
  const referralEarnings = 15000; // TSh 15,000

  const dict = {
    sw: {
      header: 'Viwango na Tuzo (Leaderboard)',
      subHeader: 'Jipime uwezo wako na wanafunzi wengine kitaifa na mikoani. Kusanya alama za XP na beji kwa kila juhudi unayoweka.',
      rankingTitle: 'Msimamo wa Wanafunzi',
      achievementsTitle: 'Beji na Mafanikio Yangu',
      referralTitle: 'Mwaliko & Kipato (Referral System)',
      referralDesc: 'Waalike rafiki zako kujiunga na Lupanulla Elimu Hub. Wakijiunga na kuanza kujifunza, utapokea TSh 5,000 kama zawadi kwenye pochi yako kwa kila mmoja!',
      kitaifa: 'Kitaifa (National)',
      mikoa: 'Kimkoa (Regional)',
      searchPlaceholder: 'Tafuta mwanafunzi kwa jina...',
      rank: 'Nafasi',
      name: 'Mwanafunzi',
      level: 'Kiwango',
      xp: 'Alama za XP',
      streak: 'Mfululizo',
      region: 'Mkoa',
      unlocked: 'Imefunguliwa',
      locked: 'Imefungwa',
      shareLink: 'Nakili Link ya Mwaliko',
      copied: 'Imenakiliwa!',
      referralsCount: 'Waliotembelea',
      earnings: 'Kipato cha Mwaliko',
      balance: 'Salio la Pochi',
      withdrawBtn: 'Toa Fedha (M-Pesa)',
      rewardCard: 'Zawadi & Bonasi',
      notUnlockedYet: 'Mada haijafunguliwa bado. Endelea kusoma kupata beji hii!'
    },
    en: {
      header: 'Rankings & Rewards',
      subHeader: 'Compete with peers nationwide. Accumulate experience points (XP) and earn prestigious badges as you study.',
      rankingTitle: 'Student Standings',
      achievementsTitle: 'My Earned Badges',
      referralTitle: 'Referral & Earnings Network',
      referralDesc: 'Invite friends to study on Lupanulla Elimu Hub. Earn TSh 5,000 bonus directly deposited into your wallet for every friend who joins and activates!',
      kitaifa: 'National',
      mikoa: 'Regional',
      searchPlaceholder: 'Search student by name...',
      rank: 'Rank',
      name: 'Student',
      level: 'Level',
      xp: 'XP Points',
      streak: 'Streak',
      region: 'Region',
      unlocked: 'Unlocked',
      locked: 'Locked',
      shareLink: 'Copy Referral Link',
      copied: 'Link Copied!',
      referralsCount: 'Total Referred',
      earnings: 'Referral Commissions',
      balance: 'Wallet Balance',
      withdrawBtn: 'Withdraw Earnings',
      rewardCard: 'Rewards & Bonuses',
      notUnlockedYet: 'Keep practicing to unlock this achievement!'
    }
  }[language];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLeaderboard = leaderboardData.filter(user => 
    user.name.toLowerCase().includes(searchName.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-800 to-indigo-950 border border-emerald-500/10 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Trophy size={28} className="text-yellow-400 animate-bounce" />
            {dict.header}
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            {dict.subHeader}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Rankings Board */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
            <h2 className="font-display font-black text-slate-900 text-base sm:text-lg uppercase tracking-tight flex items-center gap-2">
              <TrendingUp size={18} className="text-cyan-500" />
              {dict.rankingTitle}
            </h2>
            
            {/* Filter Buttons */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setFilterLevel('kitaifa')}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  filterLevel === 'kitaifa' ? 'bg-white text-slate-950 font-black shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {dict.kitaifa}
              </button>
              <button
                onClick={() => setFilterLevel('mikoa')}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  filterLevel === 'mikoa' ? 'bg-white text-slate-950 font-black shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {dict.mikoa}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Search filter input */}
            <div className="relative">
              <input 
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder={dict.searchPlaceholder}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <Search className="absolute left-4 top-3 text-slate-400" size={14} />
            </div>

            {/* Rankings list table */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
                    <th className="py-3.5 px-5">{dict.rank}</th>
                    <th className="py-3.5 px-4">{dict.name}</th>
                    <th className="py-3.5 px-4 text-center">{dict.level}</th>
                    <th className="py-3.5 px-4">{dict.xp}</th>
                    <th className="py-3.5 px-4 text-center">{dict.streak}</th>
                    <th className="py-3.5 px-4">{dict.region}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredLeaderboard.map((user) => (
                    <tr 
                      key={user.rank} 
                      className={`hover:bg-slate-50/50 transition-colors ${
                        user.isCurrentUser ? 'bg-emerald-500/5 text-emerald-950 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-extrabold ${
                          user.rank === 1 ? 'bg-yellow-100 text-yellow-700 font-black' :
                          user.rank === 2 ? 'bg-slate-200 text-slate-800' :
                          user.rank === 3 ? 'bg-amber-100 text-amber-850' : 'text-slate-400'
                        }`}>
                          {user.rank}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full ${user.avatarBg} text-white font-black flex items-center justify-center text-xs uppercase`}>
                            {user.name.charAt(0)}
                          </div>
                          <span className="truncate max-w-[140px] block">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-extrabold">Lvl {user.level}</td>
                      <td className="py-4 px-4 font-mono font-bold text-slate-900">{user.xp.toLocaleString()} XP</td>
                      <td className="py-4 px-4 text-center text-amber-600 font-extrabold">
                        <span className="inline-flex items-center gap-0.5"><Flame size={12} /> {user.streak}</span>
                      </td>
                      <td className="py-4 px-4 text-[11px] font-bold text-slate-500">{user.region}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Achievements & Referral System */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Referral system Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <h3 className="font-display font-black text-white text-sm uppercase tracking-tight flex items-center gap-1.5">
              <Gift size={18} className="text-emerald-400" />
              {dict.referralTitle}
            </h3>
            
            <p className="text-slate-300 text-xs leading-relaxed">
              {dict.referralDesc}
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">LINK YAKO YA MWALIKO</span>
              <div className="flex gap-2.5">
                <input 
                  type="text" 
                  readOnly 
                  value={referralLink}
                  className="flex-grow bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-[10px] font-mono text-slate-300 focus:outline-none"
                />
                <button 
                  onClick={handleCopyLink}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold p-2.5 rounded-xl transition-all"
                >
                  {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
                </button>
              </div>
            </div>

            {/* Referrals Stats Wallet */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-800/40 border border-slate-850 p-3 rounded-xl">
                <span className="block text-[9px] text-slate-400 uppercase font-extrabold">{dict.referralsCount}</span>
                <span className="text-lg font-extrabold text-white">{totalReferrals}</span>
              </div>
              <div className="bg-slate-800/40 border border-slate-850 p-3 rounded-xl">
                <span className="block text-[9px] text-slate-400 uppercase font-extrabold">Salio la Pochi</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono block">TSh {referralEarnings.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => alert('💸 Ombi lako la kutoa fedha limepokelewa! TSh 15,000 itatumwa kwenye namba yako ya simu ya malipo kwa M-Pesa ndani ya masaa 24.')}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10"
            >
              <Wallet size={13} /> {dict.withdrawBtn}
            </button>
          </div>

          {/* Achievement Badges Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <h3 className="font-display font-black text-slate-900 text-sm uppercase tracking-tight flex items-center gap-1.5">
              <Award size={18} className="text-amber-500" />
              {dict.achievementsTitle}
            </h3>

            <div className="space-y-4 divide-y divide-slate-100">
              {achievements.map((ach) => (
                <div 
                  key={ach.id} 
                  className={`flex gap-3.5 pt-3 first:pt-0 ${
                    ach.isUnlocked ? 'opacity-100' : 'opacity-65'
                  }`}
                >
                  <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {ach.icon}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-950">{ach.title}</h4>
                      <span className="text-[9px] bg-cyan-50 text-cyan-800 rounded px-1.5 font-bold font-mono">+{ach.xpReward} XP</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug font-semibold">{ach.desc}</p>
                    {ach.isUnlocked ? (
                      <span className="text-[8px] text-emerald-600 uppercase font-black tracking-wide flex items-center gap-0.5">
                        <CheckCircle size={8} /> {dict.unlocked} • {new Date(ach.unlockedDate!).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-[8px] text-slate-400 uppercase font-black tracking-wide">
                        {dict.locked}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
