import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await submitFeedback({
        userId: user.uid,
        userName: userProfile?.name || user.displayName || 'Mwanafunzi',
        email: user.email || '',
        type,
        message: message.trim()
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setMessage('');
        setType('missing_notes');
      }, 2000);
    } catch (err: any) {
      setError('Samahani, tumeshindwa kutuma maoni yako. Tafadhali jaribu tena baadae.');
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
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <MessageSquare className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display">Maoni & Mapendekezo</h3>
                <p className="text-xs text-slate-400">Tusaidie kuboresha Lupanulla Elimu Hub</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
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
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-slate-900">Asante Sana!</h4>
                  <p className="text-slate-500">Maoni yako yamepokelewa na yanafanyiwa kazi.</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Unatoa maoni kuhusu nini?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'missing_notes', label: 'Notisi Hazipo', icon: AlertCircle },
                      { id: 'improvement', label: 'Maboresho', icon: Send },
                      { id: 'bug', label: 'Tatizo la App', icon: AlertCircle },
                      { id: 'other', label: 'Mengineyo', icon: MessageSquare },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setType(item.id as FeedbackType)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                          type === item.id 
                            ? 'bg-cyan-50 border-cyan-500 text-cyan-700 shadow-sm ring-1 ring-cyan-500' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-cyan-200 hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${type === item.id ? 'text-cyan-500' : 'text-slate-400'}`} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Ujumbe Wako</label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Elezea kwa kifupi unachotaka kusema..."
                    className="w-full min-h-[140px] p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all resize-none text-slate-700"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Tuma Maoni
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
