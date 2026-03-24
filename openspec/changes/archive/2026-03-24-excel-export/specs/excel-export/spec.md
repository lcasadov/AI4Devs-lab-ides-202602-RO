## ADDED Requirements

### Requirement: Exportar candidatos a Excel
`CandidatesPage` SHALL mostrar un botón "Exportar Excel" que al pulsarlo descargue un archivo `.xlsx` con los candidatos actualmente filtrados.

#### Scenario: Exportar candidatos filtrados
- **WHEN** el usuario pulsa "Exportar Excel" en CandidatesPage
- **THEN** se descarga un archivo `candidatos-YYYY-MM-DD.xlsx` con columnas: Nombre, Apellido, Email, Teléfono, Provincia, Municipio, Sector, Tipo de Puesto

#### Scenario: Exportar con filtros activos
- **WHEN** el usuario tiene filtros aplicados y pulsa "Exportar Excel"
- **THEN** el archivo contiene solo los registros visibles en la tabla (post-filtro)

#### Scenario: Exportar lista vacía
- **WHEN** no hay candidatos que coincidan con los filtros y el usuario pulsa "Exportar Excel"
- **THEN** se descarga un archivo `.xlsx` con cabeceras pero sin filas de datos

### Requirement: Exportar usuarios a Excel
`UsersPage` SHALL mostrar un botón "Exportar Excel" que descargue los usuarios visibles.

#### Scenario: Exportar usuarios
- **WHEN** el usuario pulsa "Exportar Excel" en UsersPage
- **THEN** se descarga `usuarios-YYYY-MM-DD.xlsx` con columnas: Login, Nombre, Apellidos, Email, Rol

### Requirement: Exportar sectores a Excel
`SectorsPage` SHALL mostrar un botón "Exportar Excel" que descargue los sectores visibles.

#### Scenario: Exportar sectores
- **WHEN** el usuario pulsa "Exportar Excel" en SectorsPage
- **THEN** se descarga `sectores-YYYY-MM-DD.xlsx` con columna: Nombre

### Requirement: Exportar tipos de puesto a Excel
`JobTypesPage` SHALL mostrar un botón "Exportar Excel" que descargue los tipos de puesto visibles.

#### Scenario: Exportar tipos de puesto
- **WHEN** el usuario pulsa "Exportar Excel" en JobTypesPage
- **THEN** se descarga `tipos-puesto-YYYY-MM-DD.xlsx` con columnas: Nombre, Sector

### Requirement: Utilidad genérica de exportación
`frontend/src/utils/exportExcel.ts` SHALL exportar una función `exportToExcel(rows, columns, filename)` que genere y descargue un archivo `.xlsx`.

#### Scenario: Genera archivo con datos y cabeceras
- **WHEN** se llama con filas y columnas definidas
- **THEN** el archivo `.xlsx` contiene una hoja con la primera fila como cabeceras y las siguientes filas con los datos

#### Scenario: Nombre de archivo con fecha
- **WHEN** se llama con `filename = "candidatos"`
- **THEN** el archivo descargado se llama `candidatos-YYYY-MM-DD.xlsx` donde YYYY-MM-DD es la fecha actual
