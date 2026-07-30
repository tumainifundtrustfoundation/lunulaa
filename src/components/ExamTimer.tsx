import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Bell, 
  BellRing,
  GripHorizontal,
  Minus,
  Plus
} from 'lucide-react';

interface ExamTimerProps {
  onClose: () => void;
}

export default function ExamTimer({ onClose }: ExamTimerProps) {
  const [timeLeft, setTimeLeft] = useState(3600); // Default 1 hour in seconds
  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [initialTime, setInitialTime] = useState(3600);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      // Optional: Sound alert could be added here
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const setPreset = (minutes: number) => {
    const seconds = minutes * 60;
    setInitialTime(seconds);
    setTimeLeft(seconds);
    setIsActive(false);
  };

  const isLowTime = timeLeft > 0 && timeLeft < 300; // Less than 5 minutes

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        width: isMinimized ? 'auto' : '280px' 
      }}
      className={`fixed bottom-6 right-6 z-50 bg-white border-2 ${isLowTime ? 'border-red-500 shadow-xl shadow-red-500/20' : 'border-slate-200 shadow-2xl'} rounded-3xl overflow-hidden pointer-events-auto`}
    >
      {/* Header / Drag Handle */}
      <div className={`p-3 flex items-center justify-between gap-4 ${isLowTime ? 'bg-red-50' : 'bg-slate-50'} border-b border-slate-100 cursor-move`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isLowTime ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-900 text-white'}`}>
            <Timer size={14} />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Muda wa Mtihani</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400"
          >
            {isMinimized ? <Plus size={14} /> : <Minus size={14} />}
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-red-100 hover:text-red-600 rounded-md transition-colors text-slate-400"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isMinimized ? (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-5 space-y-6"
          >
            {/* Display */}
            <div className="text-center space-y-1">
              <div className={`font-mono text-5xl font-black tracking-tighter ${isLowTime ? 'text-red-600' : 'text-slate-900'}`}>
                {formatTime(timeLeft)}
              </div>
              {timeLeft === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-bold text-red-600 uppercase tracking-widest"
                >
                  Muda Umekwisha!
                </motion.div>
              )}
            </div>

            {/* Presets */}
            {!isActive && (
              <div className="grid grid-cols-4 gap-2">
                {[30, 60, 120, 180].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPreset(m)}
                    className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                      initialTime === m * 60 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {m >= 60 ? `${m/60}h` : `${m}m`}
                  </button>
                ))}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTimer}
                disabled={timeLeft === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs transition-all ${
                  isActive 
                    ? 'bg-amber-400 text-amber-950 hover:bg-amber-500' 
                    : 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-600/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                {isActive ? 'Simamisha' : 'Anza Sasa'}
              </button>
              
              <button
                onClick={resetTimer}
                className="p-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl transition-all"
                title="Rudia"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
              <BellRing size={10} className={isLowTime ? 'text-red-500 animate-bounce' : ''} />
              <span>Utajulishwa muda ukikaribia kuisha</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="minimized"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className={`px-4 py-2 flex items-center gap-3 ${isLowTime ? 'bg-red-50' : 'bg-white'}`}
          >
            <div className={`font-mono font-black ${isLowTime ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={toggleTimer}
              className={`p-1.5 rounded-lg ${isActive ? 'bg-amber-100 text-amber-600' : 'bg-cyan-100 text-cyan-600'}`}
            >
              {isActive ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
