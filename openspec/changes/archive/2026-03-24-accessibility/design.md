## Context

La app usa React 18 + TypeScript con UnoCSS. Los componentes existentes usan HTML semántico básico pero sin ARIA. Los formularios tienen labels en algunos casos y no en otros. Las tablas no tienen `caption`. Los errores no se anuncian automáticamente.

## Goals / Non-Goals

**Goals:**
- WCAG 2.1 AA para las pantallas principales
- Navegación por teclado funcional (Tab, Shift+Tab, Enter, Escape)
- Anuncio automático de errores y estados de carga con `aria-live`

**Non-Goals:**
- Internacionalización / i18n
- Contraste de colores (UnoCSS defaults son suficientes)
- Tests automatizados de accesibilidad (jest-axe)

## Decisions

### 1. `aria-live="polite"` para mensajes de error

Zonas de error existentes ya tienen `role="alert"` en algunos sitios. Completar donde falte. `role="alert"` implica `aria-live="assertive"` — apropiado para errores críticos. Para estados de carga, usar `aria-live="polite"`.

### 2. Labels explícitos con `htmlFor` / `id`

Los inputs de filtro en las tablas no tienen `<label>` visible — tienen placeholder. Añadir `aria-label` en lugar de labels visibles para no romper el layout.

### 3. `aria-current="page"` en Sidebar

El enlace activo en el Sidebar ya tiene estilos visuales. Añadir `aria-current="page"` para lectores de pantalla.

### 4. `<caption>` en tablas

Cada tabla de gestión SHALL tener un `<caption className="sr-only">` con descripción de la tabla. UnoCSS tiene la clase `sr-only` (visually hidden).

### 5. Escape cierra formularios modales

Los formularios se muestran en el mismo contenedor (no modal overlay real), pero Escape debe llamar a `onCancel`. Añadir `useEffect` con listener de keydown en componentes de formulario.

## Risks / Trade-offs

- `aria-label` en inputs con placeholder: duplica información para usuarios sin discapacidad — aceptable, es la práctica estándar.
- `sr-only` caption: UnoCSS puede no tener esta clase por defecto; si no existe, añadir CSS inline o clase equivalente.

## Migration Plan

Solo cambios de markup HTML y atributos. Sin cambios de lógica ni tests. Deploy directo.

## Open Questions

Ninguna.
