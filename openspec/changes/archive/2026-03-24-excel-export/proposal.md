## Why

Las páginas de gestión (Candidatos, Usuarios, Sectores, Tipos de puesto) muestran tablas con datos filtrados pero no permiten exportarlos. El equipo de RRHH necesita descargar los listados para análisis offline y generación de informes.

## What Changes

- Añadir un botón "Exportar Excel" en cada página de tabla (Candidatos, Usuarios, Sectores, Tipos de puesto)
- La exportación se genera en el cliente a partir de los datos ya cargados (sin nuevo endpoint backend)
- Se exportan los datos actualmente filtrados/visibles, no todos los registros
- Biblioteca: `xlsx` (SheetJS) — pure JavaScript, sin dependencias nativas

## Capabilities

### New Capabilities

- `excel-export`: Exportar a Excel el contenido visible de cualquier tabla de gestión, con un clic en un botón "Exportar Excel"

### Modified Capabilities

## Impact

**Frontend — ficheros afectados**
- `frontend/src/utils/exportExcel.ts` — nuevo, función genérica `exportToExcel(rows, columns, filename)`
- `frontend/src/pages/CandidatesPage.tsx` — añadir botón y llamada a exportación
- `frontend/src/pages/UsersPage.tsx` — añadir botón y llamada a exportación
- `frontend/src/pages/SectorsPage.tsx` — añadir botón y llamada a exportación
- `frontend/src/pages/JobTypesPage.tsx` — añadir botón y llamada a exportación

**Backend — sin cambios**

**Schema — sin cambios**
