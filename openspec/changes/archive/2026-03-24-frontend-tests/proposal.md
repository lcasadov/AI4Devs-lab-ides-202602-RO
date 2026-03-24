## Why

Faltan tests para `CandidatesPage` (la página principal de candidatos, no el formulario) y `DashboardPage`. El resto de páginas ya tienen cobertura básica. Sin tests de estas páginas, los regresiones en la lógica de filtrado o en la carga de datos del dashboard pasarían desapercibidos.

## What Changes

- Nuevo `frontend/src/tests/CandidatesPage.test.tsx` — tests de la tabla, filtros y acciones
- Nuevo `frontend/src/tests/DashboardPage.test.tsx` — tests de carga, estados loading/error/vacío y paneles

## Capabilities

### New Capabilities

### Modified Capabilities

## Impact

**Frontend — ficheros afectados**
- `frontend/src/tests/CandidatesPage.test.tsx` — nuevo
- `frontend/src/tests/DashboardPage.test.tsx` — nuevo

**Backend — sin cambios**
**Schema — sin cambios**
