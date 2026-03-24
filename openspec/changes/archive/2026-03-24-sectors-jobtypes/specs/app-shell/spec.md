## MODIFIED Requirements

### Requirement: Sidebar navigation items
The Sidebar SHALL display navigation links based on the authenticated user's role. ADMIN users SHALL see all menu items. RECRUITER users SHALL only see Dashboard and Candidatos.

**Updated item list:**
- Dashboard → `/dashboard` (all roles)
- Candidatos → `/candidates` (all roles)
- Usuarios → `/users` (ADMIN only)
- Sectores → `/sectors` (ADMIN only)
- Tipos de puesto → `/jobtypes` (ADMIN only)

#### Scenario: ADMIN sees all menu items
- **WHEN** an ADMIN user is authenticated and views the Sidebar
- **THEN** the Sidebar shows Dashboard, Candidatos, Usuarios, Sectores, and Tipos de puesto

#### Scenario: RECRUITER sees limited menu
- **WHEN** a RECRUITER is authenticated and views the Sidebar
- **THEN** the Sidebar shows only Dashboard and Candidatos

### Requirement: Protected routes for admin-only pages
App.tsx SHALL register `/sectors` and `/jobtypes` as protected routes requiring ADMIN role. Navigating to these routes as a RECRUITER SHALL redirect to `/dashboard`.

#### Scenario: ADMIN accesses /sectors
- **WHEN** an ADMIN navigates to `/sectors`
- **THEN** the SectorsPage is rendered

#### Scenario: ADMIN accesses /jobtypes
- **WHEN** an ADMIN navigates to `/jobtypes`
- **THEN** the JobTypesPage is rendered

#### Scenario: RECRUITER redirected from /sectors
- **WHEN** a RECRUITER navigates to `/sectors`
- **THEN** the system redirects to `/dashboard`

#### Scenario: RECRUITER redirected from /jobtypes
- **WHEN** a RECRUITER navigates to `/jobtypes`
- **THEN** the system redirects to `/dashboard`
