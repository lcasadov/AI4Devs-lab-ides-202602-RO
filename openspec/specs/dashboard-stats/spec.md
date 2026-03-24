### Requirement: Dashboard stats endpoint
The backend SHALL expose `GET /dashboard/stats` protected by JWT (any authenticated role). It SHALL return candidate counts grouped by job type, province, and municipality in a single response.

#### Scenario: Authenticated user fetches stats
- **WHEN** an authenticated user sends `GET /dashboard/stats` with a valid JWT
- **THEN** the response is 200 with body `{ byJobType: [...], byProvince: [...], byMunicipality: [...] }`

#### Scenario: Unauthenticated request is rejected
- **WHEN** a request is sent to `GET /dashboard/stats` without a JWT
- **THEN** the response is 401

#### Scenario: byJobType groups candidates by job type name
- **WHEN** there are candidates with job types
- **THEN** `byJobType` contains one entry per distinct job type: `{ name: string, count: number }`, ordered by count descending
- **THEN** candidates with no jobTypeId are excluded from `byJobType`

#### Scenario: byProvince groups candidates by province
- **WHEN** there are candidates with and without province set
- **THEN** `byProvince` contains one entry per distinct non-null province plus one entry `{ name: "Sin provincia", count: N }` for candidates where province is null
- **THEN** entries are ordered by count descending

#### Scenario: byMunicipality groups candidates by municipality
- **WHEN** there are candidates with and without municipality set
- **THEN** `byMunicipality` contains one entry per distinct non-null municipality plus one entry `{ name: "Sin municipio", count: N }` for candidates where municipality is null
- **THEN** entries are ordered by count descending

#### Scenario: Empty database returns empty arrays
- **WHEN** there are no candidates
- **THEN** `byJobType`, `byProvince`, and `byMunicipality` are all empty arrays `[]`

### Requirement: Dashboard page displays three stat panels
The `DashboardPage` SHALL display three panels side by side (or in a responsive grid): by job type, by province, and by municipality. Each panel SHALL show a table with columns "Nombre" and "Candidatos".

#### Scenario: Page loads and displays stats
- **WHEN** an authenticated user navigates to `/dashboard`
- **THEN** the page calls `GET /dashboard/stats` on mount
- **THEN** three panels are rendered, each with a title and a table of rows

#### Scenario: Loading state shown during fetch
- **WHEN** the stats request is in flight
- **THEN** the page displays a loading indicator

#### Scenario: Error state shown on fetch failure
- **WHEN** the stats request fails
- **THEN** the page displays an error message

#### Scenario: Empty panel shown when no data
- **WHEN** an array in the response is empty
- **THEN** the corresponding panel shows an empty table (no rows), not a crash

### Requirement: Dashboard service encapsulates API call
`frontend/src/services/dashboard.service.ts` SHALL export a function `getDashboardStats(token: string)` that calls `GET /dashboard/stats` and returns the typed response.

#### Scenario: Service returns typed stats on success
- **WHEN** `getDashboardStats` is called with a valid token
- **THEN** it returns `{ byJobType, byProvince, byMunicipality }` matching the backend contract

#### Scenario: Service propagates errors
- **WHEN** the backend returns a non-2xx response
- **THEN** `getDashboardStats` throws so the caller can handle the error state
