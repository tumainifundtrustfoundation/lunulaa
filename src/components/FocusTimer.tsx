import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Coffee, 
  Clock,
  CheckCircle,
  Plus,
  Minus,
  Trophy
} from 'lucide-react';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface FocusTimerProps {
  language?: 'sw' | 'en';
  userProfile?: any;
  onAwardPoints?: (points: number, minutes: number) => void;
}

export default function FocusTimer({ language = 'sw', userProfile, onAwardPoints }: FocusTimerProps) {
  // Timer durations in minutes
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);

  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [xpAwardedPopup, setXpAwardedPopup] = useState<number | null>(null);

  // Audio Context refs for synthesis
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Setup/Reset timeLeft when duration or mode changes
  useEffect(() => {
    if (!isActive) {
      if (mode === 'focus') {
        setTimeLeft(focusDuration * 60);
      } else if (mode === 'shortBreak') {
        setTimeLeft(shortBreakDuration * 60);
      } else if (mode === 'longBreak') {
        setTimeLeft(longBreakDuration * 60);
      }
    }
  }, [mode, focusDuration, shortBreakDuration, longBreakDuration, isActive]);

  // Main countdown effect
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, mode]);

  // Handle timer completion
  const handleTimerComplete = () => {
    setIsActive(false);
    playChime();
    
    if (mode === 'focus') {
      setCompletedCycles((prev) => prev + 1);
      
      const pointsEarned = focusDuration * 10;
      setXpAwardedPopup(pointsEarned);
      if (onAwardPoints && userProfile?.uid) {
        onAwardPoints(pointsEarned, focusDuration);
      }
      
      // Auto-switch to appropriate break
      if ((completedCycles + 1) % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(longBreakDuration * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(shortBreakDuration * 60);
      }
    } else {
      // Return to focus mode
      setMode('focus');
      setTimeLeft(focusDuration * 60);
    }
  };

  // Synthesize a high-quality study completion chime
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.25, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      // Arpeggio chime
      playTone(523.25, ctx.currentTime, 0.8); // C5
      playTone(659.25, ctx.currentTime + 0.15, 0.8); // E5
      playTone(783.99, ctx.currentTime + 0.3, 0.8); // G5
      playTone(1046.50, ctx.currentTime + 0.45, 1.2); // C6
    } catch (e) {
      console.error('Failed to play synthesized chime:', e);
    }
  };

  // Web Audio client-side cozy brown noise (study focus soundscape) generator
  const startAmbientNoise = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const bufferSize = 10 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise formula for a warm, cozy rumble resembling soft rain/breeze
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compensate volume
      }
      
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;
      
      // Cozy warm filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, ctx.currentTime);
      
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      source.start();
      noiseSourceRef.current = source;
      setIsAmbientPlaying(true);
    } catch (e) {
      console.error('Could not start ambient synthesizer:', e);
    }
  };

  const stopAmbientNoise = () => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
      } catch (e) {}
      noiseSourceRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    setIsAmbientPlaying(false);
  };

  const toggleAmbientNoise = () => {
    if (isAmbientPlaying) {
      stopAmbientNoise();
    } else {
      startAmbientNoise();
    }
  };

  // Clean up noise when component unmounts
  useEffect(() => {
    return () => {
      stopAmbientNoise();
    };
  }, []);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'focus') {
      setTimeLeft(focusDuration * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(shortBreakDuration * 60);
    } else if (mode === 'longBreak') {
      setTimeLeft(longBreakDuration * 60);
    }
  };

  // Calculations for formatting and progress ring
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const totalDuration = (mode === 'focus' ? focusDuration : mode === 'shortBreak' ? shortBreakDuration : longBreakDuration) * 60;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  // Custom Swahili context captions
  const getMotivationalText = () => {
    if (mode === 'focus') {
      return {
        title: 'Muda wa Kuzingatia',
        sub: 'Soma kwa bidii, epuka usumbufu!',
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50/50',
        borderColor: 'border-cyan-100'
      };
    } else if (mode === 'shortBreak') {
      return {
        title: 'Mapumziko Mafupi',
        sub: 'Nyoosha viungo, kunywa maji kidogo.',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50/50',
        borderColor: 'border-emerald-100'
      };
    } else {
      return {
        title: 'Mapumziko Marefu',
        sub: 'Kazi nzuri! Burudisha akili kabisa sasa.',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50/50',
        borderColor: 'border-indigo-100'
      };
    }
  };

  const info = getMotivationalText();

  // Helper adjustments for minutes
  const adjustDuration = (type: TimerMode, amount: number) => {
    if (type === 'focus') {
      setFocusDuration((prev) => {
        const newVal = Math.max(1, Math.min(60, prev + amount));
        if (mode === 'focus' && !isActive) setTimeLeft(newVal * 60);
        return newVal;
      });
    } else if (type === 'shortBreak') {
      setShortBreakDuration((prev) => {
        const newVal = Math.max(1, Math.min(30, prev + amount));
        if (mode === 'shortBreak' && !isActive) setTimeLeft(newVal * 60);
        return newVal;
      });
    } else if (type === 'longBreak') {
      setLongBreakDuration((prev) => {
        const newVal = Math.max(1, Math.min(60, prev + amount));
        if (mode === 'longBreak' && !isActive) setTimeLeft(newVal * 60);
        return newVal;
      });
    }
  };

  return (
    <div id="study-pomodoro-timer" className="relative bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-6">
      {/* XP Awarded Popup Overlay */}
      <AnimatePresence>
        {xpAwardedPopup !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-3xl p-6 flex flex-col items-center justify-center text-center z-50 space-y-4"
          >
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-200">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-black text-slate-900 text-lg uppercase tracking-tight">
                {language === 'sw' ? 'Muzunguko Umekamilika!' : 'Session Completed!'}
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                {language === 'sw' 
                  ? `Hongera! Umesoma kwa dakika ${focusDuration} bila kuacha.` 
                  : `Well done! You studied for ${focusDuration} minutes without interruption.`}
              </p>
            </div>
            
            <div className="bg-amber-50 border border-amber-150 px-4 py-2.5 rounded-2xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              <span className="text-sm font-black text-amber-800">
                +{xpAwardedPopup} XP Points
              </span>
            </div>

            <button
              onClick={() => setXpAwardedPopup(null)}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
            >
              {language === 'sw' ? 'Endelea' : 'Continue'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Saa ya Kusomea</h4>
            <p className="text-xs text-slate-400">Tekniki ya Pomodoro</p>
          </div>
        </div>
        <button
          onClick={toggleAmbientNoise}
          title="Sauti ya utulivu ili kukusaidia kurelax wakati wa kusoma"
          className={`p-2 rounded-xl border transition-all flex items-center gap-1 text-xs font-semibold ${
            isAmbientPlaying 
              ? 'bg-cyan-50 text-cyan-600 border-cyan-100' 
              : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
          }`}
        >
          {isAmbientPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>Kelele Tulivu</span>
        </button>
      </div>

      {/* Motivational Info Card */}
      <div className={`p-4 rounded-2xl border text-center transition-all ${info.bgColor} ${info.borderColor}`}>
        <span className={`text-xs font-bold uppercase tracking-wider ${info.color}`}>
          {info.title}
        </span>
        <p className="text-xs text-slate-600 mt-1">{info.sub}</p>
      </div>

      {/* Circle / Radial Timer Progress */}
      <div className="relative flex items-center justify-center py-4">
        {/* Progress Circle Visual */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="76"
              className="stroke-slate-100"
              strokeWidth="10"
              fill="transparent"
            />
            <motion.circle
              cx="88"
              cy="88"
              r="76"
              className={`transition-all duration-300 ${
                mode === 'focus' 
                  ? 'stroke-cyan-500' 
                  : mode === 'shortBreak' 
                  ? 'stroke-emerald-500' 
                  : 'stroke-indigo-500'
              }`}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 76}
              animate={{
                strokeDashoffset: 2 * Math.PI * 76 * (1 - progressPercent / 100)
              }}
              strokeLinecap="round"
            />
          </svg>

          {/* Time digits */}
          <div className="text-center z-10">
            <span className="text-4xl font-extrabold text-slate-800 font-mono tracking-tighter">
              {formatTime(timeLeft)}
            </span>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1 flex items-center justify-center gap-1">
              {mode === 'focus' ? (
                <>
                  <Sparkles className="w-3 h-3 text-cyan-500" /> Focus Mode
                </>
              ) : (
                <>
                  <Coffee className="w-3 h-3 text-emerald-500" /> Break Mode
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={resetTimer}
          className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl border border-slate-100 transition-colors"
          title="Anza Upya"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTimer}
          className={`px-8 py-3.5 rounded-2xl font-bold text-white shadow-sm flex items-center gap-2 transition-all ${
            isActive 
              ? 'bg-slate-800 hover:bg-slate-700' 
              : 'bg-cyan-600 hover:bg-cyan-700'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="w-5 h-5 fill-white" /> Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white" /> Anza
            </>
          )}
        </button>
      </div>

      {/* Mode Selectors */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
        {[
          { id: 'focus', label: 'Zingatia', activeColor: 'bg-cyan-500 text-white' },
          { id: 'shortBreak', label: 'Pumzika', activeColor: 'bg-emerald-500 text-white' },
          { id: 'longBreak', label: 'Muda mrefu', activeColor: 'bg-indigo-500 text-white' }
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setIsActive(false);
              setMode(m.id as TimerMode);
            }}
            className={`py-2 text-[11px] font-bold rounded-xl text-center transition-all ${
              mode === m.id 
                ? m.activeColor 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Duration Adjustments (Collapsible / Advanced settings) */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Muda wa Dakika</span>
        <div className="space-y-2 text-xs">
          {/* Focus Adjustment */}
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Focus Session:</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => adjustDuration('focus', -1)}
                disabled={isActive}
                className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 disabled:opacity-40"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold w-6 text-center">{focusDuration}</span>
              <button 
                onClick={() => adjustDuration('focus', 1)}
                disabled={isActive}
                className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Short Break Adjustment */}
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Short Break:</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => adjustDuration('shortBreak', -1)}
                disabled={isActive}
                className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 disabled:opacity-40"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold w-6 text-center">{shortBreakDuration}</span>
              <button 
                onClick={() => adjustDuration('shortBreak', 1)}
                disabled={isActive}
                className="p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Focus stats */}
      <div className="space-y-2">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-cyan-600" />
            <span className="text-xs text-slate-600 font-medium">
              {language === 'sw' ? 'Mizunguko iliyokamilika:' : 'Completed sessions:'}
            </span>
          </div>
          <span className="text-sm font-black text-cyan-700 bg-cyan-50 px-3 py-1 rounded-xl border border-cyan-100">
            {completedCycles}
          </span>
        </div>

        {userProfile && (
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span className="text-xs text-slate-600 font-medium">
                {language === 'sw' ? 'Muda wa kusoma (Jumla):' : 'Total study time:'}
              </span>
            </div>
            <span className="text-sm font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
              {userProfile?.studyTime || 0} {language === 'sw' ? 'Dakika' : 'Mins'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
