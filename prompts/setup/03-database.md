# Prompt 03 — Configurar Base de Datos

**Ejecutar después de levantar Docker y con las dependencias instaladas.**

---

Aplica las migraciones de Prisma para crear las tablas en PostgreSQL.

## Pasos

1. Verifica que el contenedor Docker está corriendo:
```bash
docker-compose ps
```

2. Aplica las migraciones existentes:
```bash
cd backend
npx prisma migrate deploy
```

   Si es la primera vez y quieres modo desarrollo (crea la migración si no existe):
```bash
cd backend
npx prisma migrate dev
```

3. Genera el cliente Prisma:
```bash
npx prisma generate
```

4. Verifica que las migraciones se aplicaron correctamente:
```bash
npx prisma migrate status
```
Debe mostrar todas las migraciones como `Applied`.

## Tablas creadas
- `User` — tabla inicial del proyecto
- `Candidate` — candidatos del ATS (firstName, lastName, email, phone, address, education, workExperience, cvFileName)

## Explorar la base de datos (opcional)
```bash
npx prisma studio
```
Abre una interfaz web en `http://localhost:5555` para ver y editar los datos.
