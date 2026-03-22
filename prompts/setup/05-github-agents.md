# Prompt 05 — Configurar Agentes GitHub

**Ejecutar si quieres usar el flujo de PRs automático con agentes.**

---

El proyecto usa dos cuentas de GitHub para simular el flujo de trabajo con agentes:

- **`iagov-agent`** — crea las PRs (backend y frontend)
- **`orquestadoria`** — revisa, aprueba y mergea las PRs

## Pasos

### 1. Crear los tokens de GitHub

Para cada cuenta, ve a: GitHub → Settings → Developer settings → Personal access tokens → Generate new token

Scopes necesarios: `repo` (completo)

### 2. Añadir las cuentas como colaboradoras del repositorio

Ve a: `https://github.com/<tu-usuario>/<tu-repo>/settings/access`

Añade:
- `iagov-agent` con rol **Write**
- `orquestadoria` con rol **Write**

Las cuentas deben aceptar la invitación.

### 3. Configurar el `.env` raíz

```env
IAGOV_AGENT_TOKEN=ghp_xxxxxxxxxxxx
IAGOV_ORCHESTRATOR_TOKEN=ghp_xxxxxxxxxxxx
```

### 4. Instalar GitHub CLI

Descarga desde: https://cli.github.com/

Verifica la instalación:
```bash
gh --version
```

### 5. Verificar que los tokens funcionan

```bash
export $(grep -v '^#' .env | xargs)
GITHUB_TOKEN=$IAGOV_AGENT_TOKEN gh auth status
GITHUB_TOKEN=$IAGOV_ORCHESTRATOR_TOKEN gh auth status
```

Ambos deben mostrar `✓ Logged in` y `Token scopes: 'repo'`.

## Uso

Una vez configurado, puedes pedir al orquestador que implemente features completas:

```
implementa la feature add-candidate siguiendo prompts/add-candidate/00-orchestrator.md
```

El orquestador:
1. Lanza los agentes en paralelo
2. Recoge las PRs creadas por `iagov-agent`
3. Las revisa con `orquestadoria`
4. Aprueba/rechaza y mergea automáticamente si los tests pasan
