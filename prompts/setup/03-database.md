# Prompt 03 — Configurar Base de Datos

**Ejecutar después de levantar Docker y con las dependencias instaladas.**

---

Aplica las migraciones de Prisma y carga los datos iniciales.

## Pasos

### 1. Verifica que el contenedor Docker está corriendo
```bash
docker-compose ps
```

### 2. Aplica las migraciones

En producción/staging (aplica migraciones existentes sin cambios):
```bash
cd backend
npx prisma migrate deploy
```

En desarrollo (crea migración si hay cambios en el schema):
```bash
cd backend
npx prisma migrate dev
```

### 3. Genera el cliente Prisma
```bash
npx prisma generate
```

### 4. Verifica que las migraciones se aplicaron correctamente
```bash
npx prisma migrate status
```
Debe mostrar todas las migraciones como `Applied`.

### 5. Carga los datos iniciales (seed)
```bash
npx prisma db seed
```

El seed crea:
- **Usuario ADMIN inicial**: login `admin` / contraseña `Admin@1234`
- **10 sectores** con más de 80 tipos de puesto (Tecnología, Ingeniería, Salud, Finanzas, Marketing, Educación, Derecho, RRHH, Logística, Comercial)

> El seed es idempotente: ejecutarlo varias veces no duplica datos.

## Tablas creadas

| Tabla | Descripción |
|---|---|
| `User` | Usuarios del sistema (login, nombre, email, role: ADMIN/RECRUITER, active) |
| `Candidate` | Candidatos del ATS (datos personales, localización, educación, experiencia, CV) |
| `Sector` | Sectores laborales (nombre único) |
| `JobType` | Tipos de puesto (nombre + sector FK) |

## Explorar la base de datos (opcional)
```bash
npx prisma studio
```
Abre una interfaz web en `http://localhost:5555` para ver y editar los datos.

## Credenciales iniciales

| Campo | Valor |
|---|---|
| Login | `admin` |
| Contraseña | `Admin@1234` |
| Rol | ADMIN |
| Email | `admin@lti.com` |

> Cambia la contraseña tras el primer acceso desde el avatar en la cabecera de la aplicación.
