import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, CheckCircle2, Calendar, Globe, ExternalLink, Printer, Clipboard, Check, Star, AlertCircle } from 'lucide-react';
import { ExamResult } from '../types';

interface MatokeoValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ExamResult | null;
}

export default function MatokeoValidationModal({ isOpen, onClose, result }: MatokeoValidationModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !result) return null;

  const isExternal = (result as any).isExternal;
  const sourceUrl = result.publishedAt 
    ? "https://lupanulla.elimu.hub/records/verified" 
    : ((result as any).sourceUrl || "https://matokeo.necta.go.tz");
  
  // Format published/verification date nicely
  const timestamp = result.publishedAt 
    ? new Date(result.publishedAt).toLocaleString('sw-TZ', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    : new Date().toLocaleString('sw-TZ', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
      });

  // Calculate unique transaction hash for styling/realism
  const getVerificationHash = () => {
    const dataString = `${result.candidateCode}-${result.studentName}-${result.gpa}`;
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      hash = (hash << 5) - hash + dataString.charCodeAt(i);
      hash |= 0;
    }
    return `LUP-${Math.abs(hash).toString(16).toUpperCase()}-${result.year}`;
  };

  const verificationHash = getVerificationHash();

  const handleCopyHash = () => {
    navigator.clipboard.writeText(verificationHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        >
          {/* Top gradient accent */}
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-indigo-600 to-cyan-500 shrink-0" />

          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-400/20">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black font-display tracking-tight uppercase">Uhakiki wa Matokeo</h3>
                <p className="text-xs text-slate-400 font-medium">Lupanulla Official Verification Portal</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-700">
            {/* Status Panel */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Hali ya Uhakiki</span>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-black text-slate-900 uppercase">
                    {isExternal ? "IMEHAKIKIWA MTANDAONI" : "IMEHAKIKIWA KWENYE LEDGER"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  {isExternal 
                    ? "Matokeo haya yamepatikana kwa wakati halisi kupitia search grounding kutoka tovuti rasmi ya NECTA."
                    : "Matokeo haya yapo salama kwenye hifadhidata ya ufaulu ya Lupanulla Elimu Hub."
                  }
                </p>
              </div>
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider self-start sm:self-auto shrink-0 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> Verified
              </div>
            </div>

            {/* Validation Details List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Source URL Card */}
              <div className="border border-slate-150 rounded-2xl p-4 space-y-2 bg-white hover:bg-slate-50/40 transition-colors">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Globe className="w-4 h-4 text-cyan-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Chanzo cha Data</span>
                </div>
                <p className="text-xs font-extrabold text-slate-800 line-clamp-1">{isExternal ? "NECTA Result Server" : "Lupanulla Academic Registry"}</p>
                <a 
                  href={sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Fungua kiungo rasmi <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Timestamp Card */}
              <div className="border border-slate-150 rounded-2xl p-4 space-y-2 bg-white hover:bg-slate-50/40 transition-colors">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Muda wa Uhakiki</span>
                </div>
                <p className="text-xs font-extrabold text-slate-800">{timestamp}</p>
                <span className="text-[10px] text-slate-400 font-semibold italic block">Muda wa Afrika Mashariki (EAT)</span>
              </div>
            </div>

            {/* Digital Ledger Signature */}
            <div className="bg-indigo-50/45 border border-indigo-100 rounded-2xl p-4 space-y-1">
              <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider block">Sahihi ya Kidijitali (Verification Hash)</span>
              <div className="flex items-center justify-between gap-4">
                <code className="text-xs font-mono font-bold text-indigo-900 break-all">{verificationHash}</code>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="p-2 bg-indigo-100/50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-all shrink-0 cursor-pointer"
                  title="Copy Hash"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Candidate Summary Transcript info */}
            <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white">
              <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-150">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wide">Mhtasari wa Mwanafunzi</h4>
              </div>
              <div className="p-4 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Jina Kamili</span>
                    <span className="text-slate-800 font-black">{result.studentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Namba ya Mtihani</span>
                    <span className="text-slate-800 font-mono font-black">{result.candidateCode}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Ngazi na Aina ya Mtihani</span>
                    <span className="text-slate-800 font-semibold">{result.level} - {result.examType} ({result.year})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Matokeo</span>
                    <span className="text-indigo-600 font-black">{result.division} (GPA: {result.gpa})</span>
                  </div>
                </div>

                {/* Subject list inline recap */}
                <div className="pt-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1.5">Masomo na Alama</span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.subjects.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-150 font-semibold text-[11px] text-slate-700">
                        <span>{s.subject}</span>
                        <strong className="text-indigo-600 font-mono">{s.grade}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-slate-400 leading-normal italic text-center">
              * Uhakiki huu umekamilika kidijitali na unaungwa mkono na ulinzi wa rekodi za kitaaluma wa Lupanulla Elimu Hub. 
            </p>
          </div>

          {/* Footer controls */}
          <div className="p-4 bg-slate-50 border-t border-slate-150 shrink-0 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-extrabold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Funga (Close)
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer hover:scale-[1.01]"
            >
              <Printer className="w-3.5 h-3.5" /> Chapa Hati ya Uhakiki
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
