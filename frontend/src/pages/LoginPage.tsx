import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';

export function LoginPage(): JSX.Element {
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError('');
    setForgotMessage('');
    setLoading(true);
    try {
      await login({ login: loginValue, password });
      navigate('/dashboard');
    } catch {
      setError('Usuario o contraseña incorrectos. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(): Promise<void> {
    if (!loginValue) {
      setError('Introduce tu usuario para recuperar la contraseña');
      return;
    }
    setError('');
    setForgotLoading(true);
    try {
      await authService.forgotPassword(loginValue);
    } catch {
      // silenced for security
    } finally {
      setForgotMessage('Si el usuario existe, recibirás una nueva contraseña en tu correo electrónico.');
      setForgotLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* ── Left panel: branding ── */}
      <div
        style={{
          flex: '0 0 52%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          background: 'linear-gradient(160deg, #0f1f3d 0%, #1a3566 45%, #1e4db7 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="hidden lg:flex"
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-120px', right: '-120px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'rgba(59,130,246,0.12)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '380px', height: '380px', borderRadius: '50%',
          background: 'rgba(96,165,250,0.10)', pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '20px', color: '#fff', letterSpacing: '-1px',
          }}>
            L
          </div>
          <span style={{ fontWeight: 700, fontSize: '18px', color: '#fff', letterSpacing: '0.3px' }}>
            LTI ATS
          </span>
        </div>

        {/* Hero text */}
        <div style={{ position: 'relative' }}>
          <p style={{
            fontSize: '13px', fontWeight: 600, letterSpacing: '2px',
            color: '#93c5fd', textTransform: 'uppercase', marginBottom: '20px',
          }}>
            Applicant Tracking System
          </p>
          <h2 style={{
            fontSize: '42px', fontWeight: 800, lineHeight: 1.15,
            color: '#fff', marginBottom: '20px', letterSpacing: '-0.5px',
          }}>
            Gestiona el talento<br />
            <span style={{ color: '#60a5fa' }}>desde un solo lugar.</span>
          </h2>
          <p style={{ fontSize: '16px', color: '#bfdbfe', lineHeight: 1.7, maxWidth: '380px', marginBottom: '48px' }}>
            Centraliza candidatos, equipos y procesos de selección. Toma decisiones de contratación más rápidas y con más contexto.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { icon: '👥', title: 'Gestión de candidatos', desc: 'Perfil completo con CV adjunto y seguimiento' },
              { icon: '📊', title: 'Dashboard en tiempo real', desc: 'Métricas por puesto, provincia y municipio' },
              { icon: '📤', title: 'Exportación a Excel', desc: 'Descarga filtrada con un solo clic' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                background: 'rgba(255,255,255,0.07)', borderRadius: '12px',
                padding: '14px 18px', backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <span style={{ fontSize: '22px', lineHeight: 1 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{title}</div>
                  <div style={{ fontSize: '12px', color: '#93c5fd' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ fontSize: '12px', color: '#6b9fd4', position: 'relative' }}>
          © 2026 LTI · Applicant Tracking System · Todos los derechos reservados
        </p>
      </div>

      {/* ── Right panel: form ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        padding: '32px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '9px',
              background: '#1a3566', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 800, fontSize: '18px', color: '#fff',
            }}>L</div>
            <span style={{ fontWeight: 700, fontSize: '17px', color: '#111827' }}>LTI ATS</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '36px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Bienvenido
            </h1>
            <p style={{ fontSize: '15px', color: '#64748b' }}>
              Accede con tus credenciales para continuar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="login" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                Usuario
              </label>
              <input
                id="login"
                type="text"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                placeholder="Introduce tu usuario"
                autoComplete="username"
                autoFocus
                required
                style={{
                  border: '1.5px solid #e2e8f0', borderRadius: '10px',
                  padding: '11px 14px', fontSize: '14px', color: '#1e293b',
                  background: '#fff', outline: 'none', transition: 'border-color 0.15s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'; }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="password" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduce tu contraseña"
                autoComplete="current-password"
                required
                style={{
                  border: '1.5px solid #e2e8f0', borderRadius: '10px',
                  padding: '11px 14px', fontSize: '14px', color: '#1e293b',
                  background: '#fff', outline: 'none', transition: 'border-color 0.15s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'; }}
              />
            </div>

            {error && (
              <div role="alert" style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '10px', padding: '12px 14px',
                fontSize: '13px', color: '#dc2626', display: 'flex', gap: '8px', alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '15px', lineHeight: 1.2 }}>⚠️</span>
                {error}
              </div>
            )}

            {forgotMessage && (
              <div role="status" style={{
                background: '#eff6ff', border: '1px solid #bfdbfe',
                borderRadius: '10px', padding: '12px 14px',
                fontSize: '13px', color: '#1d4ed8', display: 'flex', gap: '8px', alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '15px', lineHeight: 1.2 }}>✉️</span>
                {forgotMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                color: '#fff', fontWeight: 700, fontSize: '15px',
                border: 'none', borderRadius: '10px', padding: '13px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s, transform 0.1s',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(37,99,235,0.4)',
                letterSpacing: '0.2px',
              }}
              onMouseEnter={(e) => { if (!loading) (e.target as HTMLButtonElement).style.opacity = '0.92'; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.opacity = '1'; }}
            >
              {loading ? 'Verificando...' : 'Acceder al sistema →'}
            </button>
          </form>

          {/* Forgot password */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => { void handleForgotPassword(); }}
              disabled={forgotLoading}
              style={{
                background: 'none', border: 'none', cursor: forgotLoading ? 'not-allowed' : 'pointer',
                fontSize: '13px', color: '#6b7280', textDecoration: 'underline',
                textDecorationColor: 'transparent', transition: 'color 0.15s',
                opacity: forgotLoading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.color = '#2563eb'; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.color = '#6b7280'; }}
            >
              {forgotLoading ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
            </button>
          </div>

          {/* Divider */}
          <div style={{
            marginTop: '40px', paddingTop: '28px',
            borderTop: '1px solid #e2e8f0', textAlign: 'center',
          }}>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              Acceso restringido · Solo personal autorizado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
