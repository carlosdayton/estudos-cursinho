import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Target, 
  Calendar, 
  Brain, 
  BookOpen, 
  TrendingUp,
  Clock,
  Award,
  Zap
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: 'Planejamento Inteligente',
      description: 'Organize seus estudos com ciclos personalizados e cronogramas otimizados para o ENEM'
    },
    {
      icon: Brain,
      title: 'Flashcards e Revisões',
      description: 'Sistema de repetição espaçada para fixar conteúdos e revisar no momento certo'
    },
    {
      icon: Target,
      title: 'Simulados e Análise',
      description: 'Acompanhe sua evolução com simulados completos e análise detalhada de desempenho'
    },
    {
      icon: Clock,
      title: 'Pomodoro Timer',
      description: 'Mantenha o foco com sessões de estudo cronometradas e pausas estratégicas'
    },
    {
      icon: BookOpen,
      title: 'Gestão de Matérias',
      description: 'Organize todas as matérias e tópicos do ENEM em um só lugar'
    },
    {
      icon: TrendingUp,
      title: 'Estatísticas Completas',
      description: 'Visualize seu progresso com gráficos e métricas detalhadas'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'var(--bg-dark)',
      backgroundImage: 'var(--bg-gradient)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem',
      overflow: 'auto'
    }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          maxWidth: '1200px',
          width: '100%',
          textAlign: 'center',
          marginTop: 'clamp(2rem, 8vh, 4rem)',
          marginBottom: 'clamp(3rem, 10vh, 6rem)'
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            width: '96px',
            height: '96px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 60px rgba(99,102,241,0.6)',
            margin: '0 auto 2rem',
            transform: 'rotate(-3deg)'
          }}
        >
          <GraduationCap size={48} strokeWidth={2.5} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            color: '#fff',
            marginBottom: '1.5rem'
          }}
        >
          Foco ENEM
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '3rem',
            maxWidth: '700px',
            margin: '0 auto 3rem',
            lineHeight: 1.6
          }}
        >
          Sua plataforma completa de estudos para conquistar a aprovação no ENEM
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(129,140,248,0.5)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/checkout')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '1.25rem 3rem',
            borderRadius: '16px',
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #818cf8, #6366f1)',
            color: '#fff',
            fontSize: '1.125rem',
            fontWeight: 800,
            fontFamily: 'Lexend, sans-serif',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            boxShadow: '0 10px 30px rgba(129,140,248,0.4)',
            transition: 'all 0.3s ease'
          }}
        >
          <Zap size={24} fill="currentColor" />
          Assinar Agora
        </motion.button>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          style={{
            marginTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.875rem',
            fontWeight: 600
          }}
        >
          <Award size={18} />
          <span>Acesso imediato após o pagamento</span>
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        style={{
          maxWidth: '1200px',
          width: '100%',
          marginBottom: '4rem'
        }}
      >
        <h2 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 900,
          color: '#fff',
          textAlign: 'center',
          marginBottom: '3rem',
          letterSpacing: '-0.02em'
        }}>
          Tudo que você precisa para estudar
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
              whileHover={{ y: -8, borderColor: 'rgba(255,255,255,0.3)' }}
              style={{
                background: 'rgba(30,41,59,0.4)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '24px',
                padding: '2rem',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Top gradient line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
              }} />

              {/* Icon */}
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(129,140,248,0.15)',
                border: '1px solid rgba(129,140,248,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
                marginBottom: '1.5rem'
              }}>
                <feature.icon size={28} strokeWidth={2} />
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#fff',
                marginBottom: '0.75rem',
                letterSpacing: '-0.01em'
              }}>
                {feature.title}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: '0.95rem',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.6
              }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bottom CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        style={{
          maxWidth: '800px',
          width: '100%',
          textAlign: 'center',
          marginBottom: '4rem',
          background: 'rgba(30,41,59,0.5)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(129,140,248,0.3)',
          borderRadius: '32px',
          padding: 'clamp(2rem, 5vw, 4rem)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #818cf8, transparent)'
        }} />

        <h2 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
          fontWeight: 900,
          color: '#fff',
          marginBottom: '1rem',
          letterSpacing: '-0.02em'
        }}>
          Comece sua jornada hoje
        </h2>

        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '2rem',
          lineHeight: 1.6
        }}>
          Junte-se a milhares de estudantes que estão conquistando seus objetivos
        </p>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(129,140,248,0.5)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/checkout')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '1.25rem 3rem',
            borderRadius: '16px',
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #818cf8, #6366f1)',
            color: '#fff',
            fontSize: '1.125rem',
            fontWeight: 800,
            fontFamily: 'Lexend, sans-serif',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            boxShadow: '0 10px 30px rgba(129,140,248,0.4)',
            transition: 'all 0.3s ease'
          }}
        >
          <Zap size={24} fill="currentColor" />
          Começar Agora
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '1200px',
          padding: '2rem 0',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.875rem'
        }}
      >
        <p>© 2024 Foco ENEM. Todos os direitos reservados.</p>
      </motion.footer>
    </div>
  );
}
