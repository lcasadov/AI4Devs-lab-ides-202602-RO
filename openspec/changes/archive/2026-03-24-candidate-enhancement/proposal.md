## Why

La aplicación necesita una gestión completa de candidatos: el modelo actual solo tiene campos básicos y la página `AddCandidatePage` no permite listar ni editar. Con Sectores y Tipos de Puesto ya disponibles (C3), este cambio conecta candidatos con esos catálogos y añade localización, educación estructurada, experiencia laboral y adjunto de CV.

## What Changes

- **BREAKING** Migración Prisma: añadir `postalCode`, `province`, `municipality`, `sectorId` (FK Sector), `jobTypeId` (FK JobType) al modelo `Candidate`
- API REST candidatos extendida: GET incluye relaciones sector/jobType; POST y PUT aceptan nuevos campos con validación Zod
- Nuevo endpoint `POST /candidates/:id/cv` para subir CV (PDF/DOCX, max 5 MB) con multer
- Página `CandidatesPage` que reemplaza `AddCandidatePage`: tabla con filtros, doble click para editar
- `CandidateForm` completo con combos encadenados sector→tipo de puesto, secciones de educación y experiencia laboral dinámicas, y botón de subida de CV en modo edición
- Sidebar y `App.tsx` actualizados: ruta `/candidates` apunta a `CandidatesPage`

## Capabilities

### New Capabilities

- `candidate-management`: CRUD completo de candidatos con campos enriquecidos, combos sector/tipo de puesto encadenados, educación y experiencia dinámicas, y adjunto de CV
- `cv-upload`: subida de fichero CV (PDF/DOCX, max 5 MB) vinculado al candidato

### Modified Capabilities

- `app-shell`: `App.tsx` reemplaza `AddCandidatePage` por `CandidatesPage` en la ruta `/candidates`

## Impact

**Base de datos**
- Migración Prisma requerida: nuevos campos en `Candidate` + FKs a `Sector` y `JobType`
- Sin datos en producción → migración limpia

**Backend — ficheros afectados**
- `backend/prisma/schema.prisma` — ampliar modelo Candidate
- `backend/src/domain/models/Candidate.ts` — ampliar interfaces
- `backend/src/domain/repositories/ICandidateRepository.ts` — ampliar métodos
- `backend/src/infrastructure/repositories/CandidateRepository.ts` — incluir relaciones en Prisma
- `backend/src/application/services/CandidateService.ts` — lógica de negocio extendida
- `backend/src/presentation/controllers/CandidateController.ts` — validación Zod extendida + endpoint CV
- `backend/src/routes/candidate.routes.ts` — registrar POST /:id/cv con multer
- `backend/src/index.ts` — servir estáticos de `uploads/` si se requiere
- Nueva dependencia: `multer` + `@types/multer`

**Frontend — ficheros afectados**
- `frontend/src/types/candidate.types.ts` — nuevo/ampliado
- `frontend/src/services/candidate.service.ts` — nuevo
- `frontend/src/hooks/useCandidates.ts` — nuevo
- `frontend/src/pages/CandidatesPage.tsx` — nuevo (reemplaza AddCandidatePage)
- `frontend/src/components/CandidateForm.tsx` — nuevo
- `frontend/src/App.tsx` — cambiar ruta `/candidates`

**Dependencias nuevas**
- `multer` + `@types/multer` (backend)
