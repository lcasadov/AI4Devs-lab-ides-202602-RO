## ADDED Requirements

### Requirement: Visual identity — light theme with Inter typography
The application SHALL use a light color scheme (white/gray backgrounds) with Inter as the primary font family (`'Inter', -apple-system, BlinkMacSystemFont, sans-serif`). Styling SHALL use inline styles (not Tailwind/UnoCSS classes) to ensure deterministic rendering across environments.

#### Scenario: Application renders with light theme
- **WHEN** any authenticated page is loaded
- **THEN** the background color is `#f1f5f9` (slate-100), cards are white, borders are `#e2e8f0`

---

### Requirement: Header — white bar with SVG logo and user avatar
The `Header` component SHALL render as a fixed top bar (height 56px) with white background and a subtle bottom border. It SHALL display a custom SVG logo (blue gradient rectangle with a person silhouette and a green checkmark badge), the text "LTI ATS" and a muted uppercase label. The right side SHALL show the authenticated user's name and a dropdown to change password or logout.

#### Scenario: Header visible on all authenticated pages
- **WHEN** an authenticated user views any page
- **THEN** the header is fixed at the top (height 56px, white background)

#### Scenario: Header NOT visible on login page
- **WHEN** the user is on `/login`
- **THEN** the header is not rendered

---

### Requirement: Sidebar — white left panel with icon navigation
The `Sidebar` component SHALL render as a fixed left panel (width 240px, top offset 56px) with white background. Each nav item SHALL display a Unicode symbol icon and a label. The active item SHALL be highlighted with a blue left border (`#2563eb`) and a light blue background.

#### Scenario: Active nav item is visually distinguished
- **WHEN** the user is on `/candidates`
- **THEN** the "Candidatos" nav item has a blue left border and light blue background, all others are neutral

#### Scenario: Admin-only items hidden from RECRUITER
- **WHEN** a RECRUITER is logged in
- **THEN** Usuarios, Sectores, and Tipos de puesto items are not rendered

---

### Requirement: Login page — two-panel layout
The `LoginPage` SHALL use a full-height two-panel layout: left panel (branding, hidden on mobile) and right panel (login form centered vertically).

#### Scenario: Login form centered on right panel
- **WHEN** the user visits `/login`
- **THEN** the form appears on the right half, vertically centered, no header or sidebar visible

#### Scenario: Error message shown on failed login
- **WHEN** the backend returns 401
- **THEN** an error message appears with `role="alert"`

---

### Requirement: Dashboard — colored stat panels
The `DashboardPage` SHALL render three stat panels in a responsive grid. Each panel SHALL have a colored header strip with emoji icon, title, and total candidate count; and a data table with count values as badge chips.

#### Scenario: Each panel shows total count in header
- **WHEN** the dashboard loads successfully
- **THEN** each panel header shows "N candidato(s) en total"

#### Scenario: Empty panel shows "Sin datos"
- **WHEN** an array in the response is empty
- **THEN** the panel body shows "Sin datos" centered

---

### Requirement: Management tables — consistent inline-styled layout
All management pages SHALL use a consistent table layout: white card container, filter row with styled inputs, rows with hover highlight (`#f8fafc`), and small action buttons.

#### Scenario: Filter inputs have consistent styling
- **WHEN** any management page renders
- **THEN** all filter inputs have border `1px solid #e2e8f0`, border-radius `6px`, padding `7px 10px`, font-size `13px`

#### Scenario: Table rows highlight on hover
- **WHEN** the user hovers over a table row
- **THEN** the row background changes to `#f8fafc`

---

### Requirement: App routing — login outside authenticated layout
The `App` component SHALL render `/login` outside of `AppLayout` so unauthenticated users never see header or sidebar.

#### Scenario: Login route has no chrome
- **WHEN** the user navigates to `/login`
- **THEN** no header, no sidebar, no layout padding are rendered

#### Scenario: All other routes have full layout
- **WHEN** an authenticated user navigates to any non-login route
- **THEN** the header and sidebar are rendered around the page content

---

### Requirement: Seed data — sectors and job types catalog
`backend/prisma/seed.ts` SHALL populate a comprehensive catalog of sectors and job types using upsert (idempotent). It SHALL cover at minimum: Tecnología, Ingeniería, Salud, Finanzas, Marketing, Educación, Derecho, Recursos Humanos, Logística, Comercial.

#### Scenario: Seed runs idempotently
- **WHEN** `npx prisma db seed` is run multiple times
- **THEN** no duplicate sectors or job types are created

#### Scenario: Seed creates initial ADMIN user
- **WHEN** `npx prisma db seed` is run on an empty database
- **THEN** an ADMIN user is created along with all sectors and job types
