import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Upload, 
  BookOpen, 
  Crown, 
  User, 
  ShieldAlert, 
  LogOut, 
  LogIn, 
  Search, 
  Menu, 
  X,
  Sparkles,
  Bot,
  Play,
  Calculator,
  Compass,
  Briefcase,
  Megaphone,
  Book,
  Trophy,
  Store,
  LayoutDashboard,
  Bell,
  MessageSquare,
  Library,
  Palette,
  Video,
  Award,
  CheckCircle2,
  Globe,
  FileSpreadsheet
} from 'lucide-react';
import { UserProfile, AppNotification, AppTheme } from '../types';
import { subscribeNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../firebase';
import Logo from './Logo';

interface NavbarProps {
  activeView: string;
  onNavigate: (view: string, documentId?: string) => void;
  userProfile: UserProfile | null;
  onSignInClick: () => void;
  onSignOut: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
  language: 'sw' | 'en';
  onChangeLanguage: (lang: 'sw' | 'en') => void;
}

export default function Navbar({
  activeView,
  onNavigate,
  userProfile,
  onSignInClick,
  onSignOut,
  searchQuery,
  onSearchChange,
  theme,
  onChangeTheme,
  language,
  onChangeLanguage
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [extraToolsOpen, setExtraToolsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);

  // Close menus/dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
        setDropdownOpen(false);
        setExtraToolsOpen(false);
        setNotifDropdownOpen(false);
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!userProfile?.uid) {
      setNotifications([]);
      return;
    }

    const unsubscribe = subscribeNotifications(userProfile.uid, (list) => {
      setNotifications(list);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userProfile?.uid]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Sasa hivi';
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Dakika ${mins} zilizopita`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Saa ${hrs} zilizopita`;
    const days = Math.floor(hrs / 24);
    return `Siku ${days} zilizopita`;
  };

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    setExtraToolsOpen(false);
    setNotifDropdownOpen(false);
  };

  const primaryMenuItems = [
    { id: 'portal', label: 'Nyumbani', icon: BookOpen },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Maktaba Kuu', icon: Library },
    { id: 'masomo', label: 'Masomo', icon: Book },
    { id: 'mitihani', label: 'Mitihani (Past Papers)', icon: FileText },
    { id: 'duka', label: 'Duka (Books)', icon: Store },
    { id: 'fisimaji', label: 'Lupanulla AI', icon: Bot, highlight: true },
    { id: 'workspace', label: 'Maktaba ya Google', icon: Globe },
    { id: 'videos', label: 'Lupa+ Videos', icon: Play },
  ];

  const toolsMenuItems = [
    { id: 'necta-progress', label: 'Maendeleo ya NECTA', icon: CheckCircle2 },
    { id: 'combinations', label: 'Kombination 2025/2026', icon: Award },
    { id: 'resources', label: 'Hub ya Vyanzo vya Elimu', icon: Globe },
    { id: 'forum', label: 'Jukwaa la Jamii', icon: MessageSquare },
    { id: 'live', label: 'Kipindi cha Video', icon: Video },
    { id: 'certificates', label: 'Vyeti Vyangu', icon: Award },
    { id: 'leaderboard', label: 'Viwango vya Tuzo', icon: Trophy },
    { id: 'calculator', label: 'GPA Calculator', icon: Calculator },
    { id: 'kamusi', label: 'Kamusi', icon: BookOpen },
    { id: 'mikoa', label: 'Viwango vya NECTA', icon: Trophy },
    { id: 'ajira', label: 'Ajira za Walimu', icon: Briefcase },
    { id: 'mwalimu-hub', label: 'Mifumo ya Walimu', icon: FileSpreadsheet },
    { id: 'matangazo', label: 'Habari & Kuhusu', icon: Megaphone },
    { id: 'feedback', label: 'Toa Maoni', icon: MessageSquare },
  ];

  const getThemeLabel = (themeId: AppTheme) => {
    switch (themeId) {
      case 'theme-tanzania-forest':
        return '🌲 Tanzania Forest';
      case 'theme-night-mode':
        return '🌙 Night Mode';
      case 'theme-high-contrast':
        return '👁️ High Contrast';
      default:
        return '🌲 Tanzania Forest';
    }
  };

  return (
    <nav ref={navRef} id="app-navbar" className="bg-slate-950 text-white sticky top-0 z-50 shadow-md border-b border-cyan-500/10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo - Tanzanian Educational Pride */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('portal')}>
            <Logo size="md" />
            <div>
              <span className="font-display font-extrabold text-lg tracking-tight block leading-none uppercase">
                Lupanulla
              </span>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mt-0.5">
                Elimu Hub 🇹🇿
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-3xl mx-6">
            {primaryMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all duration-150 tracking-wide ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : item.highlight
                      ? 'text-purple-400 hover:text-purple-300 font-extrabold border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Extra tools dropdown */}
            <div className="relative">
              <button 
                onClick={() => setExtraToolsOpen(!extraToolsOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all duration-150 tracking-wide text-slate-300 hover:bg-slate-900 hover:text-white`}
              >
                <Compass size={14} />
                <span>Ziada</span>
                <span className="text-[9px] text-cyan-400">▼</span>
              </button>

              {extraToolsOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50">
                  {toolsMenuItems.map(tool => {
                    const ToolIcon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleNavClick(tool.id)}
                        className="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wide hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"
                      >
                        <ToolIcon size={14} className="text-cyan-400" />
                        <span>{tool.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* User profile action buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => onChangeLanguage('sw')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all ${
                  language === 'sw'
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Soma kwa Kiswahili"
              >
                🇹🇿 SW
              </button>
              <button
                onClick={() => onChangeLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all ${
                  language === 'en'
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Read in English"
              >
                🇬🇧 EN
              </button>
            </div>

            {/* Theme Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl flex items-center gap-1.5 transition-all text-xs font-bold uppercase"
                title="Badili Mada (Themes)"
              >
                <Palette className="w-4 h-4 text-cyan-400" />
                <span className="hidden xl:inline">{getThemeLabel(theme)}</span>
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50 animate-fade-in text-white">
                  <div className="px-3 py-1 border-b border-slate-800 mb-1 text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Badili Mada / Theme
                  </div>
                  {[
                    { id: 'theme-tanzania-forest', label: 'Tanzania Forest 🌲', desc: 'Teal/Green asili' },
                    { id: 'theme-night-mode', label: 'Night Mode 🌙', desc: 'Mwangaza hafifu' },
                    { id: 'theme-high-contrast', label: 'High Contrast 👁️', desc: 'Uso safi kwa uoni' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onChangeTheme(t.id as any);
                        setThemeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-slate-800 flex flex-col ${
                        theme === t.id ? 'text-cyan-400' : 'text-slate-300'
                      }`}
                    >
                      <span>{t.label}</span>
                      <span className="text-[9px] text-slate-500 font-normal">{t.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            {userProfile && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl relative transition-all"
                  title="Taarifa"
                >
                  {unreadCount > 0 ? (
                    <>
                      <Bell className="w-5 h-5 text-cyan-400 animate-pulse" />
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[8px] font-extrabold text-white rounded-full flex items-center justify-center border border-slate-950">
                        {unreadCount}
                      </span>
                    </>
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </button>

                <AnimatePresence>
                  {notifDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-3 z-50 text-white max-h-[480px] flex flex-col"
                    >
                      <div className="px-4 pb-2 border-b border-slate-800 flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Arifa za Lupanulla</h3>
                          {unreadCount > 0 && <p className="text-[10px] text-slate-400">{unreadCount} mpya hazijasomwa</p>}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllNotificationsAsRead(userProfile.uid, notifications)}
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-extrabold uppercase border border-cyan-500/20 px-2 py-1 rounded-lg bg-cyan-500/5 transition-all"
                          >
                            Soma Zote
                          </button>
                        )}
                      </div>

                      <div className="overflow-y-auto flex-1 divide-y divide-slate-850 max-h-[350px]">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                            <Bell className="w-8 h-8 text-slate-600 stroke-[1.5]" />
                            <p className="text-xs font-semibold">Hakuna taarifa mpya kwa sasa</p>
                          </div>
                        ) : (
                          notifications.map((notif, index) => (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.04 }}
                              key={notif.id}
                              onClick={async () => {
                                await markNotificationAsRead(notif.id);
                                if (notif.link) {
                                  handleNavClick(notif.link);
                                }
                                setNotifDropdownOpen(false);
                              }}
                              className={`p-3.5 hover:bg-slate-850 cursor-pointer transition-all flex gap-3 relative ${
                                !notif.read ? 'bg-cyan-950/10 hover:bg-cyan-950/20' : ''
                              }`}
                            >
                              {!notif.read && (
                                <span className="absolute top-4 right-4 w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
                              )}
                              
                              <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-slate-850 border border-slate-800 text-sm">
                                {notif.type === 'approval' ? '🎉' : notif.type === 'ai_response' ? '🤖' : '📢'}
                              </div>
                              
                              <div className="flex-1 space-y-0.5 pr-2">
                                <div className="flex items-center justify-between">
                                  <h4 className={`text-xs font-bold leading-tight ${!notif.read ? 'text-white' : 'text-slate-300'}`}>
                                    {notif.title}
                                  </h4>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                                  {notif.message}
                                </p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider pt-0.5">
                                  {getRelativeTime(notif.createdAt)}
                                </p>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {userProfile ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 rounded-xl p-1.5 border border-slate-800 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center font-extrabold text-sm uppercase">
                    {userProfile.name.charAt(0)}
                  </div>
                  <div className="pr-2 hidden sm:block">
                    <p className="text-xs font-bold text-white line-clamp-1 max-w-[120px]">{userProfile.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                        (userProfile.subscription === 'premium' || userProfile.role === 'admin' || userProfile.role === 'super_admin')
                          ? 'bg-amber-400 text-amber-950' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                      }`}>
                        {(userProfile.subscription === 'premium' || userProfile.role === 'admin' || userProfile.role === 'super_admin') ? '★ Premium' : 'Bure'}
                      </span>
                    </div>
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50 text-white">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-400 font-semibold">Umeingia kama</p>
                      <p className="text-sm font-bold text-white truncate">{userProfile.email}</p>
                    </div>
                    
                    <button
                      onClick={() => handleNavClick('upload')}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"
                    >
                      <Upload size={14} className="text-cyan-400" />
                      <span>Pakia faili (Upload)</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('premium')}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"
                    >
                      <Crown size={14} className="text-amber-400 animate-pulse" />
                      <span>Jiunge na Premium</span>
                    </button>

                    {(userProfile.role === 'admin' || userProfile.role === 'super_admin') && (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide hover:bg-slate-800 text-rose-400 hover:text-rose-300 flex items-center gap-2"
                      >
                        <ShieldAlert size={14} />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <hr className="my-1 border-slate-800" />

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide hover:bg-red-950/20 text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={14} />
                      <span>Ondoka (Sign Out)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onSignInClick}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 rounded-xl text-xs font-extrabold uppercase tracking-wide shadow-md hover:scale-[1.01] transition-all"
              >
                <LogIn size={14} />
                Ingia (Sign In)
              </button>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex items-center gap-2 lg:hidden">
            {userProfile && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl relative transition-all"
                  title="Taarifa"
                >
                  {unreadCount > 0 ? (
                    <>
                      <Bell className="w-5 h-5 text-cyan-400 animate-pulse" />
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[8px] font-extrabold text-white rounded-full flex items-center justify-center border border-slate-950">
                        {unreadCount}
                      </span>
                    </>
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </button>

                <AnimatePresence>
                  {notifDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-3 z-50 text-white max-h-[400px] flex flex-col"
                    >
                      <div className="px-4 pb-2 border-b border-slate-800 flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Arifa</h3>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllNotificationsAsRead(userProfile.uid, notifications)}
                            className="text-[9px] text-cyan-400 hover:text-cyan-300 font-extrabold uppercase border border-cyan-500/20 px-2 py-0.5 rounded-md bg-cyan-500/5"
                          >
                            Soma Zote
                          </button>
                        )}
                      </div>

                      <div className="overflow-y-auto flex-1 divide-y divide-slate-850 max-h-[300px]">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-slate-500 flex flex-col items-center justify-center gap-1">
                            <Bell className="w-6 h-6 text-slate-600 animate-pulse" />
                            <p className="text-[11px] font-semibold">Hakuna taarifa mpya</p>
                          </div>
                        ) : (
                          notifications.map((notif, index) => (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.04 }}
                              key={notif.id}
                              onClick={async () => {
                                await markNotificationAsRead(notif.id);
                                if (notif.link) {
                                  handleNavClick(notif.link);
                                }
                                setNotifDropdownOpen(false);
                              }}
                              className={`p-2.5 hover:bg-slate-850 cursor-pointer transition-all flex gap-2 relative ${
                                !notif.read ? 'bg-cyan-950/10' : ''
                              }`}
                            >
                              <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-slate-850 border border-slate-800 text-xs">
                                {notif.type === 'approval' ? '🎉' : notif.type === 'ai_response' ? '🤖' : '📢'}
                              </div>
                              
                              <div className="flex-1 space-y-0.5 min-w-0">
                                <h4 className="text-[11px] font-bold truncate">
                                  {notif.title}
                                </h4>
                                <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">
                                  {notif.message}
                                </p>
                                <p className="text-[8px] text-slate-500">
                                  {getRelativeTime(notif.createdAt)}
                                </p>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {!userProfile && (
              <button
                onClick={onSignInClick}
                className="px-3 py-1.5 bg-cyan-500 text-slate-950 rounded-lg text-xs font-extrabold uppercase"
              >
                Ingia
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2.5 hover:bg-slate-900 rounded-xl relative transition-all active:scale-95 border border-slate-800/40 bg-slate-900/20 flex items-center justify-center"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} className="text-cyan-400" /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Premium Sidebar Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] lg:hidden"
            />

            {/* Side Sheet Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[350px] bg-slate-950 border-l border-cyan-500/10 shadow-2xl z-[101] p-5 flex flex-col justify-between overflow-y-auto lg:hidden text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <Logo size="sm" />
                  <div>
                    <span className="font-display font-black text-sm tracking-tight block uppercase text-white">
                      Lupanulla
                    </span>
                    <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider block">
                      Elimu Hub 🇹🇿
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white border border-slate-800/80 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Navigation Links and Selectors */}
              <div className="flex-1 py-4 space-y-5 overflow-y-auto pr-1">
                {/* Main Views */}
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-cyan-500/80 uppercase tracking-widest px-3 mb-1.5">Vipengele Kuu</p>
                  {primaryMenuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                      <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03, type: 'spring', stiffness: 200 }}
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-500/5 text-cyan-400 border border-cyan-500/20 font-extrabold'
                            : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={15} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Extra Tools Section */}
                <div className="space-y-1 pt-1">
                  <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest px-3 mb-1.5">Zana za Masomo (Tools)</p>
                  {toolsMenuItems.map((tool, index) => {
                    const ToolIcon = tool.icon;
                    const isActive = activeView === tool.id;
                    return (
                      <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (primaryMenuItems.length + index) * 0.03, type: 'spring', stiffness: 200 }}
                        key={tool.id}
                        onClick={() => handleNavClick(tool.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-500/20 to-purple-500/5 text-purple-300 border border-purple-500/20 font-extrabold'
                            : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <ToolIcon size={15} className={isActive ? 'text-purple-400' : 'text-cyan-400'} />
                          <span>{tool.label}</span>
                        </div>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Preferences */}
                <div className="space-y-3 pt-3 border-t border-slate-900">
                  {/* Language Switcher */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3">Lugha / Language</p>
                    <div className="grid grid-cols-2 gap-2 px-1">
                      <button
                        onClick={() => onChangeLanguage('sw')}
                        className={`py-2 px-2 text-[10px] font-extrabold uppercase rounded-xl border text-center transition-all ${
                          language === 'sw'
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850'
                        }`}
                      >
                        🇹🇿 Kiswahili
                      </button>
                      <button
                        onClick={() => onChangeLanguage('en')}
                        className={`py-2 px-2 text-[10px] font-extrabold uppercase rounded-xl border text-center transition-all ${
                          language === 'en'
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                    </div>
                  </div>

                  {/* Theme Switcher */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3">Mada / Theme</p>
                    <div className="grid grid-cols-3 gap-1.5 px-1">
                      {[
                        { id: 'theme-tanzania-forest', label: '🌲 Forest' },
                        { id: 'theme-night-mode', label: '🌙 Night' },
                        { id: 'theme-high-contrast', label: '👁️ Contrast' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => onChangeTheme(t.id as any)}
                          className={`py-2 px-1 text-[9px] font-extrabold uppercase rounded-xl border text-center transition-all ${
                            theme === t.id
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Profile Row */}
              <div className="pt-4 border-t border-slate-900">
                {userProfile ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-2 py-1 bg-slate-900/50 rounded-xl border border-slate-800/40">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-slate-950 flex items-center justify-center font-black text-sm">
                        {userProfile.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-white truncate">{userProfile.name}</p>
                        <p className="text-[10px] text-slate-400 truncate leading-none mt-0.5">{userProfile.email}</p>
                      </div>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                        (userProfile.subscription === 'premium' || userProfile.role === 'admin' || userProfile.role === 'super_admin')
                          ? 'bg-amber-400 text-amber-950 shadow-[0_0_8px_rgba(251,191,36,0.3)]' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {(userProfile.subscription === 'premium' || userProfile.role === 'admin' || userProfile.role === 'super_admin') ? '★ Premium' : 'Bure'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-1.5">
                      <button
                        onClick={() => handleNavClick('upload')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase text-slate-300 hover:bg-slate-900 hover:text-white rounded-xl border border-slate-900 transition-all"
                      >
                        <Upload size={14} className="text-cyan-400" />
                        <span>Pakia Faili / Upload</span>
                      </button>

                      {(userProfile.role === 'admin' || userProfile.role === 'super_admin') && (
                        <button
                          onClick={() => handleNavClick('admin')}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase text-rose-400 hover:bg-rose-950/20 rounded-xl border border-rose-950/30 transition-all"
                        >
                          <ShieldAlert size={14} />
                          <span>Admin Dashboard</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase text-red-400 hover:bg-red-950/20 rounded-xl transition-all"
                      >
                        <LogOut size={14} />
                        <span>Ondoka (Sign Out)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignInClick();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg active:scale-95"
                  >
                    <LogIn size={14} />
                    <span>Ingia (Sign In)</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
