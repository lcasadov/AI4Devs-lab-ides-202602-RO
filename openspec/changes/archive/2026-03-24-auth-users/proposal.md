## Why

La aplicación LTI no tiene sistema de autenticación ni control de acceso. Cualquier persona puede acceder a todos los datos de candidatos sin identificarse. Este cambio introduce login con usuario y contraseña, gestión de usuarios con roles y un servicio de email para el ciclo de vida de contraseñas.

## What Changes

- **BREAKING** Reescritura del modelo `User` en Prisma: se añaden `login`, `passwordHash`, `firstName`, `lastName`, `role`, `active`; se elimina `name`
- Nueva migración de base de datos para el modelo `User` y el enum `Role`
- API de autenticación: login, logout, forgot-password (con envío de email)
- API de gestión de usuarios protegida por JWT y rol ADMIN: CRUD completo + reset de password
- Middleware JWT que protege todas las rutas existentes y futuras
- Servicio de email con Nodemailer (SMTP ethereal.mail)
- Página de Login en el frontend con manejo de errores genérico (no revela si el usuario existe)
- AuthContext + protected routes en React
- Página de Gestión de Usuarios (solo ADMIN): tabla con filtros, formulario alta/edición, reset de password
- Modal de cambio de contraseña propio accesible desde el avatar del header
- Migración de estilos: UnoCSS reemplaza los ficheros CSS actuales (App.css, index.css)

## Capabilities

### New Capabilities

- `user-auth`: Autenticación JWT con login/logout y recuperación de contraseña por email
- `user-management`: CRUD de usuarios de la aplicación con roles (ADMIN / RECRUITER) y gestión de contraseñas
- `email-service`: Servicio transversal de envío de emails via SMTP (ethereal.mail) usado por auth y gestión de usuarios

### Modified Capabilities

_(no hay specs previas que modificar)_

## Impact

**Base de datos**
- Migración Prisma requerida: nuevo enum `Role`, modelo `User` reescrito
- Sin datos en producción → migración limpia

**Backend — ficheros afectados**
- `backend/prisma/schema.prisma` — modelo User + enum Role
- `backend/src/domain/models/` — entidad User, interfaz UserRepository
- `backend/src/application/services/` — AuthService, UserService, EmailService
- `backend/src/infrastructure/repositories/` — UserRepository (Prisma)
- `backend/src/presentation/controllers/` — AuthController, UserController
- `backend/src/routes/` — auth.routes.ts, user.routes.ts
- `backend/src/middleware/` — auth.middleware.ts (JWT guard)
- `backend/.env` — JWT_SECRET, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS

**Frontend — ficheros afectados**
- `frontend/src/context/AuthContext.tsx` (nuevo)
- `frontend/src/pages/LoginPage.tsx` (nuevo)
- `frontend/src/pages/UsersPage.tsx` (nuevo)
- `frontend/src/components/ChangePasswordModal.tsx` (nuevo)
- `frontend/src/services/auth.service.ts` (nuevo)
- `frontend/src/services/user.service.ts` (nuevo)
- `frontend/src/types/user.types.ts` (nuevo)
- `frontend/src/App.tsx` — integrar AuthContext y protected routes
- `frontend/src/App.css`, `frontend/src/index.css` — reemplazar con UnoCSS

**Dependencias nuevas**
- Backend: `bcrypt`, `jsonwebtoken`, `nodemailer`, `@types/bcrypt`, `@types/jsonwebtoken`, `@types/nodemailer`
- Frontend: `unocss`, `@unocss/reset`
