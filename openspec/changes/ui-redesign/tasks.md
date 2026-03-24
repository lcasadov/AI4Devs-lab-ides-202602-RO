## 1. App Shell — Routing y Layout

- [ ] 1.1 Mover la ruta `/login` fuera de `AppLayout` en `frontend/src/App.tsx` para que los usuarios no autenticados no vean header ni sidebar
- [ ] 1.2 Eliminar los condicionales `isAuthenticated && <Header />` y `isAuthenticated && <Sidebar />` del `AppLayout`
- [ ] 1.3 Actualizar los estilos de `main` en `AppLayout` para usar inline styles (marginLeft, marginTop, minHeight)

## 2. Header — Rediseño visual

- [ ] 2.1 Reemplazar la cabecera azul (`bg-blue-600`) por una barra blanca con borde inferior (`#e2e8f0`) de 56px de altura
- [ ] 2.2 Añadir logo SVG con gradiente azul (`#1e40af` → `#2563eb`), silueta de persona y badge verde de verificación
- [ ] 2.3 Añadir texto "LTI **ATS**" con label muted "Gestión de Candidatos"
- [ ] 2.4 Migrar el dropdown de usuario y el modal de cambio de contraseña a inline styles

## 3. Sidebar — Rediseño visual

- [ ] 3.1 Reemplazar el sidebar oscuro (`bg-gray-900`) por panel blanco con borde derecho (`#e2e8f0`) de 240px
- [ ] 3.2 Añadir icono Unicode a cada ítem de navegación (definido en el array `NAV_ITEMS`)
- [ ] 3.3 Implementar indicador de ítem activo con borde izquierdo azul (`#2563eb`) y fondo `#eff6ff`
- [ ] 3.4 Añadir footer del sidebar con versión o información de la app

## 4. LoginPage — Layout de dos paneles

- [ ] 4.1 Reemplazar el layout centrado de una columna por un layout `display: flex` de dos paneles
- [ ] 4.2 Panel izquierdo: fondo degradado azul, logo SVG, nombre de app y lista de características
- [ ] 4.3 Panel derecho: formulario login centrado verticalmente con estilos inline (inputs, botón, link)
- [ ] 4.4 Actualizar el mensaje de error de login para mayor claridad

## 5. DashboardPage — Paneles coloreados

- [ ] 5.1 Añadir prop `icon` y `color` al componente `StatsPanel`
- [ ] 5.2 Renderizar cabecera coloreada en cada panel con emoji icon, título y contador total
- [ ] 5.3 Mostrar los conteos como badge chips (fondo `#f1f5f9`, border-radius 12px)
- [ ] 5.4 Mostrar "Sin datos" cuando el array está vacío (en lugar de tabla sin filas)
- [ ] 5.5 Aplicar inline styles al layout de grid de paneles

## 6. Páginas de gestión — Tablas uniformes

- [ ] 6.1 Migrar `CandidatesPage.tsx` a inline styles: toolbar, filtros, tabla, filas con hover `#f8fafc`
- [ ] 6.2 Migrar `UsersPage.tsx` a inline styles con el mismo patrón
- [ ] 6.3 Migrar `SectorsPage.tsx` a inline styles con el mismo patrón
- [ ] 6.4 Migrar `JobTypesPage.tsx` a inline styles con el mismo patrón

## 7. Formularios — Inline styles

- [ ] 7.1 Migrar `CandidateForm.tsx` a inline styles (campos, secciones education/experience, botones)
- [ ] 7.2 Migrar `UserForm.tsx` a inline styles
- [ ] 7.3 Migrar `SectorForm.tsx` a inline styles
- [ ] 7.4 Migrar `JobTypeForm.tsx` a inline styles
- [ ] 7.5 Migrar `ChangePasswordModal.tsx` a inline styles

## 8. Backend — Seed data

- [ ] 8.1 Ampliar `backend/prisma/seed.ts` con catálogo completo: Tecnología (13 puestos), Ingeniería (9), Salud, Finanzas, Marketing, Educación, Derecho, RRHH, Logística, Comercial
- [ ] 8.2 Usar `upsert` por nombre para garantizar idempotencia
- [ ] 8.3 Verificar que el seed crea el usuario ADMIN inicial y todos los sectores/tipos sin errores

## 9. Verificación y commit

- [ ] 9.1 Ejecutar `npm test` en frontend — verificar que todos los tests existentes pasan con el nuevo markup
- [ ] 9.2 Ejecutar `npm run build` en frontend — verificar sin errores TypeScript
- [ ] 9.3 Verificar visualmente en el navegador: login, dashboard, candidatos, usuarios, sectores, tipos de puesto
- [ ] 9.4 Commitear los cambios con mensaje `feat(frontend): UI redesign — light theme, inline styles, two-panel login`
