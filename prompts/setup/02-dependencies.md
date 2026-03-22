# Prompt 02 — Instalar Dependencias

**Ejecutar después de clonar el repositorio.**

---

Instala todas las dependencias del proyecto LTI (frontend y backend).

## Pasos

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Variables de entorno

Crea el fichero `backend/.env` con el siguiente contenido (ajusta la password al valor de `POSTGRES_PASSWORD` en `docker-compose.yml`):

```env
DB_PASSWORD=<password_del_docker_compose>
DB_USER=LTIdbUser
DB_NAME=LTIdb
DB_PORT=5432
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"
```

Crea el fichero `.env` en la raíz del proyecto para los tokens de GitHub de los agentes:

```env
IAGOV_AGENT_TOKEN=<token_de_la_cuenta_agente>
IAGOV_ORCHESTRATOR_TOKEN=<token_de_la_cuenta_orquestador>
```

> Los tokens necesitan scope `repo` completo y las cuentas deben ser colaboradoras del repositorio.
