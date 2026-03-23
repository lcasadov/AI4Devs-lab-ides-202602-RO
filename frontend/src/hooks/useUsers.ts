import { useCallback, useState } from 'react';
import { userService } from '../services/user.service';
import { CreateUserRequest, UpdateUserRequest, User, UserFilters } from '../types/user.types';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  filters: UserFilters;
  selectedUser: User | null;
  loadUsers: () => Promise<void>;
  createUser: (dto: CreateUserRequest) => Promise<void>;
  updateUser: (id: number, dto: UpdateUserRequest) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  resetUserPassword: (id: number) => Promise<void>;
  setFilters: (filters: UserFilters) => void;
  selectUser: (user: User | null) => void;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadUsers = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAll(filters);
      setUsers(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar los usuarios';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createUser = useCallback(async (dto: CreateUserRequest): Promise<void> => {
    setError(null);
    try {
      await userService.create(dto);
      await userService.getAll(filters).then(setUsers);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear el usuario';
      setError(message);
      throw err;
    }
  }, [filters]);

  const updateUser = useCallback(async (id: number, dto: UpdateUserRequest): Promise<void> => {
    setError(null);
    try {
      await userService.update(id, dto);
      await userService.getAll(filters).then(setUsers);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar el usuario';
      setError(message);
      throw err;
    }
  }, [filters]);

  const deleteUser = useCallback(async (id: number): Promise<void> => {
    setError(null);
    try {
      await userService.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el usuario';
      setError(message);
      throw err;
    }
  }, []);

  const resetUserPassword = useCallback(async (id: number): Promise<void> => {
    setError(null);
    try {
      await userService.resetPassword(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al resetear la contraseña';
      setError(message);
      throw err;
    }
  }, []);

  function selectUser(user: User | null): void {
    setSelectedUser(user);
  }

  return {
    users,
    loading,
    error,
    filters,
    selectedUser,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    setFilters,
    selectUser,
  };
}
