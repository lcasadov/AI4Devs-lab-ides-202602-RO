## ADDED Requirements

### Requirement: Add candidate button visible on dashboard
The system SHALL display a clearly visible "Añadir candidato" button on the main recruiter dashboard page.

#### Scenario: Button visible on dashboard
- **WHEN** a recruiter visits the main dashboard at `/`
- **THEN** a button or link labelled "Añadir candidato" SHALL be visible without scrolling

#### Scenario: Button navigates to add candidate form
- **WHEN** the recruiter clicks "Añadir candidato"
- **THEN** the system SHALL navigate to the candidate creation form page

---

### Requirement: Candidate creation form
The system SHALL present a form with all required fields to capture candidate information when the recruiter selects the add candidate option.

#### Scenario: Form displays all required fields
- **WHEN** the recruiter opens the add candidate form
- **THEN** the form SHALL display fields for: firstName, lastName, email, phone, address, education, workExperience, and a CV file upload input

#### Scenario: Required fields marked
- **WHEN** the form is displayed
- **THEN** firstName, lastName, and email SHALL be visually marked as required

---

### Requirement: Form data validation
The system SHALL validate all form data before submission to ensure completeness and correctness.

#### Scenario: Empty required fields blocked
- **WHEN** the recruiter submits the form with firstName, lastName, or email empty
- **THEN** the system SHALL display a validation error message next to each empty required field and SHALL NOT submit the form

#### Scenario: Invalid email format blocked
- **WHEN** the recruiter enters an email without a valid format (e.g. missing `@`)
- **THEN** the system SHALL display an error message indicating the email is invalid and SHALL NOT submit the form

#### Scenario: Duplicate email rejected by backend
- **WHEN** the recruiter submits a form with an email that already exists in the system
- **THEN** the backend SHALL return HTTP 409 and the frontend SHALL display a message indicating the email is already registered

#### Scenario: Valid data accepted
- **WHEN** all required fields are filled with valid data
- **THEN** the form SHALL submit successfully

---

### Requirement: CV file upload
The system SHALL allow the recruiter to attach the candidate's CV in PDF or DOCX format.

#### Scenario: Valid CV file accepted
- **WHEN** the recruiter attaches a file with `.pdf` or `.docx` extension not exceeding 5 MB
- **THEN** the system SHALL accept the file and include it in the candidate record

#### Scenario: Invalid file type rejected
- **WHEN** the recruiter attaches a file with an unsupported extension (e.g. `.jpg`, `.exe`)
- **THEN** the system SHALL display an error message and SHALL NOT submit the form

#### Scenario: File too large rejected
- **WHEN** the recruiter attaches a file exceeding 5 MB
- **THEN** the system SHALL display an error message indicating the file size limit and SHALL NOT submit the form

#### Scenario: CV is optional
- **WHEN** the recruiter submits the form without attaching a CV
- **THEN** the system SHALL create the candidate record without a CV file

---

### Requirement: Candidate creation confirmation
The system SHALL display a success confirmation message after the candidate has been added successfully.

#### Scenario: Confirmation message shown
- **WHEN** the candidate is created successfully
- **THEN** the system SHALL display a confirmation message indicating the candidate was added

#### Scenario: Form reset after success
- **WHEN** the confirmation message is shown
- **THEN** the form SHALL be reset or the user SHALL be redirected so they cannot accidentally resubmit

---

### Requirement: Error handling on server failure
The system SHALL inform the recruiter with a descriptive error message when the server returns an error.

#### Scenario: Server error shown to user
- **WHEN** the backend returns HTTP 500
- **THEN** the frontend SHALL display a user-friendly error message and SHALL NOT expose internal error details

#### Scenario: Network error shown to user
- **WHEN** the frontend cannot reach the backend
- **THEN** the frontend SHALL display a message indicating a connection problem

---

### Requirement: Backend API — Create candidate
The backend SHALL expose a `POST /candidates` endpoint that creates a new candidate record.

#### Scenario: Successful creation returns 201
- **WHEN** a valid `POST /candidates` request is received with required fields
- **THEN** the backend SHALL persist the candidate and return HTTP 201 with the created candidate object (excluding sensitive internal fields)

#### Scenario: Missing required fields returns 400
- **WHEN** `POST /candidates` is called without firstName, lastName, or email
- **THEN** the backend SHALL return HTTP 400 with a descriptive error message

#### Scenario: Duplicate email returns 409
- **WHEN** `POST /candidates` is called with an email already in the database
- **THEN** the backend SHALL return HTTP 409

#### Scenario: Prisma errors not exposed
- **WHEN** the backend encounters an internal database error
- **THEN** the response SHALL return HTTP 500 with a generic message and SHALL NOT include Prisma error details or stack traces

---

### Requirement: Backend API — List candidates
The backend SHALL expose a `GET /candidates` endpoint that returns the list of candidates.

#### Scenario: Returns list
- **WHEN** `GET /candidates` is called
- **THEN** the backend SHALL return HTTP 200 with an array of candidate objects

#### Scenario: Returns empty array when no candidates
- **WHEN** `GET /candidates` is called and no candidates exist
- **THEN** the backend SHALL return HTTP 200 with an empty array `[]`

---

### Requirement: Backend API — Get candidate by ID
The backend SHALL expose a `GET /candidates/:id` endpoint.

#### Scenario: Returns candidate when found
- **WHEN** `GET /candidates/:id` is called with a valid existing ID
- **THEN** the backend SHALL return HTTP 200 with the candidate object

#### Scenario: Returns 404 when not found
- **WHEN** `GET /candidates/:id` is called with a non-existent ID
- **THEN** the backend SHALL return HTTP 404

---

### Requirement: Candidate data model
The system SHALL persist candidate data in a `candidates` table with all required fields.

#### Scenario: All fields stored
- **WHEN** a candidate is created with all fields provided
- **THEN** the database SHALL store: firstName, lastName, email (unique), phone, address, education (JSON), workExperience (JSON), cvFileName, createdAt, updatedAt

#### Scenario: Email uniqueness enforced
- **WHEN** two candidates with the same email are created
- **THEN** the database SHALL reject the second insert with a unique constraint error
