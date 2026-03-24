## Why

La aplicación usaba clases Tailwind/UnoCSS que generaban inconsistencias visuales entre entornos y no reflejaban la identidad de producto deseada. Se rediseña la UI con un sistema visual cohesionado (light theme, tipografía Inter, logo propio) para mejorar la percepción profesional del ATS y facilitar el mantenimiento de estilos.

Adicionalmente, el seed de la base de datos carecía de datos representativos, dificultando las demos y el onboarding.

## What Changes

- **Header**: rediseño completo — fondo blanco, logo SVG con gradiente azul + badge verde, tipografía "LTI ATS" con label muted
- **Sidebar**: panel blanco con bordes, iconos Unicode por item, indicador activo con borde azul izquierdo
- **LoginPage**: layout de dos paneles (panel branding izquierdo + formulario derecho), oculta header/sidebar
- **DashboardPage**: paneles con cabecera coloreada, total de candidatos en header, chips para conteos
- **Páginas de gestión** (CandidatesPage, UsersPage, SectorsPage, JobTypesPage): estilo de tabla uniforme con inputs filtro estilizados, hover en filas, botones de acción consistentes
- **App.tsx**: ruta `/login` movida fuera de `AppLayout` — los usuarios no autenticados no ven chrome
- **seed.ts**: catálogo completo de sectores y tipos de puesto (Tecnología, Ingeniería, Salud, Finanzas, Marketing, Educación, Derecho, RRHH, Logística, Comercial, etc.)
- Todos los estilos migrados a **inline styles** (sin dependencia de Tailwind/UnoCSS en runtime)

## Capabilities

### New Capabilities

- `ui-design`: Sistema visual de la aplicación — light theme, componentes de layout (Header, Sidebar), estilos de tablas y formularios, layout de login, seed data

### Modified Capabilities

<!-- No hay cambios en requisitos funcionales existentes; solo cambia la implementación visual -->

## Impact

- **Archivos frontend**: `src/App.tsx`, `src/components/Header.tsx`, `src/components/Sidebar.tsx`, `src/pages/LoginPage.tsx`, `src/pages/DashboardPage.tsx`, `src/pages/CandidatesPage.tsx`, `src/pages/UsersPage.tsx`, `src/pages/SectorsPage.tsx`, `src/pages/JobTypesPage.tsx`, y todos los componentes de formulario
- **Backend**: `backend/prisma/seed.ts`
- **Sin cambios de schema Prisma** (no requiere migración)
- **Sin cambios de API** (contratos backend inalterados)
- **Dependencias eliminadas**: UnoCSS ya no es necesario en runtime (inline styles)
