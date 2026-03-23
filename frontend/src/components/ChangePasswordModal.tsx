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
      const message = err instanceof Error ? err.message : 'Error al cambiar la contraseña';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  function PolicyItem({ met, label }: { met: boolean; label: string }): JSX.Element {
    return (
      <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>
        <span className="font-bold">{met ? '✓' : '✗'}</span>
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Cambiar contraseña</h2>

        {success ? (
          <div className="flex flex-col gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700" role="status">
              Contraseña cambiada correctamente.
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="bg-blue-600 text-white font-semibold rounded-lg py-2 px-4 hover:bg-blue-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700" htmlFor="currentPassword">
                Contraseña actual
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700" htmlFor="newPassword">
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700" htmlFor="confirmPassword">
                Confirmar nueva contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {newPassword.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-1">
                <PolicyItem met={policy.minLength} label="Mínimo 8 caracteres" />
                <PolicyItem met={policy.hasUppercase} label="Al menos una mayúscula" />
                <PolicyItem met={policy.hasLowercase} label="Al menos una minúscula" />
                <PolicyItem met={policy.hasNumber} label="Al menos un número" />
                <PolicyItem met={policy.hasSpecial} label="Al menos un carácter especial" />
                <PolicyItem met={policy.passwordsMatch} label="Las contraseñas coinciden" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end mt-2">
              <button
                type="button"
                onClick={handleClose}
                className="border border-gray-300 text-gray-700 font-semibold rounded-lg py-2 px-4 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !allPoliciesMet || !currentPassword}
                className="bg-blue-600 text-white font-semibold rounded-lg py-2 px-4 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
