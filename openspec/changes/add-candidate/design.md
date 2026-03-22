## Context

El sistema LTI parte desde cero. No existe ninguna entidad de dominio implementada, ninguna ruta Express ni ningún componente React. Esta feature es la primera en el sistema y establece los patrones arquitectónicos que seguirán todas las demás.

La arquitectura backend sigue DDD en capas: `domain` → `application` → `infrastructure` ← `presentation`. El frontend separa componentes, hooks, services y tipos en carpetas dedicadas.

## Goals / Non-Goals

**Goals:**
- Implementar el modelo `Candidate` completo en base de datos con Prisma
- API REST con endpoints de creación y consulta de candidatos
- Soporte de carga de CV (PDF/DOCX) via `multer`
- Formulario React con validación en cliente y servidor
- Establecer la estructura de carpetas DDD para backend y la estructura de frontend

**Non-Goals:**
- Autenticación/autorización de usuarios (fuera del alcance de esta historia)
- Edición o eliminación de candidatos
- Búsqueda o filtrado avanzado de candidatos
- Almacenamiento de ficheros en servicios cloud (S3, etc.) — se usa disco local
- Integración con portales de empleo externos

## Decisions

### 1. Arquitectura backend: DDD en capas
**Decisión:** `domain/` → `application/` → `infrastructure/` ← `presentation/`
**Alternativa considerada:** MVC plano (routes + controllers + models)
**Razón:** Establece la base para escalar el ATS sin acoplar lógica de negocio a Express o Prisma. Los servicios de aplicación son testables sin base de datos.

### 2. Carga de ficheros: multer con almacenamiento local
**Decisión:** `multer` con `diskStorage` en `backend/uploads/`
**Alternativa considerada:** almacenamiento en base de datos (blob) o S3
**Razón:** Simplicidad para el MVP. La ruta de fichero se guarda en BD (`cvFileName`). Migrar a S3 en el futuro solo requiere cambiar el storage de multer sin tocar el dominio.

### 3. Validación: express-validator en el controlador + validación de dominio en el servicio
**Decisión:** validación de formato (email, campos obligatorios) en el controlador antes de llegar al servicio; validación de reglas de negocio en el servicio
**Razón:** Separación de responsabilidades — el controlador valida el contrato HTTP, el servicio valida las reglas del dominio.

### 4. Campos de educación y experiencia: JSON en PostgreSQL
**Decisión:** `education` y `workExperience` se almacenan como `Json` en Prisma
**Alternativa considerada:** tablas separadas `Education` y `WorkExperience` con relaciones
**Razón:** Para el MVP es suficiente y evita complejidad de joins. La historia no requiere filtrar por educación o experiencia. Se puede normalizar en una historia posterior.

### 5. Frontend: formulario controlado con estado local
**Decisión:** formulario controlado con `useState` en el componente, validación en cliente antes del submit
**Alternativa considerada:** React Hook Form o Formik
**Razón:** Evitar dependencias externas para un formulario único. Si el número de formularios crece, se puede adoptar React Hook Form en una refactorización posterior.

## Risks / Trade-offs

- **Almacenamiento local de ficheros** → Los CVs se pierden si el servidor se reinicia sin volumen persistente en Docker. _Mitigación_: documentar que `backend/uploads/` debe ser un volumen Docker en producción.
- **JSON para educación/experiencia** → Sin validación de esquema en BD. _Mitigación_: validar la estructura en el servicio de aplicación antes de persistir.
- **Sin autenticación** → Cualquiera puede llamar a la API. _Mitigación_: aceptado para el MVP; se añadirá autenticación en una historia posterior.
- **multer como nueva dependencia** → Aumenta la superficie de ataque para upload de ficheros maliciosos. _Mitigación_: validar tipo MIME y extensión en el controlador, limitar tamaño máximo.

## Migration Plan

1. Añadir modelo `Candidate` a `backend/prisma/schema.prisma`
2. Ejecutar `npx prisma migrate dev --name add_candidate_table`
3. Ejecutar `npx prisma generate`
4. Implementar capas backend en orden: domain → infrastructure → application → presentation → routes
5. Implementar frontend: types → services → hooks → components → pages
6. Reiniciar servidor backend (`npm run dev`)

**Rollback:** `npx prisma migrate dev` crea una migración reversible. En caso de rollback, ejecutar `npx prisma migrate reset` (solo en desarrollo) o revertir la migración manualmente.

## Open Questions

- ¿Dónde se mostrará el botón "Añadir candidato" en el dashboard? Por ahora se asume una página principal en `/` con un botón visible. _Decisión pendiente del diseño visual._
- ¿Tamaño máximo del CV? Se asume 5 MB por defecto.
