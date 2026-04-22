import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, AlertCircle, Clock, Home } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type PaymentStatus = 'approved' | 'pending' | 'failed';

export default function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>('approved');

  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam === 'pending') {
      setStatus('pending');
    } else if (statusParam === 'failed') {
      setStatus('failed');
    } else {
      setStatus('approved');
    }
  }, [searchParams]);

  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          iconColor: '#10b981',
          title: 'Pagamento Confirmado!',
          message: 'Seu pagamento foi processado com sucesso.',
          instruction: 'Verifique seu email para acessar a plataforma. Enviamos um link mágico para você fazer login.',
          showEmailIcon: true
        };
      case 'pending':
        return {
          icon: Clock,
          iconColor: '#f59e0b',
          title: 'Pagamento Pendente',
          message: 'Seu pagamento está sendo processado.',
          instruction: 'Assim que confirmarmos o pagamento, você receberá um email com as instruções de acesso.',
          showEmailIcon: true
        };
      case 'failed':
        return {
          icon: AlertCircle,
          iconColor: '#ef4444',
          title: 'Pagamento Não Processado',
          message: 'Não foi possível processar seu pagamento.',
          instruction: 'Por favor, tente novamente ou entre em contato com o suporte.',
          showEmailIcon: false
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'var(--bg-dark)',
      backgroundImage: 'var(--bg-gradient)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '600px',
          background: 'rgba(30,41,59,0.5)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '32px',
          padding: 'clamp(2rem, 5vw, 3rem)',
          textAlign: 'center',
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
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${config.iconColor}, transparent)`
        }} />

        {/* Status Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{
            width: '96px',
            height: '96px',
            background: `${config.iconColor}22`,
            border: `2px solid ${config.iconColor}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: config.iconColor,
            margin: '0 auto 2rem',
            boxShadow: `0 0 40px ${config.iconColor}44`
          }}
        >
          <StatusIcon size={48} strokeWidth={2.5} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
            fontWeight: 900,
            color: '#fff',
            marginBottom: '1rem',
            letterSpacing: '-0.02em'
          }}
        >
          {config.title}
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            fontSize: '1.125rem',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '2rem',
            lineHeight: 1.6
          }}
        >
          {config.message}
        </motion.p>

        {/* Instruction box */}
        {config.showEmailIcon && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{
              background: 'rgba(129,140,248,0.1)',
              border: '1px solid rgba(129,140,248,0.3)',
              borderRadius: '20px',
              padding: '1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              textAlign: 'left'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(129,140,248,0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
              flexShrink: 0
            }}>
              <Mail size={24} />
            </div>
            <p style={{
              fontSize: '0.95rem',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.6,
              margin: 0
            }}>
              {config.instruction}
            </p>
          </motion.div>
        )}

        {!config.showEmailIcon && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '2rem',
              lineHeight: 1.6
            }}
          >
            {config.instruction}
          </motion.p>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1rem',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #818cf8, #6366f1)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 800,
              fontFamily: 'Lexend, sans-serif',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              boxShadow: '0 10px 30px rgba(129,140,248,0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            <Home size={20} />
            Voltar ao Início
          </button>

          {status === 'failed' && (
            <button
              onClick={() => navigate('/checkout')}
              style={{
                padding: '1rem',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1rem',
                fontWeight: 700,
                fontFamily: 'Lexend, sans-serif',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease'
              }}
            >
              Tentar Novamente
            </button>
          )}
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        style={{
          marginTop: '2rem',
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
