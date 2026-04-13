import { useState } from 'react';
import { CheckCircle2, Timer, X, NotebookPen } from 'lucide-react';
import type { Topic } from '../utils/studyLogic';
import { isReviewDue } from '../utils/studyLogic';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  topic: Topic;
  onToggleStudied: () => void;
  onToggleExercises: () => void;
  onRemove: () => void;
  onUpdateNotes: (notes: string) => void;
}

export default function TopicItem({ topic, onToggleStudied, onToggleExercises, onRemove, onUpdateNotes }: Props) {
  const [showNotes, setShowNotes] = useState(false);
  const reviewDue = isReviewDue(topic.reviewDate);
  const completed = topic.isStudied && topic.isExercisesDone;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`sub-card rounded-[40px] group transition-all duration-500 overflow-hidden flex flex-col relative ${
        completed 
          ? 'border-white/50 bg-white/[0.1] shadow-[0_30px_60px_rgba(255,255,255,0.08)]' 
          : 'border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
      }`}
    >
      <div className="absolute top-6 right-6 flex gap-2 z-30">
        <button 
          onClick={() => setShowNotes(!showNotes)}
          className={`p-2 transition-all rounded-xl hover:bg-white/20 ${showNotes ? 'bg-white/20' : ''}`}
          title="Anotações"
        >
          <NotebookPen size={20} color="#FFFFFF" strokeWidth={2.5} />
        </button>
        <button 
          onClick={onRemove}
          className="p-2 text-white transition-all rounded-xl hover:bg-white/20"
          style={{ color: '#FFFFFF' }}
        >
          <X size={20} color="#FFFFFF" strokeWidth={3} />
        </button>
      </div>

      <div className="p-10 flex flex-col items-center gap-4">
        {/* Centered Huge Content Name - EVEN BIGGER */}
        <div className="text-center w-full px-4">
          <h4 
            className={`text-5xl font-black tracking-tighter transition-all mb-0 ${completed ? 'line-through decoration-white/50' : ''}`}
            style={{ color: '#FFFFFF' }}
          >
            {topic.name}
          </h4>
          
          {topic.reviewDate && (
            <div className="flex justify-center mt-1">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl border bg-white/[0.05] border-white/20 text-white shadow-xl" style={{ color: '#FFFFFF' }}>
                <Timer size={12} strokeWidth={3} color="#FFFFFF" className={reviewDue ? 'animate-pulse' : ''} />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: '#FFFFFF' }}>
                  {reviewDue ? 'REVISÃO AGENDADA' : 'PRÓXIMA REVISÃO'}: {new Date(topic.reviewDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Row: Side-by-Side (PURE WHITE 100% OPACITY) */}
        <div className="flex flex-row gap-4 w-full mt-4">
          <button 
            onClick={onToggleStudied}
            className={`flex-1 flex flex-col items-center justify-center gap-3 py-7 rounded-3xl transition-all border ${
              topic.isStudied 
                ? 'bg-white/30 border-white/60 shadow-lg' 
                : 'bg-white/[0.08] border-white/20 hover:border-white/40'
            }`}
            style={{ color: '#FFFFFF' }}
          >
            <CheckCircle2 size={32} strokeWidth={3} color="#FFFFFF" opacity={topic.isStudied ? 1 : 0.3} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] !text-white" style={{ color: '#FFFFFF' }}>Teoria Completa</span>
          </button>

          <button 
            onClick={onToggleExercises}
            className={`flex-1 flex flex-col items-center justify-center gap-3 py-7 rounded-3xl transition-all border ${
              topic.isExercisesDone 
                ? 'bg-white/30 border-white/60 shadow-lg' 
                : 'bg-white/[0.08] border-white/20 hover:border-white/40'
            }`}
            style={{ color: '#FFFFFF' }}
          >
            <CheckCircle2 size={32} strokeWidth={3} color="#FFFFFF" opacity={topic.isExercisesDone ? 1 : 0.3} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] !text-white" style={{ color: '#FFFFFF' }}>Prática Feita</span>
          </button>
        </div>

        <AnimatePresence>
          {showNotes && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full mt-4 overflow-hidden"
            >
              <textarea 
                value={topic.notes || ''}
                onChange={(e) => onUpdateNotes(e.target.value)}
                placeholder="Suas anotações importantes aqui..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-white/30 resize-none custom-scroll"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Subtle Progress Bar at the bottom (PURE WHITE) */}
      <div className="h-2 w-full bg-white/[0.1] mt-auto">
        <motion.div 
          className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]"
          initial={{ width: 0 }}
          animate={{ width: completed ? '100%' : (topic.isStudied || topic.isExercisesDone ? '50%' : '5%') }}
          transition={{ duration: 1.2, ease: "circOut" }}
          style={{ backgroundColor: '#FFFFFF' }}
        />
      </div>
    </motion.div>
  );
}
