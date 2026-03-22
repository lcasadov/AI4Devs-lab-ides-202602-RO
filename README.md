# LTI - Talent Tracking System (ATS)

Full-stack ATS application with a React frontend, Express backend, Prisma ORM and PostgreSQL. Developed with an AI-orchestrated multi-agent workflow.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript 4.9 (port 3000) |
| Backend | Express 4 + TypeScript 4.9 (port 3010) |
| ORM | Prisma 5 |
| Database | PostgreSQL (Docker, port 5432) |
| Testing | Jest + Supertest (backend), Jest + RTL (frontend) |
| API Docs | Swagger (`/api-docs`) |

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── domain/           # Entities and interfaces (no external deps)
│   │   ├── application/      # Services (business logic)
│   │   ├── infrastructure/   # Prisma repositories
│   │   ├── presentation/     # Express controllers
│   │   ├── routes/           # Express Router + Swagger JSDoc
│   │   └── tests/            # Jest + Supertest tests
│   └── prisma/               # Schema and migrations
├── frontend/
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── pages/            # Route-level components
│       ├── hooks/            # Custom React hooks
│       ├── services/         # API call functions
│       ├── types/            # Shared TypeScript interfaces
│       └── tests/            # Jest + RTL tests
├── openspec/                 # Feature specs and design docs
├── prompts/                  # Ordered prompts for AI-orchestrated implementation
│   ├── setup/                # Project setup prompts (start here)
│   └── add-candidate/        # Feature implementation prompts
└── CLAUDE.md                 # Orchestrator configuration for Claude Code
```

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [GitHub CLI](https://cli.github.com/) (only for the AI agent workflow)

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/AI4Devs-lab-ides-202602-RO.git
cd AI4Devs-lab-ides-202602-RO

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

Create `backend/.env`:
```env
DB_PASSWORD=<password_from_docker_compose>
DB_USER=LTIdbUser
DB_NAME=LTIdb
DB_PORT=5432
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"
```

### 3. Start the database

```bash
docker-compose up -d
```

Verify it's running:
```bash
docker-compose ps   # db should show as "Up"
```

### 4. Apply database migrations

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 5. Start the application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3010 |
| Swagger docs | http://localhost:3010/api-docs |

---

## Running Tests

```bash
# Backend (20 tests)
cd backend && npm test

# Frontend (12 tests)
cd frontend && npm test -- --watchAll=false
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| POST | `/candidates` | Create candidate (multipart/form-data) |
| GET | `/candidates` | List all candidates |
| GET | `/candidates/:id` | Get candidate by ID |

---

## AI-Orchestrated Development

This project uses Claude Code with a multi-agent orchestration workflow:

- **Orchestrator** (Claude at root) — breaks down features, coordinates agents, reviews and merges PRs
- **Backend Agent** — implements Express/Prisma/DDD layers, opens PRs
- **Frontend Agent** — implements React components/hooks/services, opens PRs
- **DevOps Agent** — manages Docker, migrations, environment config
- **Tester Agent** — writes and runs Jest/Supertest/RTL tests

### Using the orchestrator

```
implementa la feature <name> siguiendo prompts/<name>/00-orchestrator.md
```

See `prompts/setup/` for full setup instructions for the agent workflow.

---

## Setup Guides

Detailed step-by-step prompts in `prompts/setup/`:

| File | Content |
|------|---------|
| `01-docker.md` | Docker setup and troubleshooting |
| `02-dependencies.md` | Install dependencies and env vars |
| `03-database.md` | Apply migrations, explore with Prisma Studio |
| `04-run.md` | Start the application and run tests |
| `05-github-agents.md` | Configure GitHub agent accounts for the PR workflow |

---

## Stopping the application

```bash
# Stop Docker database
docker-compose down
```
