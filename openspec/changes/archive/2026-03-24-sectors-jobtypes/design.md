## Context

The auth-users change already delivered the full application shell (Header, Sidebar, ProtectedRoute, AuthContext with `isAdmin`, UnoCSS). This change adds the two simplest reference-data modules on top of that shell.

Current state: no Sector or JobType tables exist. The Prisma schema only has User and Candidate. The Sidebar has Dashboard, Candidatos, Usuarios items.

Constraints: Windows AppLocker blocks `schema-engine-windows.exe`, so `npx prisma migrate dev` cannot run. Migrations must be applied manually via `docker exec psql` and recorded in `_prisma_migrations`.

## Goals / Non-Goals

**Goals:**
- Add `Sector` and `JobType` Prisma models with FK relationship
- Deliver full CRUD REST API for both, role-protected (GET for all authenticated, mutations ADMIN only)
- Deliver SectorsPage and JobTypesPage frontend pages (ADMIN only)
- Expose `GET /jobtypes?sectorId=` filter for future use in candidate form (C4)
- Update Sidebar with new menu items visible only to ADMIN

**Non-Goals:**
- Linking Sector/JobType to Candidate (that is C4 — candidate-enhancement)
- Excel export
- Pagination (simple lists, expected small volume)

## Decisions

### D1 — Same DDD architecture as users module
Follow the same layer separation: `domain/models` → `domain/repositories` (interface) → `infrastructure/repositories` (Prisma) → `application/services` → `presentation/controllers` → `routes`.

**Why**: Consistency with the existing pattern. Reviewers and future agents already know where to look.

**Alternative considered**: Flat controllers-only approach (simpler for 2 small models). Rejected because it would create an inconsistent codebase.

### D2 — Manual SQL migration (AppLocker constraint)
Create a hand-written `migration.sql`, apply via `docker exec -i <container> psql`, then insert a row into `_prisma_migrations`. Run `npx prisma generate` (no schema engine needed) to regenerate the client.

**Why**: `schema-engine-windows.exe` is blocked by Windows AppLocker — the same constraint solved identically in auth-users.

**Alternative considered**: Run migration inside the container with `prisma migrate dev`. Rejected — same AppLocker issue applies.

### D3 — DELETE /sectors/:id returns 409 if it has JobTypes
The service layer checks `jobType count > 0` before deleting. Returns HTTP 409 Conflict with message "Sector has associated job types".

**Why**: Referential integrity at the business layer, not just at the DB level. Gives the API consumer a clear, actionable error.

**Alternative considered**: Cascade delete JobTypes automatically. Rejected — too destructive; ADMIN should be aware of the dependency.

### D4 — GET /sectors and GET /jobtypes accessible to all authenticated roles
Both GET (list + by-id) endpoints only require `authMiddleware`, not `roleMiddleware(ADMIN)`.

**Why**: The candidate form (C4) needs these endpoints to populate combos, and RECRUITERs manage candidates.

**Alternative considered**: ADMIN-only even for reads. Rejected because it would break C4 candidate form for RECRUITERs.

### D5 — JobType unique constraint on (name, sectorId)
Same name can exist in different sectors (e.g., "Analyst" in Technology and in Finance).

**Why**: Natural business rule — job type names are scoped to their sector.

**Alternative considered**: Global unique name. Rejected as too restrictive.

### D6 — Frontend pages follow UsersPage pattern
Table with per-column text filters, double-click to open form in a modal, confirm before delete. UnoCSS utility classes. State managed in a custom hook (`useSectors`, `useJobTypes`).

**Why**: Consistency with UsersPage which the user already validated. Reuse the same patterns.

### D7 — Zod validation on all request bodies (backend)
`POST /sectors`, `PUT /sectors/:id`, `POST /jobtypes`, `PUT /jobtypes/:id` validate with Zod schemas before reaching the service layer.

**Why**: Established pattern from auth-users. Prevents invalid data from reaching Prisma.

## Risks / Trade-offs

- [AppLocker migration risk] → Mitigation: same manual SQL + `_prisma_migrations` insert pattern used successfully in auth-users; document exact SQL and commands in tasks.
- [JobType combo performance] → Not a risk at expected data volumes (< 100 sectors, < 500 job types). No pagination needed.
- [Sidebar ADMIN-only items] → Already handled by `isAdmin` from `AuthContext`; Sidebar already conditionally renders Usuarios. Same pattern applies.

## Migration Plan

1. Write SQL for `CREATE TABLE "Sector"` and `CREATE TABLE "JobType"` with FK + unique constraints
2. Apply via `docker exec -i <postgres_container> psql -U LTIdbUser -d LTIdb`
3. Insert migration record into `_prisma_migrations`
4. Run `npx prisma generate` from `backend/`
5. Rollback: `DROP TABLE "JobType"; DROP TABLE "Sector";` — safe since no production data

## Open Questions

None — all decisions made above.
