## Context

La aplicación LTI ATS tenía estilos implementados con clases Tailwind/UnoCSS. El sistema generaba dependencias de build no triviales y la identidad visual no era coherente con la imagen de producto deseada (dark sidebar, cabecera azul plana, sin logo). Los cambios de estilo afectan exclusivamente al frontend; el backend solo se toca en el seed.

## Goals / Non-Goals

**Goals:**
- Establecer un sistema visual consistente basado en inline styles (sin framework CSS en runtime)
- Introducir una identidad de marca (logo SVG, paleta azul/blanco, tipografía Inter)
- Mejorar la estructura de routing para que `/login` no muestre chrome de la aplicación
- Poblar la BD con un catálogo representativo de sectores/tipos de puesto para demos

**Non-Goals:**
- Cambiar ningún contrato de API ni modelo de datos
- Implementar un sistema de theming dinámico (dark mode, tokens CSS variables)
- Migrar a un design system externo (MUI, Chakra, etc.)
- Añadir tests visuales o de regresión de UI

## Decisions

### D1: Inline styles sobre CSS-in-JS o utility classes

**Decisión**: Todos los estilos nuevos usan el objeto `React.CSSProperties` pasado directamente como `style={...}`.

**Alternativas consideradas**:
- *Tailwind/UnoCSS*: ya en uso, pero requiere purge en build y tiene fricción en SSR/test environments
- *CSS modules*: añade archivos extra por componente, overhead para cambios puramente visuales
- *Styled-components*: dependencia nueva, runtime overhead, curva de aprendizaje

**Rationale**: Los inline styles son deterministas, no requieren build step, y son más legibles en diffs pequeños. La penalización de rendimiento (no hay deduplicación de clases) es aceptable para una app de gestión interna con N usuarios reducido.

### D2: Constante `ff` para font-family compartida

**Decisión**: Cada componente que define estilos declara `const ff = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"` localmente.

**Alternativas consideradas**:
- *Context/theme provider*: overkill para una sola variable de fuente
- *CSS custom property en :root*: requeriría volver a usar CSS global

**Rationale**: Duplicación aceptable dado el alcance. Si en el futuro se necesita theming real, se extrae a un módulo `theme.ts`.

### D3: Login fuera de AppLayout

**Decisión**: En `App.tsx`, la ruta `/login` se renderiza directamente bajo `<AuthProvider>`, fuera del `<AppLayout>` que incluye Header y Sidebar.

**Antes**:
```
AuthProvider → AppLayout (Header + Sidebar) → Routes [/login, /dashboard, ...]
```

**Después**:
```
AuthProvider → Routes [
  /login → LoginPage (sin chrome),
  /* → AppLayout → Routes [/dashboard, /candidates, ...]
]
```

**Rationale**: El diseño de dos paneles del login requiere control total del viewport. Mantener la ruta dentro de AppLayout con condicionales (`isAuthenticated && <Header />`) era frágil y generaba flash de layout.

### D4: Seed con upsert por nombre

**Decisión**: El seed usa `upsert` (`where: { name }`, `create`, `update: {}`) para ser idempotente — ejecutarlo múltiples veces no duplica datos.

**Rationale**: Permite re-ejecutar el seed en entornos de desarrollo sin limpiar la BD.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|-----------|
| Inline styles no son responsive sin media queries en JS | La app es de gestión interna; se asume desktop. Añadir `window.innerWidth` listeners si se pide responsividad |
| Tests existentes que buscan clases CSS fallarán | Revisar tests que usen `getByClassName`; reemplazar por `getByRole`/`getByText` |
| Font Inter cargada desde sistema/CDN (no bundled) | Fallback a `-apple-system` garantiza tipografía aceptable sin red |
| Seed idempotente pero lento en BD grande | Aceptable; seed solo se ejecuta en dev/staging |

## Migration Plan

1. Los cambios ya están en el working tree — no hay pasos de migración de datos
2. No se requiere `npx prisma migrate dev` (sin cambios de schema)
3. Para aplicar el seed: `cd backend && npx prisma db seed`
4. Rollback: `git checkout` de los archivos modificados (cambio puramente visual, reversible)
