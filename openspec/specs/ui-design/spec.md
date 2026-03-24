## ADDED Requirements

### Requirement: Visual identity — light theme with Inter typography
The application SHALL use a light color scheme (white/gray backgrounds) with Inter as the primary font family (`'Inter', -apple-system, BlinkMacSystemFont, sans-serif`). Styling SHALL use inline styles (not Tailwind/UnoCSS classes) to ensure deterministic rendering across environments.

#### Scenario: Application renders with light theme
- **WHEN** any authenticated page is loaded
- **THEN** the background color is `#f1f5f9` (slate-100), cards are white, borders are `#e2e8f0`

---

### Requirement: Header — white bar with SVG logo and user avatar
The `Header` component SHALL render as a fixed top bar (height 56px) with white background and a subtle bottom border. It SHALL display:
- A custom SVG logo (blue gradient rectangle with a person silhouette and a green checkmark badge)
- The text "LTI **ATS**" (bold, `#0f172a`/`#2563eb`) followed by a muted uppercase label "Gestión de Candidatos"
- On the right: the authenticated user's name and a dropdown to change password or logout

#### Scenario: Header visible on all authenticated pages
- **WHEN** an authenticated user views any page
- **THEN** the header is fixed at the top, always visible

#### Scenario: Header NOT visible on login page
- **WHEN** the user is on `/login`
- **THEN** the header is not rendered (login route is outside AppLayout)

---

### Requirement: Sidebar — white left panel with icon navigation
The `Sidebar` component SHALL render as a fixed left panel (width 240px, top offset 56px) with white background and a right border. Each nav item SHALL display a Unicode symbol icon followed by the label. The active item SHALL be highlighted with a blue left border (`#2563eb`) and light blue background.

#### Scenario: Active nav item is visually distinguished
- **WHEN** the user is on `/candidates`
- **THEN** the "Candidatos" nav item has a blue left border and light blue background
- **AND** all other items have neutral styling

#### Scenario: Admin-only items hidden from RECRUITER
- **WHEN** a RECRUITER is logged in
- **THEN** Usuarios, Sectores, and Tipos de puesto items are not rendered in the sidebar

---

### Requirement: Login page — two-panel layout
The `LoginPage` SHALL use a full-height two-panel layout:
- **Left panel** (hidden on mobile): branding panel with the LTI ATS logo, name, tagline, and a "feature highlights" section
- **Right panel**: the login form centered vertically, with fields for usuario and contraseña, a submit button, and a "¿Olvidaste tu contraseña?" link

#### Scenario: Login form is centered on the right panel
- **WHEN** the user visits `/login`
- **THEN** the form appears on the right half of the screen, vertically centered

#### Scenario: Left branding panel visible on desktop
- **WHEN** the viewport is desktop width
- **THEN** a blue gradient branding panel is visible on the left with the application logo and name

#### Scenario: Error message shown on failed login
- **WHEN** the backend returns 401
- **THEN** an error message appears below the form with `role="alert"`

---

### Requirement: Dashboard — colored stat panels
The `DashboardPage` SHALL render three stat panels in a responsive grid. Each panel SHALL have:
- A colored header strip with an emoji icon, the panel title, and the total candidate count
- A data table inside with alternating light row borders
- Candidate count values displayed as badge chips (light gray pill background)

#### Scenario: Each panel shows total count in header
- **WHEN** the dashboard loads successfully
- **THEN** each panel header shows "N candidato(s) en total" where N is the sum of all counts in that panel

#### Scenario: Empty panel shows "Sin datos"
- **WHEN** an array in the response is empty
- **THEN** the panel body shows "Sin datos" centered, not a broken table

---

### Requirement: Management tables — consistent inline-styled layout
All management pages (CandidatesPage, UsersPage, SectorsPage, JobTypesPage) SHALL use a consistent table layout with:
- White card container with rounded corners and subtle shadow
- Filter row above the table with styled text inputs and select combos
- Table rows with hover highlight (`#f8fafc`)
- Action buttons (edit, delete) as small icon-style buttons
- "Nuevo" and "Exportar Excel" buttons in the top toolbar with distinct styling

#### Scenario: Filter inputs have consistent styling
- **WHEN** any management page renders
- **THEN** all filter inputs have border `1px solid #e2e8f0`, border-radius `6px`, padding `7px 10px`, font-size `13px`

#### Scenario: Table rows highlight on hover
- **WHEN** the user hovers over a table row
- **THEN** the row background changes to `#f8fafc`

---

### Requirement: App routing — login outside authenticated layout
The `App` component SHALL render `/login` outside of `AppLayout` so that unauthenticated users never see the header or sidebar.

#### Scenario: Login route has no chrome
- **WHEN** the user navigates to `/login`
- **THEN** no header, no sidebar, and no main layout padding are rendered

#### Scenario: All other routes have full layout
- **WHEN** an authenticated user navigates to any non-login route
- **THEN** the header and sidebar are rendered around the page content

---

### Requirement: Seed data — sectors and job types catalog
`backend/prisma/seed.ts` SHALL populate a comprehensive catalog of sectors and job types covering at least: Tecnología, Ingeniería, Salud, Finanzas, Marketing, Educación, Derecho, Recursos Humanos, Logística, Comercial. Each sector SHALL have multiple representative job type entries.

#### Scenario: Seed runs without errors on empty DB
- **WHEN** `npx prisma db seed` is run on an empty database
- **THEN** sectors and job types are created along with the initial ADMIN user
