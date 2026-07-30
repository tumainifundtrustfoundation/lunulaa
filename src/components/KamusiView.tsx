import React, { useState } from 'react';
import { 
  Book, 
  Search, 
  HelpCircle, 
  CheckCircle, 
  ArrowRight,
  Award
} from 'lucide-react';

interface DictionaryWord {
  word: string;
  translation: string;
  definition: string;
  subject: string;
  example: string;
}

export default function KamusiView() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const words: DictionaryWord[] = [
    {
      word: 'Velocity',
      translation: 'Kasi mwelekeo',
      definition: 'The rate of change of displacement of an object. (Kasi ya mwendo wa kitu katika mwelekeo maalum).',
      subject: 'Physics',
      example: 'The car has a velocity of 20 m/s due East.'
    },
    {
      word: 'Photosynthesis',
      translation: 'Usanisinuru',
      definition: 'The process by which green plants manufacture their own food using sunlight, water, and carbon dioxide. (Mchakato wa mimea ya kijani kujitengenezea chakula kwa kutumia mwanga wa jua, maji, na hewa ya ukaa).',
      subject: 'Biology',
      example: 'Photosynthesis takes place in the chloroplasts of plant leaves.'
    },
    {
      word: 'Equation',
      translation: 'Mlinganyo',
      definition: 'A mathematical statement showing that two expressions are equal using the equal (=) sign. (Msemo wa kihisabati unaoonyesha kuwa pande mbili zinafanana kwa kutumia alama ya sawa).',
      subject: 'Mathematics',
      example: 'Solve the linear equation: 2x + 4 = 10.'
    },
    {
      word: 'Sovereignty',
      translation: 'Uandishi / Mamlaka Kamili',
      definition: 'The supreme power or authority of a state to govern itself. (Mamlaka makuu na ya mwisho ya nchi kujitawala yenyewe bila kuingiliwa kati).',
      subject: 'Civics',
      example: 'Tanzania attained her full sovereignty in 1961.'
    },
    {
      word: 'Metabolism',
      translation: 'Metaboliki / Mmeng`enyo wa ndani',
      definition: 'Chemical processes that occur within a living organism in order to maintain life. (Mifumo yote ya kemikali mwilini inayovunja na kujenga seli ili kuwezesha uhai).',
      subject: 'Chemistry / Biology',
      example: 'Thyroid hormones regulate the body`s rate of metabolism.'
    }
  ];

  const filteredWords = words.filter(w => 
    w.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="kamusi-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50 max-w-4xl mx-auto">
      
      <section className="bg-gradient-to-r from-cyan-600 to-indigo-950 p-6 rounded-3xl text-white shadow-md relative overflow-hidden border border-cyan-500/10 text-center sm:text-left">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-bold uppercase tracking-wider">
            <Book size={12} /> Kamusi ya Taaluma
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold uppercase">Kamusi ya Lupanulla (Academic Dictionary)</h1>
          <p className="text-slate-200 text-xs leading-relaxed max-w-xl">
            Tafuta maana na tafsiri sahihi ya msamiati wa masomo ya sayansi na jamii kwa lugha zote mbili za Kiingereza na Kiswahili ili kurahisisha uelewa wako.
          </p>
        </div>
      </section>

      {/* Dictionary search */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Tafuta msamiati au tafsiri (Mfano: Velocity, Usanisinuru, Equation)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Dictionary Word Cards */}
      <div className="space-y-4">
        {filteredWords.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredWords.map((item) => (
              <div key={item.word} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-cyan-300 hover:shadow-md transition-all">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-cyan-600 uppercase">{item.subject}</span>
                    <span className="bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full">MSAMIATI</span>
                  </div>
                  <h3 className="font-display font-extrabold text-slate-950 text-lg sm:text-xl uppercase leading-none">{item.word}</h3>
                  <p className="font-bold text-cyan-600 text-sm">{item.translation}</p>
                  <p className="text-slate-500 text-xs leading-relaxed pt-1">{item.definition}</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500 leading-relaxed font-semibold">
                  <span className="font-bold text-slate-800">Mfano:</span> &quot;{item.example}&quot;
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center py-16 space-y-3 shadow-sm">
            <Book size={32} className="mx-auto text-slate-300" />
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase">Neno halikupatikana bado</h4>
            <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
              Msamiati ulioandika haupo kwenye maktaba yetu fupi ya kamusi kwa sasa. Unaweza kumuuliza msaidizi wetu wa akili ya bandia **Lupanulla AI** kwa tafsiri sahihi!
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
