## Context

LTI actualmente no tiene autenticación. El modelo `User` en Prisma solo tiene `id`, `email` y `name` — no hay contraseñas, roles ni sesiones. Toda la API es pública. Este cambio introduce autenticación JWT stateless, roles ADMIN/RECRUITER y un ciclo completo de gestión de contraseñas con email.

## Goals / Non-Goals

**Goals:**
- Autenticación stateless con JWT (access token de corta duración)
- Control de acceso basado en rol (RBAC simple: ADMIN vs RECRUITER)
- Ciclo de vida de contraseñas: creación, cambio propio, reset por ADMIN, recuperación por email
- Gestión de usuarios como módulo CRUD completo (ADMIN only)
- Servicio de email reutilizable para futuros cambios (C3, C4, C5)

**Non-Goals:**
- Refresh tokens o sesiones persistentes (out of scope)
- OAuth / SSO (out of scope)
- Auditoría de accesos / logs de seguridad (out of scope)
- Rate limiting en endpoints de auth (out of scope)
- Export a Excel (diferido a cambio futuro)

## Decisions

### D1: JWT stateless sin refresh token
**Decisión:** Access token de 8h, almacenado en `localStorage` en el frontend.
**Alternativas consideradas:**
- `httpOnly cookie` + refresh token: más seguro frente a XSS pero requiere endpoint de refresh y manejo de CSRF. Complejidad desproporcionada para el alcance actual.
- Session en servidor: rompe la naturaleza stateless de la API.

**Rationale:** El entorno es una intranet corporativa. localStorage con JWT de 8h es suficiente. Si la política de seguridad cambia, se puede migrar sin tocar el backend.

### D2: bcrypt para hash de contraseñas (cost factor 12)
**Decisión:** `bcrypt` con salt rounds = 12.
**Alternativas consideradas:**
- `argon2`: más moderno pero dependencia nativa más compleja de compilar en Windows/Docker.
- `scrypt` (Node built-in): viable pero bcrypt tiene más soporte en el ecosistema Node/Prisma.

**Rationale:** bcrypt es estándar de facto en el ecosistema Express/Node. Cost 12 es seguro y suficientemente rápido (<300ms en hardware moderno).

### D3: Generación de contraseñas aleatorias para reset/creación
**Decisión:** Generador propio con `crypto.randomBytes` que garantiza los requisitos de la política de contraseñas.
**Política:** mínimo 8 chars, ≥1 mayúscula, ≥1 minúscula, ≥1 número, ≥1 carácter especial, máx 2 iguales consecutivos.
**Rationale:** No añadir dependencia extra cuando `crypto` es built-in de Node.

### D4: Nodemailer con transporte SMTP (ethereal.mail en desarrollo)
**Decisión:** Servicio `EmailService` singleton que envuelve Nodemailer. Configurable via `.env`. En desarrollo apunta a ethereal.mail.
**Rationale:** Desacopla el transporte del servicio — en producción solo cambia la configuración `.env`, no el código.

### D5: forgot-password no revela existencia de usuario
**Decisión:** El endpoint `POST /api/auth/forgot-password` siempre responde con `200 OK` y el mismo mensaje, independientemente de si el usuario existe.
**Rationale:** Previene enumeración de usuarios (OWASP A07).

### D6: UnoCSS mediante CDN/PostCSS en Create React App
**Decisión:** Integrar UnoCSS como plugin de PostCSS con `@unocss/postcss`. Eliminar `App.css` e `index.css`.
**Alternativas consideradas:**
- Vite + UnoCSS plugin: requiere migrar de CRA a Vite (out of scope).
- Styled-components: cambia el paradigma de estilos del proyecto.
**Rationale:** `@unocss/postcss` es compatible con CRA sin eyectar.

### D7: Arquitectura DDD — AuthService vs UserService separados
**Decisión:** Dos servicios de aplicación independientes:
- `AuthService`: login, logout, forgot-password, change-password
- `UserService`: CRUD de usuarios + reset-password por ADMIN
Ambos usan `UserRepository` e `EmailService`.

```
presentation/
  AuthController    → AuthService
  UserController    → UserService

application/
  AuthService       → UserRepository + EmailService
  UserService       → UserRepository + EmailService

infrastructure/
  UserRepository    → PrismaClient (singleton)
  EmailService      → Nodemailer
```

**Rationale:** Responsabilidades claras. AuthService no conoce la gestión de usuarios y viceversa.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|-----------|
| JWT en localStorage vulnerable a XSS | Sanitizar todo input; en producción migrar a httpOnly cookie |
| ethereal.mail solo para desarrollo | Configurar variables de entorno de producción antes del despliegue real |
| Migración rompe el modelo User existente | Sin datos en producción — migración limpia con `prisma migrate dev --name rewrite-user` |
| Contraseña generada aleatoriamente puede no cumplir política en edge cases | Función de generación verifica los requisitos antes de devolver la contraseña |
| UnoCSS en CRA puede requerir CRACO o react-app-rewired | Probar con `@unocss/postcss` primero; fallback: CDN con atributos de clase |

## Migration Plan

1. `npx prisma migrate dev --name rewrite-user-model` — aplica nuevo schema
2. `npx prisma generate` — regenera el cliente
3. Crear usuario ADMIN inicial via script de seed o endpoint temporal
4. Desplegar backend con nuevas rutas protegidas
5. Desplegar frontend con Login como ruta raíz
6. Verificar que rutas anteriores (`/api/candidates`) requieren JWT válido
