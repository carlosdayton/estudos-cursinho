import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Mode = 'login' | 'signup' | 'reset';

const ACCENT = '#818cf8';

// ─── Input field ──────────────────────────────────────────────────────────────
interface InputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon: React.ReactNode;
  error?: string;
  autoComplete?: string;
  rightElement?: React.ReactNode;
}

function Field({ id, label, type, value, onChange, placeholder, icon, error, autoComplete, rightElement }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label htmlFor={id} style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: error ? '#f87171' : 'rgba(255,255,255,0.3)', pointerEvents: 'none', display: 'flex' }}>
          {icon}
        </div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{
            width: '100%',
            background: error ? 'rgba(248,113,113,0.06)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${error ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '14px',
            padding: '0.875rem 1rem 0.875rem 2.75rem',
            paddingRight: rightElement ? '3rem' : '1rem',
            color: '#fff',
            fontSize: '14px',
            fontFamily: 'Lexend, sans-serif',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s, background 0.2s',
          }}
          onFocus={e => {
            if (!error) {
              e.target.style.borderColor = `${ACCENT}88`;
              e.target.style.background = 'rgba(129,140,248,0.06)';
            }
          }}
          onBlur={e => {
            if (!error) {
              e.target.style.borderColor = 'rgba(255,255,255,0.1)';
              e.target.style.background = 'rgba(255,255,255,0.05)';
            }
          }}
        />
        {rightElement && (
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <AlertCircle size={11} color="#f87171" />
          <span style={{ fontSize: '11px', color: '#f87171', fontWeight: 600 }}>{error}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function AuthScreen() {
  const { signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearState = () => {
    setGlobalError('');
    setSuccessMsg('');
    setFieldErrors({});
  };

  const switchMode = (m: Mode) => {
    clearState();
    setPassword('');
    setConfirmPassword('');
    setMode(m);
  };

  // ─── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!email.trim()) errs.email = 'Email obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email inválido';

    if (mode !== 'reset') {
      if (!password) errs.password = 'Senha obrigatória';
      else if (mode === 'signup' && password.length < 8) errs.password = 'Mínimo 8 caracteres';
    }

    if (mode === 'signup') {
      if (!confirmPassword) errs.confirmPassword = 'Confirme a senha';
      else if (password !== confirmPassword) errs.confirmPassword = 'As senhas não coincidem';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearState();
    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setGlobalError(translateError(error.message));
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) setGlobalError(translateError(error.message));
        else setSuccessMsg('Conta criada! Verifique seu email para confirmar o cadastro.');
      } else {
        const { error } = await resetPassword(email);
        if (error) setGlobalError(translateError(error.message));
        else setSuccessMsg('Email de recuperação enviado! Verifique sua caixa de entrada.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Translate Supabase errors to PT-BR ──────────────────────────────────────
  const translateError = (msg: string): string => {
    if (msg.includes('Invalid login credentials')) return 'Email ou senha incorretos.';
    if (msg.includes('Email not confirmed')) return 'Confirme seu email antes de entrar.';
    if (msg.includes('User already registered')) return 'Este email já está cadastrado.';
    if (msg.includes('Password should be at least')) return 'A senha deve ter pelo menos 8 caracteres.';
    if (msg.includes('rate limit')) return 'Muitas tentativas. Aguarde alguns minutos.';
    if (msg.includes('network')) return 'Erro de conexão. Verifique sua internet.';
    return 'Ocorreu um erro. Tente novamente.';
  };

  const titles: Record<Mode, string> = {
    login: 'Entrar na sua conta',
    signup: 'Criar conta',
    reset: 'Recuperar senha',
  };

  const subtitles: Record<Mode, string> = {
    login: 'Bem-vindo de volta! Continue seus estudos.',
    signup: 'Comece sua jornada rumo à aprovação.',
    reset: 'Enviaremos um link para redefinir sua senha.',
  };

  const btnLabels: Record<Mode, string> = {
    login: 'Entrar',
    signup: 'Criar conta',
    reset: 'Enviar link',
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-dark)',
      backgroundImage: 'var(--bg-gradient)',
      backgroundAttachment: 'fixed',
      padding: '1rem',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow blobs */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          style={{
            width: '100%',
            maxWidth: '420px',
            background: 'rgba(10,15,30,0.85)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '28px',
            padding: '2.5rem',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top shimmer */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${ACCENT}88, transparent)` }} />

          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{
              width: '64px', height: '64px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              borderRadius: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 40px rgba(99,102,241,0.4)',
              transform: 'rotate(6deg)',
            }}>
              <GraduationCap size={30} strokeWidth={2.5} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>
                Foco ENEM
              </h1>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontWeight: 500 }}>
                {subtitles[mode]}
              </p>
            </div>
          </div>

          {/* Title */}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: '0 0 1.5rem', letterSpacing: '-0.01em' }}>
            {titles[mode]}
          </h2>

          {/* Success message */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '0.875rem 1rem', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: '14px', marginBottom: '1.25rem' }}
              >
                <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '13px', color: '#34d399', margin: 0, lineHeight: 1.5, fontWeight: 600 }}>{successMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Global error */}
          <AnimatePresence>
            {globalError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '0.875rem 1rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '14px', marginBottom: '1.25rem' }}
              >
                <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '13px', color: '#f87171', margin: 0, lineHeight: 1.5, fontWeight: 600 }}>{globalError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field
              id="auth-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="seu@email.com"
              icon={<Mail size={16} />}
              error={fieldErrors.email}
              autoComplete="email"
            />

            {mode !== 'reset' && (
              <Field
                id="auth-password"
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                placeholder={mode === 'signup' ? 'Mínimo 8 caracteres' : '••••••••'}
                icon={<Lock size={16} />}
                error={fieldErrors.password}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', padding: '4px' }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
            )}

            {mode === 'signup' && (
              <Field
                id="auth-confirm"
                label="Confirmar senha"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Repita a senha"
                icon={<Lock size={16} />}
                error={fieldErrors.confirmPassword}
                autoComplete="new-password"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirm(s => !s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', padding: '4px' }}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
            )}

            {/* Forgot password link */}
            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginTop: '-4px' }}>
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600, fontFamily: 'Lexend, sans-serif', padding: 0 }}
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '0.9rem',
                borderRadius: '14px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? 'rgba(129,140,248,0.4)' : `linear-gradient(135deg, ${ACCENT}, #a855f7)`,
                color: '#fff',
                fontSize: '14px',
                fontWeight: 800,
                fontFamily: 'Lexend, sans-serif',
                letterSpacing: '0.03em',
                boxShadow: loading ? 'none' : '0 4px 24px rgba(129,140,248,0.4)',
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
                    style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                  />
                  Aguarde...
                </>
              ) : (
                <>
                  {mode === 'reset' ? <RotateCcw size={16} /> : <Sparkles size={16} />}
                  {btnLabels[mode]}
                  {mode !== 'reset' && <ArrowRight size={16} />}
                </>
              )}
            </button>
          </form>

          {/* Mode switcher */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
            {mode === 'login' && (
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                Não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: ACCENT, fontWeight: 700, fontSize: '13px', fontFamily: 'Lexend, sans-serif', padding: 0 }}
                >
                  Criar conta grátis
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: ACCENT, fontWeight: 700, fontSize: '13px', fontFamily: 'Lexend, sans-serif', padding: 0 }}
                >
                  Entrar
                </button>
              </p>
            )}
            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontFamily: 'Lexend, sans-serif', padding: 0, display: 'flex', alignItems: 'center', gap: '5px', margin: '0 auto' }}
              >
                ← Voltar para o login
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
