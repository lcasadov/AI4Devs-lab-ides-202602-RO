import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../domain/models/User';

export interface AuthenticatedUser {
  userId: number;
  login: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

interface JwtPayload {
  userId: number;
  login: string;
  role: Role;
}

export const authMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Prefer HttpOnly cookie; fall back to Authorization header for API clients / tests
  const cookieToken = (req.cookies as Record<string, string> | undefined)?.['jwt'];
  const authHeader = req.headers['authorization'];
  const token = cookieToken ?? (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined);

  if (!token) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = {
      userId: payload.userId,
      login: payload.login,
      role: payload.role,
    };
    next();
  } catch (_err: unknown) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
