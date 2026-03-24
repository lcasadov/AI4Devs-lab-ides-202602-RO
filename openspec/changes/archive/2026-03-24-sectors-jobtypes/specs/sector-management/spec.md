## ADDED Requirements

### Requirement: List all sectors
The system SHALL expose `GET /sectors` returning all sectors ordered by name. The endpoint SHALL require JWT authentication and be accessible to both ADMIN and RECRUITER roles.

#### Scenario: Authenticated user lists sectors
- **WHEN** an authenticated user sends `GET /sectors`
- **THEN** the system returns HTTP 200 with an array of `{ id, name, createdAt, updatedAt }`

#### Scenario: Unauthenticated request is rejected
- **WHEN** a request without a valid JWT token is sent to `GET /sectors`
- **THEN** the system returns HTTP 401

### Requirement: Get sector by ID
The system SHALL expose `GET /sectors/:id` returning a single sector. Accessible to all authenticated roles.

#### Scenario: Sector found
- **WHEN** an authenticated user sends `GET /sectors/1` and sector with id=1 exists
- **THEN** the system returns HTTP 200 with `{ id, name, createdAt, updatedAt }`

#### Scenario: Sector not found
- **WHEN** an authenticated user sends `GET /sectors/999` and no sector with id=999 exists
- **THEN** the system returns HTTP 404

### Requirement: Create sector
The system SHALL expose `POST /sectors` restricted to ADMIN role. Name MUST be unique and at most 100 characters.

#### Scenario: ADMIN creates sector successfully
- **WHEN** an ADMIN sends `POST /sectors` with `{ "name": "Technology" }`
- **THEN** the system returns HTTP 201 with the created sector `{ id, name, createdAt, updatedAt }`

#### Scenario: Duplicate name rejected
- **WHEN** an ADMIN sends `POST /sectors` with a name that already exists
- **THEN** the system returns HTTP 409

#### Scenario: RECRUITER cannot create sector
- **WHEN** a RECRUITER sends `POST /sectors`
- **THEN** the system returns HTTP 403

#### Scenario: Name too long rejected
- **WHEN** an ADMIN sends `POST /sectors` with a name exceeding 100 characters
- **THEN** the system returns HTTP 400

### Requirement: Update sector
The system SHALL expose `PUT /sectors/:id` restricted to ADMIN role.

#### Scenario: ADMIN updates sector name
- **WHEN** an ADMIN sends `PUT /sectors/1` with `{ "name": "Finance" }`
- **THEN** the system returns HTTP 200 with the updated sector

#### Scenario: Update to duplicate name rejected
- **WHEN** an ADMIN sends `PUT /sectors/1` with a name already used by another sector
- **THEN** the system returns HTTP 409

#### Scenario: Sector not found on update
- **WHEN** an ADMIN sends `PUT /sectors/999`
- **THEN** the system returns HTTP 404

### Requirement: Delete sector
The system SHALL expose `DELETE /sectors/:id` restricted to ADMIN role. DELETE SHALL be rejected with HTTP 409 if the sector has associated JobTypes.

#### Scenario: ADMIN deletes empty sector
- **WHEN** an ADMIN sends `DELETE /sectors/1` and the sector has no JobTypes
- **THEN** the system returns HTTP 204

#### Scenario: Delete rejected when sector has JobTypes
- **WHEN** an ADMIN sends `DELETE /sectors/1` and the sector has at least one associated JobType
- **THEN** the system returns HTTP 409 with message indicating referential constraint

#### Scenario: Sector not found on delete
- **WHEN** an ADMIN sends `DELETE /sectors/999`
- **THEN** the system returns HTTP 404

### Requirement: Sectors page (frontend)
The system SHALL provide a `/sectors` page accessible only to ADMIN users showing a table of sectors with inline filters, create/edit/delete actions.

#### Scenario: ADMIN visits sectors page
- **WHEN** an ADMIN navigates to `/sectors`
- **THEN** the page displays a table with columns: Name, Actions (edit, delete)

#### Scenario: RECRUITER cannot access sectors page
- **WHEN** a RECRUITER navigates to `/sectors`
- **THEN** the system redirects to `/dashboard`

#### Scenario: Filter by name
- **WHEN** the ADMIN types in the Name filter field
- **THEN** the table rows update to show only sectors whose name contains the typed text (case-insensitive)

#### Scenario: Create new sector
- **WHEN** the ADMIN clicks "Nuevo sector" and submits a valid name in the form
- **THEN** the new sector appears in the table

#### Scenario: Edit sector via double-click
- **WHEN** the ADMIN double-clicks a table row
- **THEN** a form opens pre-filled with that sector's data

#### Scenario: Delete sector with confirmation
- **WHEN** the ADMIN clicks the delete action for a sector
- **THEN** a confirmation dialog appears; on confirm, the sector is deleted and removed from the table
