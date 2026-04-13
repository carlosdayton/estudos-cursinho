import { useMemo } from 'react';
import { Flame, Clock, BookCheck, TrendingUp } from 'lucide-react';
import type { Subject, Simulado } from '../utils/studyLogic';
import { calculateStudyStreak } from '../utils/studyLogic';

interface StatsPanelProps {
  subjects: Subject[];
  simulados: Simulado[];
  pomodoroSessions: number;
}

function formatFocusTime(totalMinutes: number): string {
  if (totalMinutes === 0) return '—';
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '56px',
        color: 'rgba(255,255,255,0.2)',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        Adicione mais simulados para ver a evolução
      </div>
    );
  }

  const width = 300;
  const height = 56;
  const pad = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x, y] as [number, number];
  });

  const polyline = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const [lx, ly] = pts[pts.length - 1];

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}
      aria-label="Evolução dos simulados" role="img" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(129,140,248,0.3)" />
          <stop offset="100%" stopColor="rgba(129,140,248,1)" />
        </linearGradient>
      </defs>
      <polyline points={polyline} fill="none" stroke="url(#sparkGrad)"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="4" fill="#818cf8" stroke="white" strokeWidth="2" />
    </svg>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}

function StatCard({ icon, label, value, subtext, accentColor, accentBg, accentBorder }: StatCardProps) {
  return (
    <div style={{
      background: accentBg,
      border: `1px solid ${accentBorder}`,
      borderRadius: '20px',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: accentBorder,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: accentColor,
      }}>
        {icon}
      </div>
      <div>
        <p style={{
          fontSize: '10px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '4px',
        }}>
          {label}
        </p>
        <p style={{
          fontSize: value === '—' ? '1rem' : '1.75rem',
          fontWeight: 900,
          color: value === '—' ? 'rgba(255,255,255,0.2)' : accentColor,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
        }}>
          {value}
        </p>
        {subtext && (
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px', fontWeight: 500 }}>
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

export default function StatsPanel({ subjects, simulados, pomodoroSessions }: StatsPanelProps) {
  const streak = useMemo(() => calculateStudyStreak(subjects), [subjects]);
  const focusLabel = formatFocusTime(pomodoroSessions * 25);

  const topicsThisWeek = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoISO = weekAgo.toISOString();
    let count = 0;
    for (const s of subjects)
      for (const t of s.topics)
        if (t.completedAt && t.completedAt >= weekAgoISO) count++;
    return count;
  }, [subjects]);

  const sparklineValues = useMemo(() => {
    if (simulados.length === 0) return [];
    return [...simulados].sort((a, b) => a.date.localeCompare(b.date)).map(s => s.total);
  }, [simulados]);

  const latestAvg = useMemo(() => {
    if (simulados.length === 0) return 0;
    return Math.round(simulados.reduce((acc, s) => acc + s.total, 0) / simulados.length);
  }, [simulados]);

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.4)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '24px',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
      marginTop: '2rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '44px', height: '44px',
          borderRadius: '14px',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.8)',
        }}>
          <TrendingUp size={20} />
        </div>
        <div>
          <h3 style={{
            fontSize: '1rem', fontWeight: 900, color: '#fff',
            textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0,
          }}>
            Estatísticas
          </h3>
          <p style={{
            fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0,
          }}>
            Seu progresso em números
          </p>
        </div>
      </div>

      {/* Cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
      }}>
        <StatCard
          icon={<Flame size={20} />}
          label="Sequência"
          value={streak > 0 ? `${streak} dia${streak !== 1 ? 's' : ''}` : '—'}
          subtext={streak === 0 ? 'Estude hoje para começar' : undefined}
          accentColor="#fb923c"
          accentBg="rgba(251,146,60,0.08)"
          accentBorder="rgba(251,146,60,0.25)"
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Foco acumulado"
          value={focusLabel}
          subtext={pomodoroSessions === 0 ? 'Nenhuma sessão ainda' : `${pomodoroSessions} sessões`}
          accentColor="#818cf8"
          accentBg="rgba(129,140,248,0.08)"
          accentBorder="rgba(129,140,248,0.25)"
        />
        <StatCard
          icon={<BookCheck size={20} />}
          label="Tópicos esta semana"
          value={topicsThisWeek > 0 ? String(topicsThisWeek) : '—'}
          subtext={topicsThisWeek === 0 ? 'Nenhum tópico concluído' : undefined}
          accentColor="#34d399"
          accentBg="rgba(52,211,153,0.08)"
          accentBorder="rgba(52,211,153,0.25)"
        />
      </div>

      {/* Sparkline */}
      <div style={{
        background: 'rgba(129,140,248,0.05)',
        border: '1px solid rgba(129,140,248,0.15)',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{
            fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: 0,
          }}>
            Evolução dos Simulados
          </p>
          {simulados.length > 0 && (
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#818cf8' }}>
              Média: {latestAvg}
            </span>
          )}
        </div>
        <Sparkline values={sparklineValues} />
      </div>
    </div>
  );
}
