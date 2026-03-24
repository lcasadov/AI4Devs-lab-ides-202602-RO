## ADDED Requirements

### Requirement: List all job types
The system SHALL expose `GET /jobtypes` returning all job types ordered by name, with optional `?sectorId=` filter. Accessible to all authenticated roles.

#### Scenario: List all job types without filter
- **WHEN** an authenticated user sends `GET /jobtypes`
- **THEN** the system returns HTTP 200 with an array of `{ id, name, sectorId, sector: { id, name }, createdAt, updatedAt }`

#### Scenario: Filter by sectorId
- **WHEN** an authenticated user sends `GET /jobtypes?sectorId=2`
- **THEN** the system returns only job types where `sectorId === 2`

#### Scenario: Unauthenticated request is rejected
- **WHEN** a request without a valid JWT is sent to `GET /jobtypes`
- **THEN** the system returns HTTP 401

### Requirement: Get job type by ID
The system SHALL expose `GET /jobtypes/:id` returning a single job type including its sector. Accessible to all authenticated roles.

#### Scenario: Job type found
- **WHEN** an authenticated user sends `GET /jobtypes/1`
- **THEN** the system returns HTTP 200 with `{ id, name, sectorId, sector: { id, name }, createdAt, updatedAt }`

#### Scenario: Job type not found
- **WHEN** an authenticated user sends `GET /jobtypes/999`
- **THEN** the system returns HTTP 404

### Requirement: Create job type
The system SHALL expose `POST /jobtypes` restricted to ADMIN. Name (max 100 chars) + sectorId are required. Combination (name, sectorId) MUST be unique.

#### Scenario: ADMIN creates job type successfully
- **WHEN** an ADMIN sends `POST /jobtypes` with `{ "name": "Backend Developer", "sectorId": 1 }`
- **THEN** the system returns HTTP 201 with the created job type including sector data

#### Scenario: Duplicate (name, sectorId) rejected
- **WHEN** an ADMIN sends `POST /jobtypes` with a name+sectorId combination that already exists
- **THEN** the system returns HTTP 409

#### Scenario: Non-existent sectorId rejected
- **WHEN** an ADMIN sends `POST /jobtypes` with a `sectorId` that does not exist
- **THEN** the system returns HTTP 400

#### Scenario: RECRUITER cannot create job type
- **WHEN** a RECRUITER sends `POST /jobtypes`
- **THEN** the system returns HTTP 403

### Requirement: Update job type
The system SHALL expose `PUT /jobtypes/:id` restricted to ADMIN.

#### Scenario: ADMIN updates job type
- **WHEN** an ADMIN sends `PUT /jobtypes/1` with `{ "name": "Senior Backend Developer", "sectorId": 1 }`
- **THEN** the system returns HTTP 200 with the updated job type

#### Scenario: Update to duplicate (name, sectorId) rejected
- **WHEN** the updated combination already belongs to another job type
- **THEN** the system returns HTTP 409

#### Scenario: Job type not found on update
- **WHEN** an ADMIN sends `PUT /jobtypes/999`
- **THEN** the system returns HTTP 404

### Requirement: Delete job type
The system SHALL expose `DELETE /jobtypes/:id` restricted to ADMIN.

#### Scenario: ADMIN deletes job type
- **WHEN** an ADMIN sends `DELETE /jobtypes/1`
- **THEN** the system returns HTTP 204

#### Scenario: Job type not found on delete
- **WHEN** an ADMIN sends `DELETE /jobtypes/999`
- **THEN** the system returns HTTP 404

### Requirement: Job types page (frontend)
The system SHALL provide a `/jobtypes` page accessible only to ADMIN showing a table of job types with inline filters, sector combo for filtering, and create/edit/delete actions.

#### Scenario: ADMIN visits job types page
- **WHEN** an ADMIN navigates to `/jobtypes`
- **THEN** the page displays a table with columns: Name, Sector, Actions

#### Scenario: RECRUITER cannot access job types page
- **WHEN** a RECRUITER navigates to `/jobtypes`
- **THEN** the system redirects to `/dashboard`

#### Scenario: Filter by name
- **WHEN** the ADMIN types in the Name filter
- **THEN** only job types whose name contains the typed text are shown

#### Scenario: Filter by sector
- **WHEN** the ADMIN selects a sector from the Sector filter combo
- **THEN** only job types belonging to that sector are shown

#### Scenario: Create new job type
- **WHEN** the ADMIN clicks "Nuevo tipo de puesto" and submits a valid name + sector
- **THEN** the new job type appears in the table

#### Scenario: Sector combo is required on create
- **WHEN** the ADMIN submits the form without selecting a sector
- **THEN** the form shows a validation error and does not submit

#### Scenario: Edit job type via double-click
- **WHEN** the ADMIN double-clicks a table row
- **THEN** a form opens pre-filled with that job type's data including its sector
