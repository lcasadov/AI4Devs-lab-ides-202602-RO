# Prompt 04 — Arrancar la Aplicación

**Ejecutar después de completar los pasos 01, 02 y 03.**

---

Arranca el backend y el frontend del proyecto LTI ATS.

## Terminal 1 — Backend

```bash
cd backend
npm run dev
```

El servidor arranca en `http://localhost:3010`.

### Endpoints principales

**Autenticación**
- `POST /auth/login` — login con usuario y contraseña → devuelve JWT
- `POST /auth/forgot-password` — solicitar nueva contraseña por email
- `PUT  /auth/change-password` — cambiar contraseña propia (requiere JWT)

**Candidatos** *(requieren JWT)*
- `GET    /candidates` — listar candidatos (con filtros opcionales)
- `POST   /candidates` — crear candidato (multipart/form-data)
- `GET    /candidates/:id` — obtener candidato por ID
- `PUT    /candidates/:id` — actualizar candidato
- `DELETE /candidates/:id` — eliminar candidato
- `POST   /candidates/:id/cv` — subir CV (PDF/DOCX, máx 5 MB)

**Sectores y Tipos de puesto** *(requieren JWT)*
- `GET /sectors` · `POST /sectors` · `PUT /sectors/:id` · `DELETE /sectors/:id`
- `GET /jobtypes` · `POST /jobtypes` · `PUT /jobtypes/:id` · `DELETE /jobtypes/:id`

**Usuarios** *(requieren JWT + rol ADMIN)*
- `GET    /users` — listar usuarios (con filtros)
- `POST   /users` — crear usuario (genera contraseña y envía email)
- `PUT    /users/:id` — actualizar usuario
- `DELETE /users/:id` — eliminar usuario
- `POST   /users/:id/reset-password` — resetear contraseña y enviar por email

**Dashboard** *(requiere JWT)*
- `GET /dashboard/stats` — candidatos agrupados por tipo de puesto, provincia y municipio

**Documentación**
- `GET /api-docs` — Swagger UI

## Terminal 2 — Frontend

```bash
cd frontend
npm start
```

La aplicación abre en `http://localhost:3000`.

## Primer acceso

1. Abre `http://localhost:3000` — redirige automáticamente a `/login`
2. Introduce las credenciales iniciales:
   - **Usuario**: `admin`
   - **Contraseña**: `Admin@1234`
3. Tras autenticarse verás el Dashboard con estadísticas de candidatos

## Verificar que todo funciona

| Paso | URL | Resultado esperado |
|---|---|---|
| Login | `http://localhost:3000/login` | Formulario de acceso con panel de branding |
| Dashboard | `http://localhost:3000/dashboard` | 3 paneles con estadísticas |
| Candidatos | `http://localhost:3000/candidates` | Tabla con filtros y botón "Nuevo candidato" |
| Sectores | `http://localhost:3000/sectors` | Tabla de sectores (solo ADMIN) |
| Tipos de puesto | `http://localhost:3000/jobtypes` | Tabla de tipos de puesto (solo ADMIN) |
| Usuarios | `http://localhost:3000/users` | Gestión de usuarios (solo ADMIN) |
| Swagger | `http://localhost:3010/api-docs` | Documentación de la API |

## Ejecutar tests

```bash
# Backend (100 tests)
cd backend && npm test

# Frontend (41 tests)
cd frontend && npm test -- --watchAll=false
```
