import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageSquare, AlertCircle, CheckCircle2, Mail, ExternalLink } from 'lucide-react';
import { submitFeedback } from '../firebase';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  userProfile: UserProfile | null;
}

type FeedbackType = 'missing_notes' | 'improvement' | 'bug' | 'other';

export default function FeedbackModal({ isOpen, onClose, user, userProfile }: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>('missing_notes');
  const [message, setMessage] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const officialEmail = 'tumainifundtrustfoundation@gmail.com';

  const typeLabels: Record<FeedbackType, string> = {
    missing_notes: 'Notisi au Mtihani Unakosekana',
    improvement: 'Maboresho na Mapendekezo',
    bug: 'Report Tatizo la App',
    other: 'Maswali & Mengineyo'
  };

  const handleOpenMailClient = () => {
    const category = typeLabels[type];
    const sender = userProfile?.name || user?.displayName || guestName || 'Mtumiaji wa Lupanulla';
    const emailAddr = user?.email || guestEmail || '';
    
    const subject = encodeURIComponent(`[Lupanulla Elimu Hub] ${category}`);
    const bodyText = encodeURIComponent(
      `Habari Timu ya Lupanulla,\n\n` +
      `Kipengele: ${category}\n` +
      `Jina la Mtumiaji: ${sender}\n` +
      `Barua Pepe: ${emailAddr}\n\n` +
      `Ujumbe / Maoni:\n` +
      `${message || '(Andika ujumbe wako hapa...)'}\n\n` +
      `Sent from Lupanulla Elimu Hub App`
    );

    window.open(`mailto:${officialEmail}?subject=${subject}&body=${bodyText}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const uid = user ? user.uid : `guest_${Date.now()}`;
    const name = userProfile?.name || user?.displayName || guestName.trim() || 'Mtumiaji Mgeni';
    const email = user?.email || guestEmail.trim() || 'hakuna_email@lupanulla.org';

    try {
      await submitFeedback({
        userId: uid,
        userName: name,
        email: email,
        type,
        message: message.trim()
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setMessage('');
        setGuestName('');
        setGuestEmail('');
        setType('missing_notes');
      }, 2000);
    } catch (err: any) {
      setError('Samahani, tumeshindwa kutuma maoni kwa server. Unaweza kutumia kitufe cha "Tuma kwa Email" hapo chini.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="bg-slate-900 p-6 flex items-center justify-between text-white border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
                <MessageSquare className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold font-display">Wasiliana Nasi &amp; Maoni</h3>
                <p className="text-xs text-slate-400 font-medium">Tuma ujumbe wa moja kwa moja au kutoa ushauri</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-slate-900">Asante Sana!</h4>
                  <p className="text-slate-600 text-sm font-medium">Maoni yako yamepokelewa vizuri na timu ya Lupanulla Elimu Hub.</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Guest name and email inputs if not logged in */}
                {!user && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Jina Lako (Hiari)</label>
                      <input 
                        type="text" 
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Mf. Yohana Musa"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Barua Pepe / Email (Hiari)</label>
                      <input 
                        type="email" 
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="mfano@gmail.com"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-cyan-500 font-semibold"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Kipengele cha Maoni</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'missing_notes', label: 'Notisi Hazipo', icon: AlertCircle },
                      { id: 'improvement', label: 'Maboresho', icon: Send },
                      { id: 'bug', label: 'Report Tatizo', icon: AlertCircle },
                      { id: 'other', label: 'Mengineyo', icon: MessageSquare },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setType(item.id as FeedbackType)}
                        className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                          type === item.id 
                            ? 'bg-cyan-50 border-cyan-500 text-cyan-800 shadow-sm ring-1 ring-cyan-500' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-cyan-300 hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${type === item.id ? 'text-cyan-600' : 'text-slate-400'}`} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Ujumbe au Maoni Wako</label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Andika maoni yako au elezea maombi/tatizo unalokumbana nalo..."
                    className="w-full min-h-[120px] p-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all resize-none text-slate-800 text-xs font-medium leading-relaxed"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                    {error}
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="flex-1 bg-slate-900 text-white py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-cyan-400" />
                        Tuma Mtandaoni
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenMailClient}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
                    title="Fungua app yako ya Mail kutuma barua pepe moja kwa moja"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="whitespace-nowrap">Tuma kwa Email App</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </button>
                </div>

                <p className="text-[10px] text-center text-slate-400 font-medium pt-1">
                  Barua pepe rasmi: <a href={`mailto:${officialEmail}`} className="text-cyan-600 hover:underline font-bold">{officialEmail}</a>
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

