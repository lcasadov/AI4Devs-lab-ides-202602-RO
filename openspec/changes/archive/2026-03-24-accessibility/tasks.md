## 1. Sidebar

- [x] 1.1 Envolver el `<ul>` del Sidebar en `<nav aria-label="Menú principal">`
- [x] 1.2 Añadir `aria-current="page"` al enlace activo (basado en `location.pathname`)

## 2. Tablas — inputs de filtro

- [x] 2.1 Añadir `aria-label` descriptivo a cada input de filtro en CandidatesPage (ej. `aria-label="Filtrar por nombre"`)
- [x] 2.2 Mismo en UsersPage (Login, Nombre, Apellidos, Email, Rol)
- [x] 2.3 Mismo en SectorsPage (Nombre)
- [x] 2.4 Mismo en JobTypesPage (Nombre, Sector)

## 3. Tablas — captions

- [x] 3.1 Añadir `<caption className="sr-only">Tabla de candidatos</caption>` en CandidatesPage
- [x] 3.2 Mismo en UsersPage (`Tabla de usuarios`)
- [x] 3.3 Mismo en SectorsPage (`Tabla de sectores`)
- [x] 3.4 Mismo en JobTypesPage (`Tabla de tipos de puesto`)

## 4. Estados de error y carga

- [x] 4.1 Verificar que todos los divs de error tienen `role="alert"` (ya existe en algunos; completar donde falte)
- [x] 4.2 Añadir `role="status"` o `aria-live="polite"` a los textos "Cargando..." en todas las páginas

## 5. Dashboard panels

- [x] 5.1 Añadir `aria-label` descriptivo al `<div>` de cada panel en DashboardPage (ej. `aria-label="Candidatos por tipo de puesto"`)

## 6. Escape en formularios

- [x] 6.1 Añadir `useEffect` con listener de `keydown` en `CandidateForm` para cerrar con Escape
- [x] 6.2 Mismo en `UserForm`
- [x] 6.3 Mismo en `SectorForm`
- [x] 6.4 Mismo en `JobTypeForm`

## 7. Verificación TypeScript

- [x] 7.1 Ejecutar `npx tsc --noEmit` en `frontend/` y resolver errores nuevos
