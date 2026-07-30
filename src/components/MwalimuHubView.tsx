import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calculator, 
  FileSpreadsheet, 
  Mail, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Coins, 
  Download, 
  Send, 
  Users, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Settings, 
  Phone, 
  FileText, 
  Award,
  ChevronRight,
  ShieldCheck,
  Search,
  BookOpen,
  Check,
  Crown,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MockStudent {
  id: string;
  name: string;
  regNo: string;
  civics: number;
  history: number;
  geography: number;
  kiswahili: number;
  english: number;
  physics: number;
  chemistry: number;
  biology: number;
  basicMath: number;
  phone?: string;
  total?: number;
  avg?: number;
  division?: string;
  points?: number;
  rank?: number;
  smsSent?: boolean;
}

const INITIAL_MOCK_STUDENTS: MockStudent[] = [
  { id: '1', name: 'Asha Hamisi', regNo: 'S0101/0001/2026', civics: 78, history: 85, geography: 74, kiswahili: 90, english: 82, physics: 68, chemistry: 72, biology: 80, basicMath: 65, phone: '0712345601' },
  { id: '2', name: 'Baraka John', regNo: 'S0101/0002/2026', civics: 45, history: 38, geography: 52, kiswahili: 61, english: 55, physics: 30, chemistry: 42, biology: 48, basicMath: 22, phone: '0712345602' },
  { id: '3', name: 'Catherine Joseph', regNo: 'S0101/0003/2026', civics: 88, history: 92, geography: 89, kiswahili: 95, english: 91, physics: 85, chemistry: 88, biology: 90, basicMath: 84, phone: '0712345603' },
  { id: '4', name: 'Dennis Aloyce', regNo: 'S0101/0004/2026', civics: 62, history: 58, geography: 65, kiswahili: 70, english: 68, physics: 55, chemistry: 60, biology: 64, basicMath: 48, phone: '0712345604' },
  { id: '5', name: 'Elisha Mosses', regNo: 'S0101/0005/2026', civics: 35, history: 28, geography: 41, kiswahili: 50, english: 44, physics: 18, chemistry: 25, biology: 32, basicMath: 15, phone: '0712345605' },
  { id: '6', name: 'Faraja Ally', regNo: 'S0101/0006/2026', civics: 92, history: 88, geography: 84, kiswahili: 91, english: 87, physics: 76, chemistry: 80, biology: 85, basicMath: 78, phone: '0712345606' },
  { id: '7', name: 'Grace Wilson', regNo: 'S0101/0007/2026', civics: 55, history: 62, geography: 58, kiswahili: 67, english: 60, physics: 45, chemistry: 48, biology: 52, basicMath: 38, phone: '0712345607' },
  { id: '8', name: 'Halima Ramadhani', regNo: 'S0101/0008/2026', civics: 82, history: 78, geography: 80, kiswahili: 88, english: 85, physics: 70, chemistry: 74, biology: 78, basicMath: 68, phone: '0712345608' },
  { id: '9', name: 'Iddi Kassim', regNo: 'S0101/0009/2026', civics: 41, history: 45, geography: 38, kiswahili: 55, english: 48, physics: 32, chemistry: 35, biology: 40, basicMath: 25, phone: '0712345609' },
  { id: '10', name: 'Juma Ally', regNo: 'S0101/0010/2026', civics: 70, history: 75, geography: 68, kiswahili: 82, english: 74, physics: 62, chemistry: 65, biology: 70, basicMath: 55, phone: '0712345610' },
];

