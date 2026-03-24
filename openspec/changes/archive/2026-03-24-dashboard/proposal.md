## Why

La aplicación tiene un menú Dashboard visible para todos los roles, pero la página está vacía. Con candidatos ya gestionados y enriquecidos con provincia, municipio y tipo de puesto, es el momento de mostrar métricas de distribución que ayuden al equipo de RRHH a entender el pool de talento de un vistazo.

## What Changes

- Nuevo endpoint `GET /dashboard/stats` que devuelve conteos agrupados de candidatos por tipo de puesto, provincia y municipio
- Actualizar `DashboardPage` con tres paneles de estadísticas: por tipo de puesto, por provincia y por municipio
- Nuevo `dashboard.service.ts` en el frontend para llamar al endpoint

## Capabilities

### New Capabilities

- `dashboard-stats`: Estadísticas de candidatos agrupadas por tipo de puesto, provincia y municipio, servidas por un endpoint REST y visualizadas en la página Dashboard

### Modified Capabilities

## Impact

**Backend — ficheros afectados**
- `backend/src/domain/models/Dashboard.ts` — nuevo, interfaces DashboardStats
- `backend/src/domain/repositories/IDashboardRepository.ts` — nuevo, interfaz del repositorio
- `backend/src/infrastructure/repositories/DashboardRepository.ts` — nuevo, queries Prisma groupBy
- `backend/src/application/services/DashboardService.ts` — nuevo, lógica de negocio
- `backend/src/presentation/controllers/DashboardController.ts` — nuevo, handler GET /dashboard/stats
- `backend/src/routes/dashboard.routes.ts` — nuevo, ruta con Swagger JSDoc
- `backend/src/index.ts` — registrar ruta /dashboard

**Frontend — ficheros afectados**
- `frontend/src/services/dashboard.service.ts` — nuevo
- `frontend/src/pages/DashboardPage.tsx` — actualizar con los tres paneles

**Sin cambios de schema** — usa los campos ya existentes en Candidate (province, municipality, jobTypeId/jobType).
