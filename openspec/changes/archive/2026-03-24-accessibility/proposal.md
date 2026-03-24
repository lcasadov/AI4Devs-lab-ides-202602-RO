## Why

La aplicación funciona visualmente pero carece de atributos ARIA y semántica HTML completa. Esto impide a usuarios con lectores de pantalla navegar correctamente y no cumple las pautas básicas de accesibilidad (WCAG 2.1 AA).

## What Changes

- Añadir `aria-label`, `aria-live`, `role` y atributos semánticos a los componentes principales
- Asegurar navegación por teclado correcta (focus visible, orden lógico, Escape cierra modales)
- Añadir `<label>` explícitos o `aria-label` a todos los inputs sin etiqueta visible asociada
- Mensajes de error con `role="alert"` y `aria-live="polite"` para anuncio automático

## Capabilities

### New Capabilities

### Modified Capabilities

- `app-shell`: navegación principal con `role="navigation"`, `aria-current="page"` en enlace activo
- `candidate-management`: formulario con labels asociados, errores con role=alert, tabla con caption
- `dashboard-stats`: paneles con `aria-label` descriptivo

## Impact

**Frontend — ficheros afectados**
- `frontend/src/components/Sidebar.tsx` — `<nav>` semántico, `aria-current`, `aria-label`
- `frontend/src/components/CandidateForm.tsx` — labels asociados a inputs, `role="alert"` en errores
- `frontend/src/pages/CandidatesPage.tsx` — `<caption>` en tabla, `aria-label` en botones de acción
- `frontend/src/pages/UsersPage.tsx` — mismo patrón
- `frontend/src/pages/SectorsPage.tsx` — mismo patrón
- `frontend/src/pages/JobTypesPage.tsx` — mismo patrón
- `frontend/src/pages/DashboardPage.tsx` — `aria-label` en paneles de estadísticas
- `frontend/src/pages/LoginPage.tsx` — verificar labels, errores con role=alert

**Backend — sin cambios**
