import React, { useState } from 'react';
import { 
  Crown, 
  CheckCircle, 
  ArrowRight, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Smartphone,
  PhoneCall,
  Lock,
  MessageCircle,
  Sparkles,
  Bot,
  Brain,
  Clock
} from 'lucide-react';
import { updateUserProfile, submitPaymentTransaction } from '../firebase';

interface PremiumViewProps {
  onNavigate: (view: string, id?: string) => void;
  userProfile: any;
  onProfileUpdate: () => void;
}

export default function PremiumView({
  onNavigate,
  userProfile,
  onProfileUpdate
}: PremiumViewProps) {
  const [selectedPlan, setSelectedPlan] = useState<'daily' | 'monthly' | 'term'>('monthly');
  const [paymentStep, setPaymentStep] = useState<'tiers' | 'instructions' | 'pending_approval' | 'success'>('tiers');
  const [payMethod, setPayMethod] = useState<'mpesa' | 'tigopesa' | 'airtel'>('mpesa');
  
  // Verification states
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plans = {
    daily: {
      name: 'Kifurushi cha Siku 1',
      price: 1000,
      period: 'kwa siku',
      desc: 'Inafaa kwa mwanafunzi anayetaka kusoma na kupakua karatasi au notisi chache za haraka leo.'
    },
    monthly: {
      name: 'Kifurushi cha Mwezi 1 (Sana Zaidi!)',
      price: 5000,
      period: 'kwa mwezi',
      desc: 'Kifurushi pendwa zaidi nchini. Inakupa uwezo wa kupakua na kupata msaada wa Lupanulla AI muda wote.'
    },
    term: {
      name: 'Kifurushi cha Muhula (Term Package)',
      price: 15000,
      period: 'kwa muhula',
      desc: 'Inafaa kwa maandalizi ya dhati ya mitihani ya NECTA ya kitaifa. Okoa gharama za vitabu na notisi.'
    }
  };

  const handleChoosePlan = (planId: 'daily' | 'monthly' | 'term') => {
    setSelectedPlan(planId);
    setPaymentStep('instructions');
  };

  // Submit transaction details to Firestore for admin review
  const handleVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setError('Tafadhali weka Namba ya Muamala (Transaction ID) iliyotumwa kwenye SMS yako ya malipo.');
      return;
    }

    const txCode = transactionId.trim().toUpperCase();
    if (txCode.length < 8) {
      setError('Namba ya muamala uliyoweka haina usahihi. Lazima iwe na angalau herufi au namba 8.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (!userProfile?.uid) {
        throw new Error('Hujajisajili au kuingia kwenye akaunti ili kufanya malipo.');
      }

      await submitPaymentTransaction({
        userId: userProfile.uid,
        userName: userProfile.name || 'Mtumiaji Lupanulla',
        userEmail: userProfile.email || 'mwanafunzi@lupanulla.co.tz',
        planId: selectedPlan,
        planName: activePlanDetails.name,
        amount: activePlanDetails.price,
        payMethod: payMethod,
        transactionId: txCode,
      });

      setPaymentStep('pending_approval');
    } catch (err: any) {
      setError(err.message || 'Mchakato wa kuwasilisha malipo umefeli. Tafadhali jaribu tena baadae.');
    } finally {
      setSubmitting(false);
    }
  };

  const activePlanDetails = plans[selectedPlan];

  return (
    <div id="premium-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50 max-w-4xl mx-auto">
      
      {/* Premium Header Banner */}
      <section className="bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-950 p-6 sm:p-10 rounded-3xl text-white shadow-lg relative overflow-hidden border border-amber-500/10 text-center sm:text-left">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-200 text-xs font-bold uppercase tracking-wider border border-white/10">
              <Crown size={12} className="text-amber-300 animate-pulse" />
              Lupanulla Premium Access
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold uppercase leading-none">Jiunge na Premium</h1>
            <p className="text-slate-100 text-xs sm:text-sm leading-relaxed">
              Ondoa kikomo cha kusoma mtandaoni na wezesha upakuaji (download) usio na kikomo wa past papers, miongozo yote, vitabu vya TIE na upate majibu ya haraka zaidi kutoka kwa Lupanulla AI!
            </p>
          </div>

          <div className="flex-shrink-0 bg-slate-950/40 border border-white/15 px-6 py-4 rounded-2xl backdrop-blur-sm text-center">
            <p className="text-[10px] text-amber-300 font-bold uppercase">Hali ya Akaunti yako</p>
            <p className="font-display font-extrabold text-lg uppercase tracking-tight">
              {(userProfile?.subscription === 'premium' || userProfile?.role === 'admin' || userProfile?.role === 'super_admin') ? '★ PREMIUM MEMBER' : 'Mwanachama wa Bure'}
            </p>
          </div>
        </div>
      </section>

      {paymentStep === 'tiers' && (
        <div className="space-y-8">
          
          {/* Main Tier Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Daily Package Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-amber-400 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2.5 py-0.5 rounded-full uppercase">Kifurushi fupi</span>
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase leading-none">{plans.daily.name}</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-semibold">{plans.daily.desc}</p>
                
                <div className="pt-2 border-t border-slate-50 flex items-baseline gap-1">
                  <span className="text-2xl font-display font-extrabold text-slate-950">TSh {plans.daily.price.toLocaleString()}</span>
                  <span className="text-slate-400 text-xs font-bold">{plans.daily.period}</span>
                </div>
              </div>

              <button 
                onClick={() => handleChoosePlan('daily')}
                className="w-full py-2.5 text-xs text-center font-extrabold bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-all shadow-md uppercase"
              >
                Chagua kifurushi
              </button>
            </div>

            {/* Monthly Package Card (Recommended) */}
            <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 text-[9px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Inapendekezwa zaidi
              </div>

              <div className="space-y-3">
                <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2.5 py-0.5 rounded-full uppercase">Kifurushi Kikuu</span>
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase leading-none">{plans.monthly.name}</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-semibold">{plans.monthly.desc}</p>
                
                <div className="pt-2 border-t border-slate-50 flex items-baseline gap-1">
                  <span className="text-3xl font-display font-extrabold text-amber-600">TSh {plans.monthly.price.toLocaleString()}</span>
                  <span className="text-slate-400 text-xs font-bold">{plans.monthly.period}</span>
                </div>
              </div>

              <button 
                onClick={() => handleChoosePlan('monthly')}
                className="w-full py-3 text-xs text-center font-extrabold bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-xl transition-all shadow-md shadow-amber-400/10 uppercase"
              >
                Chagua kifurushi
              </button>
            </div>

            {/* Term Package Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-amber-400 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2.5 py-0.5 rounded-full uppercase">Kifurushi kirefu</span>
                <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase leading-none">{plans.term.name}</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-semibold">{plans.term.desc}</p>
                
                <div className="pt-2 border-t border-slate-50 flex items-baseline gap-1">
                  <span className="text-2xl font-display font-extrabold text-slate-950">TSh {plans.term.price.toLocaleString()}</span>
                  <span className="text-slate-400 text-xs font-bold">{plans.term.period}</span>
                </div>
              </div>

              <button 
                onClick={() => handleChoosePlan('term')}
                className="w-full py-2.5 text-xs text-center font-extrabold bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-all shadow-md uppercase"
              >
                Chagua kifurushi
              </button>
            </div>

          </div>

          {/* Premium Core features list */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-950 text-sm uppercase">Mambo unayopata kwa kujiunga na Premium:</h3>
            <div className="grid gap-4 sm:grid-cols-2 text-xs font-semibold text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                <p>Kupakua (download) pasina kikomo PDF zote za mitihani na miongozo kwenye kifaa chako.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                <p>Majibu ya haraka zaidi na msaada mkubwa wa Lupanulla AI bila vizuizi vyovyote vya siku.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                <p>Notisi na mitihani teule iliyotayarishwa na walimu nguli wa mikoa iliyoandaliwa kwa ajili ya Premium.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                <p>Hakuna matangazo yoyote ya usumbufu wakati unajisomea.</p>
              </div>
            </div>
          </div>

          {/* Premium AI Features Showcase - "ai ionekane kwenye premium" */}
          <div className="bg-gradient-to-r from-cyan-900 via-indigo-950 to-slate-950 border border-cyan-500/25 rounded-3xl p-6 sm:p-8 text-white space-y-6 relative overflow-hidden shadow-lg animate-fade-in">
            <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
            <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold uppercase tracking-wider border border-cyan-500/30">
                  <Sparkles size={11} className="text-amber-300 animate-pulse" />
                  Kipengele Kikuu cha AI Premium
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
                  <Bot size={24} className="text-cyan-400 animate-bounce" />
                  Msaidizi wa Elimu wa Lupanulla AI & Notisi Mahiri
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-semibold">
                  Wezesha uwezo kamili wa akili mnemba (Artificial Intelligence) uliolengwa maalum kwa ajili ya mtaala wa NECTA na vitabu vya TIE nchini Tanzania. Premium inakupa:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5 space-y-1">
                    <h4 className="text-cyan-300 text-xs font-bold uppercase flex items-center gap-1">
                      <Sparkles size={12} className="text-cyan-400" />
                      Smart Notes (AI Summaries)
                    </h4>
                    <p className="text-slate-400 text-[10px] leading-relaxed">Huzalisha muhtasari na miongozo mahiri ya mada zote za NECTA kwa kubofya kitufe kimoja tu.</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5 space-y-1">
                    <h4 className="text-cyan-300 text-xs font-bold uppercase flex items-center gap-1">
                      <Brain size={12} className="text-cyan-400" />
                      Interactive Annotations
                    </h4>
                    <p className="text-slate-400 text-[10px] leading-relaxed">Chagua maandishi yoyote ndani ya notisi ili kuweka highlight na kuongeza dokezo la kukusaidia kukumbuka.</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5 space-y-1">
                    <h4 className="text-cyan-300 text-xs font-bold uppercase flex items-center gap-1">
                      <Bot size={12} className="text-cyan-400" />
                      Lupanulla AI Chat Tutor
                    </h4>
                    <p className="text-slate-400 text-[10px] leading-relaxed">Chat bila kikomo na mwalimu asilia aliyefundishwa mtaala wa kitaifa kutatua hesabu na maswali magumu.</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5 space-y-1">
                    <h4 className="text-cyan-300 text-xs font-bold uppercase flex items-center gap-1">
                      <ArrowRight size={12} className="text-cyan-400" />
                      Offline PDF Export
                    </h4>
                    <p className="text-slate-400 text-[10px] leading-relaxed">Pakua (download) Smart Notes zako zote pamoja na highlights kama faili la PDF la kusoma offline bila bando la internet.</p>
                  </div>
                </div>
              </div>

              {/* Graphical simulation of AI tutor in action */}
              <div className="flex-shrink-0 w-full md:w-64 bg-slate-950/80 border border-white/10 p-4 rounded-2xl space-y-3 backdrop-blur-sm shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-wider">Lupanulla AI Simulator</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                
                <div className="space-y-2">
                  <div className="bg-white/5 p-2 rounded-xl text-[10px] text-slate-300">
                    <p className="font-extrabold text-[8px] uppercase text-cyan-400">Mwanafunzi:</p>
                    <p className="font-semibold italic">&quot;Nisaidie kutatua 2x² + 5x - 3 = 0&quot;</p>
                  </div>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 p-2.5 rounded-xl text-[10px] text-slate-200">
                    <p className="font-extrabold text-[8px] uppercase text-amber-400">Lupanulla AI:</p>
                    <p className="font-semibold">Njia ya Quadratic Formula ni x = [-b ± √(b² - 4ac)] / 2a. Hapa tunapata x = 0.5 au x = -3...</p>
                  </div>
                </div>

                <button 
                  onClick={() => onNavigate('fisimaji')}
                  className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles size={12} className="text-amber-950 animate-pulse" /> Jaribu Lupanulla AI sasa
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {paymentStep === 'instructions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step Instructions Panel */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Smartphone size={20} className="text-amber-500" />
              <h3 className="font-display font-bold text-slate-950 text-base uppercase">Maelekezo ya Malipo ya Simu (Lipa kwa Simu)</h3>
            </div>

            {/* Mobile operators tab select */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-150 w-fit">
              <button 
                onClick={() => setPayMethod('mpesa')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${payMethod === 'mpesa' ? 'bg-amber-400 text-amber-950' : 'text-slate-500 hover:text-slate-800'}`}
              >
                M-Pesa (Vodacom)
              </button>
              <button 
                onClick={() => setPayMethod('tigopesa')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${payMethod === 'tigopesa' ? 'bg-amber-400 text-amber-950' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Tigo Pesa
              </button>
              <button 
                onClick={() => setPayMethod('airtel')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${payMethod === 'airtel' ? 'bg-amber-400 text-amber-950' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Airtel Money
              </button>
            </div>

            {/* Tanzanian SMS transaction instructions details */}
            <div className="space-y-3.5 text-xs sm:text-sm font-semibold text-slate-700">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <p className="pt-0.5">
                  Piga msimbo wa huduma ya kifedha: <span className="font-bold text-slate-950 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{payMethod === 'mpesa' ? '*150*00#' : payMethod === 'tigopesa' ? '*150*01#' : '*150*60#'}</span>
                </p>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <p className="pt-0.5">
                  {payMethod === 'mpesa' ? (
                    <>Chagua huduma ya <span className="font-bold text-slate-950">Lipa kwa M-Pesa (VodaLipa)</span></>
                  ) : payMethod === 'airtel' ? (
                    <>Chagua huduma ya <span className="font-bold text-slate-950">Tuma Pesa</span> (Send Money)</>
                  ) : (
                    <>Chagua huduma ya <span className="font-bold text-slate-950">Lipa kwa Simu / Tuma Pesa</span></>
                  )}
                </p>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <div className="pt-0.5 space-y-2">
                  <p className="font-bold text-slate-950">Maelezo ya Akaunti ya Malipo:</p>
                  {payMethod === 'mpesa' && (
                    <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl space-y-1.5 text-xs">
                      <p className="text-slate-800">Lipa Namba ya Vodacom (VodaLipa):</p>
                      <p className="font-extrabold text-amber-600 font-mono text-base tracking-wider bg-white px-2 py-1 rounded border border-amber-200/50 w-fit">50640388</p>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-tight">Thibitisha Jina: <span className="font-extrabold text-slate-800">LAWRENT JOSEPH MDEGELA</span></p>
                    </div>
                  )}
                  {payMethod === 'airtel' && (
                    <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl space-y-1.5 text-xs">
                      <p className="text-slate-800">Namba ya Airtel Money:</p>
                      <p className="font-extrabold text-amber-600 font-mono text-base tracking-wider bg-white px-2 py-1 rounded border border-amber-200/50 w-fit">0684458632</p>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-tight">Thibitisha Jina: <span className="font-extrabold text-slate-800">YOHANA MARCO BAHATI</span></p>
                    </div>
                  )}
                  {payMethod === 'tigopesa' && (
                    <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl space-y-3 text-xs">
                      <div className="space-y-1">
                        <p className="text-slate-800 font-bold">Namba ya Tigo Pesa (Tuma Pesa):</p>
                        <p className="font-extrabold text-amber-600 font-mono text-base tracking-wider bg-white px-2 py-1 rounded border border-amber-200/50 w-fit">0652637810</p>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-tight">Thibitisha Jina: <span className="font-extrabold text-slate-850">SIGBERT EVARIST MINJA</span> au jina husika la muamala</p>
                      </div>
                      <div className="border-t border-amber-100/60 pt-2 text-[10px] text-slate-500 font-semibold">
                        Njia mbadala kama huna Tigo Pesa ya moja kwa moja:
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-800 font-bold">Chaguo la 2: Lipa kwenda VodaLipa Vodacom</p>
                        <p className="font-extrabold text-slate-900 font-mono">Lipa Namba: 50640388</p>
                        <p className="text-[10px] text-slate-400">Jina: LAWRENT JOSEPH MDEGELA</p>
                      </div>
                      <div className="space-y-1 border-t border-amber-100/60 pt-2">
                        <p className="text-slate-800 font-bold">Chaguo la 3: Tuma Airtel Money</p>
                        <p className="font-extrabold text-slate-900 font-mono">Namba: 0684458632</p>
                        <p className="text-[10px] text-slate-400">Jina: YOHANA MARCO BAHATI</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                <p className="pt-0.5">
                  Weka kiasi kamili cha kifurushi chako: <span className="font-bold text-slate-950 bg-slate-100 px-1.5 py-0.5 rounded">TSh {activePlanDetails.price.toLocaleString()}</span>
                </p>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
                <p className="pt-0.5">Thibitisha muamala kwa kuingiza namba yako ya siri.</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 text-xs text-slate-400 font-semibold leading-relaxed">
              Baada ya kupata SMS ya kukamilisha malipo kwenye simu yako, tafadhali nakili namba ya muamala (Transaction ID / Reference Number) na uiingize kwenye fomu ya upande wa kulia ili kuwezesha akaunti yako ya Premium papo hapo.
            </div>
          </div>

          {/* Validation Code Input Box */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="font-display font-bold text-slate-950 text-xs uppercase">Thibitisha Malipo</h4>
              
              <form onSubmit={handleVerifyPayment} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-150 rounded-xl p-3 flex gap-2 text-xs text-red-700 font-semibold items-center">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Namba ya Muamala (Transaction ID)</label>
                  <input 
                    type="text" 
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Mfano: 8HA5F78X23 au REF..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 placeholder-slate-400 font-mono"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 text-xs text-center font-extrabold bg-amber-400 hover:bg-amber-300 disabled:bg-slate-150 text-amber-950 rounded-xl transition-all shadow-md shadow-amber-400/10 uppercase flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-amber-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Inathibitisha...</span>
                    </>
                  ) : (
                    <>
                      <span>Thibitisha Sasa</span>
                    </>
                  )}
                </button>
              </form>

              <button 
                onClick={() => setPaymentStep('tiers')}
                className="w-full py-2 text-xs text-center font-bold text-slate-400 hover:text-slate-800 transition-colors"
              >
                Rudi Kwenye Vifurushi
              </button>
            </div>

            <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <h4 className="font-display font-bold text-sm uppercase flex items-center gap-1.5 text-amber-400">
                <ShieldCheck size={16} />
                Msaada wa Malipo
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed font-semibold">
                Kama umepata changamoto yoyote wakati wa kufanya malipo au SMS haijafika, tafadhali tupigie au wasiliana nasi moja kwa moja kwa msaada wa haraka kupitia:
              </p>
              <div className="flex flex-col gap-2.5 pt-1">
                <a href="tel:0652637810" className="flex items-center gap-2 text-xs font-bold text-white hover:text-amber-400 hover:underline">
                  <PhoneCall size={14} className="text-amber-400 animate-pulse" />
                  Piga Simu (Sigbert): 0652637810
                </a>
                <a href="tel:0684458632" className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-amber-400 hover:underline">
                  <PhoneCall size={14} className="text-amber-400/80" />
                  Piga Simu (Yohana): 0684458632
                </a>
                <a href="tel:0699479032" className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-amber-400 hover:underline">
                  <PhoneCall size={14} className="text-amber-400/70" />
                  Piga Simu (Lawrent/Support): 0699479032
                </a>
                <a href="https://wa.me/255684458632?text=Habari,%20nahitaji%20msaada%20wa%20malipo%20ya%20Lupanulla%20Premium" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline">
                  <MessageCircle size={14} className="text-emerald-400 animate-pulse" />
                  Msaada wa WhatsApp (Yohana) &rarr;
                </a>
              </div>
            </div>
          </div>

        </div>
      )}

      {paymentStep === 'pending_approval' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-sm max-w-xl mx-auto space-y-6 animate-fade-in py-16 text-slate-800">
          <div className="relative mx-auto w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shadow-inner">
            <Clock size={36} className="animate-spin text-amber-500 stroke-[2.5]" style={{ animationDuration: '3s' }} />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 uppercase">Malipo Yanahakikiwa! ⏳</h2>
            <p className="text-slate-650 text-xs sm:text-sm leading-relaxed max-w-md mx-auto font-semibold">
              Ombi lako la malipo limepokelewa na kusajiliwa kikamilifu! Msimamizi wa mfumo (Admin) anahakiki muamala wako sasa hivi. 
            </p>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
              Akaunti yako itamilishwa kuwa **Premium** ndani ya dakika 15-30. Unaweza kufunga ukurasa huu na utapata ujumbe au kubofya kitufe cha chini kujulisha Admin kwa haraka.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-left max-w-md mx-auto space-y-2">
            <p className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Muhtasari wa Malipo:</p>
            <div className="text-xs space-y-1 text-slate-700">
              <p>Mteja: <strong className="text-slate-900">{userProfile?.name}</strong></p>
              <p>Kifurushi: <strong className="text-slate-900">{activePlanDetails.name}</strong></p>
              <p>Njia ya Malipo: <strong className="text-slate-900 uppercase">{payMethod}</strong></p>
              <p>Transaction ID: <strong className="text-slate-900 font-mono">{transactionId.toUpperCase()}</strong></p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-md mx-auto">
            <a
              href={`https://wa.me/255684458632?text=Habari%20Admin,%20nimewasilisha%20muamala%20wangu%20wa%20Lupanulla%20Premium%20kwa%20ajili%20ya%20uhakiki.%0A%0AJina:%20${encodeURIComponent(userProfile?.name || '')}%0ABarua%20Pepe:%20${encodeURIComponent(userProfile?.email || '')}%0ANamba%20ya%20Muamala:%20${encodeURIComponent(transactionId.trim().toUpperCase())}%0AKifurushi:%20${encodeURIComponent(activePlanDetails.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <MessageCircle size={15} />
              Arifu Admin via WhatsApp
            </a>

            <button 
              onClick={() => {
                setPaymentStep('tiers');
                setTransactionId('');
              }}
              className="px-5 py-3 border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl"
            >
              Rudi Kwenye Vifurushi
            </button>
          </div>
        </div>
      )}

      {paymentStep === 'success' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-sm max-w-xl mx-auto space-y-6 animate-fade-in py-16">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
            <Crown size={36} className="stroke-[2.5] animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-2xl text-slate-900 uppercase">Sasa Wewe ni PREMIUM!</h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-md mx-auto font-medium">
              Malipo yako ya muamala yamethibitishwa kikamilifu! Sasa una akaunti ya **Premium Member**. Unaweza kusoma, kupakua faili zote bila kikomo na kutumia Lupanulla AI wakati wowote.
            </p>
          </div>

          <button 
            onClick={() => onNavigate('mitihani')}
            className="px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
          >
            Nenda Kwenye Maktaba ya Nyaraka
          </button>
        </div>
      )}

    </div>
  );
}
