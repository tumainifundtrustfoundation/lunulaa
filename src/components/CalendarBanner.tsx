import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Check, 
  Trash2, 
  Sparkles, 
  BookOpen, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ListTodo,
  CalendarDays,
  Bell,
  BellRing,
  BellOff,
  Info
} from 'lucide-react';
import { fetchStudyEvents, saveStudyEvent, deleteStudyEvent } from '../firebase';
import { StudyEvent } from '../types';

interface CalendarBannerProps {
  userProfile: any;
  onNavigate: (view: string) => void;
}

// Swahili translation arrays
const SWAHILI_DAYS = ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'];
const SWAHILI_MONTHS = [
  'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 
  'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'
];

// NECTA upcoming exam dates (estimated based on standard academic calendars)
const NECTA_EXAMS = [
  { id: 'psle', name: 'Darasa la 7 (PSLE)', date: '2026-09-09', desc: 'Mtihani wa Kumaliza Elimu ya Msingi' },
  { id: 'csee', name: 'Kidato cha 4 (CSEE)', date: '2026-11-02', desc: 'Mtihani wa Kidato cha Nne' },
  { id: 'ftsee', name: 'Kidato cha 2 (FTSEE)', date: '2026-11-09', desc: 'Upimaji wa Kitaifa Kidato cha Pili' },
  { id: 'acsee', name: 'Kidato cha 6 (ACSEE)', date: '2027-05-03', desc: 'Mtihani wa Kidato cha Sita' },
];

