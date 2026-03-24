## ADDED Requirements

### Requirement: CandidatesPage has unit tests
`frontend/src/tests/CandidatesPage.test.tsx` SHALL cubrir los comportamientos principales de la página.

#### Scenario: Shows loading state
- **WHEN** `useCandidates` devuelve `isLoading: true`
- **THEN** la página muestra "Cargando..."

#### Scenario: Shows candidates in table
- **WHEN** `useCandidates` devuelve una lista de candidatos
- **THEN** la página renderiza una fila por candidato con nombre, apellido y email visibles

#### Scenario: Shows empty state
- **WHEN** `useCandidates` devuelve lista vacía y `isLoading: false`
- **THEN** la página muestra "No hay candidatos"

#### Scenario: New candidate button shows form
- **WHEN** el usuario pulsa el botón "Nuevo candidato"
- **THEN** se renderiza el componente `CandidateForm`

#### Scenario: Export Excel button triggers export
- **WHEN** el usuario pulsa el botón "Exportar Excel"
- **THEN** se llama a `exportToExcel` con los candidatos visibles

### Requirement: DashboardPage has unit tests
`frontend/src/tests/DashboardPage.test.tsx` SHALL cubrir los comportamientos principales de la página.

#### Scenario: Shows loading state during fetch
- **WHEN** `getDashboardStats` está en curso (Promise pendiente)
- **THEN** la página muestra "Cargando..."

#### Scenario: Shows three panels with data
- **WHEN** `getDashboardStats` resuelve con datos
- **THEN** la página muestra tres paneles con los datos de byJobType, byProvince y byMunicipality

#### Scenario: Shows error message on failure
- **WHEN** `getDashboardStats` rechaza con un error
- **THEN** la página muestra un mensaje de error

#### Scenario: Shows empty tables when arrays are empty
- **WHEN** `getDashboardStats` resuelve con arrays vacíos
- **THEN** los tres paneles se renderizan sin filas de datos (sin crash)
