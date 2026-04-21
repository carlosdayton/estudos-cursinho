import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, TrendingDown, Minus, AlertTriangle, BarChart3 } from 'lucide-react';
import { useSimulados } from '../hooks/useSimulados';
import type { SimuladoScores } from '../utils/studyLogic';

const ACCENT = '#38bdf8';

const AREAS: { key: keyof SimuladoScores; label: string; color: string; enem: number }[] = [
  { key: 'linguagens', label: 'Linguagens', color: '#818cf8', enem: 524 },
  { key: 'humanas', label: 'Humanas', color: '#f472b6', enem: 511 },
  { key: 'natureza', label: 'Natureza', color: '#4ade80', enem: 499 },
  { key: 'matematica', label: 'Matemática', color: '#fbbf24', enem: 516 },
  { key: 'redacao', label: 'Redação', color: '#e879f9', enem: 614 },
];

function Trend({ val }: { val: 'up' | 'down' | 'stable' }) {
  if (val === 'up') return <TrendingUp size={14} color="#4ade80" />;
  if (val === 'down') return <TrendingDown size={14} color="#f87171" />;
  return <Minus size={14} color="rgba(255,255,255,0.3)" />;
}

// ─── Bar chart SVG ────────────────────────────────────────────────────────────
function BarChartSVG({ data }: { data: { label: string; value: number; color: string; enem: number }[] }) {
  const maxVal = 1000;
  const W = 560;
  const H = 200;
  const barW = 48;
  const gap = (W - data.length * barW) / (data.length + 1);

  return (
    <svg viewBox={`0 0 ${W} ${H + 40}`} style={{ width: '100%', maxWidth: W, overflow: 'visible' }}>
      {/* Grid lines */}
      {[0, 250, 500, 750, 1000].map(v => {
        const y = H - (v / maxVal) * H;
        return (
          <g key={v}>
            <line x1={0} y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            <text x={-4} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize={9} fontFamily="Lexend, sans-serif">{v}</text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const x = gap + i * (barW + gap);
        const barH = (d.value / maxVal) * H;
        const enemH = (d.enem / maxVal) * H;
        const y = H - barH;
        const enemY = H - enemH;

        return (
          <g key={d.label}>
            {/* ENEM average line */}
            <line x1={x - 4} y1={enemY} x2={x + barW + 4} y2={enemY} stroke={d.color} strokeWidth={1.5} strokeDasharray="4 3" opacity={0.5} />

            {/* Bar */}
            <motion.rect
              x={x} y={y} width={barW} height={barH}
              rx={6} fill={d.color}
              initial={{ height: 0, y: H }}
              animate={{ height: barH, y }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: 'circOut' }}
              opacity={0.85}
            />

            {/* Value label */}
            {d.value > 0 && (
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fill={d.color} fontSize={11} fontWeight={700} fontFamily="Lexend, sans-serif">
                {Math.round(d.value)}
              </text>
            )}

            {/* Area label */}
            <text x={x + barW / 2} y={H + 16} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={10} fontFamily="Lexend, sans-serif">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Radar chart SVG ─────────────────────────────────────────────────────────
function RadarChartSVG({ last, avg }: { last: SimuladoScores; avg: SimuladoScores }) {
  const cx = 160;
  const cy = 160;
  const r = 120;
  const n = AREAS.length;
  const maxVal = 1000;

  function point(value: number, index: number) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const dist = (value / maxVal) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  }

  function labelPoint(index: number) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const dist = r + 22;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  }

  const lastPoints = AREAS.map((a, i) => point(last[a.key], i));
  const avgPoints = AREAS.map((a, i) => point(avg[a.key], i));

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';

  return (
    <svg viewBox="0 0 320 320" style={{ width: '100%', maxWidth: 320 }}>
      {/* Grid circles */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <circle key={f} cx={cx} cy={cy} r={r * f} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      ))}
      {/* Spokes */}
      {AREAS.map((_, i) => {
        const p = point(maxVal, i);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />;
      })}

      {/* Average polygon */}
      <motion.path
        d={toPath(avgPoints)}
        fill="rgba(56,189,248,0.1)"
        stroke={ACCENT}
        strokeWidth={1.5}
        strokeDasharray="4 3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Last simulado polygon */}
      <motion.path
        d={toPath(lastPoints)}
        fill="rgba(232,121,249,0.15)"
        stroke="#e879f9"
        strokeWidth={2}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'circOut' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Labels */}
      {AREAS.map((a, i) => {
        const lp = labelPoint(i);
        return (
          <text key={a.key} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.6)" fontSize={10} fontFamily="Lexend, sans-serif" fontWeight={600}>
            {a.label}
          </text>
        );
      })}

      {/* Legend */}
      <g>
        <rect x={8} y={296} width={10} height={3} rx={1} fill="#e879f9" />
        <text x={22} y={300} fill="rgba(255,255,255,0.5)" fontSize={9} fontFamily="Lexend, sans-serif" dominantBaseline="middle">Último simulado</text>
        <rect x={110} y={296} width={10} height={3} rx={1} fill={ACCENT} opacity={0.7} />
        <text x={124} y={300} fill="rgba(255,255,255,0.5)" fontSize={9} fontFamily="Lexend, sans-serif" dominantBaseline="middle">Média geral</text>
      </g>
    </svg>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────
export default function SimuladosAnalise() {
  const { simulados } = useSimulados();

  const stats = useMemo(() => {
    if (!simulados.length) return null;

    const areaStats = AREAS.map(area => {
      const values = simulados.map(s => s.scores[area.key]);
      const best = Math.max(...values);
      const worst = Math.min(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (simulados.length >= 2) {
        const recent = simulados.slice(0, Math.min(3, simulados.length)).reduce((a, s) => a + s.scores[area.key], 0) / Math.min(3, simulados.length);
        const older = simulados.slice(Math.min(3, simulados.length)).reduce((a, s) => a + s.scores[area.key], 0) / Math.max(1, simulados.length - 3);
        if (simulados.length > 3) {
          trend = recent > older + 5 ? 'up' : recent < older - 5 ? 'down' : 'stable';
        }
      }

      return { ...area, best, worst, avg, trend };
    });

    const avgScores: SimuladoScores = {
      linguagens: areaStats.find(a => a.key === 'linguagens')!.avg,
      humanas: areaStats.find(a => a.key === 'humanas')!.avg,
      natureza: areaStats.find(a => a.key === 'natureza')!.avg,
      matematica: areaStats.find(a => a.key === 'matematica')!.avg,
      redacao: areaStats.find(a => a.key === 'redacao')!.avg,
    };

    const lastScores = simulados[0].scores;

    // Weakest 2 areas
    const sorted = [...areaStats].sort((a, b) => a.avg - b.avg);
    const weakest = sorted.slice(0, 2);

    return { areaStats, avgScores, lastScores, weakest };
  }, [simulados]);

  if (!simulados.length) {
    return (
      <div style={{ padding: 'clamp(1rem, 4vw, 3rem) clamp(1rem, 5vw, 3.5rem) clamp(4rem, 10vw, 8rem)', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `${ACCENT}22`, border: `1px solid ${ACCENT}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT }}>
            <BarChart2 size={20} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>Análise de Simulados</h2>
        </div>
        <div style={{ padding: '5rem 2rem', textAlign: 'center', border: '1px dashed rgba(56,189,248,0.2)', borderRadius: '24px', background: 'rgba(56,189,248,0.03)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 1.25rem', background: `${ACCENT}15`, border: `1px solid ${ACCENT}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT }}>
            <BarChart3 size={28} />
          </div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Nenhum simulado registrado</p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>Adicione simulados na aba "Simulados" para ver a análise aqui.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(1rem, 4vw, 3rem) clamp(1rem, 5vw, 3.5rem) clamp(4rem, 10vw, 8rem)', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `${ACCENT}22`, border: `1px solid ${ACCENT}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT }}>
          <BarChart2 size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>Análise de Simulados</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{simulados.length} simulado{simulados.length !== 1 ? 's' : ''} registrado{simulados.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Weak areas alert */}
      {stats && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {stats.weakest.map(area => (
            <motion.div
              key={area.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '14px', flex: 1, minWidth: '200px' }}
            >
              <AlertTriangle size={16} color="#fbbf24" />
              <div>
                <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fbbf24', margin: 0 }}>Área fraca</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: '2px 0 0' }}>Foque em {area.label} (média: {Math.round(area.avg)})</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Bar chart */}
          <div style={{ background: 'rgba(30,41,59,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.5rem' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: '0 0 1.25rem' }}>Média por área</p>
            {stats && (
              <BarChartSVG
                data={stats.areaStats.map(a => ({ label: a.label, value: a.avg, color: a.color, enem: a.enem }))}
              />
            )}
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '0.75rem', textAlign: 'center' }}>
              Linha tracejada = média nacional ENEM
            </p>
          </div>

          {/* Evolution table */}
          <div style={{ background: 'rgba(30,41,59,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.5rem', overflowX: 'auto' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: '0 0 1.25rem' }}>Tabela de evolução</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Área', 'Melhor', 'Pior', 'Média', 'vs ENEM', 'Tendência'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 12px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats?.areaStats.map(a => {
                  const diff = Math.round(a.avg - a.enem);
                  return (
                    <tr key={a.key}>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{a.label}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 700, color: '#4ade80', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{Math.round(a.best)}</td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 700, color: '#f87171', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{Math.round(a.worst)}</td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 700, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{Math.round(a.avg)}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 700, color: diff >= 0 ? '#4ade80' : '#f87171', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        {diff >= 0 ? '+' : ''}{diff}
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <Trend val={a.trend} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: radar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>
          <div style={{ background: 'rgba(30,41,59,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.5rem' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: '0 0 1rem' }}>Último vs Média</p>
            {stats && <RadarChartSVG last={stats.lastScores} avg={stats.avgScores} />}
          </div>

          {/* ENEM comparison */}
          <div style={{ background: 'rgba(30,41,59,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.5rem' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: '0 0 1rem' }}>Comparação com ENEM</p>
            {stats?.areaStats.map(a => {
              const pct = Math.min(100, Math.round((a.avg / a.enem) * 100));
              return (
                <div key={a.key} style={{ marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: a.color }}>{a.label}</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{Math.round(a.avg)} / {a.enem}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
                    <motion.div
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'circOut' }}
                      style={{ height: '100%', background: a.color, borderRadius: '99px' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
