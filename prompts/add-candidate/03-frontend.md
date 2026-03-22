# Prompt 03 — Frontend Agent

**Ejecutar en paralelo con el prompt 02 (Backend). Son independientes.**

---

Eres el Frontend Agent del proyecto LTI (ATS). Implementa la feature "Añadir Candidato".

## Tarea

Lee primero estos ficheros:
- `frontend/src/App.tsx` — punto de entrada React actual
- `frontend/src/` — estructura de carpetas existente

Luego implementa en este orden:

### 1. Tipos (`frontend/src/types/candidate.ts`)

```ts
export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  education?: unknown;
  workExperience?: unknown;
  cvFileName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  education?: string;
  workExperience?: string;
  cv?: File;
}
```

### 2. Servicio API (`frontend/src/services/candidate.service.ts`)

- `create(dto: CreateCandidateDto): Promise<Candidate>` — usa `multipart/form-data` con `FormData` para enviar el CV
- `getAll(): Promise<Candidate[]>`
- `getById(id: number): Promise<Candidate>`
- Base URL: `http://localhost:3010`
- Lanza `Error` con mensaje descriptivo si `res.ok` es false

### 3. Hook (`frontend/src/hooks/useCreateCandidate.ts`)

Estado: `isLoading: boolean`, `error: string | null`, `success: boolean`
Método: `createCandidate(dto: CreateCandidateDto): Promise<void>`
Resetea `error` y `success` al llamar `createCandidate`.

### 4. Componente formulario (`frontend/src/components/CandidateForm.tsx`)

Props:
```ts
interface CandidateFormProps {
  onSuccess: () => void;
}
```

Campos del formulario:
- `firstName` (requerido), `lastName` (requerido), `email` (requerido, formato email)
- `phone`, `address` (opcionales)
- `education` (textarea, opcional)
- `workExperience` (textarea, opcional)
- `cv` (file input, acepta `.pdf,.docx`, opcional)

Comportamiento:
- Validación en cliente antes de submit: campos requeridos vacíos y formato email
- Muestra mensajes de error junto a cada campo inválido
- Deshabilita el botón submit mientras `isLoading` es true
- Llama a `onSuccess` cuando el candidato se crea correctamente
- Muestra error general si el servicio devuelve error (incluyendo email duplicado: "Este email ya está registrado")

### 5. Página (`frontend/src/pages/AddCandidatePage.tsx`)

- Contiene `CandidateForm`
- Cuando `onSuccess` se dispara: muestra mensaje de confirmación "Candidato añadido correctamente" y resetea el formulario o redirige

### 6. Dashboard (`frontend/src/App.tsx` o página principal)

- Añade un botón o enlace "Añadir candidato" claramente visible
- Al hacer clic navega a `AddCandidatePage` (usa routing simple o renderizado condicional si no hay React Router)

## Convenciones obligatorias

- Componentes funcionales con named exports, sin default exports
- Interface para cada props de componente
- Sin `any` — usa `unknown` y narrowing
- Nunca llames a la API directamente en un componente — usa `services/` y `hooks/`
- Prefijo `is`/`has` para booleanos, `handle` para event handlers
- Un componente por fichero, `PascalCase` para ficheros de componentes

## Al terminar

- Crea rama `feat/frontend-add-candidate`
- Commit con mensaje `feat: add candidate creation form`
- Lee el token del fichero `.env` en la raíz del proyecto: variable `IAGOV_AGENT_TOKEN`
- Abre PR contra `main`: `GITHUB_TOKEN=$IAGOV_AGENT_TOKEN gh pr create --title "[Frontend] Add candidate creation form" --body "..."`
- Devuelve la URL de la PR

## Contexto del proyecto
- React 18 + TypeScript 4.9, puerto 3000
- Backend API en `http://localhost:3010`
- Tests: Jest + React Testing Library
