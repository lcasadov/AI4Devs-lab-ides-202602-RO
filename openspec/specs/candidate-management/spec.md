## ADDED Requirements

### Requirement: Candidate model includes localization and job context fields
The `Candidate` model SHALL include the optional fields `postalCode`, `province`, `municipality`, `sectorId` (FK to Sector), and `jobTypeId` (FK to JobType). All new fields SHALL be nullable to preserve existing records.

#### Scenario: Create candidate without new optional fields
- **WHEN** a POST /candidates request omits postalCode, province, municipality, sectorId, and jobTypeId
- **THEN** the system SHALL create the candidate with those fields set to null

#### Scenario: Create candidate with all new fields
- **WHEN** a POST /candidates request includes postalCode "28001", province "Madrid", municipality "Madrid", sectorId 1, and jobTypeId 2
- **THEN** the system SHALL persist all values and return the candidate with sector and jobType relations included

#### Scenario: Candidate response includes sector and jobType relations
- **WHEN** GET /candidates or GET /candidates/:id is called
- **THEN** each candidate object SHALL include a `sector` object `{id, name}` and a `jobType` object `{id, name}` when the FKs are set, or null when they are not

### Requirement: Candidate API validates new fields
The POST and PUT /candidates endpoints SHALL validate postalCode, sectorId, and jobTypeId with Zod.

#### Scenario: postalCode must be exactly 5 digits if provided
- **WHEN** a POST /candidates request includes postalCode "1234" (4 digits)
- **THEN** the system SHALL return HTTP 400 with a validation error message

#### Scenario: sectorId must be a positive integer if provided
- **WHEN** a POST /candidates request includes sectorId -1
- **THEN** the system SHALL return HTTP 400

#### Scenario: jobTypeId must be a positive integer if provided
- **WHEN** a PUT /candidates/:id request includes jobTypeId 0
- **THEN** the system SHALL return HTTP 400

#### Scenario: phone must match +34 format if provided
- **WHEN** a POST /candidates request includes phone "123456789" (no +34 prefix)
- **THEN** the system SHALL return HTTP 400

### Requirement: CandidatesPage lists candidates in a table
The `/candidates` route SHALL render `CandidatesPage`, which shows a table of all candidates with columns: Nombre, Apellido, Email, Teléfono, Sector, Tipo de Puesto, Acciones.

#### Scenario: Table renders loaded candidates
- **WHEN** the user navigates to /candidates
- **THEN** the page SHALL display a row for each candidate returned by GET /candidates

#### Scenario: New candidate button opens empty form
- **WHEN** the user clicks "Nuevo candidato"
- **THEN** a CandidateForm SHALL open in create mode with all fields empty

#### Scenario: Double-click row opens edit form
- **WHEN** the user double-clicks a candidate row
- **THEN** a CandidateForm SHALL open in edit mode pre-filled with that candidate's data

### Requirement: CandidatesPage supports column filters
The page SHALL provide text filters for nombre and apellido, and combo filters for sector and tipo de puesto (the jobType combo SHALL be filtered by the sector selected in the filter).

#### Scenario: Name filter narrows displayed rows
- **WHEN** the user types "Ana" in the nombre filter
- **THEN** only candidates whose firstName contains "Ana" (case-insensitive) SHALL be displayed

#### Scenario: Sector filter updates jobType filter options
- **WHEN** the user selects a sector in the sector filter
- **THEN** the jobType filter combo SHALL show only job types belonging to that sector

### Requirement: CandidateForm supports create and edit modes
The CandidateForm component SHALL allow creating a new candidate (POST) and editing an existing one (PUT), including all fields: firstName, lastName, email, phone, address, postalCode, province, municipality, sector, jobType, education entries, and workExperience entries.

#### Scenario: Saving a new candidate calls POST /candidates
- **WHEN** the user fills all required fields and clicks "Guardar" in create mode
- **THEN** the form SHALL call POST /candidates and close on success

