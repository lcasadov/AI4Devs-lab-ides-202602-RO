## 1. Base de datos y DevOps

- [ ] 1.1 Añadir modelo `Candidate` a `backend/prisma/schema.prisma` con campos: id, firstName, lastName, email (unique), phone, address, education (Json), workExperience (Json), cvFileName, createdAt, updatedAt
- [ ] 1.2 Ejecutar `npx prisma migrate dev --name add_candidate_table` y verificar que la migración se aplica correctamente
- [ ] 1.3 Ejecutar `npx prisma generate` y verificar que el cliente Prisma se regenera sin errores
- [ ] 1.4 Instalar dependencia `multer` y `@types/multer` en el backend para gestión de carga de ficheros
- [ ] 1.5 Crear carpeta `backend/uploads/` y añadirla a `.gitignore`

## 2. Backend — Dominio

- [ ] 2.1 Crear interfaz `Candidate` y `CreateCandidateDto` en `backend/src/domain/models/candidate.ts`
- [ ] 2.2 Crear interfaz `ICandidateRepository` en `backend/src/domain/repositories/candidate.repository.interface.ts`

## 3. Backend — Infraestructura

- [ ] 3.1 Crear singleton `PrismaClient` en `backend/src/infrastructure/database/prisma-client.ts`
- [ ] 3.2 Implementar `CandidateRepository` en `backend/src/infrastructure/repositories/candidate.repository.ts` con métodos: `create`, `findAll`, `findById`, `findByEmail`

## 4. Backend — Aplicación

- [ ] 4.1 Implementar `CandidateService` en `backend/src/application/services/candidate.service.ts` con métodos: `create`, `getAll`, `getById`
- [ ] 4.2 Añadir validación de email único en `CandidateService.create` (lanzar error si ya existe)
- [ ] 4.3 Añadir validación de tipo y tamaño de fichero CV en el servicio (PDF/DOCX, máx 5 MB)

## 5. Backend — Presentación y rutas

- [ ] 5.1 Implementar `CandidateController` en `backend/src/presentation/controllers/candidate.controller.ts` con métodos: `create`, `getAll`, `getById`
- [ ] 5.2 Configurar `multer` en el controlador para gestión de carga de CV (diskStorage en `uploads/`, validación de tipo MIME y tamaño)
- [ ] 5.3 Crear `backend/src/routes/candidate.routes.ts` con rutas: `POST /candidates`, `GET /candidates`, `GET /candidates/:id` e inyectar dependencias
- [ ] 5.4 Añadir anotaciones Swagger JSDoc a todas las rutas (request body, responses, schemas de `CreateCandidateDto` y `Candidate`)
- [ ] 5.5 Registrar las rutas de candidatos en `backend/src/index.ts`

## 6. Backend — Tests

- [ ] 6.1 Escribir tests de integración para `POST /candidates` en `backend/src/tests/candidates.test.ts`: happy path (201), validación (400), email duplicado (409), error de servidor (500)
- [ ] 6.2 Escribir tests de integración para `GET /candidates` y `GET /candidates/:id`: lista (200), vacío (200), no encontrado (404)
- [ ] 6.3 Escribir tests unitarios para `CandidateService`: crear candidato, email duplicado, validación de fichero inválido

## 7. Frontend — Tipos y servicios

- [ ] 7.1 Crear interfaces TypeScript en `frontend/src/types/candidate.ts`: `Candidate`, `CreateCandidateDto`
- [ ] 7.2 Implementar `candidateService` en `frontend/src/services/candidate.service.ts` con métodos: `create` (multipart/form-data), `getAll`, `getById`

## 8. Frontend — Hook y componentes

- [ ] 8.1 Crear hook `useCreateCandidate` en `frontend/src/hooks/useCreateCandidate.ts` con estado: isLoading, error, success
- [ ] 8.2 Implementar `CandidateForm` en `frontend/src/components/CandidateForm.tsx` con todos los campos del formulario, validación en cliente y manejo de carga de CV
- [ ] 8.3 Implementar `AddCandidatePage` en `frontend/src/pages/AddCandidatePage.tsx` que incluya `CandidateForm` y gestione confirmación y errores
- [ ] 8.4 Añadir botón "Añadir candidato" en la página principal (`frontend/src/App.tsx` o página de dashboard) que navegue al formulario

## 9. Frontend — Tests

- [ ] 9.1 Escribir tests para `CandidateForm`: renderiza todos los campos, valida campos vacíos, valida email inválido, valida tipo de fichero, submit correcto llama al servicio
- [ ] 9.2 Escribir tests para `AddCandidatePage`: muestra confirmación tras submit exitoso, muestra error cuando el servicio falla
- [ ] 9.3 Escribir tests para `useCreateCandidate`: estado de carga, éxito, error

## 10. Verificación final

- [ ] 10.1 Verificar que `npm test` pasa en backend sin errores
- [ ] 10.2 Verificar que `npm test` pasa en frontend sin errores
- [ ] 10.3 Verificar manualmente el flujo completo: abrir dashboard → clic "Añadir candidato" → rellenar formulario → subir CV → confirmar creación
- [ ] 10.4 Verificar que Swagger docs están disponibles en `http://localhost:3010/api-docs` con el nuevo endpoint documentado
