import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChangePasswordModal } from './ChangePasswordModal';

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
      <header className="h-14 bg-blue-600 text-white flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-40 shadow">
        <h1 className="text-lg font-bold">LTI — Gestión de Candidatos</h1>

        {user && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="w-9 h-9 rounded-full bg-white text-blue-600 font-bold flex items-center justify-center text-sm hover:bg-blue-50 transition-colors focus:outline-none"
              aria-label="Menú de usuario"
              aria-expanded={dropdownOpen}
            >
              {initials}
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                    {user.firstName} {user.lastName}
                  </div>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cambiar contraseña
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cerrar sesión
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
