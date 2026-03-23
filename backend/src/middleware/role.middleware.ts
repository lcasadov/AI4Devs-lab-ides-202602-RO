import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Role } from '../domain/models/User';

export function roleMiddleware(role: Role): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ error: 'Acceso denegado' });
      return;
    }
    next();
  };
}
