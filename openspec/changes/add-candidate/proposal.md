## Why

El sistema ATS no tiene actualmente ninguna funcionalidad implementada. El primer paso crítico es permitir al reclutador añadir candidatos al sistema, ya que sin candidatos no es posible gestionar ningún proceso de selección.

## What Changes

- Nuevo modelo de datos `Candidate` en PostgreSQL (Prisma migration)
- Nueva API REST en el backend: `POST /candidates`, `GET /candidates`, `GET /candidates/:id`
- Soporte para carga de CV en formato PDF o DOCX (almacenado en servidor)
- Nueva página en el frontend con formulario de alta de candidato accesible desde el dashboard
- Validación de datos en frontend y backend
- Mensaje de confirmación al añadir candidato correctamente
- Manejo de errores con mensajes descriptivos al usuario

## Capabilities

### New Capabilities

- `candidate-management`: Gestión de candidatos — alta, consulta y almacenamiento de datos personales, educación, experiencia laboral y CV

### Modified Capabilities

_(ninguna — el sistema parte desde cero)_

## Impact

**Backend:**
- `backend/prisma/schema.prisma` — nuevo modelo `Candidate` (**requiere Prisma migration**)
- `backend/src/domain/models/candidate.ts` — entidad de dominio
- `backend/src/application/services/candidate.service.ts` — lógica de negocio
- `backend/src/infrastructure/repositories/candidate.repository.ts` — acceso a datos
- `backend/src/presentation/controllers/candidate.controller.ts` — controlador Express
- `backend/src/routes/candidate.routes.ts` — rutas y anotaciones Swagger
- Dependencia nueva: `multer` para gestión de carga de ficheros

**Frontend:**
- `frontend/src/types/candidate.ts` — interfaces TypeScript
- `frontend/src/services/candidate.service.ts` — llamadas a la API
- `frontend/src/hooks/useCandidates.ts` — hook de datos
- `frontend/src/components/CandidateForm.tsx` — formulario de alta
- `frontend/src/pages/AddCandidatePage.tsx` — página completa

**Base de datos:**
- Nueva tabla `candidates` con campos: id, firstName, lastName, email, phone, address, education, workExperience, cvFileName, createdAt, updatedAt
- Prisma migration requerida: `add_candidate_table`
