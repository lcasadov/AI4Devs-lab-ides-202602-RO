import { Request, Response } from 'express';
import { z } from 'zod';
import {
  UserService,
  UserNotFoundError,
  DuplicateLoginError,
  DuplicateEmailError,
  CannotDeleteSelfError,
} from '../../application/services/UserService';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { getEmailService } from '../../infrastructure/services/EmailService';

function getUserService(): UserService {
  return new UserService(new UserRepository(), getEmailService());
}

const createUserSchema = z.object({
  login: z.string().min(1).max(250),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(150),
  email: z.string().email().max(250),
  role: z.enum(['ADMIN', 'RECRUITER']),
});

const updateUserSchema = z.object({
  login: z.string().min(1).max(250).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(150).optional(),
  email: z.string().email().max(250).optional(),
  role: z.enum(['ADMIN', 'RECRUITER']).optional(),
  active: z.boolean().optional(),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const { login, firstName, lastName, email, role } = req.query;
    const filters = {
      ...(typeof login === 'string' ? { login } : {}),
      ...(typeof firstName === 'string' ? { firstName } : {}),
      ...(typeof lastName === 'string' ? { lastName } : {}),
      ...(typeof email === 'string' ? { email } : {}),
      ...(typeof role === 'string' ? { role } : {}),
    };
    const userService = getUserService();
    const users = await userService.findAll(Object.keys(filters).length ? filters : undefined);
    res.status(200).json(users);
  } catch (err: unknown) {
    console.error('Get all users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  try {
    const userService = getUserService();
    const user = await userService.findById(id);
    res.status(200).json(user);
  } catch (err: unknown) {
    if (err instanceof UserNotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    console.error('Get user by id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body', details: parsed.error.errors });
    return;
  }

  try {
    const userService = getUserService();
    const user = await userService.create(parsed.data);
    res.status(201).json(user);
  } catch (err: unknown) {
    if (err instanceof DuplicateLoginError || err instanceof DuplicateEmailError) {
      res.status(409).json({ error: err.message });
      return;
    }
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body', details: parsed.error.errors });
    return;
  }

  try {
    const userService = getUserService();
    const user = await userService.update(id, parsed.data);
    res.status(200).json(user);
  } catch (err: unknown) {
    if (err instanceof UserNotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    if (err instanceof DuplicateLoginError || err instanceof DuplicateEmailError) {
      res.status(409).json({ error: err.message });
      return;
    }
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  try {
    const userService = getUserService();
    await userService.delete(id, req.user.userId);
    res.status(204).send();
  } catch (err: unknown) {
    if (err instanceof CannotDeleteSelfError) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (err instanceof UserNotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  try {
    const userService = getUserService();
    await userService.resetPassword(id);
    res.status(200).json({ message: 'Password reset successfully. New credentials have been sent by email.' });
  } catch (err: unknown) {
    if (err instanceof UserNotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
