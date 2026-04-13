import { useState } from 'react';
import type { Subject } from '../utils/studyLogic';
import { isReviewDue } from '../utils/studyLogic';
import { Timer, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  subjects: Subject[];
}

export default function RevisionPanel({ subjects }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Flatten all topics and filter those due for review
  const reviewsDue = subjects.flatMap(subject => 
    subject.topics
      .filter(topic => isReviewDue(topic.reviewDate))
      .map(topic => ({ ...topic, subjectName: subject.name, subjectColor: subject.color }))
  );

  if (reviewsDue.length === 0) return null;

  return (
    <div className="w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-card p-6 flex items-center justify-between border-amber-500/20 hover:bg-amber-500/5 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Timer size={24} className="animate-pulse" />
          </div>
          <div className="text-left">
            <h4 className="text-lg font-black text-white uppercase tracking-wider">Revisões Pendentes</h4>
            <p className="text-sm text-white font-bold uppercase tracking-widest">
              {reviewsDue.length} {reviewsDue.length === 1 ? 'tópico precisa' : 'tópicos precisam'} de atenção hoje
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="text-white" /> : <ChevronDown className="text-white" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewsDue.map(item => (
                <div 
                  key={item.id} 
                  className="glass-card p-6 flex items-center justify-between border-white/5 bg-white/[0.02]"
                >
                  <div className="flex flex-col gap-1">
                    <span 
                      className="text-[10px] font-black uppercase tracking-[0.2em]"
                      style={{ color: item.subjectColor }}
                    >
                      {item.subjectName}
                    </span>
                    <h5 className="text-xl font-black text-white tracking-tight">{item.name}</h5>
                  </div>
                  <div className="flex items-center gap-2 text-white/30">
                    <AlertCircle size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Vencido</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
