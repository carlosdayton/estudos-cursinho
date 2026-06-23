import { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDaysUntilEnem, ENEM_2026_DATE } from '../utils/studyLogic';
import './EnemCountdown.css';

const MOTIVATIONAL = [
  'CADA DIA É UM PASSO MAIS PERTO.',
  'CONSISTÊNCIA SUPERA INTENSIDADE.',
  'O ENEM NÃO ESPERA. PREPARE-SE.',
  'FOCO TOTAL. RESULTADO CERTO.',
  'SUA DEDICAÇÃO HOJE É A APROVAÇÃO AMANHÃ.',
];

export default function EnemCountdown() {
  const days = getDaysUntilEnem();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const totalDays = 305;
  const elapsed = Math.max(0, totalDays - days);
  const yearProgress = Math.min(100, Math.round((elapsed / totalDays) * 100));

  const quote = MOTIVATIONAL[Math.floor(Date.now() / 86400000) % MOTIVATIONAL.length];

  const msLeft = new Date(ENEM_2026_DATE).getTime() - Date.now();
  const hLeft = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
  const sLeft = Math.floor((msLeft % (1000 * 60)) / 1000);

  return (
    <div className="enem-countdown">
      <div className="countdown-header">
        <div className="countdown-icon-box">
          <Target size={16} strokeWidth={2} />
        </div>
        <div className="countdown-label-group">
          <span className="countdown-label-top">Telemetria</span>
          <span className="countdown-label-bottom">ENEM 2026</span>
        </div>
      </div>

      <div className="countdown-big-number">
        <motion.span
          key={days}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="big-number-val"
        >
          {days}
        </motion.span>
        <div className="big-number-label">Dias Restantes</div>
      </div>

      <div className="live-ticker">
        {[
          { val: String(hLeft).padStart(2, '0'), label: 'h' },
          { val: String(mLeft).padStart(2, '0'), label: 'm' },
          { val: String(sLeft).padStart(2, '0'), label: 's' },
        ].map(({ val, label }, i) => (
          <div key={label} className="ticker-segment">
            {i > 0 && <span className="ticker-colon">:</span>}
            <span className="ticker-val">{val}</span>
            <span className="ticker-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="progress-section">
        <div className="progress-labels">
          <span className="progress-label">Jan 2026</span>
          <span className="progress-label highlight">{yearProgress}% CUMPRIDO</span>
          <span className="progress-label">Nov 2026</span>
        </div>
        <div className="progress-track">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${yearProgress}%` }}
            transition={{ duration: 1.5, ease: 'circOut' }}
            className="progress-fill"
          />
        </div>
      </div>

      <p className="countdown-quote">"{quote}"</p>
    </div>
  );
}
