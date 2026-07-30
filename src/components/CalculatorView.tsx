import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  HelpCircle, 
  RefreshCw, 
  Award, 
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Info,
  BookOpen,
  GraduationCap,
  School,
  ChevronRight
} from 'lucide-react';

interface SubjectScore {
  name: string;
  grade: string;
}

interface UniversityCourse {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

type AcademicLevel = 'primary' | 'olevel' | 'alevel' | 'university';

export default function CalculatorView() {
  const [currentLevel, setCurrentLevel] = useState<AcademicLevel>('olevel');

  // --- 1. Primary School States ---
  const primarySubjectsList = [
    'Hisabati (Mathematics)',
    'Sayansi na Teknolojia (Science & Tech)',
    'Kiswahili',
    'English Language',
    'Maarifa ya Jamii (Social Studies)',
    'Uraia na Maadili (Civic & Moral Education)'
  ];
  const [primaryScores, setPrimaryScores] = useState<SubjectScore[]>(
    primarySubjectsList.map(name => ({ name, grade: '' }))
  );

  // --- 2. O-Level States ---
  const olevelSubjectsList = [
    'Basic Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English Language',
    'Kiswahili',
    'Civics',
    'History',
    'Geography',
    'Bookkeeping',
    'Commerce',
    'Additional Mathematics',
    'Literature in English',
    'Bible Knowledge / Islamic Knowledge'
  ];
  const [olevelScores, setOlevelScores] = useState<SubjectScore[]>(
    olevelSubjectsList.map(name => ({ name, grade: '' }))
  );

  // --- 3. A-Level States ---
  const alevelSubjectsList = [
    'General Studies (GS)',
    'Advanced Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Geography',
    'History',
    'Economics',
    'Kiswahili',
    'English Language',
    'Literature in English',
    'Commerce',
    'Bookkeeping',
    'Agriculture'
  ];
  const [alevelScores, setAlevelScores] = useState<SubjectScore[]>(
    alevelSubjectsList.map(name => ({ name, grade: '' }))
  );

  // --- 4. University States ---
  const [universityCourses, setUniversityCourses] = useState<UniversityCourse[]>([
    { id: '1', name: 'Course 1', credits: 3, grade: '' },
    { id: '2', name: 'Course 2', credits: 3, grade: '' },
    { id: '3', name: 'Course 3', credits: 3, grade: '' },
    { id: '4', name: 'Course 4', credits: 4, grade: '' },
  ]);

  // --- Calculation Results State ---
  const [result, setResult] = useState<{
    division: string;
    points: number;
    gpa: number;
    status: string;
    levelName: string;
    details?: string;
  } | null>(null);

  // Reset calculator based on level
  const handleReset = () => {
    setResult(null);
    if (currentLevel === 'primary') {
      setPrimaryScores(primarySubjectsList.map(name => ({ name, grade: '' })));
    } else if (currentLevel === 'olevel') {
      setOlevelScores(olevelSubjectsList.map(name => ({ name, grade: '' })));
    } else if (currentLevel === 'alevel') {
      setAlevelScores(alevelSubjectsList.map(name => ({ name, grade: '' })));
    } else if (currentLevel === 'university') {
      setUniversityCourses([
        { id: '1', name: 'Course 1', credits: 3, grade: '' },
        { id: '2', name: 'Course 2', credits: 3, grade: '' },
        { id: '3', name: 'Course 3', credits: 3, grade: '' },
        { id: '4', name: 'Course 4', credits: 4, grade: '' },
      ]);
    }
  };

  // Reset output automatically on level switch
  useEffect(() => {
    setResult(null);
  }, [currentLevel]);

  // --- Handlers for grade changes ---
  const handlePrimaryGradeChange = (index: number, grade: string) => {
    const updated = [...primaryScores];
    updated[index].grade = grade;
    setPrimaryScores(updated);
  };

  const handleOlevelGradeChange = (index: number, grade: string) => {
    const updated = [...olevelScores];
    updated[index].grade = grade;
    setOlevelScores(updated);
  };

  const handleAlevelGradeChange = (index: number, grade: string) => {
    const updated = [...alevelScores];
    updated[index].grade = grade;
    setAlevelScores(updated);
  };

  // --- University Dynamic Add/Remove/Change Row ---
  const handleAddUniversityCourse = () => {
    const newId = (universityCourses.length + 1).toString();
    setUniversityCourses([
      ...universityCourses,
      { id: newId, name: `Course ${newId}`, credits: 3, grade: '' }
    ]);
  };

  const handleRemoveUniversityCourse = (id: string) => {
    if (universityCourses.length <= 1) return;
    setUniversityCourses(universityCourses.filter(c => c.id !== id));
  };

  const handleUniversityChange = (id: string, field: keyof UniversityCourse, value: any) => {
    setUniversityCourses(
      universityCourses.map(c => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // --- Calculation Engines ---

  // 1. Primary (PSLE) Calculations
  const calculatePrimary = () => {
    const graded = primaryScores.filter(s => s.grade !== '');
    if (graded.length < 4) {
      alert('Tafadhali weka alama kwa angalau masomo 4 ili kupiga hesabu ya wastani wa Darasa la Saba.');
      return;
    }

    // Map grades to numeric points (A=5, B=4, C=3, D=2, E=1)
    const pointsMap: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1 };
    const scoreSum = graded.reduce((acc, curr) => acc + pointsMap[curr.grade], 0);
    const averagePoints = Number((scoreSum / graded.length).toFixed(2));

    let division = 'DARAJA C (Wastani)';
    let status = 'Kiwango kizuri cha wastani wa ufaulu wa shule ya msingi. Jitahidi kuongeza bidii sekondari!';
    
    if (averagePoints >= 4.1) {
      division = 'DARAJA A (Bora Sana)';
      status = 'Ufaulu wa kiwango cha juu mno! Una sifa bora za kujiunga na shule bora za sekondari za kitaifa.';
    } else if (averagePoints >= 3.1) {
      division = 'DARAJA B (Vizuri)';
      status = 'Kazi nzuri sana! Umefaulu vizuri sana na una sifa bora za kujiunga na sekondari.';
    } else if (averagePoints >= 2.1) {
      division = 'DARAJA C (Wastani)';
      status = 'Umefaulu na kupata wastani wa kuridhisha wa kujiunga na kidato cha kwanza.';
    } else if (averagePoints >= 1.1) {
      division = 'DARAJA D (Inaridhisha)';
      status = 'Ufaulu wa kiwango cha chini (D). Unaweza kuhitaji ushauri na masomo ya ziada ya ziada.';
    } else {
      division = 'DARAJA E (Dhaifu/Kufeli)';
      status = 'Ufaulu hafifu. Inabidi urudie mtihani au kupata ushauri wa kitaaluma.';
    }

    setResult({
      levelName: 'Darasa la Saba (PSLE)',
      division,
      points: scoreSum,
      gpa: averagePoints,
      status,
      details: `Umekokotoa wastani kutoka kwa masomo ${graded.length} yaliyowekewa alama.`
    });
  };

  // 2. O-Level (CSEE) Calculations
  const calculateOlevel = () => {
    const graded = olevelScores.filter(s => s.grade !== '');
    if (graded.length < 7) {
      alert('Tafadhali weka alama kwa angalau masomo 7 ya mtaala (ikiwemo masomo ya lazima) ili kupiga hesabu.');
      return;
    }

    // Map O-Level grades to NECTA points (A=1, B=2, C=3, D=4, F=5)
    const olevelGradeValues: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, F: 5 };
    const pointsList = graded.map(s => olevelGradeValues[s.grade]).sort((a, b) => a - b);
    
    // Take the best 7 subjects
    const bestSeven = pointsList.slice(0, 7);
    const pointsSum = bestSeven.reduce((acc, curr) => acc + curr, 0);
    const gpa = Number((pointsSum / 7).toFixed(2));

    let division = 'DARAJA LA SIFURI (Division 0)';
    let status = 'Ufaulu hafifu. Inabidi uongeze juhudi au urudie mitihani ili kupata alama za kujiunga na ngazi nyingine.';

    if (pointsSum >= 7 && pointsSum <= 17) {
      division = 'DARAJA LA KWANZA (Division I)';
      status = 'Hongera sana! Umefaulu kwa kiwango cha juu sana kitaifa. Una sifa za kujiunga na tahasusi yoyote kidato cha tano.';
    } else if (pointsSum >= 18 && pointsSum <= 21) {
      division = 'DARAJA LA PILI (Division II)';
      status = 'Safi sana! Umefaulu vizuri sana na una sifa thabiti ya kujiunga na Kidato cha Tano au vyuo vya kati.';
    } else if (pointsSum >= 22 && pointsSum <= 25) {
      division = 'DARAJA LA TATU (Division III)';
      status = 'Vizuri! Umefaulu na una sifa nzuri za kujiunga na masomo ya juu au mafunzo ya vyuo mbalimbali nchini.';
    } else if (pointsSum >= 26 && pointsSum <= 33) {
      division = 'DARAJA LA NNE (Division IV)';
      status = 'Umefaulu. Unahitaji kuwa na angalau ufaulu wa D tatu (au zaidi kulingana na muundo) ili kupata sifa ya vyuo vya stashahada/cheti.';
    }

    setResult({
      levelName: 'Kidato cha Nne (CSEE)',
      division,
      points: pointsSum,
      gpa,
      status,
      details: `Imekokotolewa kulingana na masomo yako 7 bora yaliyowekwa alama.`
    });
  };

  // 3. A-Level (ACSEE) Calculations
  const calculateAlevel = () => {
    // Principal subjects are everything except General Studies (GS)
    const principalGraded = alevelScores.filter(s => s.name !== 'General Studies (GS)' && s.grade !== '');
    const gsScore = alevelScores.find(s => s.name === 'General Studies (GS)')?.grade || '';

    if (principalGraded.length < 3) {
      alert('Tafadhali weka alama kwa masomo yote 3 ya Tahasusi (Principal Subjects) ili kupiga hesabu ya Division.');
      return;
    }

    // Map ACSEE grades to points (A=1, B=2, C=3, D=4, E=5, S=6, F=7)
    const alevelGradeValues: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5, S: 6, F: 7 };
    
    // Sort and take the best 3 principal subjects (or exactly 3 if that's what's filled)
    const sortedPoints = principalGraded.map(s => alevelGradeValues[s.grade]).sort((a, b) => a - b);
    const bestThreePoints = sortedPoints.slice(0, 3);
    const pointsSum = bestThreePoints.reduce((acc, curr) => acc + curr, 0);
    const gpa = Number((pointsSum / 3).toFixed(2));

    let division = 'DARAJA LA SIFURI (Division 0)';
    let status = 'Hujafikia vigezo vya kupata Division katika mtihani wa Kidato cha Sita.';

    if (pointsSum >= 3 && pointsSum <= 9) {
      division = 'DARAJA LA KWANZA (Division I)';
      status = 'Hongera sana! Ufaulu mkubwa wa Division I. Sifa dhabiti ya kudahiliwa moja kwa moja kwenye fani yoyote chuo kikuu.';
    } else if (pointsSum >= 10 && pointsSum <= 12) {
      division = 'DARAJA LA PILI (Division II)';
      status = 'Vizuri sana! Umepata Division II dhabiti. Una sifa kamili za kudahiliwa chuo kikuu.';
    } else if (pointsSum >= 13 && pointsSum <= 17) {
      division = 'DARAJA LA TATU (Division III)';
      status = 'Kazi nzuri! Division III inakuhakikishia nafasi nzuri za masomo ya shahada katika vyuo vikuu vingi vya Tanzania.';
    } else if (pointsSum >= 18 && pointsSum <= 19) {
      division = 'DARAJA LA NNE (Division IV)';
      status = 'Division IV. Unaweza kuhitaji kuunganisha matokeo au kudahiliwa kupitia vyuo vya kati/diploma kwanza.';
    }

    let gsStatus = '';
    if (gsScore) {
      if (gsScore === 'F') {
        gsStatus = ' Zingatia: Umefeli somo la General Studies (GS) ambalo linaweza kuchelewesha baadhi ya vigezo vya TCU chuo kikuu.';
      } else {
        gsStatus = ' Vizuri: Umefaulu pia General Studies (GS - Grade ' + gsScore + ') ambayo ni sifa ya nyongeza.';
      }
    }

    setResult({
      levelName: 'Kidato cha Sita (ACSEE)',
      division,
      points: pointsSum,
      gpa,
      status: status + gsStatus,
      details: `Imekokotolewa kutokana na masomo yako 3 bora ya tahasusi (kwa mfano PCM, PCB, HGL, HKL).`
    });
  };

  // 4. University Calculations
  const calculateUniversity = () => {
    const graded = universityCourses.filter(c => c.grade !== '');
    if (graded.length === 0) {
      alert('Tafadhali ingiza alama kwa angalau kozi moja ya chuo kikuu.');
      return;
    }

    // Map university grades to standard Tanzanian points (A=5, B+=4, B=3, C=2, D=1, E=0)
    const uniGradePoints: Record<string, number> = {
      'A': 5.0,
      'B+': 4.0,
      'B': 3.0,
      'C': 2.0,
      'D': 1.0,
      'E': 0.0
    };

    let totalWeightedPoints = 0;
    let totalCredits = 0;

    graded.forEach(c => {
      const gp = uniGradePoints[c.grade];
      totalWeightedPoints += gp * c.credits;
      totalCredits += c.credits;
    });

    const gpa = Number((totalWeightedPoints / totalCredits).toFixed(2));

    let division = 'FAIL (Hakuna Tuzo)';
    let status = 'GPA ipo chini ya kiwango cha kufaulu (2.0). Utahitaji kufanya supplementary au kuboresha ufaulu wako.';

    if (gpa >= 4.4) {
      division = 'FIRST CLASS (Daraja la Kwanza)';
      status = 'Ufaulu wa kipekee na wa kiwango cha dhahabu chuo kikuu! Hongera kwa kuwa mwanafunzi bora zaidi.';
    } else if (gpa >= 3.5) {
      division = 'UPPER SECOND CLASS (Daraja la Pili Juu)';
      status = 'Kazi nzuri sana! Umepata daraja thabiti na maarufu sana linalofungua milango ya fursa nyingi za kazi na ufadhili wa masomo.';
    } else if (gpa >= 2.7) {
      division = 'LOWER SECOND CLASS (Daraja la Pili Chini)';
      status = 'Umefaulu vizuri. Daraja hili ni zuri na linakuwezesha kuhitimu shahada yako kikamilifu.';
    } else if (gpa >= 2.0) {
      division = 'PASS (Kufaulu kwa Kiwango cha Chini)';
      status = 'Umefaulu na utahitimu shahada yako. Tafuta uzoefu wa vitendo kuboresha wasifu wako.';
    }

    setResult({
      levelName: 'Elimu ya Juu / Chuo Kikuu (GPA)',
      division,
      points: totalCredits, // Display total credit hours as points in result UI
      gpa,
      status,
      details: `Imekokotolewa kutoka kozi ${graded.length} zenye jumla ya pindi/credeti ${totalCredits} za masomo.`
    });
  };

  // Switch between calculators
  const triggerCalculate = () => {
    if (currentLevel === 'primary') calculatePrimary();
    else if (currentLevel === 'olevel') calculateOlevel();
    else if (currentLevel === 'alevel') calculateAlevel();
    else if (currentLevel === 'university') calculateUniversity();
  };

  return (
    <div id="calculator-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Dynamic Jumbotron Header */}
      <section className="bg-gradient-to-r from-cyan-600 via-indigo-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-cyan-500/10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 space-y-3 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-black uppercase tracking-wider">
            <Calculator size={12} className="animate-pulse" /> Kikokotoo Rasmi cha Elimu Tanzania
          </span>
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold uppercase tracking-tight">Kikokotoo cha GPA na Division</h1>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Kikokotoo mahiri kinachokidhi mifumo yote ya Tanzania kuanzia Shule za Msingi (PSLE), Kidato cha Nne (CSEE), Kidato cha Sita (ACSEE), hadi ngazi ya Chuo Kikuu (GPA Scale ya 5.0).
          </p>
        </div>
      </section>

      {/* Navigation Tabs for Educational Levels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white p-2 border border-slate-200 rounded-2xl shadow-sm">
        <button
          onClick={() => setCurrentLevel('primary')}
          className={`px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            currentLevel === 'primary' 
              ? 'bg-slate-900 text-white shadow-md' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <School size={14} /> Darasa la Saba
        </button>
        <button
          onClick={() => setCurrentLevel('olevel')}
          className={`px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            currentLevel === 'olevel' 
              ? 'bg-slate-900 text-white shadow-md' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <BookOpen size={14} /> Kidato cha 4 (CSEE)
        </button>
        <button
          onClick={() => setCurrentLevel('alevel')}
          className={`px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            currentLevel === 'alevel' 
              ? 'bg-slate-900 text-white shadow-md' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <GraduationCap size={14} /> Kidato cha 6 (ACSEE)
        </button>
        <button
          onClick={() => setCurrentLevel('university')}
          className={`px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
            currentLevel === 'university' 
              ? 'bg-slate-900 text-white shadow-md' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Award size={14} /> Chuo Kikuu (GPA)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Interactive Input Section */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div className="space-y-0.5">
                <h3 className="font-display font-black text-slate-900 text-sm uppercase flex items-center gap-2">
                  <ChevronRight size={16} className="text-cyan-500 animate-pulse" />
                  {currentLevel === 'primary' && "Masomo ya Msingi (Tanzania Primary Curriculum)"}
                  {currentLevel === 'olevel' && "Masomo ya Kidato cha Nne (CSEE Syllabus)"}
                  {currentLevel === 'alevel' && "Masomo ya Kidato cha Sita (ACSEE Principal & GS)"}
                  {currentLevel === 'university' && "Daftari la Kozi za Semesta (Semester Courses Ledger)"}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold">
                  {currentLevel === 'primary' && "Weka madaraja A hadi E kulingana na viwango vya PSLE."}
                  {currentLevel === 'olevel' && "Mfumo wa pointi unazingatia masomo 7 bora. A=1, B=2, C=3, D=4, F=5."}
                  {currentLevel === 'alevel' && "Division inajumlisha masomo 3 ya tahasusi. A=1, B=2, C=3, D=4, E=5, S=6, F=7."}
                  {currentLevel === 'university' && "Weka masomo yote ya semesta, uzito wa mikopo (credits/units), na grade yako."}
                </p>
              </div>
              <button 
                onClick={handleReset} 
                className="text-slate-400 hover:text-slate-700 text-xs font-black flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <RefreshCw size={12} /> Anza Upya
              </button>
            </div>

            {/* Render Primary list */}
            {currentLevel === 'primary' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {primaryScores.map((subj, idx) => (
                  <div key={subj.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-150">
                    <span className="text-xs font-extrabold text-slate-800 line-clamp-1">{subj.name}</span>
                    <select
                      value={subj.grade}
                      onChange={(e) => handlePrimaryGradeChange(idx, e.target.value)}
                      className="bg-white border border-slate-250 rounded-xl px-3 py-1.5 text-xs font-black text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Grade</option>
                      <option value="A">Grade A (41-50)</option>
                      <option value="B">Grade B (31-40)</option>
                      <option value="C">Grade C (21-30)</option>
                      <option value="D">Grade D (11-20)</option>
                      <option value="E">Grade E (0-10)</option>
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* Render O-Level list */}
            {currentLevel === 'olevel' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-2">
                {olevelScores.map((subj, idx) => (
                  <div key={subj.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-150">
                    <span className="text-xs font-extrabold text-slate-800 line-clamp-1">{subj.name}</span>
                    <select
                      value={subj.grade}
                      onChange={(e) => handleOlevelGradeChange(idx, e.target.value)}
                      className="bg-white border border-slate-250 rounded-xl px-3 py-1.5 text-xs font-black text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Weka Grade</option>
                      <option value="A">Grade A (Excellent - Pt 1)</option>
                      <option value="B">Grade B (Very Good - Pt 2)</option>
                      <option value="C">Grade C (Good - Pt 3)</option>
                      <option value="D">Grade D (Satisfactory - Pt 4)</option>
                      <option value="F">Grade F (Fail - Pt 5)</option>
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* Render A-Level list */}
            {currentLevel === 'alevel' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-2">
                {alevelScores.map((subj, idx) => (
                  <div key={subj.name} className={`flex items-center justify-between p-3 rounded-2xl border ${
                    subj.name === 'General Studies (GS)' 
                      ? 'bg-amber-50/60 border-amber-200' 
                      : 'bg-slate-50 border-slate-150'
                  }`}>
                    <div className="space-y-0.5">
                      <span className="text-xs font-extrabold text-slate-800 line-clamp-1">{subj.name}</span>
                      {subj.name === 'General Studies (GS)' && (
                        <span className="text-[9px] text-amber-600 font-bold block">Lazima (GS haina Pointi za Division)</span>
                      )}
                    </div>
                    <select
                      value={subj.grade}
                      onChange={(e) => handleAlevelGradeChange(idx, e.target.value)}
                      className="bg-white border border-slate-250 rounded-xl px-3 py-1.5 text-xs font-black text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Weka Grade</option>
                      <option value="A">Grade A (80-100 - Pt 1)</option>
                      <option value="B">Grade B (70-79 - Pt 2)</option>
                      <option value="C">Grade C (60-69 - Pt 3)</option>
                      <option value="D">Grade D (50-59 - Pt 4)</option>
                      <option value="E">Grade E (40-49 - Pt 5)</option>
                      <option value="S">Grade S (Subsidiary - Pt 6)</option>
                      <option value="F">Grade F (Fail - Pt 7)</option>
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* Render University Dynamic List */}
            {currentLevel === 'university' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-indigo-50/50 px-4 py-2 rounded-xl text-xs font-black text-indigo-900 border border-indigo-100">
                  <span>Jina la Somo/Kozi</span>
                  <div className="flex gap-12 mr-6">
                    <span>Credit Hours</span>
                    <span>Grade ya Chuo</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {universityCourses.map((course) => (
                    <div key={course.id} className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-150">
                      <input
                        type="text"
                        value={course.name}
                        onChange={(e) => handleUniversityChange(course.id, 'name', e.target.value)}
                        placeholder="e.g. CS 101, DS 101, Law"
                        className="bg-white border border-slate-250 rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-800 flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />

                      <div className="flex items-center gap-3 justify-end">
                        <div className="flex items-center gap-1 shrink-0">
                          <label className="text-[10px] font-bold text-slate-400 sm:hidden">Credits:</label>
                          <select
                            value={course.credits}
                            onChange={(e) => handleUniversityChange(course.id, 'credits', parseInt(e.target.value, 10))}
                            className="bg-white border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-black text-slate-700 cursor-pointer"
                          >
                            <option value="1">1 Credit</option>
                            <option value="2">2 Credits</option>
                            <option value="3">3 Credits</option>
                            <option value="4">4 Credits</option>
                            <option value="5">5 Credits</option>
                            <option value="6">6 Credits</option>
                          </select>
                        </div>

                        <select
                          value={course.grade}
                          onChange={(e) => handleUniversityChange(course.id, 'grade', e.target.value)}
                          className="bg-white border border-slate-250 rounded-xl px-2.5 py-1.5 text-xs font-black text-slate-700 cursor-pointer"
                        >
                          <option value="">Grade</option>
                          <option value="A">Grade A (Excellent - 5.0)</option>
                          <option value="B+">Grade B+ (Very Good - 4.0)</option>
                          <option value="B">Grade B (Good - 3.0)</option>
                          <option value="C">Grade C (Pass - 2.0)</option>
                          <option value="D">Grade D (Marginal Fail - 1.0)</option>
                          <option value="E">Grade E (Fail - 0.0)</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveUniversityCourse(course.id)}
                          disabled={universityCourses.length <= 1}
                          className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 disabled:opacity-40 transition-colors cursor-pointer"
                          title="Futa Somo hili"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddUniversityCourse}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Plus size={14} /> Sajili Somo Lingine la Chuo
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={triggerCalculate}
            className="w-full mt-6 py-4 text-xs text-center font-extrabold bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-all shadow-md uppercase tracking-wide cursor-pointer flex items-center justify-center gap-2"
          >
            <Calculator size={15} /> KOKOTOA MATOKEO NA DIVISION YANGU
          </button>
        </div>

        {/* Right Output & Guidelines Cards Panel */}
        <div className="space-y-6">
          {/* Output Display Card */}
          {result ? (
            <div className="bg-gradient-to-br from-slate-950 to-indigo-950 text-white border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-fade-in relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="text-center space-y-1.5 border-b border-white/5 pb-4">
                <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest block">Matokeo Yako yaliyokokotolewa</span>
                <span className="text-[9px] bg-white/10 px-2.5 py-0.5 rounded-full font-bold text-slate-300 uppercase">{result.levelName}</span>
                <h4 className="font-display font-black text-cyan-400 text-base sm:text-xl leading-tight uppercase pt-2">{result.division}</h4>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center border-b border-white/5 pb-5">
                <div className="space-y-1 border-r border-slate-800">
                  <span className="text-slate-400 text-[10px] font-black uppercase">
                    {currentLevel === 'university' ? 'Jumla ya Mikopo' : 'Jumla ya Pointi'}
                  </span>
                  <p className="text-3xl font-display font-black text-white">{result.points}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] font-black uppercase">Wastani (GPA)</span>
                  <p className="text-3xl font-display font-black text-white">{result.gpa}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
                  <p className="text-[11px] text-slate-200 font-bold leading-relaxed text-center italic">
                    &ldquo;{result.status}&rdquo;
                  </p>
                </div>
                
                <p className="text-[10px] text-slate-400 font-semibold text-center">
                  {result.details}
                </p>

                <div className="flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-[9px] text-slate-400 font-black uppercase tracking-wider">
                  <Award size={13} className="text-amber-500" />
                  {currentLevel === 'primary' && "Mtaala: A=5, B=4, C=3, D=2, E=1"}
                  {currentLevel === 'olevel' && "NECTA CSEE: A=1, B=2, C=3, D=4, F=5 (7 Bora)"}
                  {currentLevel === 'alevel' && "NECTA ACSEE: A=1, B=2, C=3, D=4, E=5, S=6, F=7"}
                  {currentLevel === 'university' && "Grading: A=5.0, B+=4.0, B=3.0, C=2.0, D=1.0, E=0.0"}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-250 rounded-3xl p-6 text-center py-12 space-y-4 shadow-sm min-h-[320px] flex flex-col justify-center">
              <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto border border-slate-150">
                <HelpCircle size={28} />
              </div>
              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wide">Matokeo Yatabadilika hapa</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed max-w-xs mx-auto font-medium">
                Tafadhali chagua au jaza alama za masomo yako katika orodha ya upande wa kushoto, kisha bofya kitufe cha &quot;Kokotoa&quot; ili kupata daraja na GPA yako mara moja.
              </p>
            </div>
          )}

          {/* Quick Educational System Guide */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3.5">
            <h4 className="font-black text-slate-900 text-xs uppercase flex items-center gap-1.5">
              <Info size={14} className="text-indigo-500" />
              Mwongozo wa Viwango:
            </h4>
            
            {currentLevel === 'primary' && (
              <div className="space-y-2.5">
                <p className="text-[10px] text-slate-400 leading-normal font-semibold">Viwango rasmi vya ufaulu wa shule za msingi Tanzania (Darasa la saba / PSLE):</p>
                <ul className="space-y-2 text-[10px] font-bold text-slate-500">
                  <li className="flex justify-between border-b border-slate-100 pb-1"><span>Daraja A (Bora Sana):</span> <span className="text-emerald-600">Wastani wa 4.1 - 5.0</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-1"><span>Daraja B (Vizuri):</span> <span className="text-indigo-600">Wastani wa 3.1 - 4.0</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-1"><span>Daraja C (Wastani):</span> <span className="text-slate-700">Wastani wa 2.1 - 3.0</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-1"><span>Daraja D (Inaridhisha):</span> <span className="text-amber-600">Wastani wa 1.1 - 2.0</span></li>
                  <li className="flex justify-between"><span>Daraja E (Dhaifu/F):</span> <span className="text-rose-600">Wastani wa 0.0 - 1.0</span></li>
                </ul>
              </div>
            )}

            {currentLevel === 'olevel' && (
              <div className="space-y-2.5">
                <p className="text-[10px] text-slate-400 leading-normal font-semibold">Viwango vya Division kulingana na muhtasari wa alama za NECTA (CSEE):</p>
                <ul className="space-y-2 text-[10px] font-bold text-slate-500">
                  <li className="flex justify-between border-b border-slate-100 pb-1"><span>Division I:</span> <span className="text-emerald-600">Pointi 7 - 17</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-1"><span>Division II:</span> <span className="text-indigo-600">Pointi 18 - 21</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-1"><span>Division III:</span> <span className="text-slate-700">Pointi 22 - 25</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-1"><span>Division IV:</span> <span className="text-amber-600">Pointi 26 - 33</span></li>
                  <li className="flex justify-between"><span>Division 0:</span> <span className="text-rose-600">Pointi 34 - 35</span></li>
                </ul>
              </div>
            )}

            {currentLevel === 'alevel' && (
              <div className="space-y-2.5">
                <p className="text-[10px] text-slate-400 leading-normal font-semibold">Division ya Kidato cha Sita (ACSEE) inayojumlisha masomo 3 ya tahasusi (kwa mfano HGL, PCM):</p>
                <ul className="space-y-2 text-[10px] font-bold text-slate-500">
                  <li className="flex justify-between border-b border-slate-100 pb-1"><span>Division I:</span> <span className="text-emerald-600">Pointi 3 - 9</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-1"><span>Division II:</span> <span className="text-indigo-600">Pointi 10 - 12</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-1"><span>Division III:</span> <span className="text-slate-700">Pointi 13 - 17</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-1"><span>Division IV:</span> <span className="text-amber-600">Pointi 18 - 19</span></li>
                  <li className="flex justify-between"><span>Division 0:</span> <span className="text-rose-600">Pointi 20 - 21</span></li>
                </ul>
              </div>
            )}

            {currentLevel === 'university' && (
              <div className="space-y-2.5">
                <p className="text-[10px] text-slate-400 leading-normal font-semibold">Ufaulu wa Shahada (Tanzania TCU GPA Classification System - 5.0 Scale):</p>
                <ul className="space-y-2 text-[10px] font-bold text-slate-500">
                  <li className="flex justify-between border-b border-slate-100 pb-1"><span>First Class:</span> <span className="text-emerald-600">GPA 4.4 - 5.0</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-1"><span>Upper Second Class:</span> <span className="text-indigo-600">GPA 3.5 - 4.3</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-1"><span>Lower Second Class:</span> <span className="text-slate-700">GPA 2.7 - 3.4</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-1"><span>Pass Degree:</span> <span className="text-amber-600">GPA 2.0 - 2.6</span></li>
                  <li className="flex justify-between"><span>Fail / No Award:</span> <span className="text-rose-600">GPA &lt; 2.0</span></li>
                </ul>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
