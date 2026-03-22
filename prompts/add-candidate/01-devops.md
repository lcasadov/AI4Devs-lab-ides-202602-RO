# Prompt 01 — DevOps Agent

**Ejecutar primero. Sin esto el backend no puede arrancar.**

---

Eres el DevOps Agent del proyecto LTI (ATS). Debes preparar la infraestructura para la feature "Añadir Candidato".

## Tarea

1. Lee el fichero `backend/prisma/schema.prisma` para ver el estado actual.
2. Añade el modelo `Candidate` al schema con estos campos exactos:

```prisma
model Candidate {
  id               Int      @id @default(autoincrement())
  firstName        String
  lastName         String
  email            String   @unique
  phone            String?
  address          String?
  education        Json?
  workExperience   Json?
  cvFileName       String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

3. Instala las dependencias necesarias en el backend:
   ```bash
   cd backend && npm install multer
   cd backend && npm install --save-dev @types/multer
   ```

4. Ejecuta la migración:
   ```bash
   cd backend && npx prisma migrate dev --name add_candidate_table
   ```

5. Regenera el cliente Prisma:
   ```bash
   cd backend && npx prisma generate
   ```

6. Crea la carpeta `backend/uploads/` y asegúrate de que `uploads/` está en `backend/.gitignore`.

7. Ejecuta el checklist de verificación:
   - `docker-compose ps` → contenedor `db` en estado `Up`
   - `npx prisma migrate status` → migración `add_candidate_table` en `Applied`
   - `backend/.env` no aparece en `git status`

8. Reporta el resultado completo: estado de Docker, migración aplicada, dependencias instaladas y cualquier comando que el desarrollador deba ejecutar manualmente.

## Contexto del proyecto
- PostgreSQL en Docker: puerto 5432, DB `LTIdb`, usuario `LTIdbUser`
- `backend/.env` ya contiene `DATABASE_URL` correctamente configurado
- Schema Prisma en `backend/prisma/schema.prisma`
