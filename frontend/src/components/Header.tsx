import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChangePasswordModal } from './ChangePasswordModal';

const ff = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

export function Header(): JSX.Element {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '';

  function handleLogout(): void {
    setDropdownOpen(false);
    logout();
  }

  function handleChangePassword(): void {
    setDropdownOpen(false);
    setChangePasswordOpen(true);
  }

  return (
    <>
      <header style={{
        height: '56px',
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 40,
        fontFamily: ff,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        {/* Logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Custom SVG logo */}
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="34" height="34" rx="8" fill="url(#logoGrad)" />
            {/* Person silhouette */}
            <circle cx="17" cy="12" r="4.5" fill="white" fillOpacity="0.95" />
            <path d="M8 27c0-5 4-8 9-8s9 3 9 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" strokeOpacity="0.95" />
            {/* Checkmark badge */}
            <circle cx="26" cy="10" r="5" fill="#34d399" />
            <path d="M23.5 10l1.8 1.8 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
          <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', letterSpacing: '-0.3px' }}>
            LTI <span style={{ color: '#2563eb' }}>ATS</span>
          </span>
          <span style={{
            marginLeft: '8px', fontSize: '11px', fontWeight: 600,
            color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            Gestión de Candidatos
          </span>
        </div>

        {/* Avatar */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label="Menú de usuario"
              aria-expanded={dropdownOpen}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                color: '#fff', fontWeight: 700, fontSize: '13px',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
              }}
            >
              {initials}
            </button>

            {dropdownOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                  onClick={() => setDropdownOpen(false)}
                  aria-hidden="true"
                />
                <div style={{
                  position: 'absolute', right: 0, top: '44px',
                  width: '200px',
                  background: '#fff', borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  border: '1px solid #e2e8f0',
                  zIndex: 50,
                  overflow: 'hidden',
                  fontFamily: ff,
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '13px', fontWeight: 600, color: '#374151',
                  }}>
                    {user.firstName} {user.lastName}
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400, marginTop: '2px' }}>
                      {user.role === 'ADMIN' ? 'Administrador' : 'Recruiter'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '10px 16px', fontSize: '13px', color: '#374151',
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                  >
                    🔑 Cambiar contraseña
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '10px 16px', fontSize: '13px', color: '#dc2626',
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      borderTop: '1px solid #f1f5f9',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                  >
                    ← Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </>
  );
}
