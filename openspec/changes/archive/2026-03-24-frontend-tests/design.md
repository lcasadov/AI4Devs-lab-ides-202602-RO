## Context

Stack de tests: Jest + React Testing Library. Patrón AAA. Los hooks se mockean a nivel de módulo. Los servicios se mockean con `jest.mock`. `useAuth` se mockea para devolver un token de prueba.

## Goals / Non-Goals

**Goals:**
- Cobertura de happy path + estados de error/carga para CandidatesPage y DashboardPage
- Sin llamadas HTTP reales — todos los datos mockeados

**Non-Goals:**
- 100% de cobertura de línea
- Tests de interacción compleja (drag & drop, etc.)

## Decisions

### CandidatesPage: mockear `useCandidates` hook

El hook es el punto de control del estado. Mockear el módulo completo con `jest.mock('../hooks/useCandidates', ...)`. También mockear `sectorService` y `jobtypeService` para los combos de filtro.

### DashboardPage: mockear `getDashboardStats` service

La página llama directamente al service. Mockear `jest.mock('../services/dashboard.service', ...)`.

### Tests a cubrir

**CandidatesPage:**
1. Muestra "Cargando..." mientras `isLoading=true`
2. Muestra candidatos en tabla cuando carga completa
3. Muestra "No hay candidatos" cuando lista vacía
4. Botón "Nuevo candidato" muestra el formulario
5. Botón "Exportar Excel" llama a exportación (mock `exportToExcel`)

**DashboardPage:**
1. Muestra "Cargando..." mientras fetch en curso
2. Muestra tres paneles con datos cuando carga completa
3. Muestra error cuando el service rechaza
4. Muestra tablas vacías cuando arrays vacíos

## Migration Plan

Solo ficheros de test nuevos. Sin impacto en código de producción.
