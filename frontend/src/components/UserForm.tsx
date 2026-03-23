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
      const message = err instanceof Error ? err.message : 'Error al guardar el usuario';
      setError(message);
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
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="userLogin">
            Usuario *
          </label>
          <input
            id="userLogin"
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="firstName">
            Nombre *
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="lastName">
            Apellidos *
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="userEmail">
            Email *
          </label>
          <input
            id="userEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="userRole">
            Rol *
          </label>
          <select
            id="userRole"
            value={role}
            onChange={(e) => setRole(e.target.value as 'ADMIN' | 'RECRUITER')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="RECRUITER">Recruiter</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {isEdit && (
          <div className="flex items-center gap-2">
            <input
              id="userActive"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700" htmlFor="userActive">
              Usuario activo
            </label>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        {isEdit && (
          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => { void handleResetPassword(); }}
              className="text-sm text-orange-600 hover:text-orange-800 underline"
            >
              Resetear contraseña
            </button>
            {resetMessage && (
              <p className="mt-2 text-sm text-gray-600">{resetMessage}</p>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-end mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="border border-gray-300 text-gray-700 font-semibold rounded-lg py-2 px-4 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white font-semibold rounded-lg py-2 px-4 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
