## 1. Schema Prisma y migración

- [x] 1.1 Añadir modelos `Sector` y `JobType` a `backend/prisma/schema.prisma` con los campos, relación FK y unique constraints definidos en el diseño
- [x] 1.2 Escribir el fichero SQL de migración (`backend/prisma/migrations/<timestamp>_add_sector_jobtype/migration.sql`) con `CREATE TABLE "Sector"` y `CREATE TABLE "JobType"`
- [x] 1.3 Aplicar la migración con `docker exec -i <postgres_container> psql -U LTIdbUser -d LTIdb` e insertar el registro en `_prisma_migrations`
- [x] 1.4 Ejecutar `npx prisma generate` desde `backend/` para regenerar el cliente Prisma

## 2. Backend — Capa de dominio

- [x] 2.1 Crear entidad `Sector` en `backend/src/domain/models/Sector.ts` con campos: `id`, `name`, `createdAt`, `updatedAt`
- [x] 2.2 Crear entidad `JobType` en `backend/src/domain/models/JobType.ts` con campos: `id`, `name`, `sectorId`, `sector?`, `createdAt`, `updatedAt`
- [x] 2.3 Crear interfaz `ISectorRepository` en `backend/src/domain/repositories/ISectorRepository.ts` con métodos: `findAll`, `findById`, `create`, `update`, `delete`, `hasJobTypes`
- [x] 2.4 Crear interfaz `IJobTypeRepository` en `backend/src/domain/repositories/IJobTypeRepository.ts` con métodos: `findAll` (con filtro opcional sectorId), `findById`, `create`, `update`, `delete`

## 3. Backend — Repositorios Prisma

- [x] 3.1 Implementar `SectorRepository` en `backend/src/infrastructure/repositories/SectorRepository.ts` usando el singleton PrismaClient; `hasJobTypes` hace `count` sobre `jobType`
- [x] 3.2 Implementar `JobTypeRepository` en `backend/src/infrastructure/repositories/JobTypeRepository.ts`; `findAll` acepta `{ sectorId?: number }` y hace `include: { sector: true }`

## 4. Backend — Servicios de aplicación

- [x] 4.1 Implementar `SectorService` en `backend/src/application/services/SectorService.ts`: `findAll`, `findById`, `create` (409 si nombre duplicado), `update` (409 si nombre duplicado), `delete` (409 si tiene JobTypes)
- [x] 4.2 Implementar `JobTypeService` en `backend/src/application/services/JobTypeService.ts`: `findAll` (con sectorId opcional), `findById`, `create` (409 si (name,sectorId) duplicado, 400 si sectorId no existe), `update`, `delete`

## 5. Backend — Controladores y rutas

- [x] 5.1 Implementar `SectorController` en `backend/src/presentation/controllers/SectorController.ts` con métodos `getAll`, `getById`, `create`, `update`, `delete`; Zod validation en create/update; status codes correctos
- [x] 5.2 Implementar `JobTypeController` en `backend/src/presentation/controllers/JobTypeController.ts` con métodos `getAll`, `getById`, `create`, `update`, `delete`; Zod validation; `?sectorId` parseado como número
- [x] 5.3 Crear `backend/src/routes/sector.routes.ts` con Swagger JSDoc: GET /sectors (authMiddleware), GET /sectors/:id, POST /sectors (roleMiddleware ADMIN), PUT /sectors/:id (roleMiddleware ADMIN), DELETE /sectors/:id (roleMiddleware ADMIN)
- [x] 5.4 Crear `backend/src/routes/jobtype.routes.ts` con Swagger JSDoc: GET /jobtypes, GET /jobtypes/:id, POST /jobtypes (ADMIN), PUT /jobtypes/:id (ADMIN), DELETE /jobtypes/:id (ADMIN)
- [x] 5.5 Registrar las nuevas rutas en `backend/src/index.ts`: `app.use('/sectors', authMiddleware, sectorRoutes)` y `app.use('/jobtypes', authMiddleware, jobtypeRoutes)`

## 6. Frontend — Tipos y servicios

- [x] 6.1 Crear `frontend/src/types/sector.types.ts` con interfaces `Sector`, `CreateSectorRequest`, `UpdateSectorRequest`
- [x] 6.2 Crear `frontend/src/types/jobtype.types.ts` con interfaces `JobType` (incluye `sector: { id, name }`), `CreateJobTypeRequest`, `UpdateJobTypeRequest`, `JobTypeFilters`
- [x] 6.3 Crear `frontend/src/services/sector.service.ts` con `getAll`, `getById`, `create`, `update`, `delete` (todos con Bearer token)
- [x] 6.4 Crear `frontend/src/services/jobtype.service.ts` con `getAll` (acepta `{ sectorId? }`), `getById`, `create`, `update`, `delete`

## 7. Frontend — Hooks

- [x] 7.1 Crear `frontend/src/hooks/useSectors.ts` con estado de tabla, filtro por nombre, y operaciones `loadSectors`, `createSector`, `updateSector`, `deleteSector`
- [x] 7.2 Crear `frontend/src/hooks/useJobTypes.ts` con estado de tabla, filtros (nombre, sectorId), y operaciones `loadJobTypes`, `createJobType`, `updateJobType`, `deleteJobType`

## 8. Frontend — Componentes y páginas

- [x] 8.1 Crear `frontend/src/components/SectorForm.tsx`: formulario con campo `name` (max 100, requerido); modo alta y edición; botones Guardar/Cancelar
- [x] 8.2 Crear `frontend/src/components/JobTypeForm.tsx`: formulario con `name` (max 100, requerido) y `sectorId` (combo cargado de GET /sectors, requerido); modo alta y edición
- [x] 8.3 Crear `frontend/src/pages/SectorsPage.tsx`: tabla con columnas Nombre/Acciones, filtro por nombre, botón "Nuevo sector", doble click abre `SectorForm` en modal, confirmación antes de borrar
- [x] 8.4 Crear `frontend/src/pages/JobTypesPage.tsx`: tabla con columnas Nombre/Sector/Acciones, filtros por nombre y sector (combo), botón "Nuevo tipo de puesto", doble click abre `JobTypeForm` en modal

## 9. Frontend — Shell (Sidebar y App.tsx)

- [x] 9.1 Actualizar `frontend/src/components/Sidebar.tsx`: añadir items "Sectores" (`/sectors`) y "Tipos de puesto" (`/jobtypes`) visibles solo si `isAdmin`
- [x] 9.2 Actualizar `frontend/src/App.tsx`: importar `SectorsPage` y `JobTypesPage`; añadir rutas `/sectors` y `/jobtypes` con `<ProtectedRoute requireAdmin>`

## 10. Tests

- [x] 10.1 Tests unitarios para `SectorService`: findAll, create (nombre duplicado → 409), delete (con JobTypes → 409, sin JobTypes → ok)
- [x] 10.2 Tests unitarios para `JobTypeService`: create ((name,sectorId) duplicado → 409, sectorId inválido → 400, happy path → 201)
- [x] 10.3 Tests de integración con Supertest para `GET /sectors` y `POST /sectors`: happy path + 401 sin token + 403 RECRUITER
- [x] 10.4 Tests de integración con Supertest para `GET /jobtypes?sectorId=X`: happy path + 401 sin token
- [x] 10.5 Tests de componente React para `SectorsPage`: render tabla, filtro por nombre, apertura de formulario
- [x] 10.6 Tests de componente React para `JobTypesPage`: render tabla, filtro por sector
