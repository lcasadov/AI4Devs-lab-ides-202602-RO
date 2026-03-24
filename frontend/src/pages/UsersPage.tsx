import React, { useEffect, useState } from 'react';
import { UserForm } from '../components/UserForm';
import { useUsers } from '../hooks/useUsers';
import { User, UserFilters } from '../types/user.types';
import { exportToExcel } from '../utils/exportExcel';

export function UsersPage(): JSX.Element {
  const {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    setFilters,
  } = useUsers();

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [filterValues, setFilterValues] = useState<UserFilters>({});

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterChange(field: keyof UserFilters, value: string): void {
    const updated = { ...filterValues, [field]: value || undefined };
    setFilterValues(updated);
    setFilters(updated);
    void loadUsers();
  }

  function handleExportExcel(): void {
    const rows = users.map((u) => ({
      login: u.login,
      nombre: u.firstName,
      apellidos: u.lastName,
      email: u.email,
      rol: u.role === 'ADMIN' ? 'Admin' : 'Recruiter',
    }));
    exportToExcel(rows, [
      { header: 'Login', key: 'login' },
      { header: 'Nombre', key: 'nombre' },
      { header: 'Apellidos', key: 'apellidos' },
      { header: 'Email', key: 'email' },
      { header: 'Rol', key: 'rol' },
    ], 'usuarios');
  }

  function handleNewUser(): void {
    setEditingUser(undefined);
    setShowForm(true);
  }

  function handleEditUser(user: User): void {
    setEditingUser(user);
    setShowForm(true);
  }

  async function handleDeleteUser(user: User): Promise<void> {
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar al usuario "${user.login}"?`,
    );
    if (!confirmed) return;
    await deleteUser(user.id);
  }

  function handleFormSave(): void {
    setShowForm(false);
    setEditingUser(undefined);
    void loadUsers();
  }

  function handleFormCancel(): void {
    setShowForm(false);
    setEditingUser(undefined);
  }

  if (showForm) {
    return (
      <div className="p-8 flex justify-center">
        <UserForm
          user={editingUser}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
          onCreate={createUser}
          onUpdate={updateUser}
          onResetPassword={resetUserPassword}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportExcel}
            className="bg-green-600 text-white font-semibold rounded-lg py-2 px-4 hover:bg-green-700 transition-colors"
          >
            Exportar Excel
          </button>
          <button
            type="button"
            onClick={handleNewUser}
            className="bg-blue-600 text-white font-semibold rounded-lg py-2 px-4 hover:bg-blue-700 transition-colors"
          >
            + Nuevo usuario
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <caption className="sr-only">Tabla de usuarios</caption>
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                <div className="flex flex-col gap-1">
                  <span>Login</span>
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    aria-label="Filtrar por login"
                    value={filterValues.login ?? ''}
                    onChange={(e) => handleFilterChange('login', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                <div className="flex flex-col gap-1">
                  <span>Nombre</span>
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    aria-label="Filtrar por nombre"
                    value={filterValues.firstName ?? ''}
                    onChange={(e) => handleFilterChange('firstName', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                <div className="flex flex-col gap-1">
                  <span>Apellidos</span>
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    aria-label="Filtrar por apellidos"
                    value={filterValues.lastName ?? ''}
                    onChange={(e) => handleFilterChange('lastName', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                <div className="flex flex-col gap-1">
                  <span>Email</span>
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    aria-label="Filtrar por email"
                    value={filterValues.email ?? ''}
                    onChange={(e) => handleFilterChange('email', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                <div className="flex flex-col gap-1">
                  <span>Rol</span>
                  <select
                    value={filterValues.role ?? ''}
                    aria-label="Filtrar por rol"
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="ADMIN">Admin</option>
                    <option value="RECRUITER">Recruiter</option>
                  </select>
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Activo</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  <span role="status">Cargando...</span>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No hay usuarios
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  onDoubleClick={() => handleEditUser(u)}
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-gray-900">{u.login}</td>
                  <td className="px-4 py-3 text-gray-700">{u.firstName}</td>
                  <td className="px-4 py-3 text-gray-700">{u.lastName}</td>
                  <td className="px-4 py-3 text-gray-700">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {u.role === 'ADMIN' ? 'Admin' : 'Recruiter'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        u.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {u.active ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditUser(u)}
                        className="text-blue-600 hover:text-blue-800 text-xs underline"
                        aria-label={`Editar ${u.login}`}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => { void handleDeleteUser(u); }}
                        className="text-red-600 hover:text-red-800 text-xs underline"
                        aria-label={`Eliminar ${u.login}`}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
