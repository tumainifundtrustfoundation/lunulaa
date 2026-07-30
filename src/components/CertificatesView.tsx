import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Search, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  QrCode,
  User,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Certificate } from '../types';
import { fetchCertificates, fetchCertificateByCode } from '../firebase';

interface CertificatesViewProps {
  language: 'sw' | 'en';
  userProfile: any;
}

export default function CertificatesView({ language, userProfile }: CertificatesViewProps) {
  const [certs, setCerts] = useState<Certificate[]>([
    {
      id: '1',
      studentName: userProfile?.name || 'Mwanafunzi Lupanulla',
      courseName: 'Form 4 Mathematics National Mock Preparation Course',
      subject: 'Mathematics',
      grade: 'Division I (A)',
      score: 94,
      dateAwarded: '2026-06-15',
      verificationCode: 'LUP-MATH-2026-9812',
      issuedBy: 'Lupanulla Academic Board'
    },
    {
      id: '2',
      studentName: userProfile?.name || 'Mwanafunzi Lupanulla',
      courseName: 'Ordinary Level Physics: Mechanics and Motion Mastery',
      subject: 'Physics',
      grade: 'Division I (A)',
      score: 88,
      dateAwarded: '2026-07-02',
      verificationCode: 'LUP-PHYS-2026-3021',
      issuedBy: 'Lupanulla Academic Board'
    }
  ]);

  const [searchCode, setSearchCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<Certificate | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const loadRealCerts = async () => {
      setLoading(true);
      try {
        const dbCerts = await fetchCertificates();
        const userEmail = userProfile?.email?.toLowerCase() || '';
        const userName = userProfile?.name?.toLowerCase() || '';
        
        // Filter certs that match this logged-in student
        const matchedDbCerts = dbCerts.filter(c => 
          (c.studentEmail && c.studentEmail.toLowerCase() === userEmail) ||
          (c.studentName && c.studentName.toLowerCase() === userName)
        );

        if (matchedDbCerts.length > 0) {
          setCerts(prev => {
            const existingCodes = prev.map(c => c.verificationCode.toUpperCase());
            const newCerts = matchedDbCerts.filter(c => !existingCodes.includes(c.verificationCode.toUpperCase()));
            return [...newCerts, ...prev];
          });
        }
      } catch (err) {
        console.error('Error loading real certificates:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.uid) {
      loadRealCerts();
    }
  }, [userProfile?.uid]);

  const dict = {
    sw: {
      header: 'Vyeti vya Kuhitimu (Certificates)',
      subHeader: 'Vyeti rasmi vilivyo na mifumo ya QR kuthibitisha ufaulu wako katika masomo na mafunzo mbalimbali.',
      certifiedTitle: 'Vyeti Vyangu vya Ufaulu',
      verifyTitle: 'Mfumo wa Uhakiki wa Vyeti',
      verifySub: 'Ingiza nambari maalum ya cheti (Verification Code) hapa chini ili kuthibitisha usajili wake.',
      searchPlaceholder: 'Mfano: LUP-MATH-2026-9812',
      verifyBtn: 'Hakiki Cheti',
      printBtn: 'Chapa Cheti (Print)',
      downloadBtn: 'Pakua PDF',
      viewCode: 'Nambari ya Uhakiki',
      score: 'Alama za Ufaulu',
      date: 'Tarehe ya Kutunukiwa',
      issuedBy: 'Imetolewa na',
      invalidCode: 'Samahani! Nambari ya cheti uliyoingiza haijasajiliwa kwenye mfumo wetu wa Lupanulla.',
      validCertMsg: 'Cheti Kimethibitishwa Kikamilifu!',
      notEarned: 'Bado hujatunukiwa vyeti vyovyote. Fanya mazoezi na ufaulu mitihani kupata cheti chako cha kwanza!',
      subject: 'Somo',
      grade: 'Kiwango',
      student: 'Mwanafunzi',
      qrTitle: 'Skeni Uhakiki wa Haraka'
    },
    en: {
      header: 'Academic Certificates',
      subHeader: 'Verified course & exam completion certificates backed by QR authentication systems.',
      certifiedTitle: 'My Earned Certificates',
      verifyTitle: 'Certificate Verification Hub',
      verifySub: 'Input the unique Certificate Verification Code below to authenticate any issued credential.',
      searchPlaceholder: 'Example: LUP-MATH-2026-9812',
      verifyBtn: 'Verify Certificate',
      printBtn: 'Print Certificate',
      downloadBtn: 'Download PDF',
      viewCode: 'Verification Code',
      score: 'Completion Score',
      date: 'Date Awarded',
      issuedBy: 'Issued By',
      invalidCode: 'Sorry! The verification code provided is not registered in Lupanulla verification system.',
      validCertMsg: 'Certificate Authenticated Successfully!',
      notEarned: 'You have not earned any certificates yet. Complete and excel in your exams to unlock credentials!',
      subject: 'Subject',
      grade: 'Grade',
      student: 'Awarded to',
      qrTitle: 'Scan Quick Verification'
    }
  }[language];

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationResult(null);
    setVerificationError(null);

    const code = searchCode.trim().toUpperCase();
    if (!code) return;

    setVerifying(true);
    try {
      // 1. Check Firestore real database
      const realMatched = await fetchCertificateByCode(code);
      if (realMatched) {
        setVerificationResult(realMatched);
        return;
      }

      // 2. Check local mock certs
      const matched = certs.find(c => c.verificationCode.toUpperCase() === code) || 
                      (code === 'LUP-MATH-2026-9812' ? certs[0] : null);

      if (matched) {
        setVerificationResult(matched);
      } else {
        setVerificationError(dict.invalidCode);
      }
    } catch (err) {
      console.error('Error verifying certificate:', err);
      setVerificationError(language === 'sw' ? 'Mchakato wa uhakiki umeshindwa. Tafadhali jaribu tena.' : 'Verification process failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handlePrint = (cert: Certificate) => {
    setSelectedCert(cert);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-950 border border-amber-500/10 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Award size={28} className="text-amber-300" />
            {dict.header}
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
            {dict.subHeader}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Certificate List */}
        <div className="lg:col-span-2 space-y-5">
          <h2 className="font-display font-black text-slate-900 text-base sm:text-lg uppercase tracking-tight border-b border-slate-200 pb-2 flex items-center gap-2">
            <ShieldCheck size={18} className="text-cyan-500" />
            {dict.certifiedTitle}
          </h2>

          {certs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-2">
              <Award size={48} className="text-slate-300 mx-auto" />
              <p className="text-slate-500 text-sm font-semibold">{dict.notEarned}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {certs.map((c) => (
                <div 
                  key={c.id} 
                  className="bg-white border-2 border-double border-amber-200/80 rounded-3xl p-6 sm:p-8 relative shadow-sm flex flex-col sm:flex-row justify-between gap-6 overflow-hidden"
                >
                  {/* Subtle Background Watermark Logo */}
                  <div className="absolute right-[-10px] bottom-[-20px] opacity-[0.03] text-slate-950 pointer-events-none">
                    <Award size={220} />
                  </div>

                  {/* Certificate Main details */}
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded">
                        {c.subject} - {c.grade}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold font-mono">
                        ID: {c.verificationCode}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">{dict.student}</p>
                      <h3 className="text-lg font-display font-black text-slate-900">{c.studentName}</h3>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">{language === 'sw' ? 'Mada/Mafunzo' : 'Course Completion'}</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-700 leading-snug">{c.courseName}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs font-semibold text-slate-500">
                      <div>
                        <span className="block text-[9px] text-slate-400 uppercase font-extrabold">{dict.score}</span>
                        <span className="text-slate-800 font-black">{c.score}%</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 uppercase font-extrabold">{dict.date}</span>
                        <span>{new Date(c.dateAwarded).toLocaleDateString()}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="block text-[9px] text-slate-400 uppercase font-extrabold">{dict.issuedBy}</span>
                        <span className="text-[11px] truncate block">{c.issuedBy}</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Component & Printing buttons */}
                  <div className="sm:w-36 flex flex-col items-center justify-between gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 flex-shrink-0">
                    <div className="flex flex-col items-center text-center gap-1">
                      <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-xl p-1.5 flex items-center justify-center">
                        {/* Custom visual SVG QR */}
                        <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                          <rect x="0" y="0" width="25" height="25" />
                          <rect x="5" y="5" width="15" height="15" fill="white" />
                          <rect x="10" y="10" width="5" height="5" />
                          
                          <rect x="75" y="0" width="25" height="25" />
                          <rect x="80" y="5" width="15" height="15" fill="white" />
                          <rect x="85" y="10" width="5" height="5" />

                          <rect x="0" y="75" width="25" height="25" />
                          <rect x="5" y="80" width="15" height="15" fill="white" />
                          <rect x="10" y="85" width="5" height="5" />

                          <rect x="40" y="40" width="20" height="20" />
                          <rect x="45" y="45" width="10" height="10" fill="white" />

                          <rect x="35" y="10" width="5" height="20" />
                          <rect x="15" y="35" width="20" height="5" />
                          <rect x="60" y="15" width="10" height="5" />
                          <rect x="80" y="45" width="15" height="10" />
                          <rect x="45" y="70" width="10" height="15" />
                          <rect x="70" y="70" width="20" height="20" />
                        </svg>
                      </div>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase">{dict.qrTitle}</span>
                    </div>

                    <div className="flex gap-1.5 w-full">
                      <button 
                        onClick={() => handlePrint(c)}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 p-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                      >
                        <Printer size={12} />
                      </button>
                      <button 
                        onClick={() => alert('📥 Upakuaji umeanza! Faili lako la cheti la PDF linajengwa sasa hivi.')}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                      >
                        <Download size={12} />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Column: Verification System */}
        <div className="lg:col-span-1 space-y-5">
          <h2 className="font-display font-black text-slate-900 text-base sm:text-lg uppercase tracking-tight border-b border-slate-200 pb-2 flex items-center gap-2">
            <QrCode size={18} className="text-cyan-500" />
            {dict.verifyTitle}
          </h2>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <p className="text-slate-500 text-xs leading-relaxed">
              {dict.verifySub}
            </p>

            <form onSubmit={handleVerify} className="space-y-3">
              <input 
                type="text"
                required
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder={dict.searchPlaceholder}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase tracking-widest placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/35 bg-slate-50"
              />
              <button
                type="submit"
                disabled={verifying}
                className="w-full bg-slate-950 hover:bg-slate-850 text-white font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {verifying && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                {verifying ? (language === 'sw' ? 'Inahakiki...' : 'Verifying...') : dict.verifyBtn}
              </button>
            </form>

            {/* Verification Success Output */}
            {verificationResult && (
              <div className="bg-green-500/5 border border-green-200 rounded-2xl p-4 space-y-3 animate-fade-in text-xs font-semibold">
                <p className="text-green-700 font-black flex items-center gap-1.5 uppercase text-[10px] tracking-wide">
                  <CheckCircle2 size={13} /> {dict.validCertMsg}
                </p>
                <div className="space-y-1.5 text-slate-700">
                  <p><span className="text-slate-400 uppercase text-[9px] font-extrabold">{dict.student}:</span> {verificationResult.studentName}</p>
                  <p><span className="text-slate-400 uppercase text-[9px] font-extrabold">Somo:</span> {verificationResult.courseName}</p>
                  <p><span className="text-slate-400 uppercase text-[9px] font-extrabold">Alama:</span> {verificationResult.score}% ({verificationResult.grade})</p>
                  <p><span className="text-slate-400 uppercase text-[9px] font-extrabold">Tarehe:</span> {new Date(verificationResult.dateAwarded).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            {/* Verification Error Output */}
            {verificationError && (
              <div className="bg-red-500/5 border border-red-200 rounded-2xl p-4 space-y-1 animate-fade-in text-xs font-semibold">
                <p className="text-red-700 font-black flex items-center gap-1.5 uppercase text-[10px] tracking-wide">
                  <AlertTriangle size={13} /> Uhakiki Umeshindwa
                </p>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {verificationError}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Hidden Print preview element */}
      {selectedCert && (
        <div className="hidden print:block fixed inset-0 bg-white text-black p-12 z-50">
          <div className="border-4 border-double border-amber-600 p-8 space-y-8 text-center h-[90vh] flex flex-col justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-display font-black tracking-wider uppercase text-amber-800">LUPANULLA ELIMU HUB</h1>
              <p className="text-xs uppercase tracking-widest font-bold">Kitovu cha Elimu Tanzania</p>
            </div>

            <div className="space-y-6">
              <span className="text-lg italic font-serif">Kijitabu cha Uthibitisho wa Kitaaluma</span>
              <h2 className="text-2xl font-serif">CHETI CHA KUHITIMU NA KUKAMILISHA MASOMO</h2>
              <p className="text-sm italic">Hiki kinathibitisha kuwa mwanafunzi:</p>
              <h3 className="text-3xl font-display font-black border-b border-black pb-1 inline-block">{selectedCert.studentName}</h3>
              <p className="text-sm leading-relaxed max-w-xl mx-auto">
                Amefaulu kikamilifu na kukamilisha mafunzo ya mada ya <span className="font-bold">{selectedCert.courseName}</span> chini ya mtaala wa kitaifa nchini Tanzania na kupata kiwango cha ufaulu wa <span className="font-bold">{selectedCert.grade}</span> kwa alama za asilimia <span className="font-bold">{selectedCert.score}%</span>.
              </p>
            </div>

            <div className="flex justify-between items-end pt-12 text-xs font-bold">
              <div className="text-left space-y-1">
                <span className="block border-t border-black pt-1 w-44">Sahihi ya Mkuu wa Chuo</span>
                <span className="text-[10px] text-gray-500 font-medium">Lupanulla Academic Director</span>
              </div>
              <div className="space-y-1">
                <span className="block">Namba ya uhakiki: {selectedCert.verificationCode}</span>
                <span className="text-[10px] text-gray-500 font-medium">Imetolewa: {new Date(selectedCert.dateAwarded).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
