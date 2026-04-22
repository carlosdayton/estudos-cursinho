import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CreditCard, Shield, Zap, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Email validation function (sub-task 7.2)
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('Por favor, insira um email válido');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    // Validate email on submit
    if (!email) {
      setEmailError('Email é obrigatório');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Por favor, insira um email válido');
      return;
    }

    setIsLoading(true);

    try {
      // Sub-task 7.4: Create payment preference
      const preference = await createPaymentPreference(email);
      
      // Sub-task 7.7: Redirect to Mercado Pago checkout
      // Use sandbox_init_point for test credentials, init_point for production
      const checkoutUrl = preference.sandbox_init_point || preference.init_point;
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (error) {
      setIsLoading(false);
      setApiError(
        error instanceof Error 
          ? error.message 
          : 'Erro ao processar pagamento. Tente novamente.'
      );
    }
  };

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
      {/* Back button */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        marginBottom: '2rem'
      }}>
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '0.5rem',
            fontFamily: 'Lexend, sans-serif'
          }}
        >
          <ArrowLeft size={18} />
          Voltar
        </motion.button>
      </div>

      {/* Main checkout card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
          background: 'linear-gradient(90deg, transparent, #818cf8, transparent)'
        }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{
              width: '72px',
              height: '72px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 40px rgba(99,102,241,0.5)',
              margin: '0 auto 1.5rem'
            }}
          >
            <CreditCard size={36} strokeWidth={2.5} />
          </motion.div>

          <h1 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
            fontWeight: 900,
            color: '#fff',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em'
          }}>
            Assinar Foco ENEM
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.6
          }}>
            Acesso completo à plataforma de estudos
          </p>
        </div>

        {/* Pricing */}
        <div style={{
          background: 'rgba(129,140,248,0.1)',
          border: '1px solid rgba(129,140,248,0.3)',
          borderRadius: '20px',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(255,255,255,0.5)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '0.5rem'
          }}>
            Assinatura Mensal
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: '0.25rem'
          }}>
            <span style={{
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 700
            }}>
              R$
            </span>
            <span style={{
              fontSize: '3rem',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.02em'
            }}>
              29
            </span>
            <span style={{
              fontSize: '1.5rem',
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 700
            }}>
              ,90
            </span>
            <span style={{
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 600,
              marginLeft: '0.25rem'
            }}>
              /mês
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '0.5rem',
              letterSpacing: '0.02em'
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={20}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.4)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                  if (apiError) setApiError('');
                }}
                onBlur={handleEmailBlur}
                placeholder="seu@email.com"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${emailError ? '#f87171' : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '1rem',
                  fontFamily: 'Lexend, sans-serif',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            {emailError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: '0.875rem',
                  color: '#f87171',
                  marginTop: '0.5rem',
                  fontWeight: 600
                }}
              >
                {emailError}
              </motion.p>
            )}
          </div>

          {/* API Error */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}
            >
              <p style={{
                fontSize: '0.875rem',
                color: '#f87171',
                fontWeight: 600,
                margin: 0
              }}>
                {apiError}
              </p>
            </motion.div>
          )}

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={isLoading || !!emailError}
            whileHover={!isLoading && !emailError ? { scale: 1.02 } : {}}
            whileTap={!isLoading && !emailError ? { scale: 0.98 } : {}}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '1.25rem',
              borderRadius: '16px',
              border: 'none',
              cursor: isLoading || emailError ? 'not-allowed' : 'pointer',
              background: isLoading || emailError 
                ? 'rgba(129,140,248,0.3)' 
                : 'linear-gradient(135deg, #818cf8, #6366f1)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 800,
              fontFamily: 'Lexend, sans-serif',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              boxShadow: isLoading || emailError 
                ? 'none' 
                : '0 10px 30px rgba(129,140,248,0.4)',
              transition: 'all 0.3s ease',
              opacity: isLoading || emailError ? 0.6 : 1
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="spin" />
                Processando...
              </>
            ) : (
              <>
                <Zap size={20} fill="currentColor" />
                Ir para Pagamento
              </>
            )}
          </motion.button>
        </form>

        {/* Trust badges */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.875rem',
            fontWeight: 600
          }}>
            <Shield size={18} />
            <span>Pagamento Seguro</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.875rem',
            fontWeight: 600
          }}>
            <Zap size={18} />
            <span>Acesso Imediato</span>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '600px',
          padding: '2rem 0',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.875rem'
        }}
      >
        <p>Processado com segurança pelo Mercado Pago</p>
      </motion.footer>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Sub-task 7.4: Payment preference creation function
async function createPaymentPreference(email: string) {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  
  if (!SUPABASE_URL) {
    throw new Error('Configuração não encontrada. Entre em contato com o suporte.');
  }

  try {
    // Call Supabase Edge Function to create payment preference securely
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-preference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Create preference error:', errorData);
      
      // User-friendly error messages
      if (response.status === 400) {
        throw new Error('Email inválido. Por favor, verifique e tente novamente.');
      } else if (response.status === 500) {
        throw new Error('Erro no servidor. Tente novamente em alguns instantes.');
      } else {
        throw new Error('Erro ao processar pagamento. Tente novamente.');
      }
    }

    const preference = await response.json();
    
    // Validate response has init_point
    if (!preference.init_point && !preference.sandbox_init_point) {
      throw new Error('Resposta inválida do servidor. Tente novamente.');
    }
    
    return preference;
  } catch (error) {
    console.error('Error creating payment preference:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Erro ao processar pagamento. Verifique sua conexão e tente novamente.');
  }
}
