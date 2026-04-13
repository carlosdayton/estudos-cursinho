import { useState } from 'react';
import type { Subject, Topic } from '../utils/studyLogic';
import { calculateReviewDate, getProgress } from '../utils/studyLogic';
import TopicItem from './TopicItem';
import { Plus, GraduationCap, ChevronRight, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  subject: Subject;
  onUpdateSubject: (updated: Subject) => void;
  onDeleteSubject: () => void;
}

export default function SubjectCard({ subject, onUpdateSubject, onDeleteSubject }: Props) {
  const [newTopicName, setNewTopicName] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const addTopic = () => {
    if (!newTopicName.trim()) return;
    const newTopic: Topic = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTopicName,
      isStudied: false,
      isExercisesDone: false
    };
    onUpdateSubject({
      ...subject,
      topics: [...subject.topics, newTopic]
    });
    setNewTopicName('');
  };

  const updateTopic = (topicId: string, updates: Partial<Topic>) => {
    const updatedTopics = subject.topics.map(t => {
      if (t.id === topicId) {
        const updated = { ...t, ...updates };
        if (updated.isStudied && updated.isExercisesDone && (!t.isStudied || !t.isExercisesDone)) {
          updated.completedAt = new Date().toISOString();
          updated.reviewDate = calculateReviewDate(updated.completedAt);
        }
        return updated;
      }
      return t;
    });
    onUpdateSubject({ ...subject, topics: updatedTopics });
  };

  const removeTopic = (topicId: string) => {
    onUpdateSubject({
      ...subject,
      topics: subject.topics.filter(t => t.id !== topicId)
    });
  };

  const progress = getProgress(subject);

  return (
    <motion.div 
      layout
      className="glass-card flex flex-col group overflow-visible pt-16"
      style={{ position: 'relative' }}
    >
      {/* Floating Icon XXL */}
      <div 
        className="absolute left-1/2 -top-14 -translate-x-1/2 z-20 group-hover:-translate-y-3 transition-transform duration-700"
      >
        <div className="relative">
          <div 
            className="absolute -inset-8 blur-3xl opacity-50 rounded-full"
            style={{ backgroundColor: subject.color }}
          />
          <div 
            className="w-28 h-28 rounded-[40px] flex items-center justify-center relative z-20 bg-slate-900 border-[3px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            style={{ borderColor: subject.color, color: subject.color }}
          >
            <GraduationCap size={64} strokeWidth={2} />
          </div>
        </div>
      </div>

      <div className="flex flex-col mb-10 gap-8">
        <div className="text-center w-full px-6">
          <h3 className="text-6xl font-black text-white leading-tight mb-10 tracking-tighter drop-shadow-2xl">
            {subject.name}
          </h3>
          <div className="flex items-center justify-center gap-12 w-full">
            <span className="text-[14px] text-white/60 font-black uppercase tracking-[0.4em]">{subject.topics.length} TÓPICOS</span>
            <div className="w-3 h-3 rounded-full bg-white/10 shadow-inner" />
            <span className="text-[14px] font-black uppercase tracking-[0.4em] px-8 py-3 rounded-full bg-white/5 border border-white/5 shadow-xl" style={{ color: subject.color }}>{progress}% FEITO</span>
          </div>
        </div>
        
        <div className="flex flex-row items-center justify-center gap-8">
          <button 
            onClick={onDeleteSubject}
            className="action-btn hover:text-red-400 transition-all shadow-xl"
            style={{ width: '48px', height: '48px' }}
            title="Excluir Matéria"
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`action-btn transition-all shadow-xl ${isExpanded ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' : ''}`}
            style={{ width: '48px', height: '48px' }}
          >
            <ChevronRight size={24} style={{ transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }} />
          </button>
        </div>
      </div>

      <div className="relative h-4 bg-slate-800/50 rounded-full mb-8 overflow-hidden border-2 border-white/5 shadow-inner mx-4">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="absolute h-full left-0 top-0"
          style={{ 
            backgroundColor: subject.color,
            boxShadow: `0 0 40px ${subject.color}cc`
          }}
        />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-4 px-4 mb-16">
              <input 
                type="text" 
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                placeholder="O que vamos aprender agora?"
                className="input flex-1 py-4 text-xl px-8"
              />
              <button 
                onClick={addTopic} 
                className="btn btn-primary px-7 aspect-square flex items-center justify-center shadow-lg"
              >
                <Plus size={28} strokeWidth={3} />
              </button>
            </div>

            <div className="flex flex-col gap-6 max-h-[800px] overflow-y-auto pr-4 custom-scroll pb-12">
              {subject.topics.map(topic => (
                <TopicItem 
                  key={topic.id}
                  topic={topic}
                  onToggleStudied={() => updateTopic(topic.id, { isStudied: !topic.isStudied })}
                  onToggleExercises={() => updateTopic(topic.id, { isExercisesDone: !topic.isExercisesDone })}
                  onRemove={() => removeTopic(topic.id)}
                  onUpdateNotes={(notes) => updateTopic(topic.id, { notes })}
                />
              ))}
              {subject.topics.length === 0 && (
                <div className="py-32 text-center bg-white/[0.01] rounded-[64px] border-4 border-white/[0.04] border-dashed">
                  <p className="text-[16px] text-slate-700 font-black uppercase tracking-[0.4em]">Inicie sua jornada épica</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
