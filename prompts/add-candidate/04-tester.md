# Prompt 04 — Tester Agent

**Ejecutar después de que los prompts 02 y 03 estén completados y sus PRs aprobadas.**

---

Eres el Tester Agent del proyecto LTI (ATS). Escribe los tests completos para la feature "Añadir Candidato".

## Tarea

Lee primero la implementación:
- `backend/src/routes/candidate.routes.ts`
- `backend/src/presentation/controllers/candidate.controller.ts`
- `backend/src/application/services/candidate.service.ts`
- `backend/src/infrastructure/repositories/candidate.repository.ts`
- `frontend/src/components/CandidateForm.tsx`
- `frontend/src/pages/AddCandidatePage.tsx`
- `frontend/src/hooks/useCreateCandidate.ts`
- `frontend/src/services/candidate.service.ts`

### Tests de backend (`backend/src/tests/`)

**`candidates.test.ts`** — integración con Supertest, mockea PrismaClient:

- `POST /candidates`
  - [ ] Devuelve 201 y el candidato creado con datos válidos
  - [ ] Devuelve 400 cuando falta `firstName`
  - [ ] Devuelve 400 cuando falta `lastName`
  - [ ] Devuelve 400 cuando falta `email`
  - [ ] Devuelve 400 cuando el email tiene formato inválido
  - [ ] Devuelve 409 cuando el email ya existe (Prisma error P2002)
  - [ ] Devuelve 500 ante error inesperado de BD sin exponer detalles internos

- `GET /candidates`
  - [ ] Devuelve 200 con lista de candidatos
  - [ ] Devuelve 200 con array vacío cuando no hay candidatos
  - [ ] Devuelve 500 ante error de BD

- `GET /candidates/:id`
  - [ ] Devuelve 200 con el candidato cuando existe
  - [ ] Devuelve 404 cuando el ID no existe
  - [ ] Devuelve 500 ante error de BD

**`candidate.service.test.ts`** — tests unitarios del servicio:
  - [ ] `create` llama al repositorio con los datos correctos
  - [ ] `create` lanza error si el email ya existe
  - [ ] `getAll` devuelve la lista del repositorio
  - [ ] `getById` devuelve el candidato cuando existe
  - [ ] `getById` lanza `NotFoundError` cuando no existe

### Tests de frontend

**`CandidateForm.test.tsx`** (junto al componente):
  - [ ] Renderiza todos los campos del formulario
  - [ ] Muestra error de validación cuando `firstName` está vacío al hacer submit
  - [ ] Muestra error de validación cuando `email` tiene formato inválido
  - [ ] Deshabilita el botón submit mientras `isLoading` es true
  - [ ] Llama a `onSuccess` cuando el servicio devuelve éxito
  - [ ] Muestra mensaje de error cuando el servicio falla
  - [ ] Muestra "Este email ya está registrado" en error 409

**`AddCandidatePage.test.tsx`**:
  - [ ] Renderiza `CandidateForm`
  - [ ] Muestra mensaje de confirmación tras submit exitoso

**`useCreateCandidate.test.ts`**:
  - [ ] Estado inicial: `isLoading: false`, `error: null`, `success: false`
  - [ ] Durante la llamada: `isLoading: true`
  - [ ] Tras éxito: `success: true`, `isLoading: false`, `error: null`
  - [ ] Tras error: `error` contiene el mensaje, `isLoading: false`, `success: false`

## Convenciones obligatorias

- Patrón AAA: Arrange → Act → Assert. Un comportamiento por `it`.
- `beforeEach(() => jest.clearAllMocks())` en cada `describe`
- Sin llamadas HTTP reales ni consultas reales a la BD
- Nombres de tests descriptivos del comportamiento esperado
- Verificar que errores internos de Prisma NO aparecen en respuestas HTTP

## Al terminar

- Ejecuta `cd backend && npm test` — todos los tests deben pasar
- Ejecuta `cd frontend && npm test -- --watchAll=false` — todos los tests deben pasar
- Reporta:
  - Número de tests escritos por fichero
  - Comportamientos cubiertos
  - Cualquier bug encontrado en la implementación durante el testing
  - Cobertura si está disponible (`npm test -- --coverage`)
