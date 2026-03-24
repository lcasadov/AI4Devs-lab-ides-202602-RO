## Context

Los cambios auth-users y sectors-jobtypes ya están en producción. El modelo `Candidate` existe pero solo tiene campos básicos y no tiene relaciones con `Sector` ni `JobType`. La página de candidatos actual (`AddCandidatePage`) solo permite crear — no listar ni editar.

Restricción conocida: Windows AppLocker bloquea `schema-engine-windows.exe`, por lo que `npx prisma migrate dev` no puede ejecutarse. Las migraciones se aplican manualmente vía `docker exec psql` y se registran en `_prisma_migrations`.

## Goals / Non-Goals

**Goals:**
- Ampliar el modelo `Candidate` con localización, FK a Sector/JobType, educación y experiencia (JSON), y cvFileName
- Extender la API REST de candidatos con los nuevos campos + endpoint de subida de CV
- Reemplazar `AddCandidatePage` por `CandidatesPage` con tabla, filtros y formulario completo
- Formulario con combos encadenados sector→tipo de puesto

**Non-Goals:**
- Vista detalle de candidato en página separada (el formulario es suficiente)
- Descarga de CV desde frontend (solo almacenamiento)
- Paginación (volumen esperado bajo)
- Validación de duplicado de email en tiempo real (solo al guardar)

## Decisions

### D1 — Extender el modelo Candidate existente (no crear nuevo)
Los campos nuevos son opcionales (nullable) para no romper datos existentes. Se añaden FKs opcionales a Sector y JobType.

**Por qué**: Mínima disrupción. Los candidatos existentes seguirán funcionando sin sector ni tipo de puesto.

### D2 — Multer para subida de CV, ficheros en `backend/uploads/`
`multer` es la solución estándar de Express para `multipart/form-data`. Los ficheros se guardan en disco con nombre `<candidateId>-<timestamp>-<originalname>`. Se limita a PDF y DOCX, max 5 MB.

**Alternativa descartada**: Base64 en JSON → demasiado payload, no escala.

### D3 — Educación y experiencia laboral como campos JSON
`education Json?` y `workExperience Json?` ya existen en el schema. Se mantiene JSON estructurado (array de objetos) en lugar de tablas relacionales.

**Por qué**: Evita tablas de detalle y migraciones adicionales. El volumen es bajo y no se necesita filtrar por campos de educación/experiencia.

### D4 — Combos encadenados sector→tipo de puesto en el frontend
Al seleccionar un sector en el formulario, se llama `GET /jobtypes?sectorId=X` para filtrar los tipos de puesto. Al seleccionar un tipo de puesto sin sector previo, se autoselecciona el sector del tipo de puesto.

**Por qué**: Coherencia con el diseño de sectors-jobtypes (C3) y los requisitos del usuario.

### D5 — CandidatesPage reemplaza AddCandidatePage
`AddCandidatePage` se elimina de las importaciones de `App.tsx`. La ruta `/candidates` carga `CandidatesPage`.

**Por qué**: `AddCandidatePage` es un formulario de solo creación que no encaja con el patrón tabla+formulario del resto del sistema.

### D6 — Migración manual (AppLocker)
Mismo patrón que auth-users y sectors-jobtypes: SQL manual + `docker exec psql` + registro en `_prisma_migrations` + `npx prisma generate`.

### D7 — Instalar multer como dependencia de producción
`npm install multer @types/multer` en el backend. No es dev-only porque se usa en runtime.

## Risks / Trade-offs

- [Ficheros huérfanos] Si se borra un candidato, el CV en `uploads/` no se elimina automáticamente → Mitigación: aceptable por ahora, se limpia manualmente o con un job periódico futuro.
- [Migración manual] Riesgo de inconsistencia si se olvida registrar en `_prisma_migrations` → Mitigación: mismo procedimiento probado en dos cambios anteriores.
- [Tamaño de uploads/] Sin límite de disco a largo plazo → Mitigación: límite de 5 MB por fichero; se puede añadir limpieza en C5 o posterior.

## Migration Plan

1. Añadir campos a `Candidate` en `schema.prisma`
2. Escribir SQL (`ALTER TABLE "Candidate" ADD COLUMN ...`) + FKs
3. Aplicar vía `docker exec -i <container> psql -U LTIdbUser -d LTIdb`
4. Insertar en `_prisma_migrations`
5. `npx prisma generate`
6. Rollback: `ALTER TABLE "Candidate" DROP COLUMN ...` — seguro, no hay datos de producción

## Open Questions

Ninguna — todas las decisiones tomadas arriba.
