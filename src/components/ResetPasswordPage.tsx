import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GraduationCap, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

const ACCENT = '#818cf8';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    // Verificar se há um token de recuperação na URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (type === 'recovery' && accessToken) {
      setValidToken(true);
    } else {
      setError('Link inválido ou expirado. Solicite um novo link de recuperação.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação
    if (!password) {
      setError('Senha é obrigatória');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  if (!validToken && !error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-dark)',
        backgroundImage: 'var(--bg-gradient)',
      }}>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 600 }}
        >
          Verificando link...
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-dark)',
        backgroundImage: 'var(--bg-gradient)',
        padding: '2rem',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            maxWidth: '420px',
            width: '100%',
            background: 'rgba(10,15,30,0.85)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(52,211,153,0.3)',
            borderRadius: '28px',
            padding: '3rem 2.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(52,211,153,0.2)',
            border: '2px solid #34d399',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <CheckCircle2 size={32} color="#34d399" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>
            Senha Redefinida!
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
            Sua senha foi atualizada com sucesso. Você será redirecionado para fazer login...
          </p>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '24px',
              height: '24px',
              border: '3px solid rgba(52,211,153,0.3)',
              borderTopColor: '#34d399',
              borderRadius: '50%',
              margin: '0 auto',
            }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-dark)',
      backgroundImage: 'var(--bg-gradient)',
      padding: '2rem',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          maxWidth: '420px',
          width: '100%',
          background: 'rgba(10,15,30,0.85)',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '28px',
          padding: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top shimmer */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${ACCENT}88, transparent)`,
        }} />

        {/* Logo */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 40px rgba(99,102,241,0.4)',
            transform: 'rotate(6deg)',
          }}>
            <GraduationCap size={30} strokeWidth={2.5} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.03em',
              margin: 0,
            }}>
              Foco ENEM
            </h1>
            <p style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.4)',
              marginTop: '4px',
              fontWeight: 500,
            }}>
              Redefinir sua senha
            </p>
          </div>
        </div>

        <h2 style={{
          fontSize: '1.1rem',
          fontWeight: 800,
          color: '#fff',
          margin: '0 0 1.5rem',
          letterSpacing: '-0.01em',
        }}>
          Nova Senha
        </h2>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '0.875rem 1rem',
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.25)',
              borderRadius: '14px',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: '1px' }} />
            <p style={{
              fontSize: '13px',
              color: '#f87171',
              margin: 0,
              lineHeight: 1.5,
              fontWeight: 600,
            }}>
              {error}
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Password field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.5)',
            }}>
              Nova Senha
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.3)',
                pointerEvents: 'none',
                display: 'flex',
              }}>
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  padding: '0.875rem 3rem 0.875rem 2.75rem',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'Lexend, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.3)',
                  display: 'flex',
                  padding: '4px',
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm password field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.5)',
            }}>
              Confirmar Senha
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.3)',
                pointerEvents: 'none',
                display: 'flex',
              }}>
                <Lock size={16} />
              </div>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  padding: '0.875rem 3rem 0.875rem 2.75rem',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'Lexend, sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.3)',
                  display: 'flex',
                  padding: '4px',
                }}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !validToken}
            style={{
              marginTop: '0.5rem',
              width: '100%',
              padding: '0.9rem',
              borderRadius: '14px',
              border: 'none',
              cursor: loading || !validToken ? 'not-allowed' : 'pointer',
              background: loading || !validToken ? 'rgba(129,140,248,0.4)' : `linear-gradient(135deg, ${ACCENT}, #a855f7)`,
              color: '#fff',
              fontSize: '14px',
              fontWeight: 800,
              fontFamily: 'Lexend, sans-serif',
              letterSpacing: '0.03em',
              boxShadow: loading || !validToken ? 'none' : '0 4px 24px rgba(129,140,248,0.4)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                  }}
                />
                Aguarde...
              </>
            ) : (
              'Redefinir Senha'
            )}
          </button>
        </form>

        {/* Back to login */}
        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          textAlign: 'center',
        }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '13px',
              fontFamily: 'Lexend, sans-serif',
              padding: 0,
            }}
          >
            ← Voltar para o login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
