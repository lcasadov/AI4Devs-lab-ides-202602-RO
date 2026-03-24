import React, { useState } from 'react';
import { authService } from '../services/auth.service';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordPolicy {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  passwordsMatch: boolean;
}

function evaluatePolicy(newPassword: string, confirmPassword: string): PasswordPolicy {
  return {
    minLength: newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasLowercase: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
    passwordsMatch: newPassword.length > 0 && newPassword === confirmPassword,
  };
}

const ff = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const inputBase: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  border: '1.5px solid #e2e8f0', borderRadius: '10px',
  padding: '11px 14px', fontSize: '14px', color: '#1e293b',
  background: '#fff', outline: 'none',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

function focusIn(e: React.FocusEvent<HTMLInputElement>): void {
  e.target.style.borderColor = '#3b82f6';
  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
}
function focusOut(e: React.FocusEvent<HTMLInputElement>): void {
  e.target.style.borderColor = '#e2e8f0';
  e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
}

function PolicyItem({ met, label }: { met: boolean; label: string }): JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: met ? '#16a34a' : '#94a3b8' }}>
      <span style={{ fontWeight: 700, fontSize: '13px', lineHeight: 1 }}>{met ? '✓' : '○'}</span>
      <span>{label}</span>
    </div>
  );
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps): JSX.Element | null {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const policy = evaluatePolicy(newPassword, confirmPassword);
  const allPoliciesMet = Object.values(policy).every(Boolean);

  function resetForm(): void {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess(false);
  }

  function handleClose(): void {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!allPoliciesMet) return;
    setError('');
    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword, confirmPassword);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: '16px',
      fontFamily: ff,
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        width: '100%', maxWidth: '440px',
        padding: '32px',
        position: 'relative',
      }}>
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '20px', color: '#94a3b8', lineHeight: 1,
            padding: '4px',
          }}
          aria-label="Cerrar"
          onMouseEnter={(e) => { e.currentTarget.style.color = '#475569'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
        >
          ×
        </button>

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '4px', letterSpacing: '-0.3px' }}>
            Cambiar contraseña
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Tu nueva contraseña debe cumplir todos los requisitos.
          </p>
        </div>

        {success ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div role="status" style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: '10px', padding: '14px 16px',
              fontSize: '14px', color: '#15803d',
              display: 'flex', gap: '10px', alignItems: 'center',
            }}>
              <span style={{ fontSize: '18px' }}>✅</span>
              Contraseña cambiada correctamente.
            </div>
            <button
              type="button"
              onClick={handleClose}
              style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                color: '#fff', fontWeight: 700, fontSize: '14px',
                border: 'none', borderRadius: '10px', padding: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
              }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { void handleSubmit(e); }} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="currentPassword" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                Contraseña actual
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={inputBase}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="newPassword" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                style={inputBase}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="confirmPassword" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                Confirmar nueva contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                style={inputBase}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </div>

            {newPassword.length > 0 && (
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: '10px', padding: '14px 16px',
                display: 'flex', flexDirection: 'column', gap: '7px',
              }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Requisitos
                </p>
                <PolicyItem met={policy.minLength} label="Mínimo 8 caracteres" />
                <PolicyItem met={policy.hasUppercase} label="Al menos una mayúscula" />
                <PolicyItem met={policy.hasLowercase} label="Al menos una minúscula" />
                <PolicyItem met={policy.hasNumber} label="Al menos un número" />
                <PolicyItem met={policy.hasSpecial} label="Al menos un carácter especial" />
                <PolicyItem met={policy.passwordsMatch} label="Las contraseñas coinciden" />
              </div>
            )}

            {error && (
              <div role="alert" style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
                padding: '12px 14px', fontSize: '13px', color: '#dc2626',
                display: 'flex', gap: '8px', alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '15px', lineHeight: 1.2 }}>⚠️</span>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
              <button
                type="submit"
                disabled={loading || !allPoliciesMet || !currentPassword}
                style={{
                  flex: 1,
                  background: (loading || !allPoliciesMet || !currentPassword) ? '#93c5fd' : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                  color: '#fff', fontWeight: 700, fontSize: '14px',
                  border: 'none', borderRadius: '10px', padding: '12px',
                  cursor: (loading || !allPoliciesMet || !currentPassword) ? 'not-allowed' : 'pointer',
                  boxShadow: (loading || !allPoliciesMet || !currentPassword) ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
                }}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  flex: 1, background: '#fff', color: '#374151',
                  fontWeight: 600, fontSize: '14px',
                  border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '12px',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
