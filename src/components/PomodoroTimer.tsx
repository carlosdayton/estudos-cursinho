import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Focus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setMinutes(mode === 'work' ? 25 : 5);
    setSeconds(0);
  }, [mode]);

  const switchMode = () => {
    const newMode = mode === 'work' ? 'break' : 'work';
    setMode(newMode);
    setIsActive(false);
    setMinutes(newMode === 'work' ? 25 : 5);
    setSeconds(0);
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
          // Auto-switch mode or just stop
          // Not playing sound as per user request
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const formatTime = (m: number, s: number) => {
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card p-8 flex flex-col items-center gap-6 border-white/10">
      <div className="flex gap-4">
        <button 
          onClick={() => mode !== 'work' && switchMode()}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            mode === 'work' 
              ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
              : 'text-white hover:text-white border border-white/20'
          }`}
        >
          <Focus size={16} />
          <span className="text-xs font-black uppercase tracking-widest">Foco</span>
        </button>
        <button 
          onClick={() => mode !== 'break' && switchMode()}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            mode === 'break' 
              ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
              : 'text-white hover:text-white border border-white/20'
          }`}
        >
          <Coffee size={16} />
          <span className="text-xs font-black uppercase tracking-widest">Pausa</span>
        </button>
      </div>

      <div className="relative">
        <motion.span 
          key={formatTime(minutes, seconds)}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-7xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          {formatTime(minutes, seconds)}
        </motion.span>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={toggleTimer}
          className={`p-4 rounded-2xl transition-all ${
            isActive 
              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' 
              : 'bg-white text-slate-900 shadow-[0_10px_30px_rgba(255,255,255,0.2)]'
          }`}
        >
          {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
        </button>
        <button 
          onClick={resetTimer}
          className="p-4 rounded-2xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
}
