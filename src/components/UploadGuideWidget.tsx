import React, { useState } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  FileText, 
  FolderOpen, 
  Info, 
  HelpCircle, 
  AlertCircle, 
  FileCheck,
  Tag,
  ArrowRight,
  ShieldCheck,
  Copy
} from 'lucide-react';

export default function UploadGuideWidget() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const steps = [
    {
      title: "Matayarisho ya Faili",
      subtitle: "Uumbaji na muundo wa majina",
      icon: <FileText size={18} className="text-cyan-600" />,
      content: (
        <div className="space-y-3 text-slate-600 text-xs leading-relaxed">
          <p>
            Kabla ya kupakia, hakikisha faili lako lipo katika muundo wa <strong className="text-slate-800">PDF pekee</strong> na lina ubora mzuri wa kusomeka (readable scan au digital export).
          </p>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-2">
            <h5 className="font-extrabold text-[10px] uppercase text-indigo-700 tracking-wider flex items-center gap-1">
              <Info size={12} /> Standard Naming Conventions (Kanuni za Majina):
            </h5>
            <p className="text-[11px]">
              Kila faili linapaswa kufuata muundo rasmi wa majina ili kurahisisha utambuzi na kuzuia mchanganyiko wa faili:
            </p>
            <div className="bg-white border border-slate-200/60 rounded-xl p-2.5 font-mono text-[10px] text-slate-800 flex items-center justify-between shadow-sm">
              <span className="font-semibold select-all">[Kiwango]-[Somo]-[Aina]-[Mwaka]-[Mchapishaji].pdf</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText("[Kiwango]-[Somo]-[Aina]-[Mwaka]-[Mchapishaji].pdf");
                  setCopiedText("format");
                  setTimeout(() => setCopiedText(null), 2000);
                }}
                className="text-slate-400 hover:text-indigo-600 transition-colors"
                title="Copy standard format"
                type="button"
              >
                {copiedText === 'format' ? 'Imenakiliwa!' : <Copy size={12} />}
              </button>
            </div>
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Mifano Halisi ya Majina:</p>
              <div className="grid gap-1.5">
                <div className="bg-slate-900 text-cyan-400 px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center justify-between">
                  <span>Form4-Mathematics-Mock-2026-Lupanulla.pdf</span>
                  <span className="text-[9px] text-slate-400 font-sans font-extrabold uppercase">Mock Exam</span>
                </div>
                <div className="bg-slate-900 text-cyan-400 px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center justify-between">
                  <span>Form2-Geography-Notes-Agriculture-2025.pdf</span>
                  <span className="text-[9px] text-slate-400 font-sans font-extrabold uppercase">Class Notes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Hifadhi (Storage & Google Drive)",
      subtitle: "Jinsi ya kuhifadhi faili lenyewe",
      icon: <FolderOpen size={18} className="text-cyan-600" />,
      content: (
        <div className="space-y-3 text-slate-600 text-xs leading-relaxed">
          <p>
            Lupanulla Elimu Hub inatumia mfumo salama wa <strong className="text-slate-800">Google Drive Cloud Storage</strong> kama hifadhi kuu ya nyaraka zote za PDF.
          </p>
          <div className="space-y-2">
            <div className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
              <p>
                <strong>Kupakia Moja kwa Moja (Local File Upload):</strong> Unaweza kuvuta (drag-and-drop) au kuchagua faili moja kwa moja kutoka kwenye kompyuta au simu yako. Mfumo wetu utalihifadhi salama.
              </p>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
              <p>
                <strong>Google Drive Integration (Google Picker):</strong> Unaweza kutumia kitufe cha <em className="font-semibold text-indigo-600">"Chagua Kutoka Google Drive"</em> ili kuunganisha folda zako za wingu na kuhamisha faili moja kwa moja bila kuhitaji kulipakua kwanza.
              </p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex gap-2 text-[11px] text-amber-800">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <p className="font-medium">
              <strong>Zingatia:</strong> Faili zote zinazopakiwa hupita kwenye mfumo wetu wa usalama na hupata ID maalum (File ID) inayotumika kuliunganisha na hifadhidata ya Firestore.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Required Metadata (Firestore)",
      subtitle: "Sehemu na taarifa za lazima",
      icon: <Tag size={18} className="text-cyan-600" />,
      content: (
        <div className="space-y-3 text-slate-600 text-xs leading-relaxed">
          <p>
            Ili rasilimali iweze kupatikana kwa urahisi kwenye injini ya utafutaji ya Lupanulla, ni lazima ujaze taarifa (Metadata) zifuatazo kikamilifu kwenye Firestore:
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="border border-slate-100 rounded-xl p-2.5 space-y-1 bg-white hover:border-indigo-100 transition-colors">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Kichwa (Title)</span>
              <p className="text-[11px] font-bold text-slate-800">Kichwa kilichonyooka & cha Kina</p>
              <p className="text-[10px] text-slate-450 leading-tight">Mfano: <em>"NECTA Physics Form VI Past Paper 2024"</em>. Epuka majina mafupi kama "Physics 2024".</p>
            </div>
            <div className="border border-slate-100 rounded-xl p-2.5 space-y-1 bg-white hover:border-indigo-100 transition-colors">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Somo (Subject)</span>
              <p className="text-[11px] font-bold text-slate-800">Kuchagua Somo Maalum</p>
              <p className="text-[10px] text-slate-450 leading-tight">Mathematics, Physics, Chemistry, Biology, Kiswahili, Geography, n.k.</p>
            </div>
            <div className="border border-slate-100 rounded-xl p-2.5 space-y-1 bg-white hover:border-indigo-100 transition-colors">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Kidato & Ngazi (Class & Level)</span>
              <p className="text-[11px] font-bold text-slate-800">Uainishaji wa Kiakademia</p>
              <p className="text-[10px] text-slate-450 leading-tight">Chagua kiwango sahihi cha elimu (Form 1 - Form 6) au Ngazi (O-Level, A-Level).</p>
            </div>
            <div className="border border-slate-100 rounded-xl p-2.5 space-y-1 bg-white hover:border-indigo-100 transition-colors">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Aina ya Nyaraka (Category)</span>
              <p className="text-[11px] font-bold text-slate-800">Aina ya Maudhui (Kundi)</p>
              <p className="text-[10px] text-slate-450 leading-tight">Panga rasilimali kama: <strong>Notes</strong>, <strong>Past Papers (NECTA)</strong>, <strong>Mock Exams</strong> au <strong>Solved Reviews</strong>.</p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 text-[10.5px] space-y-1">
            <span className="font-bold text-slate-700 block">Lebo (Tags) na Maelezo (Description):</span>
            <p className="text-slate-500">
              Jaza maelezo mafupi kuelezea yaliyomo kwenye nyaraka hii, na uweke lebo (tags) zilizotenganishwa kwa koma ili kuimarisha matokeo ya utafutaji (SEO). Mfano: <code className="bg-indigo-50 text-indigo-700 px-1 rounded">csee, pastpaper, necta, math</code>.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Uhifadhi & Uidhinishaji (Publishing)",
      subtitle: "Kupitisha faili lionekane hadharani",
      icon: <ShieldCheck size={18} className="text-cyan-600" />,
      content: (
        <div className="space-y-3 text-slate-600 text-xs leading-relaxed">
          <p>
            Mara baada ya kujaza taarifa zote na kupakia faili, nenda hadi chini kabisa na ubofye kitufe cha <strong className="text-slate-800 uppercase">"Pakia Nyaraka Sasa"</strong>.
          </p>
          <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-3 space-y-2 text-emerald-900 text-[11px]">
            <p className="font-bold flex items-center gap-1">
              <Check size={14} className="stroke-[3]" /> Uhakiki Mkuu (Review Pipeline):
            </p>
            <ul className="list-disc list-inside space-y-1 text-emerald-800">
              <li>Wewe kama <strong>Admin au Super Admin</strong>, nyaraka unazopakia zinakubaliwa (approved) moja kwa moja na kuonekana hadharani.</li>
              <li>Watumiaji wa kawaida au waandishi (Authors) wakipakia, nyaraka zao zitaingia kwenye foleni ya <strong>"Inasubiri Idhini" (Uhakiki wa Faili)</strong> ili wewe uzikague kwanza kabla hazijawekwa hadharani.</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-900/5 to-slate-900/5 border border-slate-200 rounded-3xl overflow-hidden transition-all duration-300 shadow-sm">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
            <BookOpen size={20} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-sm text-slate-900 uppercase tracking-tight flex items-center gap-2">
              Mwongozo wa Kupakia Nyaraka (Admin Upload Standard)
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-black tracking-widest uppercase">Firestore & Storage</span>
            </h3>
            <p className="text-xs text-slate-450 font-medium">Soma mwongozo wa hatua kwa hatua, mifumo ya majina ya faili, na taarifa zinazohitajika.</p>
          </div>
        </div>
        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-100 p-6 bg-white animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Steps Left Tabs Column */}
            <div className="md:col-span-1 flex flex-col gap-1.5 border-r border-slate-50 pr-2">
              {steps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`px-3 py-2.5 rounded-2xl text-left transition-all flex items-center gap-2.5 border text-xs font-bold ${
                    activeStep === idx
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-700 hover:text-slate-900'
                  }`}
                  type="button"
                >
                  <span className={`w-6 h-6 rounded-xl flex items-center justify-center font-extrabold text-[10px] ${
                    activeStep === idx ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <p className="leading-tight">{step.title}</p>
                    <p className={`text-[9px] font-medium truncate ${activeStep === idx ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {step.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Step Right Content Area */}
            <div className="md:col-span-3 bg-slate-50/40 rounded-2xl border border-slate-100/50 p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    {steps[activeStep].icon}
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-xs text-slate-950 uppercase tracking-wider">
                      Hatua ya {activeStep + 1}: {steps[activeStep].title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{steps[activeStep].subtitle}</p>
                  </div>
                </div>

                <div className="min-h-[140px]">
                  {steps[activeStep].content}
                </div>
              </div>

              {/* Progress buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                <div className="flex gap-1.5">
                  {steps.map((_, idx) => (
                    <span 
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        idx === activeStep ? 'w-4 bg-indigo-600' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  {activeStep > 0 && (
                    <button
                      onClick={() => setActiveStep(activeStep - 1)}
                      className="px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
                      type="button"
                    >
                      &larr; Nyuma
                    </button>
                  )}
                  {activeStep < steps.length - 1 ? (
                    <button
                      onClick={() => setActiveStep(activeStep + 1)}
                      className="px-3 py-1.5 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center gap-1"
                      type="button"
                    >
                      <span>Endelea</span>
                      <ArrowRight size={10} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all flex items-center gap-1"
                      type="button"
                    >
                      <span>Nimeelewa Mwongozo</span>
                      <Check size={10} />
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
