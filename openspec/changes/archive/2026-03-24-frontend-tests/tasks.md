## 1. CandidatesPage tests

- [x] 1.1 Crear `frontend/src/tests/CandidatesPage.test.tsx` con mocks de `useCandidates`, `sectorService`, `jobtypeService`, `exportToExcel` y `CandidateForm`
- [x] 1.2 Test: muestra "Cargando..." cuando `isLoading: true`
- [x] 1.3 Test: muestra candidatos en tabla cuando `isLoading: false` y hay datos
- [x] 1.4 Test: muestra "No hay candidatos" cuando lista vacía
- [x] 1.5 Test: botón "Nuevo candidato" renderiza `CandidateForm`
- [x] 1.6 Test: botón "Exportar Excel" llama a `exportToExcel`

## 2. DashboardPage tests

- [x] 2.1 Crear `frontend/src/tests/DashboardPage.test.tsx` con mock de `getDashboardStats` y `useAuth`
- [x] 2.2 Test: muestra "Cargando..." mientras la Promise está pendiente
- [x] 2.3 Test: muestra tres paneles con datos cuando la Promise resuelve
- [x] 2.4 Test: muestra mensaje de error cuando la Promise rechaza
- [x] 2.5 Test: no falla con arrays vacíos (tablas sin filas)

## 3. Verificar suite completa

- [x] 3.1 Ejecutar `npm test -- --watchAll=false` en `frontend/` y verificar que todos los tests pasan
