import { useState } from 'react';
import type { Subject } from '../utils/studyLogic';
import { useLocalStorage } from '../hooks/useLocalStorage';
import SubjectCard from './SubjectCard';
import { Plus, GraduationCap, LayoutGrid, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PomodoroTimer from './PomodoroTimer';
import RevisionPanel from './RevisionPanel';
import SimuladosTracker from './SimuladosTracker';
import { getDaysUntilEnem } from '../utils/studyLogic';

const DEFAULT_SUBJECTS: Subject[] = [
  { id: '1', name: 'Matemática', color: '#fb7185', topics: [] },
  { id: '2', name: 'Biologia', color: '#4ade80', topics: [] },
  { id: '3', name: 'Física', color: '#60a5fa', topics: [] },
  { id: '4', name: 'Química', color: '#fbbf24', topics: [] },
];

export default function Dashboard() {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('enem-study-data', DEFAULT_SUBJECTS);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    const colors = ['#818cf8', '#f472b6', '#2dd4bf', '#fbbf24', '#f87171'];
    const newSub: Subject = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSubjectName,
      color: colors[Math.floor(Math.random() * colors.length)],
      topics: []
    };
    setSubjects([...subjects, newSub]);
    setNewSubjectName('');
    setShowAddSubject(false);
  };

  const updateSubject = (updated: Subject) => {
    setSubjects(subjects.map(s => s.id === updated.id ? updated : s));
  };

  const deleteSubject = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta matéria?')) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0);
  const completedTopics = subjects.reduce((acc, s) => acc + s.topics.filter(t => t.isStudied && t.isExercisesDone).length, 0);
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div key="dashboard-root" className="min-h-screen relative">
      <div className="fade-in max-w-7xl mx-auto space-y-16 pb-32">
        <header className="flex flex-col items-center justify-center text-center gap-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[24px] flex items-center justify-center text-white shadow-[0_0_40px_rgba(99,102,241,0.4)] rotate-6">
                <GraduationCap size={40} strokeWidth={2.5} />
              </div>
              <h1 className="text-7xl font-black tracking-tight drop-shadow-2xl">Foco ENEM</h1>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-12 w-full"
          >
            <div className="glass-card p-16 w-full max-w-2xl relative overflow-hidden text-center border-white/20">
              <span className="text-sm font-black uppercase tracking-[0.6em] text-white mb-8 block opacity-80">Desempenho Global do Aluno</span>
              <div className="flex items-center justify-center gap-4 mb-10">
                <span className="text-9xl font-black text-white tracking-tighter drop-shadow-[0_0_50px_rgba(255,255,255,0.4)]">{overallProgress}</span>
                <span className="text-4xl font-black text-white">%</span>
              </div>
              <div className="w-full h-6 bg-white/10 rounded-full overflow-hidden border-2 border-white/20">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  className="h-full bg-white shadow-[0_0_40px_rgba(255,255,255,0.8)]"
                />
              </div>
            </div>
            
            <button 
              onClick={() => setShowAddSubject(!showAddSubject)}
              className="btn btn-primary h-[90px] px-16 shadow-[0_20px_60px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 text-xl bg-white text-slate-950"
            >
              <Plus size={32} strokeWidth={3} />
              <span className="font-extrabold uppercase tracking-widest">Nova Matéria</span>
            </button>
          </motion.div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch py-20">
          <div className="lg:col-span-1">
            <PomodoroTimer />
          </div>
          
          <div className="lg:col-span-1 border-white/20">
            <div className="glass-card h-full p-12 flex flex-col items-center justify-center text-center gap-8 border-white/20">
              <div className="p-6 rounded-[32px] bg-white text-slate-900 shadow-2xl">
                <Clock size={48} />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-black text-white uppercase tracking-[0.4em] mb-4 opacity-70">Dias para o ENEM</span>
                <span className="text-9xl font-black text-white tracking-tighter drop-shadow-2xl leading-none">
                  {getDaysUntilEnem()}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 h-full">
            <RevisionPanel subjects={subjects} />
          </div>
        </section>

        <div className="py-40">
          <hr className="border-white/30 h-1" />
        </div>

        <AnimatePresence>
          {showAddSubject && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card flex flex-col sm:flex-row gap-6 items-end border-indigo-500/20"
            >
              <div className="flex-1 w-full">
                <label className="text-xs font-bold text-white uppercase mb-3 block tracking-widest">Qual a matéria de hoje?</label>
                <input 
                  type="text" 
                  autoFocus
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                  className="input text-lg"
                  placeholder="Ex: Literatura, Filosofia..."
                />
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={() => setShowAddSubject(false)} className="btn bg-slate-800 text-slate-300 hover:bg-slate-700 flex-1 sm:flex-none">Cancelar</button>
                <button onClick={addSubject} className="btn btn-primary flex-1 sm:flex-none">Criar Matéria</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid">
          {subjects.map(subject => (
            <SubjectCard 
              key={subject.id}
              subject={subject}
              onUpdateSubject={updateSubject}
              onDeleteSubject={() => deleteSubject(subject.id)}
            />
          ))}
          {subjects.length === 0 && (
            <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-800 rounded-[32px]">
              <LayoutGrid size={64} className="mx-auto text-slate-700 mb-6 opacity-20" />
              <p className="text-slate-500 text-xl font-medium">Bora começar? Adicione sua primeira matéria acima.</p>
            </div>
          )}
        </div>

        <section className="pt-48 mt-48 border-t-[3px] border-white/30">
          <SimuladosTracker />
        </section>
      </div>
    </div>
  );
}
