## Context

The Dashboard page exists in the frontend (`frontend/src/pages/DashboardPage.tsx`) and is linked in the Sidebar, but renders an empty placeholder. Candidates now have `province`, `municipality`, `sectorId`/`jobTypeId` fields (added in candidate-enhancement). The backend follows DDD: domain → application → infrastructure → presentation → routes.

No schema changes are needed — all required fields exist in the `Candidate` table.

## Goals / Non-Goals

**Goals:**
- Add `GET /dashboard/stats` endpoint returning candidate counts grouped by jobType, province, and municipality
- Fill the `DashboardPage` with three stat panels (jobType, province, municipality)
- Keep the implementation thin — pure read queries, no mutations, no pagination

**Non-Goals:**
- Charts or visualizations (tables only)
- Caching or polling
- Filtering or drill-down from the dashboard

## Decisions

### 1. Single endpoint returning all three groupings

**Decision**: One `GET /dashboard/stats` endpoint that returns `{ byJobType, byProvince, byMunicipality }`.

**Rationale**: The three groupings are always displayed together. A single round-trip is simpler for the frontend. If any panel were independently filterable or paginated, separate endpoints would make sense — but they aren't.

**Alternative considered**: Three separate endpoints (`/dashboard/stats/job-types`, etc.). Rejected: unnecessary network overhead and complexity for a single page load.

### 2. Prisma `groupBy` for aggregation

**Decision**: Use Prisma's `groupBy` with `_count` to compute the three distributions in the repository.

**Rationale**: `groupBy` is the idiomatic Prisma approach for COUNT…GROUP BY queries. It keeps SQL out of application code and types safe.

**Alternative considered**: Raw SQL via `prisma.$queryRaw`. Rejected: loses type safety, harder to maintain.

### 3. Null grouping handled in the repository

**Decision**: The `DashboardRepository` post-processes Prisma results to convert `null` province/municipality to `"Sin provincia"` / `"Sin municipio"`. For `byJobType`, candidates with no `jobTypeId` are excluded (they have no meaningful job type name).

**Rationale**: Keeps the service and controller free of null-handling logic. The domain model defines `null` as an accepted absence of data, so labelling nulls is a display concern resolved at the data-access boundary.

### 4. JWT required, no role restriction

**Decision**: The `/dashboard` route uses `authMiddleware` but no role check.

**Rationale**: The Sidebar shows Dashboard to all roles. Stats are aggregate counts — no PII exposure concern.

### 5. No frontend hook — logic inline in DashboardPage

**Decision**: `dashboard.service.ts` is called directly inside `DashboardPage` with `useEffect`/`useState`. No separate custom hook.

**Rationale**: The proposal specifies this explicitly. The component only needs to load data once on mount; extracting a hook would be premature abstraction for a single consumer.

## Risks / Trade-offs

- **Performance on large datasets**: `groupBy` without indexes on `province`/`municipality`/`jobTypeId` may be slow at scale. Mitigation: acceptable for current dataset size; indexes can be added later without API changes.
- **Null label hardcoded in Spanish**: `"Sin provincia"` / `"Sin municipio"` are hardcoded. Mitigation: out of scope for this change; i18n not in project scope.

## Migration Plan

1. No schema migration needed.
2. Deploy backend with the new route registered before the global error handler.
3. Deploy frontend with the updated `DashboardPage`.
4. No rollback complexity — the endpoint is additive and the page was previously empty.

## Open Questions

None — requirements are fully defined in the proposal.
