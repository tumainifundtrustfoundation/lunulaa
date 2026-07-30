import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  PlusCircle, 
  ExternalLink, 
  Play, 
  CheckCircle2, 
  TrendingUp, 
  FileVideo, 
  BookOpen, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface LiveClass {
  id: string;
  topic: string;
  subject: string;
  teacher: string;
  platform: 'Zoom' | 'Google Meet' | 'Lupa+';
  url: string;
  date: string;
  time: string;
  durationMinutes: number;
  grade: string;
  status: 'upcoming' | 'live' | 'ended';
  enrolledStudentsCount: number;
  isCheckedIn?: boolean;
}

interface Recording {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  duration: string;
  views: number;
  coverImage: string;
}

interface LiveClassesViewProps {
  language: 'sw' | 'en';
  userProfile: any;
}

export default function LiveClassesView({ language, userProfile }: LiveClassesViewProps) {
  const [classes, setClasses] = useState<LiveClass[]>([
    {
      id: '1',
      topic: 'Solving Complex Trigonometric Functions & Identites',
      subject: 'Mathematics',
      teacher: 'Mwalimu Frank Mlay',
      platform: 'Zoom',
      url: 'https://zoom.us/j/test-meeting-id',
      date: new Date().toISOString().split('T')[0], // Today
      time: '16:00',
      durationMinutes: 60,
      grade: 'Kidato cha Sita (Form 6)',
      status: 'live',
      enrolledStudentsCount: 142
    },
    {
      id: '2',
      topic: 'Organic Chemistry: Mechanism of Electrophilic Substitution',
      subject: 'Chemistry',
      teacher: 'Dr. Neema Lema',
      platform: 'Google Meet',
      url: 'https://meet.google.com/abc-defg-hij',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      time: '10:00',
      durationMinutes: 90,
      grade: 'Kidato cha Tano (Form 5)',
      status: 'upcoming',
      enrolledStudentsCount: 89
    },
    {
      id: '3',
      topic: 'Mbinu za Kujibu Maswali ya Insha kwenye Mtihani wa Kiswahili NECTA',
      subject: 'Kiswahili',
      teacher: 'Mwl. Christopher Kidanka',
      platform: 'Lupa+',
      url: '#',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      time: '14:30',
      durationMinutes: 45,
      grade: 'Kidato cha Nne (Form 4)',
      status: 'upcoming',
      enrolledStudentsCount: 231
    }
  ]);

  const [recordings] = useState<Recording[]>([
    {
      id: 'r1',
      title: 'Kuelewa Newton`s Laws of Motion kwa Mifano ya Kila Siku',
      subject: 'Physics',
      teacher: 'Mwl. Frank Mlay',
      duration: '42:15',
      views: 1450,
      coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop'
    },
    {
      id: 'r2',
      title: 'Introduction to Cell Biology & Cytology Structure',
      subject: 'Biology',
      teacher: 'Sister Martha',
      duration: '58:40',
      views: 980,
      coverImage: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=2080&auto=format&fit=crop'
    },
    {
      id: 'r3',
      title: 'Commercial Geography: Dynamic Agriculture in East Africa',
      subject: 'Geography',
      teacher: 'Mwl. Richard John',
      duration: '35:20',
      views: 670,
      coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop'
    }
  ]);

  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [scheduledTopic, setScheduledTopic] = useState('');
  const [scheduledSubject, setScheduledSubject] = useState('Mathematics');
  const [scheduledTeacher, setScheduledTeacher] = useState('');
  const [scheduledPlatform, setScheduledPlatform] = useState<'Zoom' | 'Google Meet' | 'Lupa+'>('Zoom');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledDuration, setScheduledDuration] = useState(60);
  const [scheduledGrade, setScheduledGrade] = useState('Kidato cha Nne (Form 4)');

  const dict = {
    sw: {
      header: 'Madarasa ya Mubashara (Live Classes)',
      subHeader: 'Kutana, jadiliana na jifunze moja kwa moja na walimu bora nchini kupitia video za mwingiliano.',
      upcomingTitle: 'Vipindi Vijavyo na Vilivyo Mubashara',
      addBtn: 'Panga Darasa Jipya',
      liveBadge: 'MUBASHARA (LIVE)',
      upcomingBadge: 'KIPINDI KIJAVYO',
      endedBadge: 'KIPINDI KIMEISHA',
      joinClass: 'Jiunge na Darasa Sasa',
      checkIn: 'Weka Mahudhurio',
      enrolled: 'Wanafunzi waliojisajili',
      grade: 'Darasa',
      teacher: 'Mwalimu',
      duration: 'Muda',
      platform: 'Mtandao',
      checkInSuccess: 'Mahudhurio yako yamerekodiwa kikamilifu! Pata alama za XP.',
      recordingsTitle: 'Maktaba ya Vipindi Vilivyorekodiwa',
      views: 'mionekano',
      addNewTitle: 'Panga Darasa la Mubashara',
      topicLabel: 'Mada ya Somo',
      subjectLabel: 'Somo (Subject)',
      teacherLabel: 'Jina la Mwalimu',
      dateLabel: 'Tarehe',
      timeLabel: 'Saa za Darasani (EAT)',
      durationLabel: 'Muda (Dakika)',
      gradeLabel: 'Kidato/Ngazi ya Masomo',
      cancel: 'Ghairi',
      scheduleBtn: 'Panga Darasa',
      attendanceCount: 'Mahudhurio Yangu',
      noClasses: 'Hakuna madarasa ya mubashara yaliyopangwa kwa sasa.'
    },
    en: {
      header: 'Live Interactive Classes',
      subHeader: 'Meet, interact and learn live with top certified tutors via collaborative video classrooms.',
      upcomingTitle: 'Upcoming & Live Academic Sessions',
      addBtn: 'Schedule New Session',
      liveBadge: 'LIVE NOW',
      upcomingBadge: 'UPCOMING',
      endedBadge: 'ENDED',
      joinClass: 'Join Session Now',
      checkIn: 'Mark Attendance',
      enrolled: 'Registered students',
      grade: 'Grade/Form',
      teacher: 'Tutor',
      duration: 'Duration',
      platform: 'Platform',
      checkInSuccess: 'Your attendance is logged successfully! Keep up the XP streak.',
      recordingsTitle: 'Archived Recorded Classes',
      views: 'views',
      addNewTitle: 'Schedule Live Class',
      topicLabel: 'Lesson Topic',
      subjectLabel: 'Subject',
      teacherLabel: 'Teacher Name',
      dateLabel: 'Date',
      timeLabel: 'Class Time (EAT)',
      durationLabel: 'Duration (Minutes)',
      gradeLabel: 'Class Grade Level',
      cancel: 'Cancel',
      scheduleBtn: 'Schedule Session',
      attendanceCount: 'My Attendances',
      noClasses: 'No live sessions scheduled at the moment.'
    }
  }[language];

  const handleScheduleClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledTopic.trim() || !scheduledTeacher.trim() || !scheduledDate || !scheduledTime) return;

    const newSession: LiveClass = {
      id: String(classes.length + 1),
      topic: scheduledTopic.trim(),
      subject: scheduledSubject,
      teacher: scheduledTeacher.trim(),
      platform: scheduledPlatform,
      url: scheduledPlatform === 'Zoom' ? 'https://zoom.us/j/dummy-id' : 'https://meet.google.com/dummy-id',
      date: scheduledDate,
      time: scheduledTime,
      durationMinutes: Number(scheduledDuration),
      grade: scheduledGrade,
      status: 'upcoming',
      enrolledStudentsCount: 1
    };

    setClasses([newSession, ...classes]);
    setShowAddClassModal(false);

    // Reset Form
    setScheduledTopic('');
    setScheduledTeacher('');
    setScheduledDate('');
    setScheduledTime('');
    setScheduledDuration(60);
  };

  const handleCheckIn = (classId: string) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        if (!c.isCheckedIn) {
          alert(dict.checkInSuccess);
          return { ...c, isCheckedIn: true, enrolledStudentsCount: c.enrolledStudentsCount + 1 };
        }
      }
      return c;
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-600 via-red-800 to-indigo-950 border border-red-500/10 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Video size={28} className="text-red-400 animate-pulse" />
            {dict.header}
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            {dict.subHeader}
          </p>
        </div>
        {(userProfile?.role === 'teacher' || userProfile?.role === 'admin') && (
          <button 
            onClick={() => setShowAddClassModal(true)}
            className="bg-white hover:bg-slate-100 text-red-950 font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0"
          >
            <PlusCircle size={16} />
            {dict.addBtn}
          </button>
        )}
      </div>

      {/* Live Class Schedule Section */}
      <div className="space-y-4">
        <h2 className="font-display font-black text-slate-900 text-base sm:text-lg uppercase tracking-tight border-b border-slate-200 pb-2">
          {dict.upcomingTitle}
        </h2>

        {classes.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-3xl p-6">
            <AlertCircle size={32} className="text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500 text-sm font-semibold">{dict.noClasses}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((c) => (
              <div 
                key={c.id} 
                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between hover:shadow-md relative overflow-hidden ${
                  c.status === 'live' ? 'border-red-500 bg-red-500/5 ring-1 ring-red-500/25' : 'border-slate-200'
                }`}
              >
                {/* Live glow header badge */}
                {c.status === 'live' && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-bl-xl animate-pulse">
                    {dict.liveBadge}
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                      {c.subject}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                      {c.grade}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-slate-950 text-base leading-snug line-clamp-2">
                    {c.topic}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-500 font-semibold pt-1">
                    <p className="flex items-center gap-1.5 text-slate-700">
                      <span className="font-bold text-[10px] text-slate-400 uppercase">{dict.teacher}:</span> {c.teacher}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" /> {new Date(c.date).toLocaleDateString()}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock size={13} className="text-slate-400" /> {c.time} EAT ({c.durationMinutes} {language === 'sw' ? 'Dakika' : 'Mins'})
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Users size={13} className="text-slate-400" /> {c.enrolledStudentsCount} {dict.enrolled}
                    </p>
                    <p className="flex items-center gap-1.5 text-indigo-600">
                      <span className="font-bold text-[10px] text-slate-400 uppercase">{dict.platform}:</span> {c.platform}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 mt-3 border-t border-slate-100">
                  <button 
                    disabled={c.isCheckedIn}
                    onClick={() => handleCheckIn(c.id)}
                    className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase transition-all border ${
                      c.isCheckedIn 
                        ? 'bg-green-150 border-green-200 text-green-800 font-black flex items-center justify-center gap-1' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {c.isCheckedIn ? (
                      <>
                        <CheckCircle2 size={12} /> OK
                      </>
                    ) : (
                      dict.checkIn
                    )}
                  </button>

                  <a 
                    href={c.url === '#' ? undefined : c.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase text-center transition-all shadow-sm flex items-center justify-center gap-1 ${
                      c.status === 'live' 
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/10' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {c.status === 'live' ? dict.joinClass : 'Link'} <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recorded Classes Archives */}
      <div className="space-y-4 pt-6">
        <h2 className="font-display font-black text-slate-900 text-base sm:text-lg uppercase tracking-tight border-b border-slate-200 pb-2 flex items-center gap-1.5">
          <TrendingUp size={18} className="text-cyan-500" />
          {dict.recordingsTitle}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.map((r) => (
            <div 
              key={r.id} 
              className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="relative h-44 bg-slate-950 overflow-hidden flex items-center justify-center">
                <img 
                  src={r.coverImage} 
                  alt={r.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80" 
                />
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-11 h-11 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play size={18} className="fill-current ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-[10px] font-extrabold px-2 py-0.5 rounded">
                  {r.duration}
                </span>
              </div>
              
              <div className="p-4 space-y-1.5">
                <span className="bg-cyan-50 text-cyan-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                  {r.subject}
                </span>
                <h4 className="font-display font-bold text-slate-950 text-sm leading-snug group-hover:text-cyan-600 transition-colors line-clamp-2">
                  {r.title}
                </h4>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold pt-1.5">
                  <span>{r.teacher}</span>
                  <span>{r.views.toLocaleString()} {dict.views}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Class Modal Form */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-slate-950/65 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="font-display font-black text-slate-900 text-lg sm:text-xl uppercase flex items-center gap-1.5">
                <PlusCircle size={22} className="text-red-500" />
                {dict.addNewTitle}
              </h2>
              <button 
                onClick={() => setShowAddClassModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                {/* Close component */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleScheduleClass} className="space-y-4 text-xs sm:text-sm font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-extrabold uppercase text-[10px] tracking-wide block">{dict.topicLabel}</label>
                <input 
                  type="text"
                  required
                  value={scheduledTopic}
                  onChange={(e) => setScheduledTopic(e.target.value)}
                  placeholder="Mada kuu ya kipindi..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-extrabold uppercase text-[10px] tracking-wide block">{dict.subjectLabel}</label>
                  <select
                    value={scheduledSubject}
                    onChange={(e: any) => setScheduledSubject(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="Kiswahili">Kiswahili</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-extrabold uppercase text-[10px] tracking-wide block">{dict.teacherLabel}</label>
                  <input 
                    type="text"
                    required
                    value={scheduledTeacher}
                    onChange={(e) => setScheduledTeacher(e.target.value)}
                    placeholder="Mwl. John Juma..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-extrabold uppercase text-[10px] tracking-wide block">{dict.dateLabel}</label>
                  <input 
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-extrabold uppercase text-[10px] tracking-wide block">{dict.timeLabel}</label>
                  <input 
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-extrabold uppercase text-[10px] tracking-wide block">{dict.durationLabel}</label>
                  <input 
                    type="number"
                    required
                    value={scheduledDuration}
                    onChange={(e) => setScheduledDuration(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-extrabold uppercase text-[10px] tracking-wide block">{dict.platform}</label>
                  <select
                    value={scheduledPlatform}
                    onChange={(e: any) => setScheduledPlatform(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="Zoom">Zoom</option>
                    <option value="Google Meet">Google Meet</option>
                    <option value="Lupa+">Lupa+ Streaming</option>
                  </select>
                </div>

                <div className="space-y-1.5 col-span-1">
                  <label className="text-slate-700 font-extrabold uppercase text-[10px] tracking-wide block">{dict.gradeLabel}</label>
                  <select
                    value={scheduledGrade}
                    onChange={(e) => setScheduledGrade(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="Msingi (Primary)">Darasa la 5-7 (Primary)</option>
                    <option value="Kidato cha Nne (Form 4)">Kidato cha Nne (Form 4)</option>
                    <option value="Kidato cha Sita (Form 6)">Kidato cha Sita (Form 6)</option>
                    <option value="Advanced Level">Advanced Levels</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="flex-1 py-3 text-slate-700 hover:bg-slate-50 bg-slate-100 border border-slate-200 text-xs font-extrabold uppercase tracking-wide rounded-xl transition-all"
                >
                  {dict.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wide rounded-xl transition-all shadow-md"
                >
                  {dict.scheduleBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
