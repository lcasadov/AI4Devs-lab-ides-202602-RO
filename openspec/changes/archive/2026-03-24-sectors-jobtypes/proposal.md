## Why

La aplicación necesita catálogos de referencia para clasificar candidatos. Sin Sectores ni Tipos de Puesto no se pueden filtrar candidatos por especialidad, ni generar el Dashboard con estadísticas por categoría (C5). Este cambio introduce los dos módulos CRUD más simples del sistema, que actúan de base para el cambio C4 (Candidate Enhancement).

## What Changes

- **BREAKING** Migración Prisma: dos modelos nuevos `Sector` y `JobType` con relación FK
- API REST para Sectores: CRUD completo + protección por rol (GET público para autenticados, mutaciones solo ADMIN)
- API REST para Tipos de Puesto: CRUD + filtro por sectorId (necesario para combo encadenado en candidatos)
- DELETE de Sector protegido: error 409 si tiene JobTypes asociados
- Páginas frontend `/sectors` y `/jobtypes` (solo ADMIN) con tabla + filtros + formulario
- Menú Sidebar actualizado: añade "Sectores" y "Tipos de puesto" (visibles solo para ADMIN)
- Nuevas rutas protegidas en `App.tsx`

## Capabilities

### New Capabilities

- `sector-management`: CRUD de sectores con protección de integridad referencial
- `jobtype-management`: CRUD de tipos de puesto vinculados a sector, con filtrado por sector

### Modified Capabilities

- `app-shell`: el Sidebar y App.tsx se modifican para añadir las nuevas rutas y opciones de menú

## Impact

**Base de datos**
- Migración Prisma requerida: modelos `Sector` y `JobType`
- Sin datos en producción → migración limpia

**Backend — ficheros afectados**
- `backend/prisma/schema.prisma` — modelos Sector, JobType
- `backend/src/domain/models/Sector.ts`, `JobType.ts`
- `backend/src/domain/repositories/ISectorRepository.ts`, `IJobTypeRepository.ts`
- `backend/src/infrastructure/repositories/SectorRepository.ts`, `JobTypeRepository.ts`
- `backend/src/application/services/SectorService.ts`, `JobTypeService.ts`
- `backend/src/presentation/controllers/SectorController.ts`, `JobTypeController.ts`
- `backend/src/routes/sector.routes.ts`, `jobtype.routes.ts`
- `backend/src/index.ts` — registrar nuevas rutas

**Frontend — ficheros afectados**
- `frontend/src/types/sector.types.ts`, `jobtype.types.ts` (nuevos)
- `frontend/src/services/sector.service.ts`, `jobtype.service.ts` (nuevos)
- `frontend/src/hooks/useSectors.ts`, `useJobTypes.ts` (nuevos)
- `frontend/src/pages/SectorsPage.tsx`, `JobTypesPage.tsx` (nuevos)
- `frontend/src/components/SectorForm.tsx`, `JobTypeForm.tsx` (nuevos)
- `frontend/src/components/Sidebar.tsx` — añadir items de menú
- `frontend/src/App.tsx` — añadir rutas `/sectors` y `/jobtypes`

**Dependencias nuevas**
- Ninguna
