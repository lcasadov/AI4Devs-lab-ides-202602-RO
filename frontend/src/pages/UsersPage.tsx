import React, { useEffect, useState } from 'react';
import { UserForm } from '../components/UserForm';
import { useUsers } from '../hooks/useUsers';
import { User, UserFilters } from '../types/user.types';
import { exportToExcel } from '../utils/exportExcel';

const ff = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const filterInput: React.CSSProperties = {
  border: '1px solid #e2e8f0', borderRadius: '6px',
  padding: '7px 10px', fontSize: '13px', color: '#374151',
  background: '#fff', outline: 'none',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
};

export function UsersPage(): JSX.Element {
  const { users, loading, error, loadUsers, createUser, updateUser, deleteUser, resetUserPassword, setFilters } = useUsers();

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [filterValues, setFilterValues] = useState<UserFilters>({});

  useEffect(() => { void loadUsers(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  function handleFilterChange(field: keyof UserFilters, value: string): void {
    const updated = { ...filterValues, [field]: value || undefined };
    setFilterValues(updated);
    setFilters(updated);
    void loadUsers();
  }

  function handleExportExcel(): void {
    const rows = users.map((u) => ({
      login: u.login, nombre: u.firstName, apellidos: u.lastName,
      email: u.email, rol: u.role === 'ADMIN' ? 'Admin' : 'Recruiter',
    }));
    void exportToExcel(rows, [
      { header: 'Login', key: 'login' }, { header: 'Nombre', key: 'nombre' },
      { header: 'Apellidos', key: 'apellidos' }, { header: 'Email', key: 'email' },
      { header: 'Rol', key: 'rol' },
    ], 'usuarios');
  }

  function handleNewUser(): void { setEditingUser(undefined); setShowForm(true); }
  function handleEditUser(user: User): void { setEditingUser(user); setShowForm(true); }
  function handleFormSave(): void { setShowForm(false); setEditingUser(undefined); void loadUsers(); }
  function handleFormCancel(): void { setShowForm(false); setEditingUser(undefined); }

  async function handleDeleteUser(user: User): Promise<void> {
    if (!window.confirm(`¿Eliminar al usuario "${user.login}"?`)) return;
    await deleteUser(user.id);
  }

  if (showForm) {
    return (
      <div style={{ fontFamily: ff, minHeight: '100vh', background: '#f1f5f9' }}>
        <div style={{
          background: '#1e3a5f', color: '#fff', padding: '0 32px',
          height: '48px', display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <button
            type="button" onClick={handleFormCancel}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
              borderRadius: '6px', padding: '5px 12px', fontSize: '13px',
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            ← Volver
          </button>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>
            {editingUser ? 'Editar usuario' : 'Nuevo usuario'}
          </span>
        </div>
        <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            background: '#fff', borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            padding: '32px', width: '100%', maxWidth: '560px',
          }}>
            <UserForm
              user={editingUser}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
              onCreate={createUser}
              onUpdate={updateUser}
              onResetPassword={resetUserPassword}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: ff, minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Title bar */}
      <div style={{
        background: '#1e3a5f', color: '#fff', padding: '0 32px', height: '52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.3px' }}>USUARIOS</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={handleExportExcel} style={{
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff', fontWeight: 600, fontSize: '13px', borderRadius: '7px',
            padding: '7px 14px', cursor: 'pointer',
          }}>↓ Excel</button>
          <button type="button" onClick={handleNewUser} style={{
            background: '#2563eb', border: 'none', color: '#fff', fontWeight: 700,
            fontSize: '13px', borderRadius: '7px', padding: '7px 16px', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(37,99,235,0.4)',
          }}>+ Nuevo usuario</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '12px 32px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <input type="text" placeholder="Login..." value={filterValues.login ?? ''}
          onChange={(e) => handleFilterChange('login', e.target.value)}
          aria-label="Filtrar por login" style={{ ...filterInput, width: '130px' }} />
        <input type="text" placeholder="Nombre..." value={filterValues.firstName ?? ''}
          onChange={(e) => handleFilterChange('firstName', e.target.value)}
          aria-label="Filtrar por nombre" style={{ ...filterInput, width: '130px' }} />
        <input type="text" placeholder="Apellidos..." value={filterValues.lastName ?? ''}
          onChange={(e) => handleFilterChange('lastName', e.target.value)}
          aria-label="Filtrar por apellidos" style={{ ...filterInput, width: '130px' }} />
        <input type="text" placeholder="Email..." value={filterValues.email ?? ''}
          onChange={(e) => handleFilterChange('email', e.target.value)}
          aria-label="Filtrar por email" style={{ ...filterInput, width: '170px' }} />
        <select value={filterValues.role ?? ''} onChange={(e) => handleFilterChange('role', e.target.value)}
          aria-label="Filtrar por rol" style={{ ...filterInput, width: '130px', cursor: 'pointer' }}>
          <option value="">Todos los roles</option>
          <option value="ADMIN">Admin</option>
          <option value="RECRUITER">Recruiter</option>
        </select>
        <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: 'auto' }}>
          {users.length} registro{users.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div role="alert" style={{ margin: '16px 32px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#dc2626' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ padding: '20px 32px' }}>
        <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <caption style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Tabla de usuarios</caption>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Login', 'Nombre', 'Apellidos', 'Email', 'Rol', 'Activo', 'Acciones'].map((h) => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}><span role="status">Cargando...</span></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No hay usuarios</td></tr>
              ) : (
                users.map((u, i) => (
                  <tr key={u.id} onDoubleClick={() => handleEditUser(u)}
                    style={{ borderBottom: i < users.length - 1 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
                  >
                    <td style={{ padding: '11px 16px', color: '#0f172a', fontWeight: 500 }}>{u.login}</td>
                    <td style={{ padding: '11px 16px', color: '#475569' }}>{u.firstName}</td>
                    <td style={{ padding: '11px 16px', color: '#475569' }}>{u.lastName}</td>
                    <td style={{ padding: '11px 16px', color: '#475569' }}>{u.email}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 9px', borderRadius: '12px',
                        fontSize: '11px', fontWeight: 700,
                        background: u.role === 'ADMIN' ? '#f3e8ff' : '#eff6ff',
                        color: u.role === 'ADMIN' ? '#7c3aed' : '#2563eb',
                      }}>{u.role === 'ADMIN' ? 'Admin' : 'Recruiter'}</span>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 9px', borderRadius: '12px',
                        fontSize: '11px', fontWeight: 700,
                        background: u.active ? '#f0fdf4' : '#f8fafc',
                        color: u.active ? '#16a34a' : '#94a3b8',
                      }}>{u.active ? 'Sí' : 'No'}</span>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button type="button" onClick={() => handleEditUser(u)} aria-label={`Editar ${u.login}`}
                          style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#dbeafe'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#eff6ff'; }}>
                          ✏ Editar
                        </button>
                        <button type="button" onClick={() => { void handleDeleteUser(u); }} aria-label={`Eliminar ${u.login}`}
                          style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}>
                          ✕
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
    </div>
  );
}
