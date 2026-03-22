# Prompt 00 — Orquestador

**Este es el prompt maestro. El orquestador lo ejecuta para coordinar toda la feature.**

---

## Feature: Añadir Candidato al Sistema

Implementa la historia de usuario "Añadir Candidato" coordinando los agentes especializados en el orden correcto.

## Orden de ejecución

```
[01-devops]  ──────────────────────────────► (primero, bloquea al backend)
[02-backend] ──────────────────────────────► (en paralelo con 03-frontend, después de 01)
[03-frontend] ─────────────────────────────► (en paralelo con 02-backend)
                    ↓ ambos terminan y sus PRs son revisadas y aprobadas
[04-tester]  ──────────────────────────────► (último, después de PRs aprobadas)
                    ↓ tests pasan
              merge de PRs backend y frontend
```

## Paso 1 — Lanza DevOps (bloqueante)

Lanza el agente DevOps con el contenido del prompt `prompts/add-candidate/01-devops.md`.
**Espera a que termine** antes de continuar — el backend necesita la migración para compilar.

## Paso 2 — Lanza Backend y Frontend en paralelo

Una vez DevOps complete, lanza **en un único mensaje** (simultáneamente):
- Agente Backend con el contenido del prompt `prompts/add-candidate/02-backend.md`
- Agente Frontend con el contenido del prompt `prompts/add-candidate/03-frontend.md`

Espera a que ambos terminen y devuelvan sus URLs de PR.

## Paso 3 — Revisa las PRs

Para cada PR recibida, usa `IAGOV_ORCHESTRATOR_TOKEN` del `.env` raíz:

```bash
# Leer token
source .env  # o leer manualmente el valor de IAGOV_ORCHESTRATOR_TOKEN

GITHUB_TOKEN=$IAGOV_ORCHESTRATOR_TOKEN gh pr view <número> --json files,additions,deletions,title,body
GITHUB_TOKEN=$IAGOV_ORCHESTRATOR_TOKEN gh pr diff <número>
```

Revisa según los criterios del `CLAUDE.md`:
- Arquitectura DDD respetada (backend)
- Sin `any`, tipos explícitos
- HTTP status codes correctos
- Sin Prisma details en respuestas
- Llamadas API en `services/` y `hooks/` (frontend)
- Al menos un test por comportamiento nuevo

**Si apruebas:**
```bash
GITHUB_TOKEN=$IAGOV_ORCHESTRATOR_TOKEN gh pr review <número> --approve
```

**Si rechazas:**
```bash
GITHUB_TOKEN=$IAGOV_ORCHESTRATOR_TOKEN gh pr review <número> --request-changes --body "<motivo detallado>"
```
Notifica al usuario qué debe corregirse. No continúes hasta que se corrija.

## Paso 4 — Lanza el Tester

Solo si ambas PRs están aprobadas. Lanza el agente Tester con el contenido del prompt `prompts/add-candidate/04-tester.md`.

## Paso 5 — Merge (solo si todos los tests pasan)

```bash
# Backend primero
GITHUB_TOKEN=$IAGOV_ORCHESTRATOR_TOKEN gh pr merge <número-backend> --squash --delete-branch

# Luego frontend
GITHUB_TOKEN=$IAGOV_ORCHESTRATOR_TOKEN gh pr merge <número-frontend> --squash --delete-branch
```

**Si algún test falla: NO hagas merge.** Reporta al usuario el detalle exacto del fallo.

## Paso 6 — Resumen final

Reporta:
- PRs mergeadas (URLs y números)
- Ficheros creados/modificados por capa
- Comandos pendientes que el usuario debe ejecutar (si los hay)
- Cobertura de tests si está disponible
