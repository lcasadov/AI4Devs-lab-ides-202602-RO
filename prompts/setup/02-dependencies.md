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

Crea el fichero `backend/.env` con el siguiente contenido (ajusta los valores según tu entorno):

```env
# Base de datos
DB_PASSWORD=<password_del_docker_compose>
DB_USER=LTIdbUser
DB_NAME=LTIdb
DB_PORT=5432
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"

# Autenticación JWT
JWT_SECRET=<cadena_secreta_aleatoria_min_32_chars>
JWT_EXPIRES_IN=8h

# Email (Ethereal Mail para desarrollo)
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=emmanuelle13@ethereal.email
EMAIL_PASS=Pr7UPV5zUFDP3SSxDr
EMAIL_FROM="LTI ATS <emmanuelle13@ethereal.email>"
```

Crea el fichero `.env` en la raíz del proyecto para los tokens de GitHub de los agentes:

```env
IAGOV_AGENT_TOKEN=<token_de_la_cuenta_agente>
IAGOV_ORCHESTRATOR_TOKEN=<token_de_la_cuenta_orquestador>
```

> Los tokens necesitan scope `repo` completo y las cuentas deben ser colaboradoras del repositorio.