#### Scenario: Saving an existing candidate calls PUT /candidates/:id
- **WHEN** the user modifies fields and clicks "Guardar" in edit mode
- **THEN** the form SHALL call PUT /candidates/:id and refresh the table on success

#### Scenario: Cancel button closes the form without saving
- **WHEN** the user clicks "Cancelar"
- **THEN** the form SHALL close and no API call SHALL be made

#### Scenario: Duplicate email returns a visible error
- **WHEN** the API returns HTTP 409 on save
- **THEN** the form SHALL display an error message indicating the email already exists

### Requirement: CandidateForm has chained sector→jobType combos
The sector combo SHALL load from GET /sectors. On sector selection the jobType combo SHALL reload via GET /jobtypes?sectorId=X. On jobType selection without a prior sector the sector SHALL be auto-filled with the jobType's sector.

#### Scenario: Selecting a sector filters jobType options
- **WHEN** the user selects a sector in the form
- **THEN** the jobType combo SHALL display only job types for that sector

#### Scenario: Selecting a jobType auto-fills sector
- **WHEN** the user selects a jobType before selecting a sector
- **THEN** the sector combo SHALL be set to the sector of the selected jobType

### Requirement: CandidateForm supports dynamic education and work experience sections
The form SHALL allow adding and removing rows for education `{institution, degree, startYear, endYear}` and work experience `{company, position, startYear, endYear, description}`.

#### Scenario: Add education entry
- **WHEN** the user clicks "Añadir educación"
- **THEN** a new empty education row SHALL appear in the form

#### Scenario: Remove education entry
- **WHEN** the user clicks the delete button on an education row
- **THEN** that row SHALL be removed from the form

#### Scenario: Add work experience entry
- **WHEN** the user clicks "Añadir experiencia"
- **THEN** a new empty work experience row SHALL appear

#### Scenario: Remove work experience entry
- **WHEN** the user clicks the delete button on a work experience row
- **THEN** that row SHALL be removed

### Requirement: CV upload endpoint stores a file linked to a candidate
The system SHALL expose `POST /candidates/:id/cv` to upload a CV file. The endpoint SHALL accept `multipart/form-data` with a field named `cv`. Accepted formats are PDF and DOCX. Maximum file size is 5 MB. The file SHALL be saved in `backend/uploads/` with name `<candidateId>-<originalname>`. The candidate's `cvFileName` field SHALL be updated to the stored filename.

#### Scenario: Successful CV upload
- **WHEN** a POST /candidates/:id/cv request is made with a valid PDF under 5 MB
- **THEN** the system SHALL save the file to backend/uploads/, update cvFileName on the candidate, and return HTTP 200 with the updated candidate

#### Scenario: Reject non-PDF/DOCX file
- **WHEN** a POST /candidates/:id/cv request includes a .jpg file
- **THEN** the system SHALL return HTTP 400 with an error message indicating only PDF and DOCX are accepted

#### Scenario: Reject file over 5 MB
- **WHEN** a POST /candidates/:id/cv request includes a file larger than 5 MB
- **THEN** the system SHALL return HTTP 400 with a file size error

#### Scenario: Upload for non-existent candidate returns 404
- **WHEN** a POST /candidates/9999/cv request is made with a valid file
- **THEN** the system SHALL return HTTP 404

### Requirement: CV upload button is shown only in edit mode
The CandidateForm SHALL display a file input button for CV upload only when editing an existing candidate (not when creating a new one).

#### Scenario: CV upload button hidden on create
- **WHEN** the CandidateForm is in create mode (no candidateId)
- **THEN** the CV upload section SHALL NOT be visible

#### Scenario: CV upload button visible on edit
- **WHEN** the CandidateForm is in edit mode with a valid candidateId
- **THEN** a file input for CV (PDF/DOCX, max 5 MB) SHALL be visible and functional
