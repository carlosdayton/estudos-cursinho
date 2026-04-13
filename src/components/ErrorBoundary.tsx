import { Component, type ErrorInfo } from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary] Erro capturado:', error, info.componentStack)
  }

  handleReload = (): void => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    if (this.props.fallback) {
      return this.props.fallback
    }

    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem',
          gap: '1rem',
          background: 'rgba(30, 41, 59, 0.4)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '24px',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '2.5rem' }}>⚠️</span>
        <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '1.125rem' }}>
          Algo deu errado neste componente.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
          {this.state.error?.message ?? 'Erro desconhecido'}
        </p>
        <button
          onClick={this.handleReload}
          className="btn btn-primary"
          style={{ marginTop: '0.5rem' }}
        >
          Recarregar
        </button>
      </div>
    )
  }
}

export default ErrorBoundary
