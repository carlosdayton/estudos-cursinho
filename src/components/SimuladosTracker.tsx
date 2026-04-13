import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Simulado } from '../utils/studyLogic';
import { Plus, BarChart3, TrendingUp, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SimuladosTracker() {
  const [simulados, setSimulados] = useLocalStorage<Simulado[]>('enem-simulados-data', []);
  const [showAdd, setShowAdd] = useState(false);
  const [newScores, setNewScores] = useState({
    linguagens: 0,
    humanas: 0,
    natureza: 0,
    matematica: 0,
    redacao: 0
  });

  const handleAdd = () => {
    const total = Object.values(newScores).reduce((a, b) => a + b, 0);
    const newSim: Simulado = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      scores: { ...newScores },
      total
    };
    setSimulados([newSim, ...simulados]);
    setShowAdd(false);
    setNewScores({ linguagens: 0, humanas: 0, natureza: 0, matematica: 0, redacao: 0 });
  };

  const deleteSimulado = (id: string) => {
    setSimulados(simulados.filter(s => s.id !== id));
  };

  const averageScore = simulados.length > 0 
    ? Math.round(simulados.reduce((acc, s) => acc + s.total, 0) / simulados.length) 
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <BarChart3 size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Rastreador de Simulados</h3>
            <p className="text-white text-xs font-bold uppercase tracking-widest">Acompanhe sua evolução rumo à aprovação</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="btn btn-primary px-6 py-3 flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Novo Simulado</span>
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-10 border-indigo-500/30 bg-indigo-500/[0.02]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
              {Object.entries(newScores).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50">{key}</label>
                  <input 
                    type="number" 
                    value={value || ''}
                    onChange={(e) => setNewScores({...newScores, [key]: Number(e.target.value)})}
                    className="input text-center text-xl font-black bg-white/5 border-white/10 focus:border-indigo-500"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)} className="btn bg-slate-800 text-slate-300">Cancelar</button>
              <button onClick={handleAdd} className="btn btn-primary px-10"><Save size={18} className="mr-2" /> Salvar Resultado</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {simulados.map(sim => (
            <motion.div 
              layout
              key={sim.id}
              className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                  {new Date(sim.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
                <span className="text-3xl font-black text-white tracking-tighter">Total: {sim.total}</span>
              </div>
              
              <div className="flex gap-4 flex-wrap justify-center">
                {Object.entries(sim.scores).map(([area, score]) => (
                  <div key={area} className="flex flex-col items-center px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">{area.substring(0, 3)}</span>
                    <span className="text-sm font-bold text-indigo-300">{score}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => deleteSimulado(sim.id)}
                className="p-2 text-slate-600 hover:text-red-400 transition-all"
              >
                <X size={20} />
              </button>
            </motion.div>
          ))}
          {simulados.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[32px]">
              <TrendingUp size={48} className="mx-auto text-slate-800 mb-4 opacity-20" />
              <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">Nenhum simulado registrado ainda.</p>
            </div>
          )}
        </div>

        <div className="glass-card p-8 flex flex-col items-center justify-center text-center gap-6 border-indigo-500/20 bg-indigo-500/[0.02]">
          <span className="text-xs font-black text-white uppercase tracking-[0.4em]">Média Geral</span>
          <div className="flex items-baseline gap-2">
            <span className="text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              {averageScore}
            </span>
          </div>
          <p className="text-xs text-white font-medium leading-relaxed px-4">
            Sua média está baseada nos últimos {simulados.length} simulados. Continue focado!
          </p>
        </div>
      </div>
    </div>
  );
}
