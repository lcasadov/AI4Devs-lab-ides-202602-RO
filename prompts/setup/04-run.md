# Prompt 04 — Arrancar la Aplicación

**Ejecutar después de completar los pasos 01, 02 y 03.**

---

Arranca el backend y el frontend del proyecto LTI.

## Terminal 1 — Backend

```bash
cd backend
npm run dev
```

El servidor arranca en `http://localhost:3010`.

Endpoints disponibles:
- `GET  /` — health check → `"Hola LTI!"`
- `POST /candidates` — crear candidato (multipart/form-data)
- `GET  /candidates` — listar candidatos
- `GET  /candidates/:id` — obtener candidato por ID
- `GET  /api-docs` — documentación Swagger

## Terminal 2 — Frontend

```bash
cd frontend
npm start
```

La aplicación abre automáticamente en `http://localhost:3000`.

## Verificar que todo funciona

1. Abre `http://localhost:3000` — debe mostrarse el dashboard con el botón "Añadir candidato"
2. Abre `http://localhost:3010/api-docs` — debe mostrarse la documentación Swagger
3. Haz clic en "Añadir candidato", rellena el formulario y envíalo — debe aparecer el mensaje de confirmación

## Ejecutar tests

```bash
# Backend (20 tests)
cd backend && npm test

# Frontend (12 tests)
cd frontend && npm test -- --watchAll=false
```
