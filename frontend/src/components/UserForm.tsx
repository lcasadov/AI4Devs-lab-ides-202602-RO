import React, { useEffect, useState } from 'react';
import { CreateUserRequest, UpdateUserRequest, User } from '../types/user.types';

interface UserFormProps {
  user?: User;
  onSave: () => void;
  onCancel: () => void;
  onCreate: (dto: CreateUserRequest) => Promise<void>;
  onUpdate: (id: number, dto: UpdateUserRequest) => Promise<void>;
  onResetPassword: (id: number) => Promise<void>;
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

function focusIn(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>): void {
  e.target.style.borderColor = '#3b82f6';
  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
}
function focusOut(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>): void {
  e.target.style.borderColor = '#e2e8f0';
  e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
}

export function UserForm({
  user,
  onSave,
  onCancel,
  onCreate,
  onUpdate,
  onResetPassword,
}: UserFormProps): JSX.Element {
  const isEdit = user !== undefined;

  const [login, setLogin] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'RECRUITER'>('RECRUITER');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    if (user) {
      setLogin(user.login);
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setRole(user.role);
      setActive(user.active);
    }
  }, [user]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        onCancel();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit && user) {
        const dto: UpdateUserRequest = { login, firstName, lastName, email, role, active };
        await onUpdate(user.id, dto);
      } else {
        const dto: CreateUserRequest = { login, firstName, lastName, email, role };
        await onCreate(dto);
      }
      onSave();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el usuario');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(): Promise<void> {
    if (!user) return;
    setResetMessage('');
    try {
      await onResetPassword(user.id);
      setResetMessage('Se ha enviado una nueva contraseña al correo del usuario.');
    } catch {
      setResetMessage('Error al resetear la contraseña.');
    }
  }

  return (
    <div style={{ fontFamily: ff }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '4px', letterSpacing: '-0.3px' }}>
          {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          {isEdit ? 'Modifica los datos del usuario.' : 'Completa los datos del nuevo usuario. Se enviará la contraseña por email.'}
        </p>
      </div>

      <form onSubmit={(e) => { void handleSubmit(e); }} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Grid: login + nombre */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="userLogin" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              Usuario <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="userLogin"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              style={inputBase}
              onFocus={focusIn}
              onBlur={focusOut}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="userRole" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              Rol <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              id="userRole"
              value={role}
              onChange={(e) => setRole(e.target.value as 'ADMIN' | 'RECRUITER')}
              required
              style={{ ...inputBase, cursor: 'pointer' }}
              onFocus={focusIn}
              onBlur={focusOut}
            >
              <option value="RECRUITER">Recruiter</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        {/* Grid: nombre + apellidos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="firstName" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              Nombre <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              style={inputBase}
              onFocus={focusIn}
              onBlur={focusOut}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="lastName" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              Apellidos <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              style={inputBase}
              onFocus={focusIn}
              onBlur={focusOut}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="userEmail" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
            Email <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="userEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputBase}
            onFocus={focusIn}
            onBlur={focusOut}
          />
        </div>

        {isEdit && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              id="userActive"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Usuario activo</span>
          </label>
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

        {/* Reset password section */}
        {isEdit && (
          <div style={{
            borderTop: '1px solid #f1f5f9', paddingTop: '16px',
            display: 'flex', flexDirection: 'column', gap: '8px',
          }}>
            <button
              type="button"
              onClick={() => { void handleResetPassword(); }}
              style={{
                alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0,
                fontSize: '13px', color: '#d97706', fontWeight: 600, cursor: 'pointer',
                textDecoration: 'underline', textDecorationColor: 'transparent',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#b45309'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#d97706'; }}
            >
              Resetear contraseña →
            </button>
            {resetMessage && (
              <p style={{ fontSize: '13px', color: '#64748b' }}>{resetMessage}</p>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
              color: '#fff', fontWeight: 700, fontSize: '14px',
              border: 'none', borderRadius: '10px', padding: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
            }}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={onCancel}
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
    </div>
  );
}
