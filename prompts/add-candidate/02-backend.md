# Prompt 02 — Backend Agent

**Ejecutar después del prompt 01 (DevOps). Requiere que la migración esté aplicada.**

---

Eres el Backend Agent del proyecto LTI (ATS). Implementa la feature "Añadir Candidato" siguiendo arquitectura DDD estricta.

## Tarea

Lee primero estos ficheros para entender el estado actual:
- `backend/prisma/schema.prisma` — modelo `Candidate` ya creado por DevOps
- `backend/src/index.ts` — punto de entrada Express

Luego implementa en este orden exacto (respeta la dirección de dependencias DDD):

### 1. Dominio (`backend/src/domain/`)

**`backend/src/domain/models/candidate.ts`**
```ts
export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  education?: unknown;
  workExperience?: unknown;
  cvFileName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCandidateDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  education?: unknown;
  workExperience?: unknown;
  cvFileName?: string;
}
```

**`backend/src/domain/repositories/candidate.repository.interface.ts`**
Define la interfaz `ICandidateRepository` con métodos: `create`, `findAll`, `findById`, `findByEmail`.

### 2. Infraestructura (`backend/src/infrastructure/`)

**`backend/src/infrastructure/database/prisma-client.ts`**
Singleton de `PrismaClient`. Es el único lugar donde se instancia `PrismaClient`.

**`backend/src/infrastructure/repositories/candidate.repository.ts`**
Implementa `ICandidateRepository` usando el singleton de Prisma. Usa `select` explícito en todas las queries. Nunca expongas campos internos.

### 3. Aplicación (`backend/src/application/`)

**`backend/src/application/services/candidate.service.ts`**
- `create(dto, cvFileName?)`: valida email único (lanza error descriptivo si duplicado), crea candidato
- `getAll()`: devuelve lista de candidatos
- `getById(id)`: devuelve candidato o lanza `NotFoundError`
- No usa `PrismaClient` directamente — solo la interfaz `ICandidateRepository`

### 4. Presentación (`backend/src/presentation/controllers/`)

**`backend/src/presentation/controllers/candidate.controller.ts`**
- Configura `multer` con `diskStorage` en `backend/uploads/`, acepta solo `.pdf` y `.docx`, límite 5 MB
- `create(req, res)`: valida body (firstName, lastName, email requeridos), delega a service, devuelve 201
- `getAll(req, res)`: devuelve 200 con lista
- `getById(req, res)`: devuelve 200 o 404
- Maneja errores: 400 validación, 409 duplicado, 404 no encontrado, 500 error interno (sin exponer detalles Prisma)

### 5. Rutas (`backend/src/routes/`)

**`backend/src/routes/candidate.routes.ts`**
- `POST /candidates` (multipart/form-data)
- `GET /candidates`
- `GET /candidates/:id`
- Anotaciones Swagger JSDoc completas para cada ruta (request body, responses, schemas)

### 6. Registrar rutas en `backend/src/index.ts`
Importa y monta las rutas de candidatos.

## Convenciones obligatorias

- Sin `any` — usa `unknown` en catch y narrowing con `instanceof`
- Tipos de retorno explícitos en todas las funciones
- HTTP status codes: 201 crear, 200 ok, 400 validación, 404 no encontrado, 409 duplicado, 500 error interno
- Nunca exponer detalles de Prisma en respuestas HTTP
- `PrismaClient` solo en `infrastructure/database/prisma-client.ts`
- Convenciones de ficheros: `kebab-case`

## Al terminar

- Crea rama `feat/backend-add-candidate`
- Commit con mensaje `feat: add candidate management API`
- Lee el token del fichero `.env` en la raíz del proyecto: variable `IAGOV_AGENT_TOKEN`
- Abre PR contra `main`: `GITHUB_TOKEN=$IAGOV_AGENT_TOKEN gh pr create --title "[Backend] Add candidate management API" --body "..."`
- Devuelve la URL de la PR

## Contexto del proyecto
- Backend: Express 4 + TypeScript 4.9, puerto 3010
- Prisma 5, PostgreSQL, DB `LTIdb`
- Tests: Jest + Supertest en `backend/src/tests/`
- Swagger en `http://localhost:3010/api-docs`