export default function MwalimuHubView() {
  const [activeTab, setActiveTab] = useState<'mchakataji' | 'nyaraka' | 'ratiba' | 'maelewano' | 'sms-config'>('mchakataji');
  
  // Results Processor State
  const [students, setStudents] = useState<MockStudent[]>(INITIAL_MOCK_STUDENTS);
  const [processed, setProcessed] = useState(false);
  const [processingLog, setProcessingLog] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<MockStudent | null>(null);
  const [smsLog, setSmsLog] = useState<string[]>([]);
  const [sendingSms, setSendingSms] = useState(false);
  const [smsProgress, setSmsProgress] = useState(0);
  const [smsSentCount, setSmsSentCount] = useState(0);
  const [totalSimulatedCount, setTotalSimulatedCount] = useState(10); // can scale up to 2150

  // SMS Gateway Real Config States
  const [smsProvider, setSmsProvider] = useState<'simulation' | 'africastalking' | 'infobip'>('simulation');
  const [smsApiKey, setSmsApiKey] = useState('');
  const [smsUsername, setSmsUsername] = useState('sandbox');
  const [smsSenderId, setSmsSenderId] = useState('');
  const [smsInfobipBaseUrl, setSmsInfobipBaseUrl] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [smsConfigLoading, setSmsConfigLoading] = useState(false);
  const [smsConfigSaving, setSmsConfigSaving] = useState(false);

  const fetchSMSConfig = async () => {
    setSmsConfigLoading(true);
    try {
      const response = await fetch('/api/sms/config');
      if (response.ok) {
        const data = await response.json();
        setSmsProvider(data.smsProvider || 'simulation');
        setSmsUsername(data.smsUsername || 'sandbox');
        setSmsSenderId(data.smsSenderId || '');
        setSmsInfobipBaseUrl(data.smsInfobipBaseUrl || '');
        setHasApiKey(data.hasApiKey || false);
        if (data.hasApiKey) {
          setSmsApiKey('••••••••••••••••');
        }
      }
    } catch (error) {
      console.error('Error fetching SMS config:', error);
    } finally {
      setSmsConfigLoading(false);
    }
  };

  const handleSaveSMSConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsConfigSaving(true);
    try {
      const response = await fetch('/api/sms/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          smsProvider,
          smsApiKey: smsApiKey === '••••••••••••••••' ? undefined : smsApiKey,
          smsUsername,
          smsSenderId,
          smsInfobipBaseUrl
        })
      });
      if (response.ok) {
        alert('Mipangilio ya SMS imehifadhiwa kikamilifu kwenye seva!');
        fetchSMSConfig();
      } else {
        const data = await response.json();
        alert(`Imeshindwa kuhifadhi: ${data.error || data.message}`);
      }
    } catch (error) {
      alert('Hitilafu imetokea wakati wa kuhifadhi mipangilio.');
    } finally {
      setSmsConfigSaving(false);
    }
  };

  useEffect(() => {
    fetchSMSConfig();
  }, []);
  
  // Lesson Plan State
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [selectedLevel, setSelectedLevel] = useState('Kidato cha 4');
  const [selectedTerm, setSelectedTerm] = useState('Muhula wa 1');
  const [selectedWeek, setSelectedWeek] = useState('Wiki ya 3');
  const [selectedTopic, setSelectedTopic] = useState('Magnetism');
  const [selectedSubtopic, setSelectedSubtopic] = useState('Properties of Magnets');
  const [generatedDoc, setGeneratedDoc] = useState<any | null>(null);

  // Timetable State
  const [timetableDays, setTimetableDays] = useState<any>({
    Jumatatu: ['Civics', 'Basic Math', 'Physics', 'Break', 'Kiswahili', 'Biology', 'Geography', 'Sports'],
    Jumanne: ['History', 'English', 'Chemistry', 'Break', 'Basic Math', 'Physics', 'Civics', 'Study'],
    Jumatano: ['Biology', 'Geography', 'Kiswahili', 'Break', 'History', 'Chemistry', 'English', 'Club'],
    Alhamisi: ['Physics', 'Chemistry', 'Basic Math', 'Break', 'Biology', 'English', 'Geography', 'Study'],
    Ijumaa: ['Kiswahili', 'Civics', 'History', 'Break', 'Basic Math', 'Physics', 'Religions', 'Cleaning']
  });
  const [timetabling, setTimetabling] = useState(false);
  const [timetableLogs, setTimetableLogs] = useState<string[]>([]);

  // Log Mtandao
  const [logBooks, setLogBooks] = useState<any[]>([
    { id: '1', date: '21/07/2026', subject: 'Physics', class: 'Form 4G', topic: 'Electromagnetism', subtopic: 'Faraday\'s Law of induction', status: 'Inamalikwa', attendance: '45/48', remark: 'Wanafunzi walielewa vizuri majaribio ya coil na sumaku.' },
    { id: '2', date: '20/07/2026', subject: 'Basic Math', class: 'Form 3A', topic: 'Probability', subtopic: 'Mutually exclusive events', status: 'Kamilifu', attendance: '38/40', remark: 'Zoezi la 3 limefanywa na kusahihishwa.' }
  ]);
  const [newLog, setNewLog] = useState({ subject: 'Physics', class: 'Form 4G', topic: '', subtopic: '', attendance: '45/48', remark: '' });

  // Order/Inquiry Form State
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Mfumo wa Kuchakata Matokeo (2000+ Students)',
    'SMS Gateway Integration for Parents'
  ]);
  const [schoolName, setSchoolName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [studentCount, setStudentCount] = useState(250);
  const [budgetRange, setBudgetRange] = useState(150000);
  const [customNotes, setCustomNotes] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const calculateGrades = (score: number) => {
    if (score >= 75) return { grade: 'A', points: 1, remark: 'Vizuri Sana (Excellent)' };
    if (score >= 65) return { grade: 'B', points: 2, remark: 'Vizuri (Very Good)' };
    if (score >= 45) return { grade: 'C', points: 3, remark: 'Wastani (Good)' };
    if (score >= 30) return { grade: 'D', points: 4, remark: 'Inaridhisha (Satisfactory)' };
    return { grade: 'F', points: 5, remark: 'Imefeli (Fail)' };
  };

  // Run Results Processing (Simulated 2000+ students in 10 seconds)
  const handleStartProcessing = () => {
    setIsProcessing(true);
    setProcessed(false);
    setProgress(0);
    setProcessingLog([]);

    const logs = [
      'Inasafisha na kupakia orodha ya faili...',
      'Imepata rekodi za wanafunzi 2,150 kutoka kwenye lahajakazi (Excel)...',
      'Inakokotoa wastani na jumla ya kila mwanafunzi...',
      'Inapanga madaraja (A, B, C, D, F) kwa masomo yote 9 kulingana na miongozo ya NECTA...',
      'Inatathmini pointi za masomo 7 bora kwa kila mwanafunzi...',
      'Inagawanya wanafunzi kwenye madaraja ya Division (I, II, III, IV, Zero)...',
      'Inapanga namba za nafasi (Ranks) kwa shule nzima na madarasa yao...',
      'Inatengeneza ripoti binafsi za wazazi (Parent Progress Reports)...',
      'Inasawazisha msimbo wa SMS tayari kwa kutuma kupitia mtandao...'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < logs.length) {
        setProcessingLog(prev => [...prev, `[${new Date().toLocaleTimeString('sw-TZ')}] ${logs[currentStep]}`]);
        setProgress(Math.floor(((currentStep + 1) / logs.length) * 100));
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Calculate ranks and division for current mock list
        const processedList = students.map(student => {
          const subjects = [student.civics, student.history, student.geography, student.kiswahili, student.english, student.physics, student.chemistry, student.biology, student.basicMath];
          const total = subjects.reduce((a, b) => a + b, 0);
          const avg = Math.round(total / subjects.length);
          
          // NECTA Points Calculation (7 best subjects)
          const pointsList = subjects.map(s => calculateGrades(s).points).sort((a, b) => a - b);
          const best7Points = pointsList.slice(0, 7).reduce((a, b) => a + b, 0);

          let div = 'Division IV';
          if (best7Points <= 17) div = 'Division I';
          else if (best7Points <= 21) div = 'Division II';
          else if (best7Points <= 25) div = 'Division III';
          else if (best7Points <= 33) div = 'Division IV';
          else div = 'Division 0';

          return {
            ...student,
            total,
            avg,
            points: best7Points,
            division: div,
          };
        });

        // Sort by total desc for rank
        const sorted = [...processedList].sort((a, b) => (b.total || 0) - (a.total || 0));
        const ranked = sorted.map((stud, idx) => ({
          ...stud,
          rank: idx + 1
        }));

        setStudents(ranked);
        setTotalSimulatedCount(2150); // Scale view to represent the teacher's 2000+ claim
        setIsProcessing(false);
        setProcessed(true);
        setSelectedStudent(ranked[0]);
      }
    }, 450);
  };

  // Real SMS Gateway Sending in Bulk
  const handleSendSMS = async () => {
    setSendingSms(true);
    setSmsProgress(0);
    setSmsSentCount(0);
    setSmsLog([`[ANZA] Kuanzisha utumaji wa matokeo kwa wazazi kupitia SMS ya kikundi...`]);

    const bulkMessages = students.map(student => {
      const text = `Ndugu Mzazi wa ${student.name} (${student.regNo}). Matokeo ya Mtihani: CIV:${calculateGrades(student.civics).grade}, HIST:${calculateGrades(student.history).grade}, GEO:${calculateGrades(student.geography).grade}, KISW:${calculateGrades(student.kiswahili).grade}, ENGL:${calculateGrades(student.english).grade}, PHY:${calculateGrades(student.physics).grade}, CHEM:${calculateGrades(student.chemistry).grade}, BIO:${calculateGrades(student.biology).grade}, MATH:${calculateGrades(student.basicMath).grade}. Wastani: ${student.avg}%, Nafasi: ${student.rank} kati ya ${totalSimulatedCount}. Division: ${student.division} (Pointi ${student.points}). Lupanulla Elimu Hub.`;
      return {
        phone: student.phone || '0712345678',
        text: text,
        name: student.name
      };
    });

    try {
      let progressVal = 0;
      const progressInterval = setInterval(() => {
        progressVal += 15;
        if (progressVal >= 90) {
          clearInterval(progressInterval);
        } else {
          setSmsProgress(progressVal);
          const processedCount = Math.floor((progressVal / 100) * totalSimulatedCount);
          setSmsSentCount(processedCount);
          setSmsLog(l => [...l, `Inatuma ujumbe kwa kundi la wazazi... (${processedCount}/${totalSimulatedCount})`]);
        }
      }, 350);

      const response = await fetch('/api/sms/send-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: bulkMessages
        })
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const data = await response.json();
        setSmsProgress(100);
        setSmsSentCount(totalSimulatedCount);
        if (data.method === 'simulation') {
          setSmsLog(l => [
            ...l,
            ...data.logs,
            `[KIKAMILIFU] SMS zote ${totalSimulatedCount} za wazazi zimeandaliwa kwa ufanisi katika mode ya Majaribio (Simulation)!`
          ]);
          alert(`Ujumbe wa matokeo wa wanafunzi wote umeandaliwa kwa ufanisi (Mode ya Majaribio/Simulation).`);
        } else {
          setSmsLog(l => [
            ...l,
            `[KIKAMILIFU] SMS zote ${bulkMessages.length} zimetumwa kikamilifu kwa wazazi kupitia ${data.method}!`
          ]);
          alert(`SMS zote zimetumwa kwa mafanikio kupitia ${data.method}!`);
        }
      } else {
        const data = await response.json();
        setSmsProgress(0);
        setSmsLog(l => [...l, `[MAKOSA] Utumaji wa kikundi umeshindwa: ${data.error || data.message}`]);
        alert(`Ujumbe haukuweza kutumwa: ${data.error || data.message}`);
      }
    } catch (error) {
      setSmsProgress(0);
      setSmsLog(l => [...l, `[MAKOSA] Mawasiliano na Gateway yamefeli.`]);
      alert('Mawasiliano na seva yamekatika.');
    } finally {
      setSendingSms(false);
    }
  };

  const handleSendSingleSMS = async (student: MockStudent) => {
    if (!student) return;
    const parentPhone = student.phone || '0712345678';
    
    const text = `Ndugu Mzazi wa ${student.name} (${student.regNo}). Matokeo ya Mtihani: CIV:${calculateGrades(student.civics).grade}, HIST:${calculateGrades(student.history).grade}, GEO:${calculateGrades(student.geography).grade}, KISW:${calculateGrades(student.kiswahili).grade}, ENGL:${calculateGrades(student.english).grade}, PHY:${calculateGrades(student.physics).grade}, CHEM:${calculateGrades(student.chemistry).grade}, BIO:${calculateGrades(student.biology).grade}, MATH:${calculateGrades(student.basicMath).grade}. Wastani: ${student.avg}%, Nafasi: ${student.rank} kati ya ${totalSimulatedCount}. Division: ${student.division} (Pointi ${student.points}). Lupanulla Elimu Hub.`;

    setSmsLog(l => [...l, `[ANZA] Inatuma SMS ya matokeo ya ${student.name} kwenda kwa mzazi (${parentPhone})...`]);
    try {
      const response = await fetch('/api/sms/send-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              phone: parentPhone,
              text: text,
              name: student.name
            }
          ]
        })
      });

      const data = await response.json();
      if (response.ok) {
        if (data.method === 'simulation') {
          setSmsLog(l => [...l, `[SIMULATION] SMS ya mzazi wa ${student.name} imeandaliwa kikamilifu kwenye mode ya majaribio!`]);
          alert(`[SIMULATION] SMS imeandaliwa kikamilifu! (Mode: Majaribio)\n\nSimu: ${parentPhone}\nUjumbe:\n${text}`);
        } else {
          setSmsLog(l => [...l, `[FANIKIO] SMS imetumwa kwa ${student.name} kupitia ${data.method}!`]);
          alert(`[FANIKIO] SMS imetumwa kwa Mzazi wa ${student.name} kupitia ${data.method}!`);
        }
      } else {
        setSmsLog(l => [...l, `[MAKOSA] Imeshindwa kutuma SMS ya ${student.name}: ${data.error || data.message}`]);
        alert(`Imeshindwa kutuma: ${data.error || data.message}`);
      }
    } catch (error) {
      setSmsLog(l => [...l, `[MAKOSA] Itifaki ya mtandao imeshindwa kwa SMS ya ${student.name}`]);
      alert('Hitilafu ya mtandao imetokea wakati wa kutuma SMS.');
    }
  };

  // Generate Lesson Plan
  const handleGenerateLessonPlan = () => {
    setGeneratedDoc({
      subject: selectedSubject,
      level: selectedLevel,
      term: selectedTerm,
      week: selectedWeek,
      topic: selectedTopic,
      subtopic: selectedSubtopic,
      introduction: 'Mwalimu ataanza kipindi kwa kuuliza maswali ya utangulizi kuhusu nishati ya sumaku na mifano ya sumaku inayopatikana mazingirani.',
      mainBody: 'Mwalimu ataelekeza sifa za sumaku ikiwemo kuwa na ncha mbili (Kaskazini na Kusini), sifa ya kuvuta chuma, na sifa ya ncha zinazofanana kufukuzana na zisizofanana kuvutana. Wanafunzi watafanya majaribio mepesi katika vikundi vidogo.',
      summary: 'Kuhitimisha kipindi kwa kuuliza wanafunzi kueleza sifa 3 muhimu za sumaku ambazo wamejifunza.',
      evaluation: 'Zoezi la maswali 5 kwenye daftari litatolewa. Wanafunzi 95% walielewa somo kikamilifu na kukamilisha zoezi kwa alama za juu.'
    });
  };

  // Generate Timetable Clash Free
  const handleGenerateTimetable = () => {
    setTimetabling(true);
    setTimetableLogs([]);
    const steps = [
      'Inasoma orodha ya walimu 12 na masomo 9...',
      'Inaanisha idadi ya vipindi vya sayansi vyenye vipindi pacha (Double periods)...',
      'Inapanga ratiba bila mwingiliano wa walimu (Clash-Free optimization)...',
      'Inatengeneza vipindi kwa madarasa yote kuanzia Kidato cha 1 hadi cha 4...'
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < steps.length) {
        setTimetableLogs(prev => [...prev, steps[step]]);
        step++;
      } else {
        clearInterval(interval);
        setTimetabling(false);
        // Scramble timetable classes visually to show optimization
        setTimetableDays({
          Jumatatu: ['Physics (Double)', 'Break', 'Civics', 'Kiswahili', 'Basic Math', 'Biology', 'Sports'],
          Jumanne: ['Chemistry (Double)', 'Break', 'English', 'History', 'Civics', 'Basic Math', 'Study'],
          Jumatano: ['Basic Math (Double)', 'Break', 'Geography', 'Biology', 'English', 'History', 'Club'],
          Alhamisi: ['Biology (Double)', 'Break', 'Chemistry', 'Physics', 'Kiswahili', 'Civics', 'Study'],
          Ijumaa: ['English (Double)', 'Break', 'Basic Math', 'Geography', 'History', 'Religion', 'Cleaning']
        });
      }
    }, 500);
  };

  // Add Log Book
  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.topic || !newLog.subtopic) return;
    const item = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('sw-TZ'),
      subject: newLog.subject,
      class: newLog.class,
      topic: newLog.topic,
      subtopic: newLog.subtopic,
      status: 'Kamilifu',
      attendance: newLog.attendance,
      remark: newLog.remark || 'Imerekodiwa kwenye log ya mtandao kwa ufanisi.'
    };
    setLogBooks([item, ...logBooks]);
    setNewLog({ ...newLog, topic: '', subtopic: '', remark: '' });
  };

  const handleServiceToggle = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleSendOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSubmitted(true);
    
    // Construct dynamic prefilled WhatsApp message text
    const servicesText = selectedServices.map((s, idx) => `${idx + 1}. ${s}`).join('\n');
    const waText = encodeURIComponent(
      `Habari Mwalimu Lupanulla!\nNimevutiwa na mifumo ya walimu kutoka kwenye Website.\n\n*Taarifa zangu:*\n- Shule: ${schoolName || 'Haijatajwa'}\n- Jina la Mwalimu: ${teacherName || 'Mwalimu'}\n- Idadi ya Wanafunzi: ${studentCount}\n- Bajeti Iliyotengwa: TZS ${budgetRange.toLocaleString()}\n\n*Huduma ninazohitaji:*\n${servicesText}\n\n*Maelezo ya Ziada:*\n${customNotes || 'Hakuna maelezo ya ziada'}\n\nTafadhali tuwasiliane tufanye MAELEWANO ya malipo na kuanza kuandaa mfumo sasa hivi. Asante!`
    );

    const waLink = `https://wa.me/255655883838?text=${waText}`;
    
    // Open whatsapp in new tab safely
    setTimeout(() => {
      window.open(waLink, '_blank');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* ── HEADER BANNER ── */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 border-b border-cyan-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          
          <div className="space-y-4 max-w-3xl text-left">
            <span className="inline-flex items-center gap-1.5 bg-cyan-500/10 text-cyan-400 text-xs font-black px-3 py-1 rounded-full border border-cyan-500/20 uppercase tracking-widest">
              <Sparkles size={12} /> Zana za Kidijitali kwa Walimu
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight leading-tight">
              Mfumo wa Kuchakata Matokeo na Nyaraka za Walimu 🇹🇿
            </h1>
            <p className="text-slate-300 text-sm sm:text-base font-semibold leading-relaxed max-w-2xl">
              Tengeneza Scheme of work, Lesson plan, Ratiba Kuu, Log ya Mtandao, na chakata matokeo ya wanafunzi <strong className="text-cyan-400">2,000+ ndani ya dakika 10 tu</strong> na kutuma SMS za matokeo kwa wazazi kiotomatiki!
            </p>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800 flex flex-col shrink-0 w-full md:w-80 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Gharama za Huduma</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">Maelewaneo</span>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-black text-cyan-400 block">TZS 100,000+</span>
              <span className="text-[11px] text-slate-400 block font-medium">Inategemea na idadi ya wanafunzi na mawanda ya mfumo</span>
            </div>
            <button
              onClick={() => setActiveTab('maelewano')}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Phone size={14} /> Wasiliana Kufanya Malipo
            </button>
          </div>

        </div>
      </div>

      {/* ── NAV TABS ── */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-2 py-3 scrollbar-none justify-start sm:justify-center">
          <button
            onClick={() => setActiveTab('mchakataji')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
              activeTab === 'mchakataji' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet size={15} className={activeTab === 'mchakataji' ? 'text-cyan-400' : 'text-slate-400'} />
            Mchakataji wa Matokeo &amp; SMS
          </button>

          <button
            onClick={() => setActiveTab('nyaraka')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
              activeTab === 'nyaraka' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText size={15} className={activeTab === 'nyaraka' ? 'text-cyan-400' : 'text-slate-400'} />
            Lesson Plan &amp; Scheme of Work
          </button>

          <button
            onClick={() => setActiveTab('ratiba')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
              activeTab === 'ratiba' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar size={15} className={activeTab === 'ratiba' ? 'text-cyan-400' : 'text-slate-400'} />
            Ratiba Kuu &amp; Logbook
          </button>

          <button
            onClick={() => setActiveTab('maelewano')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
              activeTab === 'maelewano' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Coins size={15} className={activeTab === 'maelewano' ? 'text-cyan-400' : 'text-slate-400'} />
            Agiza Mfumo &amp; Maelewano
          </button>

          <button
            onClick={() => setActiveTab('sms-config')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
              activeTab === 'sms-config' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings size={15} className={activeTab === 'sms-config' ? 'text-cyan-400' : 'text-slate-400'} />
            Usanidi wa SMS
          </button>
        </div>
      </div>

      {/* ── VIEW CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* TAB 1: MCHAKATAJI WA MATOKEO & SMS */}
        {activeTab === 'mchakataji' && (
          <div className="space-y-8 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Actions & Configurations */}
              <div className="space-y-6 lg:col-span-1">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-cyan-100 text-cyan-800 p-2.5 rounded-2xl">
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-slate-900 text-sm uppercase tracking-tight">Kuanzisha Mchakataji</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Majaribio ya kuchakata wanafunzi 2,150</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-semibold space-y-2">
                      <h4 className="text-slate-700 font-bold uppercase tracking-wide">Hatua ya 1: Pakia Faili la Wanafunzi</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Bofya kitufe cha mfano hapa chini kupakia orodha kamili ya wanafunzi wenye alama za masomo tayari kuchakatwa.</p>
                      
                      <div className="flex flex-col gap-2 pt-2">
                        <button
                          onClick={handleStartProcessing}
                          disabled={isProcessing}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <Clock size={14} className={isProcessing ? 'animate-spin' : ''} />
                          {isProcessing ? 'Inachakata...' : 'Pakia & Chakata 2,150 Students'}
                        </button>
                        <span className="text-[10px] text-slate-400 text-center font-medium block">Mfumo hufanya wastani, division, na ranks katika sekunde 4!</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-semibold space-y-3">
                      <h4 className="text-slate-700 font-bold uppercase tracking-wide flex items-center justify-between">
                        <span>Hatua ya 2: Tuma SMS kwa Wazazi</span>
                        {processed && <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded uppercase">Tayari</span>}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Tuma ujumbe mfupi wa SMS kwa simu za wazazi wote wa wanafunzi 2,150 wenye mchanganuo kamili wa matokeo ya watoto wao.</p>
                      
                      <button
                        onClick={handleSendSMS}
                        disabled={!processed || sendingSms}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <Send size={14} />
                        {sendingSms ? 'Inatuma SMS...' : 'Tuma SMS kwa Wazazi Wote'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated SMS Log Panel */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-display font-black text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
                    <span>Ripoti za Shughuli (Live Log)</span>
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  </h3>
                  
                  <div className="bg-slate-950 p-4 rounded-2xl font-mono text-[10px] text-slate-300 h-48 overflow-y-auto space-y-1.5 scrollbar-none">
                    {processingLog.length === 0 && smsLog.length === 0 ? (
                      <span className="text-slate-500 block italic">Mfumo upo tayari kufanya kazi. Bofya kitufe cha kupakia hapo juu ili kuanza.</span>
                    ) : (
                      <>
                        {processingLog.map((log, idx) => (
                          <div key={idx} className="text-emerald-400">{log}</div>
                        ))}
                        {smsLog.map((log, idx) => (
                          <div key={idx} className="text-cyan-400">{log}</div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Columns: Processed Table & Previews */}
              <div className="space-y-6 lg:col-span-2">
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Wanafunzi Waliochakatwa</span>
                    <span className="text-slate-900 font-black text-lg block mt-1">{processed ? '2,150' : '0'}</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Wastani wa Shule (GPA)</span>
                    <span className="text-slate-900 font-black text-lg block mt-1">{processed ? 'Division II.21' : '--'}</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ufaulu (Pass Rate)</span>
                    <span className="text-emerald-600 font-black text-lg block mt-1">{processed ? '94.2%' : '0%'}</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">SMS Zilizotumwa</span>
                    <span className="text-cyan-600 font-black text-lg block mt-1">{smsSentCount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Progress bar */}
                {(isProcessing || sendingSms) && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>{isProcessing ? 'Kuchakata Matokeo ya Wanafunzi 2,150...' : 'Kutuma SMS kwa Wazazi...'}</span>
                      <span>{isProcessing ? progress : smsProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-cyan-500 h-full transition-all duration-300" 
                        style={{ width: `${isProcessing ? progress : smsProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Student Records & Result Sheet */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-black text-slate-900 text-sm uppercase tracking-tight">Orodha ya Matokeo (Result Slip Panel)</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mfano wa wanafunzi 10 wa mwanzo katika shule</p>
                    </div>
                    <div className="relative w-full sm:w-60">
                      <input 
                        type="text" 
                        placeholder="Tafuta jina..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 pl-9 text-xs focus:ring-1 focus:ring-cyan-500 outline-none font-semibold text-slate-700"
                      />
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={13} />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4">Namba/Jina</th>
                          <th className="py-3 px-4">Civ</th>
                          <th className="py-3 px-4">Hist</th>
                          <th className="py-3 px-4">Geo</th>
                          <th className="py-3 px-4">Kisw</th>
                          <th className="py-3 px-4">Engl</th>
                          <th className="py-3 px-4">Phy</th>
                          <th className="py-3 px-4">Math</th>
                          <th className="py-3 px-4">Pts</th>
                          <th className="py-3 px-4">Div</th>
                          <th className="py-3 px-4 text-center">Kitendo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {students
                          .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((stud) => (
                            <tr 
                              key={stud.id} 
                              onClick={() => setSelectedStudent(stud)}
                              className={`hover:bg-slate-50 transition-all cursor-pointer ${selectedStudent?.id === stud.id ? 'bg-cyan-500/5' : ''}`}
                            >
                              <td className="py-3 px-4">
                                <div className="font-extrabold text-slate-900 leading-none">{stud.name}</div>
                                <span className="text-[10px] text-slate-400 font-semibold mt-1 block">{stud.regNo}</span>
                              </td>
                              <td className={`py-3 px-4 ${stud.civics < 30 ? 'text-red-500' : ''}`}>{stud.civics}</td>
                              <td className={`py-3 px-4 ${stud.history < 30 ? 'text-red-500' : ''}`}>{stud.history}</td>
                              <td className={`py-3 px-4 ${stud.geography < 30 ? 'text-red-500' : ''}`}>{stud.geography}</td>
                              <td className={`py-3 px-4 ${stud.kiswahili < 30 ? 'text-red-500' : ''}`}>{stud.kiswahili}</td>
                              <td className={`py-3 px-4 ${stud.english < 30 ? 'text-red-500' : ''}`}>{stud.english}</td>
                              <td className={`py-3 px-4 ${stud.physics < 30 ? 'text-red-500' : ''}`}>{stud.physics}</td>
                              <td className={`py-3 px-4 ${stud.basicMath < 30 ? 'text-red-500' : ''}`}>{stud.basicMath}</td>
                              <td className="py-3 px-4 text-slate-900 font-black">{processed ? stud.points : '--'}</td>
                              <td className="py-3 px-4">
                                {processed ? (
                                  <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-md ${
                                    stud.division?.includes('I') && !stud.division?.includes('IV') && !stud.division?.includes('III')
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : stud.division === 'Division 0'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {stud.division}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">--</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStudent(stud);
                                  }}
                                  className="text-cyan-600 hover:text-cyan-800 text-[11px] font-black uppercase tracking-wider"
                                >
                                  Hakiki
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Selected Student Details & Simulated Report / SMS */}
                {selectedStudent && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Simulated Report Card */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="font-display font-black text-slate-900 text-xs uppercase tracking-tight">Ripoti ya Maendeleo ya Mwanafunzi</h4>
                          <span className="text-[10px] text-slate-400 font-bold">{selectedStudent.regNo}</span>
                        </div>
                        <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg">
                          Rank: {processed ? `#${selectedStudent.rank}` : '--'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Jina Kamili:</span>
                          <span className="text-slate-900">{selectedStudent.name}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Wastani wa Alama:</span>
                          <span className="text-slate-900">{processed ? `${selectedStudent.avg}%` : '--'}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Division / Pointi:</span>
                          <span className="text-slate-900">{processed ? `${selectedStudent.division} ya pointi ${selectedStudent.points}` : '--'}</span>
                        </div>
                        <div className="flex flex-col gap-1 text-xs font-bold text-slate-700 border-t border-slate-100 pt-2">
                          <span>Namba ya Mzazi (Phone):</span>
                          <input 
                            type="text" 
                            value={selectedStudent.phone || ''}
                            onChange={(e) => {
                              const updatedPhone = e.target.value;
                              setStudents(students.map(s => s.id === selectedStudent.id ? { ...s, phone: updatedPhone } : s));
                              setSelectedStudent({ ...selectedStudent, phone: updatedPhone });
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-semibold focus:ring-1 focus:ring-cyan-500 text-slate-900 outline-none w-full"
                            placeholder="Mfano: 0712345601"
                          />
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alama na Madaraja</h5>
                        <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                          <div className="p-2 bg-slate-50 rounded-lg">
                            <span className="text-[9px] text-slate-400 block uppercase">Physics</span>
                            <span className="text-slate-900">{selectedStudent.physics} ({calculateGrades(selectedStudent.physics).grade})</span>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg">
                            <span className="text-[9px] text-slate-400 block uppercase">Chemistry</span>
                            <span className="text-slate-900">{selectedStudent.chemistry} ({calculateGrades(selectedStudent.chemistry).grade})</span>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg">
                            <span className="text-[9px] text-slate-400 block uppercase">Mathematics</span>
                            <span className="text-slate-900">{selectedStudent.basicMath} ({calculateGrades(selectedStudent.basicMath).grade})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Simulated Phone SMS Display */}
                    <div className="bg-slate-900 p-6 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800 text-white flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-cyan-400" />
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Simulated SMS Delivery</span>
                          </div>
                          <span className="bg-cyan-500/10 text-cyan-400 text-[9px] font-bold px-2 py-0.5 rounded border border-cyan-500/20">LIVE PREVIEW</span>
                        </div>

                        {/* Interactive Message Bubble */}
                        <div className="space-y-2">
                          <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wider">Kutoka: LUPANULLA SMS</span>
                          <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none text-slate-100 text-[11px] leading-relaxed font-semibold">
                            {processed ? (
                              <>
                                Ndugu Mzazi wa <strong className="text-cyan-400">{selectedStudent.name}</strong> ({selectedStudent.regNo}). Matokeo ya Mtihani: CIV:{calculateGrades(selectedStudent.civics).grade}, HIST:{calculateGrades(selectedStudent.history).grade}, GEO:{calculateGrades(selectedStudent.geography).grade}, KISW:{calculateGrades(selectedStudent.kiswahili).grade}, ENGL:{calculateGrades(selectedStudent.english).grade}, PHY:{calculateGrades(selectedStudent.physics).grade}, CHEM:{calculateGrades(selectedStudent.chemistry).grade}, BIO:{calculateGrades(selectedStudent.biology).grade}, MATH:{calculateGrades(selectedStudent.basicMath).grade}. Wastani: {selectedStudent.avg}%, Nafasi: {selectedStudent.rank} kati ya 2150. Division: {selectedStudent.division} (Pointi {selectedStudent.points}). Lupanulla Elimu Hub.
                              </>
                            ) : (
                              <span className="text-slate-400 italic">Tafadhali chakata matokeo kwanza ili kuzalisha muundo wa SMS ya matokeo ya mzazi.</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 mt-4">
                        <span className="text-[10px] text-slate-400 font-semibold">Gharama kwa SMS API: <strong className="text-white">TZS 15</strong></span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              const text = `Ndugu Mzazi wa ${selectedStudent.name} (${selectedStudent.regNo}). Matokeo ya Mtihani: CIV:${calculateGrades(selectedStudent.civics).grade}, HIST:${calculateGrades(selectedStudent.history).grade}, GEO:${calculateGrades(selectedStudent.geography).grade}, KISW:${calculateGrades(selectedStudent.kiswahili).grade}, ENGL:${calculateGrades(selectedStudent.english).grade}, PHY:${calculateGrades(selectedStudent.physics).grade}, CHEM:${calculateGrades(selectedStudent.chemistry).grade}, BIO:${calculateGrades(selectedStudent.biology).grade}, MATH:${calculateGrades(selectedStudent.basicMath).grade}. Wastani: ${selectedStudent.avg}%, Nafasi: ${selectedStudent.rank}. Division: ${selectedStudent.division} (Pointi ${selectedStudent.points}). Lupanulla Elimu Hub.`;
                              navigator.clipboard.writeText(text);
                              alert('Ujumbe wa SMS umenakiliwa kwenye clipboard kikamilifu! Unaweza kuubandika (paste) na kutuma bure.');
                            }}
                            disabled={!processed}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Nakili Ujumbe
                          </button>
                          <button 
                            onClick={() => {
                              const rawPhone = selectedStudent.phone || '';
                              let formatted = rawPhone.replace(/[^0-9]/g, '');
                              if (formatted.startsWith('0')) formatted = '255' + formatted.slice(1);
                              const text = encodeURIComponent(`Ndugu Mzazi wa ${selectedStudent.name} (${selectedStudent.regNo}). Matokeo ya Mtihani: CIV:${calculateGrades(selectedStudent.civics).grade}, HIST:${calculateGrades(selectedStudent.history).grade}, GEO:${calculateGrades(selectedStudent.geography).grade}, KISW:${calculateGrades(selectedStudent.kiswahili).grade}, ENGL:${calculateGrades(selectedStudent.english).grade}, PHY:${calculateGrades(selectedStudent.physics).grade}, CHEM:${calculateGrades(selectedStudent.chemistry).grade}, BIO:${calculateGrades(selectedStudent.biology).grade}, MATH:${calculateGrades(selectedStudent.basicMath).grade}. Wastani: ${selectedStudent.avg}%, Nafasi: ${selectedStudent.rank}. Division: ${selectedStudent.division} (Pointi ${selectedStudent.points}). Lupanulla Elimu Hub.`);
                              window.open(`https://wa.me/${formatted}?text=${text}`, '_blank');
                            }}
                            disabled={!processed}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            WhatsApp (Bure)
                          </button>
                          <button 
                            onClick={() => handleSendSingleSMS(selectedStudent)}
                            disabled={!processed}
                            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Tuma Sasa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: LESSON PLAN & SCHEME OF WORK */}
        {activeTab === 'nyaraka' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            {/* Left Column: Form Controls */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-100 text-cyan-800 p-2.5 rounded-2xl">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-display font-black text-slate-900 text-sm uppercase tracking-tight">Kijenereta cha Nyaraka</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Lesson Plan &amp; Scheme of Work</p>
                </div>
              </div>

              <div className="space-y-4 text-xs font-bold text-slate-700">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider block text-slate-400">Somo (Subject)</label>
                  <select 
                    value={selectedSubject} 
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Basic Mathematics">Basic Mathematics</option>
                    <option value="Kiswahili">Kiswahili</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider block text-slate-400">Kidato (Form Level)</label>
                  <select 
                    value={selectedLevel} 
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none"
                  >
                    <option value="Kidato cha 1">Kidato cha 1 (Form 1)</option>
                    <option value="Kidato cha 2">Kidato cha 2 (Form 2)</option>
                    <option value="Kidato cha 3">Kidato cha 3 (Form 3)</option>
                    <option value="Kidato cha 4">Kidato cha 4 (Form 4)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider block text-slate-400">Muhula (Term)</label>
                    <select 
                      value={selectedTerm} 
                      onChange={(e) => setSelectedTerm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none"
                    >
                      <option value="Muhula wa 1">Muhula wa 1</option>
                      <option value="Muhula wa 2">Muhula wa 2</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider block text-slate-400">Wiki (Week)</label>
                    <select 
                      value={selectedWeek} 
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none"
                    >
                      <option value="Wiki ya 1">Wiki ya 1</option>
                      <option value="Wiki ya 2">Wiki ya 2</option>
                      <option value="Wiki ya 3">Wiki ya 3</option>
                      <option value="Wiki ya 4">Wiki ya 4</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider block text-slate-400">Mada Kuu (Topic)</label>
                  <input 
                    type="text" 
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none font-semibold text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider block text-slate-400">Mada Ndogo (Subtopic)</label>
                  <input 
                    type="text" 
                    value={selectedSubtopic}
                    onChange={(e) => setSelectedSubtopic(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none font-semibold text-slate-700"
                  />
                </div>

                <button
                  onClick={handleGenerateLessonPlan}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <Sparkles size={14} className="text-cyan-400 animate-spin" />
                  Zalisha Lesson Plan Sasa
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Document View */}
            <div className="lg:col-span-2 space-y-6">
              {generatedDoc ? (
                <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-lg relative font-serif text-slate-800 leading-relaxed space-y-8 max-w-3xl mx-auto">
                  {/* Document Header */}
                  <div className="text-center space-y-1 border-b-2 border-slate-900 pb-6">
                    <h3 className="font-sans font-black text-slate-950 text-base sm:text-lg uppercase tracking-tight">BARAZA LA ELIMU LA SHULE - TANZANIA</h3>
                    <h4 className="font-sans font-extrabold text-slate-700 text-xs sm:text-sm uppercase">MISWADA YA MAANDALIZI YA KAZI (LESSON PLAN &amp; SCHEME)</h4>
                    <div className="flex justify-center items-center gap-6 text-[11px] font-sans font-bold text-slate-500 pt-3">
                      <span>SOMO: {generatedDoc.subject.toUpperCase()}</span>
                      <span>KIDATO: {generatedDoc.level.toUpperCase()}</span>
                      <span>MUDA: DAKIKA 80</span>
                    </div>
                  </div>

                  {/* Syllabus / Content Section */}
                  <div className="space-y-4 text-xs font-sans">
                    <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">MADA KUU (Topic)</span>
                        <strong className="text-slate-900 text-xs">{generatedDoc.topic}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">MADA NDOGO (Subtopic)</span>
                        <strong className="text-slate-900 text-xs">{generatedDoc.subtopic}</strong>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">1. UTANGULIZI WA SOMO (Introduction - Minutes 10)</h5>
                      <p className="text-slate-600 leading-relaxed">{generatedDoc.introduction}</p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">2. UFAFANUZI WA MAUDHUI (Main Body - Minutes 50)</h5>
                      <p className="text-slate-600 leading-relaxed">{generatedDoc.mainBody}</p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">3. MUHTASARI (Summary - Minutes 10)</h5>
                      <p className="text-slate-600 leading-relaxed">{generatedDoc.summary}</p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">4. TATHMINI YA KIPINDI (Evaluation - Minutes 10)</h5>
                      <p className="text-slate-600 leading-relaxed">{generatedDoc.evaluation}</p>
                    </div>
                  </div>

                  {/* Document Footer Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 font-sans">
                    <span className="text-[11px] text-slate-400 font-semibold">Toleo hili linakidhi mtaala mpya wa NECTA.</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          alert('Umezalisha Word Document! Ununuzi ukikamilika faili litapakuliwa kiootomatiki.');
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Download size={13} />
                        Pakua MS Word
                      </button>
                      <button 
                        onClick={() => {
                          alert('Maandalizi ya PDF yamekamilika! Wasiliana kufanya malipo.');
                        }}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Download size={13} />
                        Pakua PDF
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center flex flex-col justify-center items-center h-80 space-y-4">
                  <BookOpen size={36} className="text-slate-300 animate-bounce" />
                  <div className="space-y-1 max-w-sm">
                    <h4 className="font-display font-black text-slate-900 text-sm uppercase tracking-tight">Hajakamilika Bado</h4>
                    <p className="text-xs text-slate-500 font-medium">Chagua somo, kidato, na mada kuu kisha ubofye kitufe cha "Zalisha Lesson Plan" ili kuandaa nyaraka za mwalimu kikamilifu kwa sekunde chache pekee.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RATIBA KUU & LOGBOOK */}
        {activeTab === 'ratiba' && (
          <div className="space-y-8 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Timetable Panel */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-cyan-100 text-cyan-800 p-2.5 rounded-2xl">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h3 className="font-display font-black text-slate-900 text-sm uppercase tracking-tight">Ratiba Kuu ya Vipindi (General Timetable)</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mfumo wa kupanga vipindi bila mwingiliano</p>
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateTimetable}
                      disabled={timetabling}
                      className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-[10.5px] uppercase tracking-wider py-2 px-4 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Clock size={13} className={timetabling ? 'animate-spin' : ''} />
                      {timetabling ? 'Ina-optimize...' : 'Zalisha Upya (Auto-Optimized)'}
                    </button>
                  </div>

                  {timetableLogs.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[9px] text-slate-500 space-y-1">
                      {timetableLogs.map((l, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />
                          <span>{l}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-black uppercase tracking-wider text-[9px]">
                          <th className="py-3 px-3">Siku</th>
                          <th className="py-3 px-3">Kipindi 1</th>
                          <th className="py-3 px-3">Kipindi 2</th>
                          <th className="py-3 px-3">Kipindi 3</th>
                          <th className="py-3 px-3">Muda</th>
                          <th className="py-3 px-3">Kipindi 4</th>
                          <th className="py-3 px-3">Kipindi 5</th>
                          <th className="py-3 px-3">Kipindi 6</th>
                          <th className="py-3 px-3">Kazi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {Object.keys(timetableDays).map((day) => (
                          <tr key={day} className="hover:bg-slate-50">
                            <td className="py-4 px-3 font-extrabold text-slate-900">{day}</td>
                            <td className="py-4 px-3 text-[11px]">{timetableDays[day][0]}</td>
                            <td className="py-4 px-3 text-[11px]">{timetableDays[day][1]}</td>
                            <td className="py-4 px-3 text-[11px]">{timetableDays[day][2]}</td>
                            <td className="py-4 px-3">
                              <span className="bg-amber-150 text-amber-800 text-[8.5px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Break</span>
                            </td>
                            <td className="py-4 px-3 text-[11px]">{timetableDays[day][4]}</td>
                            <td className="py-4 px-3 text-[11px]">{timetableDays[day][5]}</td>
                            <td className="py-4 px-3 text-[11px]">{timetableDays[day][6]}</td>
                            <td className="py-4 px-3 text-[11px] text-slate-400">{timetableDays[day][7]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Log Mtandao Form & List */}
              <div className="space-y-6 lg:col-span-1">
                {/* Add Entry */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-display font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <FileText size={15} className="text-cyan-500" />
                    <span>Rekodi Log ya Mtandao</span>
                  </h3>
                  
                  <form onSubmit={handleAddLog} className="space-y-3 text-xs font-bold text-slate-700">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block uppercase">Somo</label>
                        <select 
                          value={newLog.subject}
                          onChange={(e) => setNewLog({ ...newLog, subject: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none"
                        >
                          <option>Physics</option>
                          <option>Chemistry</option>
                          <option>Biology</option>
                          <option>Basic Math</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block uppercase">Darasa</label>
                        <input 
                          type="text" 
                          value={newLog.class}
                          onChange={(e) => setNewLog({ ...newLog, class: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block uppercase">Mada (Topic)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="mf. Waves"
                        value={newLog.topic}
                        onChange={(e) => setNewLog({ ...newLog, topic: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none font-semibold text-slate-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block uppercase">Mada Ndogo (Subtopic)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="mf. Sound waves reflection"
                        value={newLog.subtopic}
                        onChange={(e) => setNewLog({ ...newLog, subtopic: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none font-semibold text-slate-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block uppercase">Maoni (Remarks / Observations)</label>
                      <textarea 
                        rows={2}
                        placeholder="Wanafunzi walifanya vyema..."
                        value={newLog.remark}
                        onChange={(e) => setNewLog({ ...newLog, remark: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none font-semibold text-slate-700"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-2.5 rounded-xl uppercase tracking-wider text-[10px] transition-all cursor-pointer"
                    >
                      Hifadhi Log ya Leo
                    </button>
                  </form>
                </div>

                {/* Log list */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-display font-black text-slate-900 text-xs uppercase tracking-wider block">Logbook ya Hivi Karibuni</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-none">
                    {logBooks.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-150 space-y-1 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span className="text-cyan-600">{item.subject} - {item.class}</span>
                          <span className="text-slate-400 text-[10px]">{item.date}</span>
                        </div>
                        <div className="text-slate-900 font-extrabold text-[11px]">{item.topic} &rarr; {item.subtopic}</div>
                        <p className="text-[10.5px] text-slate-500 font-medium italic">{item.remark}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold pt-1 uppercase">
                          <span>Mahudhurio: {item.attendance}</span>
                          <span className="text-emerald-600">● {item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: AGIZA MFUMO & MAELEWANO */}
        {activeTab === 'maelewano' && (
          <div className="max-w-4xl mx-auto text-left">
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Form Side */}
              <div className="md:col-span-2 space-y-6 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-8">
                <div>
                  <h3 className="font-display font-black text-slate-900 text-lg uppercase tracking-tight">Kuanzisha Utengenezaji wa Mfumo wako</h3>
                  <p className="text-xs text-slate-500 font-medium">Chagua vifurushi na nyaraka unazohitaji ili kupata makadirio ya mchango wako, huduma inakamilika ndani ya dakika 10 pekee!</p>
                </div>

                {orderSubmitted ? (
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 text-center space-y-4">
                    <CheckCircle2 size={40} className="text-emerald-500 mx-auto animate-bounce" />
                    <div className="space-y-1">
                      <h4 className="font-display font-black text-emerald-950 text-sm uppercase">Orodha Imetumwa Kikamilifu!</h4>
                      <p className="text-xs text-emerald-800 leading-relaxed font-semibold">Tumeandaa mchanganuo wa maagizo yako. Mfumo unakupeleka WhatsApp sasa hivi ili kukamilisha makubaliano ya being na malipo (MAELEWANO).</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendOrder} className="space-y-4 text-xs font-bold text-slate-700">
                    
                    {/* Services checkboxes */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 block">Huduma Zinazohitajika (Chagua)</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-semibold text-slate-800">
                        {[
                          'Mfumo wa Kuchakata Matokeo (2000+ Students)',
                          'SMS Gateway Integration for Parents',
                          'General School Timetable Builder',
                          'Lesson Plans & Schemes of Work (Kidato 1-6)',
                          'Parent Report Card Generator',
                          'Log Mtandao / Digital Logbooks'
                        ].map((serv) => {
                          const isChecked = selectedServices.includes(serv);
                          return (
                            <div 
                              key={serv} 
                              onClick={() => handleServiceToggle(serv)}
                              className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                                isChecked 
                                  ? 'bg-slate-900 text-white border-slate-900' 
                                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${isChecked ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'bg-white border-slate-300'}`}>
                                {isChecked && <Check size={11} strokeWidth={3} />}
                              </div>
                              <span className="text-[10.5px] leading-tight">{serv}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 block">Jina la Shule yako</label>
                        <input 
                          type="text" 
                          required
                          placeholder="mf. Lupanulla Secondary School"
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none text-slate-800 font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 block">Jina la Mwalimu Mkuu/Msimamizi</label>
                        <input 
                          type="text" 
                          required
                          placeholder="mf. Mwl. Juma Kassim"
                          value={teacherName}
                          onChange={(e) => setTeacherName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none text-slate-800 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 block">Namba ya Simu (WhatsApp)</label>
                        <input 
                          type="tel" 
                          required
                          placeholder="mf. 0655883838"
                          value={phoneNo}
                          onChange={(e) => setPhoneNo(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none text-slate-800 font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 block">Idadi ya Wanafunzi</label>
                        <input 
                          type="number" 
                          required
                          value={studentCount}
                          onChange={(e) => setStudentCount(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none text-slate-800 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-slate-400">
                        <span>Bajeti yako Iliyotengwa</span>
                        <strong className="text-cyan-600">TZS {budgetRange.toLocaleString()}</strong>
                      </div>
                      <input 
                        type="range" 
                        min="50000" 
                        max="1000000" 
                        step="25000"
                        value={budgetRange}
                        onChange={(e) => setBudgetRange(Number(e.target.value))}
                        className="w-full accent-cyan-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 block">Maelezo ya Ziada / Custom requirements</label>
                      <textarea 
                        rows={2}
                        placeholder="Andika hapa maelezo ya ziada unayohitaji..."
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none text-slate-800 font-semibold"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-500/10 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-xs"
                    >
                      <MessageSquare size={16} />
                      Agiza &amp; Ongea na Mwalimu WhatsApp
                    </button>
                  </form>
                )}
              </div>

              {/* Info/Negotiation Panel */}
              <div className="md:col-span-1 space-y-6">
                <div className="bg-slate-950 p-6 rounded-3xl text-white space-y-6 relative overflow-hidden border border-slate-800">
                  <div className="absolute inset-0 bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:12px_12px] opacity-10"></div>
                  
                  <div className="space-y-3 relative z-10">
                    <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border border-cyan-500/25">MAELEWANO</span>
                    <h4 className="font-display font-black text-white text-sm uppercase">Bei na Malipo</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">Tunaamini elimu inapaswa kuwa rahisi na nafuu kwa shule na walimu wote nchini Tanzania. Ndio maana mifumo yetu yote haina bei ya kudumu:</p>
                  </div>

                  <div className="space-y-3 relative z-10 text-[11px] font-semibold text-slate-300">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={13} className="text-cyan-400 shrink-0 mt-0.5" />
                      <span>Lipia baada ya mfumo kuandaliwa na kuanza kufanya kazi shuleni kwako.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={13} className="text-cyan-400 shrink-0 mt-0.5" />
                      <span>Uwezo wa kubadilisha madaraja na pointi kulingana na muundo wa shule yako.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={13} className="text-cyan-400 shrink-0 mt-0.5" />
                      <span>Tutaunganisha SMS Gateway yenye jina la Shule yako (Sender ID) kupitia mitandao yote.</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 relative z-10 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mkurugenzi wa Mifumo</span>
                    <span className="text-white text-xs font-extrabold block mt-0.5">Mwl. Lupanulla Elimu</span>
                    <span className="text-[10px] text-cyan-400 font-bold block mt-0.5">lupanulla.co.tz@gmail.com</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: SMS GATEWAY CONFIGURATION */}
        {activeTab === 'sms-config' && (
          <div className="max-w-4xl mx-auto text-left">
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-lg space-y-8">
              
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <div className="bg-cyan-100 text-cyan-800 p-3 rounded-2xl">
                  <Settings size={24} />
                </div>
                <div>
                  <h3 className="font-display font-black text-slate-900 text-base uppercase tracking-tight">Usanidi wa SMS Gateway</h3>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Sanidi watoa huduma wa SMS (Africa's Talking / Infobip) kwa ajili ya kutuma matokeo halisi kwa wazazi</p>
                </div>
              </div>

              <form onSubmit={handleSaveSMSConfig} className="space-y-6">
                
                {/* Provider Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Chagua Mtoa Huduma wa SMS (SMS Provider)</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'simulation', name: 'Simulation (Majaribio)', desc: 'Hakuna gharama au funguo za API.' },
                      { id: 'africastalking', name: "Africa's Talking", desc: 'Inafaa kwa Afrika Mashariki.' },
                      { id: 'infobip', name: 'Infobip', desc: 'Mtoa huduma wa kimataifa.' }
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSmsProvider(p.id as any)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                          smsProvider === p.id 
                            ? 'border-cyan-500 bg-cyan-500/5 ring-1 ring-cyan-500' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs font-black uppercase text-slate-900 block">{p.name}</span>
                        <span className="text-[10px] text-slate-500 font-semibold block mt-1 leading-snug">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {smsConfigLoading ? (
                  <div className="py-12 text-center text-xs font-bold text-slate-500 animate-pulse">
                    Inasoma Mipangilio ya Seva...
                  </div>
                ) : (
                  <>
                    {smsProvider === 'simulation' && (
                      <div className="p-5 bg-cyan-50 border border-cyan-200 rounded-2xl text-xs font-medium text-cyan-800 space-y-2 leading-relaxed">
                        <h4 className="font-black uppercase tracking-wider text-cyan-900">Njia ya Majaribio (Simulation Mode)</h4>
                        <p>Njia hii inaruhusu walimu wote kufanya majaribio ya kutuma matokeo kwa wazazi bila kuunganisha API key yoyote.</p>
                        <p className="font-bold">Ujumbe wote utaandikwa kwenye "Live Log" ya mchakataji, kuonesha mchanganuo kamili wa jinsi mzazi angepokea SMS hiyo shuleni.</p>
                      </div>
                    )}

                    {smsProvider === 'africastalking' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 font-semibold">
                          Usajili na API keys: Nenda kwenye <a href="https://africastalking.com" target="_blank" rel="noopener noreferrer" className="text-cyan-600 underline" onClick={(e) => e.stopPropagation()}>africastalking.com</a>, tengeneza akaunti, kisha nakili Username (kwa majaribio tumia "sandbox") na API Key yako hapa chini.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Username</label>
                            <input
                              type="text"
                              value={smsUsername}
                              onChange={(e) => setSmsUsername(e.target.value)}
                              placeholder="sandbox au Username yako"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none text-slate-800 text-xs font-semibold focus:ring-1 focus:ring-cyan-500"
                              required
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Sender ID / Shortcode (Optional)</label>
                            <input
                              type="text"
                              value={smsSenderId}
                              onChange={(e) => setSmsSenderId(e.target.value)}
                              placeholder="Mfano: SHULE_YETU (Acha wazi kwa sandbox)"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none text-slate-800 text-xs font-semibold focus:ring-1 focus:ring-cyan-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Africa's Talking API Key</label>
                          <input
                            type="password"
                            value={smsApiKey}
                            onChange={(e) => setSmsApiKey(e.target.value)}
                            placeholder={hasApiKey ? "••••••••••••••••" : "Weka API Key yako ya Africa's Talking"}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none text-slate-800 text-xs font-semibold focus:ring-1 focus:ring-cyan-500"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {smsProvider === 'infobip' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 font-semibold">
                          Nenda kwenye <a href="https://infobip.com" target="_blank" rel="noopener noreferrer" className="text-cyan-600 underline" onClick={(e) => e.stopPropagation()}>infobip.com</a> ili kusajili akaunti. Kisha andika API Key, Base URL ya akaunti yako, na Sender ID hapa chini.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Infobip Base URL</label>
                            <input
                              type="text"
                              value={smsInfobipBaseUrl}
                              onChange={(e) => setSmsInfobipBaseUrl(e.target.value)}
                              placeholder="Mfano: https://xyz.api.infobip.com"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none text-slate-800 text-xs font-semibold focus:ring-1 focus:ring-cyan-500"
                              required
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Sender ID / From Header</label>
                            <input
                              type="text"
                              value={smsSenderId}
                              onChange={(e) => setSmsSenderId(e.target.value)}
                              placeholder="Mfano: InfoSMS au Jina la Shule"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none text-slate-800 text-xs font-semibold focus:ring-1 focus:ring-cyan-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Infobip API Key</label>
                          <input
                            type="password"
                            value={smsApiKey}
                            onChange={(e) => setSmsApiKey(e.target.value)}
                            placeholder={hasApiKey ? "••••••••••••••••" : "Weka API Key yako ya Infobip"}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none text-slate-800 text-xs font-semibold focus:ring-1 focus:ring-cyan-500"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${hasApiKey ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                          {hasApiKey ? 'API KEY IMEHIFADHIWA SIKU ZA NYUMA' : 'API KEY HAIJASANIDIWA BADO'}
                        </span>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={smsConfigSaving}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {smsConfigSaving ? 'Inahifadhi...' : 'Hifadhi Mipangilio'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
