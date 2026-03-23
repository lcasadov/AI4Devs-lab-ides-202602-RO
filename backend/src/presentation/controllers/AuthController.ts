import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService, InvalidCredentialsError, InvalidPasswordError, InvalidCurrentPasswordError } from '../../application/services/AuthService';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { getEmailService } from '../../infrastructure/services/EmailService';

function getAuthService(): AuthService {
  return new AuthService(new UserRepository(), getEmailService());
}

const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  login: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
  confirmPassword: z.string().min(1),
});

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body', details: parsed.error.errors });
    return;
  }

  try {
    const authService = getAuthService();
    const result = await authService.login(parsed.data.login, parsed.data.password);
    res.status(200).json(result);
  } catch (err: unknown) {
    if (err instanceof InvalidCredentialsError) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body', details: parsed.error.errors });
    return;
  }

  try {
    const authService = getAuthService();
    await authService.forgotPassword(parsed.data.login);
    // Always return generic message — do not reveal if user exists
    res.status(200).json({ message: 'If the account exists, a password reset email has been sent.' });
  } catch (err: unknown) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body', details: parsed.error.errors });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  try {
    const authService = getAuthService();
    await authService.changePassword(
      req.user.userId,
      parsed.data.currentPassword,
      parsed.data.newPassword,
      parsed.data.confirmPassword,
    );
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err: unknown) {
    if (err instanceof InvalidPasswordError) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (err instanceof InvalidCurrentPasswordError) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (err instanceof InvalidCredentialsError) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
