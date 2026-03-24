## 1. Instalar dependencia

- [x] 1.1 Ejecutar `npm install xlsx` en `frontend/` y verificar que aparece en `package.json`

## 2. Utilidad genérica

- [x] 2.1 Crear `frontend/src/utils/exportExcel.ts` con función `exportToExcel(rows: Record<string, unknown>[], columns: { header: string; key: string }[], filename: string): void` usando SheetJS (`xlsx`)
- [x] 2.2 La función SHALL añadir la fecha actual (`YYYY-MM-DD`) al nombre del archivo antes de la extensión

## 3. CandidatesPage

- [x] 3.1 Añadir botón "Exportar Excel" junto al botón "Nuevo candidato"
- [x] 3.2 Al pulsar, llamar a `exportToExcel` con los candidatos filtrados (`filteredCandidates`) y columnas: Nombre, Apellido, Email, Teléfono, Provincia, Municipio, Sector, Tipo de Puesto

## 4. UsersPage

- [x] 4.1 Añadir botón "Exportar Excel" en UsersPage
- [x] 4.2 Al pulsar, exportar usuarios filtrados con columnas: Login, Nombre, Apellidos, Email, Rol

## 5. SectorsPage

- [x] 5.1 Añadir botón "Exportar Excel" en SectorsPage
- [x] 5.2 Al pulsar, exportar sectores filtrados con columna: Nombre

## 6. JobTypesPage

- [x] 6.1 Añadir botón "Exportar Excel" en JobTypesPage
- [x] 6.2 Al pulsar, exportar tipos de puesto filtrados con columnas: Nombre, Sector

## 7. Verificación TypeScript

- [x] 7.1 Ejecutar `npx tsc --noEmit` en `frontend/` y resolver errores de tipos