export default function CalendarBanner({ userProfile, onNavigate }: CalendarBannerProps) {
  const [now, setNow] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reminder system state stored in localStorage
  const [registeredReminders, setRegisteredReminders] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('study_reminders_registered');
      return saved ? JSON.parse(saved) : ['psle', 'csee', 'ftsee', 'acsee']; // Default opt-in to standard national exams
    } catch {
      return ['psle', 'csee', 'ftsee', 'acsee'];
    }
  });

  const [globalRemindersEnabled, setGlobalRemindersEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('global_reminders_enabled');
      return saved !== 'false'; // Defaults to true
    } catch {
      return true;
    }
  });

  const [dismissedTomorrowAlert, setDismissedTomorrowAlert] = useState<boolean>(false);
  const [eventWantsReminder, setEventWantsReminder] = useState<boolean>(true);

  // Sync reminder preferences to localStorage
  useEffect(() => {
    localStorage.setItem('study_reminders_registered', JSON.stringify(registeredReminders));
  }, [registeredReminders]);

  useEffect(() => {
    localStorage.setItem('global_reminders_enabled', String(globalRemindersEnabled));
  }, [globalRemindersEnabled]);

  const toggleReminderRegistration = (id: string) => {
    setRegisteredReminders(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const getTomorrowEvents = () => {
    if (!globalRemindersEnabled) return [];

    // Get tomorrow's date string YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowStr = `${y}-${m}-${d}`;

    const scrollingEvents = getScrollingEvents();
    return scrollingEvents.filter(ev => ev.rawDate === tomorrowStr && registeredReminders.includes(ev.id));
  };

  // New Event Form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventSubject, setEventSubject] = useState('');
  const [eventNotes, setEventNotes] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);

  // Floating Marquee details state
  const [activeDetailEvent, setActiveDetailEvent] = useState<any | null>(null);

  // Combine NECTA exams with upcoming user-created events for the marquee
  const getScrollingEvents = () => {
    const list = NECTA_EXAMS.map(exam => ({
      id: exam.id,
      title: `🚨 MTIIHANI WA TAIFA: ${exam.name}`,
      rawDate: exam.date,
      type: 'necta_exam',
      badge: 'NECTA National',
      desc: exam.desc,
      color: 'bg-rose-600 text-white'
    }));

    // Add user study events (not completed yet, from today onwards)
    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingUserEvents = events
      .filter(e => !e.isCompleted && e.date >= todayStr)
      .map(e => ({
        id: e.id,
        title: `📅 RATIBA: ${e.title}`,
        rawDate: e.date,
        type: 'user_event',
        badge: e.subject || 'Masomo',
        desc: e.notes || 'Hakuna dokezo la ziada lililohifadhiwa.',
        color: 'bg-cyan-600 text-white'
      }));

    return [...list, ...upcomingUserEvents];
  };

  // Auto-updating live clock/date
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    // Default selected date is today
    const yearStr = now.getFullYear();
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const dayStr = String(now.getDate()).padStart(2, '0');
    setSelectedDate(`${yearStr}-${monthStr}-${dayStr}`);

    return () => clearInterval(interval);
  }, []);

  // Fetch student scheduled events from Firestore
  useEffect(() => {
    if (!userProfile?.uid) return;

    const loadEvents = async () => {
      setLoading(true);
      try {
        const data = await fetchStudyEvents(userProfile.uid);
        setEvents(data);
      } catch (err) {
        console.error('Failed to load study events:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [userProfile?.uid]);

  // Handle switching calendar months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Build Calendar Matrix grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = [];
  // Fill in blanks for padding of previous month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  // Fill in actual month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  // Formatting helper for Swahili Full Date
  const getSwahiliFullDate = (dateObj: Date) => {
    const dayName = SWAHILI_DAYS[dateObj.getDay()];
    const dateNum = dateObj.getDate();
    const monthName = SWAHILI_MONTHS[dateObj.getMonth()];
    const yearNum = dateObj.getFullYear();
    const hour = String(dateObj.getHours()).padStart(2, '0');
    const min = String(dateObj.getMinutes()).padStart(2, '0');
    const sec = String(dateObj.getSeconds()).padStart(2, '0');
    return `${dayName}, ${dateNum} ${monthName} ${yearNum} - ${hour}:${min}:${sec}`;
  };

  // Countdown calculations
  const getCountdownString = (examDateStr: string) => {
    const examDate = new Date(examDateStr);
    const difference = examDate.getTime() - now.getTime();
    if (difference <= 0) return 'Tayari umepita au unafanyika leo!';
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days} Siku na ${hours} Saa zimebaki`;
  };

  // Add Event
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid || !eventTitle.trim() || !selectedDate) return;

    setSubmitting(true);
    try {
      const eventId = await saveStudyEvent({
        userId: userProfile.uid,
        title: eventTitle.trim(),
        date: selectedDate,
        subject: eventSubject.trim() || undefined,
        notes: eventNotes.trim() || undefined,
        isCompleted: false
      });

      const newEvent: StudyEvent = {
        id: eventId,
        userId: userProfile.uid,
        title: eventTitle.trim(),
        date: selectedDate,
        subject: eventSubject.trim() || undefined,
        notes: eventNotes.trim() || undefined,
        isCompleted: false,
        createdAt: Date.now()
      };

      setEvents(prev => [...prev, newEvent]);
      
      if (eventWantsReminder) {
        setRegisteredReminders(prev => [...prev, eventId]);
      }

      setEventTitle('');
      setEventSubject('');
      setEventNotes('');
      setShowEventForm(false);
    } catch (err) {
      console.error('Failed to save study event:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Event Completion
  const handleToggleEvent = async (event: StudyEvent) => {
    try {
      const updatedStatus = !event.isCompleted;
      await saveStudyEvent({
        ...event,
        isCompleted: updatedStatus
      });

      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, isCompleted: updatedStatus } : e));
    } catch (err) {
      console.error('Failed to toggle event state:', err);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteStudyEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err) {
      console.error('Failed to delete study event:', err);
    }
  };

  // Filtering events for current active selection day
  const activeDayEvents = events.filter(e => e.date === selectedDate);
  const totalCompletedEvents = events.filter(e => e.isCompleted).length;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden font-sans">
      
      {/* ── MATUKIO MUHIMU: FLOATING LEFT-TO-RIGHT MARQUEE TICKER ── */}
      <div className="bg-amber-500/10 border-b border-slate-100 py-2.5 px-4 overflow-hidden relative flex items-center gap-3">
        {/* Fixed Title Label on the left to indicate what it is */}
        <div className="bg-amber-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm shrink-0 flex items-center gap-1 z-20">
          <Sparkles size={11} className="animate-spin-slow text-amber-100" />
          <span>Matukio Muhimu</span>
        </div>
        
        {/* Scrolling text area */}
        <div className="relative w-full overflow-hidden flex items-center h-6">
          <div className="animate-marquee-ltr flex items-center gap-12 select-none">
            {getScrollingEvents().length === 0 ? (
              <span className="text-[11px] font-bold text-slate-500">
                Hakuna matukio yaliyopangwa kwa sasa. Ongeza ratiba yako mpya sasa!
              </span>
            ) : (
              // Repeat list so it fills the scrolling space and scrolls smoothly
              [...getScrollingEvents(), ...getScrollingEvents()].map((ev, idx) => (
                <button
                  key={`${ev.id}-${idx}`}
                  type="button"
                  onClick={() => setActiveDetailEvent(ev)}
                  className="inline-flex items-center gap-2 hover:scale-[1.02] transition-all text-left group cursor-pointer"
                  title="Bofya kufungua tukio hili"
                >
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${ev.color} tracking-wider shrink-0`}>
                    {ev.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-cyan-600 transition-colors flex items-center gap-1.5 whitespace-nowrap">
                    {ev.title} 
                    <span className="text-[10px] text-cyan-600 font-mono">({getCountdownString(ev.rawDate)})</span>
                  </span>
                  <span className="text-slate-300 font-bold ml-1">|</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── ALARM / REMINDER BOX: KESHO KUNA TUKIO MUHIMU! (TOMORROW REMINDER ALERT) ── */}
      {getTomorrowEvents().length > 0 && !dismissedTomorrowAlert && (
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top duration-200 border-b border-rose-700">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 p-2.5 rounded-full animate-bounce shrink-0 mt-0.5">
              <BellRing size={20} className="text-white" />
            </div>
            <div className="space-y-0.5">
              <span className="inline-block bg-white/25 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded mb-1">
                Kumbusho la Siku 1 Kabla!
              </span>
              <h4 className="text-xs sm:text-sm font-black leading-snug">
                {getTomorrowEvents().map((ev, i) => (
                  <span key={ev.id}>
                    {i > 0 && ", "}
                    <button 
                      onClick={() => setActiveDetailEvent(ev)}
                      className="underline font-extrabold hover:text-rose-100"
                    >
                      {ev.title.replace('🚨 MTIIHANI WA TAIFA: ', '').replace('📅 RATIBA: ', '')}
                    </button>
                  </span>
                ))}
                {" "}kesho tarehe {new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString('sw-TZ', { day: 'numeric', month: 'long', year: 'numeric' })}!
              </h4>
              <p className="text-[11px] text-white/90 font-medium">
                Kipindi hiki kimekaribia! Fanya mazoezi ya mitihani au pitia dondoo zako sasa ili ujiandae kikamilifu.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => {
                // Open the first tomorrow event details
                setActiveDetailEvent(getTomorrowEvents()[0]);
              }}
              className="bg-white text-rose-700 font-black text-[11px] uppercase tracking-wider px-3.5 py-2 rounded-xl shadow hover:bg-rose-50 transition-all cursor-pointer"
            >
              Maelezo
            </button>
            <button
              onClick={() => setDismissedTomorrowAlert(true)}
              className="p-1.5 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all cursor-pointer"
              title="Funga kumbusho hili"
            >
              <Plus size={16} className="rotate-45" />
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Header Banner with Swahili Clock */}
      <div className="bg-gradient-to-r from-cyan-900 via-slate-900 to-emerald-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none"></div>
        
        <div className="space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-cyan-400/20">
            <Clock size={12} className="animate-pulse" /> Kalenda na Ratiba Halisi
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white uppercase">
            Mratibu wa Kipindi cha Masomo
          </h2>
          {/* Swahili Real-time Auto-updating Date String */}
          <p className="text-xs sm:text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Calendar size={14} className="text-cyan-400" />
            <span className="font-mono text-cyan-200 tracking-wide">{getSwahiliFullDate(now)}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {/* Global Reminder Controller Switch */}
          <button
            onClick={() => setGlobalRemindersEnabled(prev => !prev)}
            className={`flex items-center gap-2.5 border px-4 py-2.5 rounded-2xl shrink-0 backdrop-blur-md transition-all cursor-pointer text-left ${
              globalRemindersEnabled 
                ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25' 
                : 'bg-rose-500/15 border-rose-400/30 text-rose-300 hover:bg-rose-500/25'
            }`}
            title={globalRemindersEnabled ? "Kumbusho za Siku 1 Kabla zimeruhusiwa" : "Kumbusho za Siku 1 Kabla zimezimwa"}
          >
            {globalRemindersEnabled ? (
              <Bell size={16} className="text-emerald-400 shrink-0" />
            ) : (
              <BellOff size={16} className="text-rose-400 shrink-0" />
            )}
            <div>
              <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">Kumbusho</span>
              <span className="text-[10px] font-black">{globalRemindersEnabled ? "ZIMEWASHWA" : "ZIMEZIMWA"}</span>
            </div>
          </button>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl shrink-0 backdrop-blur-md">
            <div className="text-right">
              <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Malengo ya Kusoma</span>
              <span className="text-xs font-black text-slate-100">{totalCompletedEvents} / {events.length} Mazoezi Mapishi</span>
            </div>
            <CheckCircle2 size={22} className="text-cyan-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-t border-slate-100">
        
        {/* LEFT PANEL: Interactive Calendar Grid (Column Span 7) */}
        <div className="lg:col-span-7 p-6 border-r border-slate-100 space-y-6">
          
          {/* Calendar Header with navigation switches */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="text-cyan-600" size={18} />
              <h3 className="text-sm font-black text-slate-900 uppercase">
                {SWAHILI_MONTHS[currentMonth]} {currentYear}
              </h3>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={handlePrevMonth}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => {
                  setCurrentMonth(now.getMonth());
                  setCurrentYear(now.getFullYear());
                }}
                className="px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Leo
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Calendar Grid Header (Days of week) */}
          <div className="grid grid-cols-7 gap-1 text-center border-b border-slate-100 pb-2">
            {['Jp', 'Jt', 'Jn', 'Jt', 'Al', 'Ij', 'Jm'].map((d, index) => (
              <span key={index} className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Grid Body */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="aspect-square bg-slate-50/20 rounded-xl"></div>;
              }

              const formattedMonth = String(currentMonth + 1).padStart(2, '0');
              const formattedDay = String(day).padStart(2, '0');
              const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
              const isSelected = selectedDate === dateStr;
              
              // Is today?
              const isToday = now.getDate() === day && now.getMonth() === currentMonth && now.getFullYear() === currentYear;

              // Check if there are events for this date
              const dayHasEvents = events.some(e => e.date === dateStr);
              const dayHasCompletedEvents = dayHasEvents && events.filter(e => e.date === dateStr).every(e => e.isCompleted);

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square relative rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                    isSelected 
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/10 scale-105 z-10' 
                      : isToday 
                        ? 'bg-slate-900 text-white' 
                        : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{day}</span>
                  
                  {/* Small Dots under number */}
                  {dayHasEvents && (
                    <span className={`absolute bottom-1 w-1 h-1 rounded-full ${
                      isSelected 
                        ? 'bg-white' 
                        : dayHasCompletedEvents 
                          ? 'bg-emerald-500' 
                          : 'bg-cyan-500'
                    }`}></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* NECTA National Exam Counter countdown card inside calendar */}
          <div className="border border-slate-200/80 rounded-2xl p-4.5 bg-slate-50 space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan-600" /> Malengo & Hesabu ya Mtihani (NECTA Countdown)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NECTA_EXAMS.map(exam => {
                return (
                  <div key={exam.id} className="bg-white border border-slate-200 p-3 rounded-xl flex flex-col justify-between space-y-1">
                    <div>
                      <span className="block text-[10px] font-black uppercase text-slate-800">{exam.name}</span>
                      <span className="text-[9px] text-slate-400 font-semibold">{exam.desc}</span>
                    </div>
                    <span className="block text-[10px] font-black text-cyan-700 font-mono mt-1">
                      {getCountdownString(exam.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: Selected Day Events & Planning (Column Span 5) */}
        <div className="lg:col-span-5 p-6 bg-slate-50/60 flex flex-col justify-between min-h-[420px]">
          
          <div className="space-y-4">
            
            {/* Header for selected day */}
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Ratiba ya Siku</span>
                <span className="text-sm font-black text-slate-900 uppercase">
                  {selectedDate ? new Date(selectedDate).toLocaleDateString('sw-TZ', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </span>
              </div>
              <button
                onClick={() => setShowEventForm(prev => !prev)}
                className="p-2 bg-white border border-slate-200 text-cyan-600 hover:text-cyan-700 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-center shadow-sm cursor-pointer"
                title="Sajili Ratiba Mpya"
              >
                {showEventForm ? <ChevronLeft size={14} /> : <Plus size={14} />}
              </button>
            </div>

            {/* Event entry form */}
            {showEventForm ? (
              <form onSubmit={handleAddEvent} className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3.5 animate-in slide-in-from-top-2 duration-150">
                <h4 className="text-xs font-black uppercase text-slate-900">Sajili Kipindi Kipya</h4>
                
                <div className="space-y-1">
                  <label className="block text-[9px] font-extrabold uppercase text-slate-400">Jina la Kipindi (e.g. Maswali ya Optics)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pitia Form 4 Chemistry 2021"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-extrabold uppercase text-slate-400">Somo (e.g. Physics)</label>
                    <input
                      type="text"
                      placeholder="e.g. Chemistry"
                      value={eventSubject}
                      onChange={(e) => setEventSubject(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-extrabold uppercase text-slate-400">Tarehe ya Tukio</label>
                    <input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-extrabold uppercase text-slate-400">Maelezo/Malengo binafsi</label>
                  <textarea
                    placeholder="e.g. Kupima uwezo kwenye mada ya Organic Chemistry"
                    value={eventNotes}
                    onChange={(e) => setEventNotes(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <input
                    type="checkbox"
                    id="eventWantsReminder"
                    checked={eventWantsReminder}
                    onChange={(e) => setEventWantsReminder(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500 cursor-pointer"
                  />
                  <label htmlFor="eventWantsReminder" className="text-[10px] font-black uppercase text-slate-600 cursor-pointer flex items-center gap-1">
                    <Bell size={12} className="text-cyan-600" />
                    Nikumbushe siku 1 kabla ya tukio hili
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Ghairi
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-black transition-all flex items-center gap-1.5"
                  >
                    {submitting ? 'Inahifadhi...' : 'Hifadhi Kipindi'}
                  </button>
                </div>
              </form>
            ) : (
              /* Events List container */
              <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
                {loading ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-bold">Inapakia ratiba...</div>
                ) : activeDayEvents.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-white/60 space-y-2">
                    <ListTodo className="mx-auto text-slate-300" size={32} />
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase">Hakuna ratiba leo</p>
                    <button 
                      onClick={() => setShowEventForm(true)}
                      className="text-[10px] font-black text-cyan-600 hover:text-cyan-700 uppercase"
                    >
                      Bofya kuongeza ratiba mpya
                    </button>
                  </div>
                ) : (
                  activeDayEvents.map(ev => {
                    return (
                      <div 
                        key={ev.id} 
                        className={`bg-white border rounded-xl p-3 flex items-start justify-between gap-3 shadow-sm transition-all ${
                          ev.isCompleted 
                            ? 'border-emerald-200 bg-emerald-50/5' 
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Checkbox box */}
                          <button
                            onClick={() => handleToggleEvent(ev)}
                            className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                              ev.isCompleted 
                                ? 'bg-emerald-500 border-transparent text-white' 
                                : 'border-slate-300 bg-white hover:border-cyan-500'
                            }`}
                          >
                            {ev.isCompleted && <Check size={11} />}
                          </button>
                          
                          <div className="space-y-0.5">
                            <p className={`text-xs font-bold leading-tight ${
                              ev.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}>
                              {ev.title}
                            </p>
                            {ev.subject && (
                              <span className="inline-block text-[8px] uppercase font-black tracking-wider bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                {ev.subject}
                              </span>
                            )}
                            {ev.notes && (
                              <p className="text-[10px] text-slate-500 font-medium italic mt-0.5">
                                {ev.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                          title="Futa ratiba hii"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

          </div>

          {/* Quick study Tip display */}
          <div className="border-t border-slate-150 pt-3 mt-4 text-[10px] text-slate-500 leading-relaxed font-semibold flex items-center gap-1.5">
            <BookOpen size={12} className="text-cyan-600" />
            <span>Chagua siku kwenye kalenda kuona na kupanga vipindi vyako binafsi vya kujiandaa.</span>
          </div>

        </div>

      </div>

      {/* ── MODAL YA DETAILS YA MATUKIO (EVENT DETAILS DIALOG) ── */}
      {activeDetailEvent && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-800">
            {/* Header with corresponding color gradient */}
            <div className={`p-6 ${activeDetailEvent.type === 'necta_exam' ? 'bg-gradient-to-br from-rose-900 to-slate-900' : 'bg-gradient-to-br from-cyan-950 to-slate-900'} text-white relative`}>
              <button 
                onClick={() => setActiveDetailEvent(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all cursor-pointer"
              >
                <Plus size={16} className="rotate-45" />
              </button>
              <span className={`inline-block text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${activeDetailEvent.color} tracking-wider mb-2`}>
                {activeDetailEvent.badge}
              </span>
              <h3 className="text-base font-black tracking-tight uppercase leading-tight">
                {activeDetailEvent.title.replace('🚨 MTIIHANI WA TAIFA: ', '').replace('📅 RATIBA: ', '')}
              </h3>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-slate-50 text-slate-700 rounded-xl">
                  <Calendar size={18} className="text-cyan-600" />
                </div>
                <div>
                  <span className="block text-[9px] font-black uppercase text-slate-400">Tarehe ya Tukio</span>
                  <span className="text-xs font-black text-slate-800">
                    {new Date(activeDetailEvent.rawDate).toLocaleDateString('sw-TZ', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
                  <Clock size={18} className="text-rose-600 animate-pulse" />
                </div>
                <div>
                  <span className="block text-[9px] font-black uppercase text-rose-400">Muda Unaobaki (Countdown)</span>
                  <span className="text-xs font-black text-rose-700 font-mono">
                    {getCountdownString(activeDetailEvent.rawDate)}
                  </span>
                </div>
              </div>

              <div className="space-y-1 bg-slate-50 p-4 rounded-2xl">
                <span className="block text-[9px] font-black uppercase text-slate-400">Maelezo ya Tukio</span>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  {activeDetailEvent.desc}
                </p>
              </div>

              {/* Registration and Tomorrow's Alarm Preferences (stored in localStorage) */}
              <div className="bg-cyan-50/60 border border-cyan-100 p-4 rounded-2xl flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellRing size={16} className={registeredReminders.includes(activeDetailEvent.id) ? "text-cyan-600 animate-bounce" : "text-slate-400"} />
                    <div>
                      <span className="block text-[9px] font-black uppercase text-slate-500">Majiandikisho ya Kumbusho</span>
                      <span className="text-xs font-black text-slate-800">
                        {registeredReminders.includes(activeDetailEvent.id) ? 'Kumbusho Siku 1 Kabla Lipo Active' : 'Kumbusho Halipo Active'}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => toggleReminderRegistration(activeDetailEvent.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                      registeredReminders.includes(activeDetailEvent.id)
                        ? 'bg-rose-100 hover:bg-rose-200 text-rose-700'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
                    }`}
                  >
                    {registeredReminders.includes(activeDetailEvent.id) ? 'Zima Kumbusho' : 'Washa Kumbusho'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  Ukisajili kumbusho hili, mfumo utakukumbusha hapa masaa 24 kabla ya tukio kuanza. Taarifa hizi zinatunzwa salama kwenye kifaa chako binafsi.
                </p>
              </div>

              {/* Encouragement / Motivational message depending on event type */}
              <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl flex gap-3">
                <Sparkles className="text-emerald-600 shrink-0 mt-0.5" size={16} />
                <div className="space-y-1">
                  <span className="block text-[9px] font-black uppercase text-emerald-800">Ushauri na Hamasa</span>
                  <p className="text-[11px] text-emerald-800 font-semibold leading-relaxed">
                    {activeDetailEvent.type === 'necta_exam' 
                      ? "Nguvu ya kufanikiwa ipo mikononi mwako! Anza kujiandaa mapema kupitia Zoezi la Saa na ufanye mitihani ya miaka iliyopita. Ukweli ni kwamba kufanya mazoezi kwa bidii ndio siri ya kupata daraja bora zaidi (Division I / Distinctions)."
                      : "Panga muda wako vizuri na ufuate ratiba yako kwa uaminifu. Kila hatua ndogo unayopiga leo inakusogeza karibu na ushindi wako mkubwa wa kitaifa!"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Footer with actions */}
            <div className="bg-slate-50 p-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveDetailEvent(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
              >
                Funga Dirisha
              </button>
              
              {activeDetailEvent.type === 'necta_exam' ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveDetailEvent(null);
                    onNavigate('mitihani'); // Go to Mitihani View
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Anza Mazoezi Sasa
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    // Set selectedDate to this event's date
                    setSelectedDate(activeDetailEvent.rawDate);
                    // Open form if needed or just highlight
                    setActiveDetailEvent(null);
                  }}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Fungua Kwenye Kalenda
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
