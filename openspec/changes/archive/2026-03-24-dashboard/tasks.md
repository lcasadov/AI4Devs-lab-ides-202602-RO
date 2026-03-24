## 1. Backend — Domain layer

- [x] 1.1 Create `backend/src/domain/models/Dashboard.ts` with interfaces `StatEntry { name: string; count: number }` and `DashboardStats { byJobType: StatEntry[]; byProvince: StatEntry[]; byMunicipality: StatEntry[] }`
- [x] 1.2 Create `backend/src/domain/repositories/IDashboardRepository.ts` with interface `IDashboardRepository { getStats(): Promise<DashboardStats> }`

## 2. Backend — Infrastructure layer

- [x] 2.1 Create `backend/src/infrastructure/repositories/DashboardRepository.ts` implementing `IDashboardRepository` using `getPrismaClient()`
- [x] 2.2 In `getStats()`: run `groupBy` on `Candidate` by `jobTypeId` (with `_count`, include `jobType.name`); map nulls for province/municipality to `"Sin provincia"` / `"Sin municipio"`; sort each array by count descending

## 3. Backend — Application layer

- [x] 3.1 Create `backend/src/application/services/DashboardService.ts` that accepts `IDashboardRepository` via constructor and exposes `getStats(): Promise<DashboardStats>`

## 4. Backend — Presentation layer

- [x] 4.1 Create `backend/src/presentation/controllers/DashboardController.ts` with `getStats(req, res, next)` handler — delegates to `DashboardService`, returns 200 JSON, wraps in try/catch
- [x] 4.2 Create `backend/src/routes/dashboard.routes.ts` with `GET /stats` route + Swagger JSDoc annotation (security: bearerAuth)
- [x] 4.3 Register `/dashboard` route in `backend/src/index.ts` with `authMiddleware`

## 5. Backend — Tests

- [x] 5.1 Create `backend/src/tests/dashboard.test.ts` with integration tests: 200 happy path, 401 without token, empty DB returns empty arrays
- [x] 5.2 Verify all existing tests still pass (`npm test` in backend)

## 6. Frontend — Service

- [x] 6.1 Create `frontend/src/services/dashboard.service.ts` exporting `getDashboardStats(token: string): Promise<DashboardStats>` — calls `GET /dashboard/stats`, throws on non-2xx

## 7. Frontend — Page

- [x] 7.1 Update `frontend/src/pages/DashboardPage.tsx`: add `useState` for stats/loading/error, `useEffect` to call `getDashboardStats` on mount using `useAuth()` token
- [x] 7.2 Render three panels in a responsive grid — each panel has a title and a two-column table ("Nombre" | "Candidatos")
- [x] 7.3 Show loading indicator while fetching; show error message on failure; show empty tables when arrays are empty
