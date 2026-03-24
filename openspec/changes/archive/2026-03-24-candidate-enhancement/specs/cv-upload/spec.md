## ADDED Requirements

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
