## 1. Infraestructura y dependencias

- [x] 1.1 Instalar dependencias backend: `bcrypt`, `jsonwebtoken`, `nodemailer` y sus `@types`
- [x] 1.2 Instalar dependencias frontend: `unocss`, `@unocss/postcss`, `@unocss/reset`
- [x] 1.3 Añadir variables de entorno en `backend/.env`: `JWT_SECRET`, `JWT_EXPIRES_IN`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`

## 2. Schema Prisma y migración

- [x] 2.1 Reescribir el modelo `User` en `backend/prisma/schema.prisma`: añadir `login`, `firstName`, `lastName`, `passwordHash`, `role`, `active`; eliminar `name`
- [x] 2.2 Añadir enum `Role { ADMIN RECRUITER }` al schema
- [x] 2.3 Ejecutar `npx prisma migrate dev --name rewrite-user-model`
- [x] 2.4 Ejecutar `npx prisma generate`
- [x] 2.5 Crear script de seed (`backend/prisma/seed.ts`) que crea un usuario ADMIN inicial

## 3. Backend — Capa de dominio

- [x] 3.1 Crear entidad `User` en `backend/src/domain/models/User.ts` con los campos del schema
- [x] 3.2 Crear interfaz `IUserRepository` en `backend/src/domain/repositories/IUserRepository.ts` con métodos: `findById`, `findByLogin`, `findByEmail`, `findAll`, `create`, `update`, `delete`
- [x] 3.3 Crear interfaz `IEmailService` en `backend/src/domain/services/IEmailService.ts` con método `send`

## 4. Backend — Servicios de infraestructura

- [x] 4.1 Implementar `UserRepository` en `backend/src/infrastructure/repositories/UserRepository.ts` usando PrismaClient singleton (excluir `passwordHash` por defecto en `select`)
- [x] 4.2 Implementar `EmailService` en `backend/src/infrastructure/services/EmailService.ts` con Nodemailer; capturar errores SMTP sin propagar al llamante
- [x] 4.3 Implementar función `generatePassword()` en `backend/src/domain/utils/passwordUtils.ts` usando `crypto.randomBytes`, garantizando cumplimiento de política

## 5. Backend — Servicios de aplicación

- [x] 5.1 Implementar `AuthService` en `backend/src/application/services/AuthService.ts`: `login`, `forgotPassword`, `changePassword`
- [x] 5.2 Implementar `UserService` en `backend/src/application/services/UserService.ts`: `findAll` (con filtros), `findById`, `create` (con email bienvenida), `update`, `delete`, `resetPassword`
- [x] 5.3 Implementar validación de política de contraseñas en `AuthService` y `UserService`

## 6. Backend — Middleware y controladores

- [x] 6.1 Implementar middleware JWT `backend/src/middleware/auth.middleware.ts`: extrae y verifica token, adjunta payload al request
- [x] 6.2 Implementar middleware de rol `backend/src/middleware/role.middleware.ts`: verifica que el usuario tenga el rol requerido (403 si no)
- [x] 6.3 Implementar `AuthController` en `backend/src/presentation/controllers/AuthController.ts`: `login`, `forgotPassword`, `changePassword`
- [x] 6.4 Implementar `UserController` en `backend/src/presentation/controllers/UserController.ts`: `getAll`, `getById`, `create`, `update`, `delete`, `resetPassword`

## 7. Backend — Rutas y Swagger

- [x] 7.1 Crear `backend/src/routes/auth.routes.ts` con `POST /auth/login`, `POST /auth/forgot-password`, `PUT /auth/change-password`
- [x] 7.2 Crear `backend/src/routes/user.routes.ts` con CRUD + `POST /users/:id/reset-password`, todos protegidos por `authMiddleware` + `roleMiddleware(ADMIN)`
- [x] 7.3 Proteger rutas existentes (`/candidates`) añadiendo `authMiddleware`
- [x] 7.4 Añadir anotaciones Swagger a todos los endpoints nuevos

## 8. Frontend — Configuración UnoCSS

- [x] 8.1 Configurar `@unocss/postcss` en `frontend/postcss.config.js`
- [x] 8.2 Crear `frontend/uno.config.ts` con preset attributify y preset uno
- [x] 8.3 Reemplazar `frontend/src/App.css` e `frontend/src/index.css` con imports de UnoCSS reset

## 9. Frontend — Autenticación

- [x] 9.1 Crear `frontend/src/types/auth.types.ts` con interfaces `LoginRequest`, `AuthUser`, `JwtPayload`
- [x] 9.2 Crear `frontend/src/services/auth.service.ts` con `login`, `logout`, `forgotPassword`, `changePassword`
- [x] 9.3 Crear `frontend/src/context/AuthContext.tsx` con estado de usuario, login, logout y helpers de rol
- [x] 9.4 Crear `frontend/src/components/ProtectedRoute.tsx` que redirige a `/login` si no hay sesión
- [x] 9.5 Crear `frontend/src/pages/LoginPage.tsx`: formulario login/password, mensaje genérico de error, enlace "¿Olvidaste tu contraseña?"
- [x] 9.6 Actualizar `frontend/src/App.tsx` para envolver con `AuthProvider` e integrar `ProtectedRoute` en todas las rutas

## 10. Frontend — Gestión de usuarios

- [x] 10.1 Crear `frontend/src/types/user.types.ts` con interfaces `User`, `CreateUserRequest`, `UpdateUserRequest`
- [x] 10.2 Crear `frontend/src/services/user.service.ts` con `getAll`, `getById`, `create`, `update`, `delete`, `resetPassword`
- [x] 10.3 Crear `frontend/src/hooks/useUsers.ts` con estado de tabla, filtros y operaciones CRUD
- [x] 10.4 Crear `frontend/src/pages/UsersPage.tsx`: tabla con columnas login/nombre/apellidos/email/rol/activo, filtros por columna, doble click abre formulario
- [x] 10.5 Crear `frontend/src/components/UserForm.tsx`: formulario alta/edición con campos login, nombre, apellidos, email, rol (combo), activo (toggle) — sin campo contraseña; botón "Resetear contraseña" en modo edición
- [x] 10.6 Crear `frontend/src/components/ChangePasswordModal.tsx`: modal con campos contraseña actual, nueva y confirmación; validación de política en tiempo real

## 11. Tests

- [x] 11.1 Tests unitarios para `AuthService`: login correcto, credenciales incorrectas, usuario inactivo, forgot-password con login existente e inexistente, cambio de contraseña
- [x] 11.2 Tests unitarios para `UserService`: CRUD completo, login/email duplicado, no eliminar propio usuario, reset de password
- [x] 11.3 Tests de integración con Supertest para `POST /auth/login`: happy path + casos de error
- [x] 11.4 Tests de integración con Supertest para rutas de usuarios (requieren token ADMIN)
- [x] 11.5 Tests de componente React para `LoginPage`: render, submit, manejo de error
- [x] 11.6 Tests de componente React para `UsersPage`: render de tabla, filtros, apertura de formulario
