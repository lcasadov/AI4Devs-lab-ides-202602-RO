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
      setError('Los datos introducidos no son correctos. No tienes acceso.');
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
      // Intentionally swallow error for security reasons
    } finally {
      setForgotMessage('Si el usuario existe, recibirás una nueva contraseña en tu correo electrónico');
      setForgotLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">LTI</h1>
        <p className="text-gray-500 text-center mb-8">Gestión de Candidatos</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="login">
              Usuario
            </label>
            <input
              id="login"
              type="text"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Introduce tu usuario"
              autoComplete="username"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Introduce tu contraseña"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          {forgotMessage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700" role="status">
              {forgotMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white font-semibold rounded-lg py-2 px-4 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Accediendo...' : 'Acceder'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => { void handleForgotPassword(); }}
            disabled={forgotLoading}
            className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {forgotLoading ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
          </button>
        </div>
      </div>
    </div>
  );
}
