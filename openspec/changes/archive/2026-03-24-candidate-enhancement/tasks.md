## 1. Backend — Schema and Migration

- [x] 1.1 Add postalCode, province, municipality, sectorId, jobTypeId fields to Candidate model in schema.prisma, with FK relations to Sector and JobType
- [x] 1.2 Write SQL migration (ALTER TABLE Candidate ADD COLUMN ...) and apply via docker exec psql
- [x] 1.3 Insert migration record into _prisma_migrations
- [x] 1.4 Run npx prisma generate to regenerate the Prisma client

## 2. Backend — Domain Layer

- [x] 2.1 Extend Candidate.ts interfaces (Candidate, CreateCandidateDto, UpdateCandidateDto) with new fields
- [x] 2.2 Verify ICandidateRepository methods signatures support new fields (no interface changes expected)

## 3. Backend — Infrastructure Layer

- [x] 3.1 Update CandidateRepository.ts findAll and findById to include sector and jobType relations
- [x] 3.2 Update CandidateRepository.ts create and update to accept new fields

## 4. Backend — Application Layer

- [x] 4.1 Update CandidateService.ts to pass new fields through create and update methods

## 5. Backend — Presentation Layer

- [x] 5.1 Extend Zod schema in CandidateController.ts to validate postalCode (5 digits), phone (+34 regex), sectorId (positive int), jobTypeId (positive int)
- [x] 5.2 Add multer middleware to backend (npm install multer @types/multer)
- [x] 5.3 Add POST /candidates/:id/cv endpoint handler in CandidateController.ts: validate candidate exists, save file to uploads/, update cvFileName
- [x] 5.4 Register POST /candidates/:id/cv route in candidate.routes.ts with multer middleware (PDF/DOCX, max 5 MB) and Swagger JSDoc
- [x] 5.5 Create backend/uploads/ directory and ensure it is git-ignored

## 6. Frontend — Types and Services

- [x] 6.1 Create/update frontend/src/types/candidate.types.ts with Candidate interface including postalCode, province, municipality, sector, jobType, education, workExperience, cvFileName
- [x] 6.2 Create frontend/src/services/candidate.service.ts with getAll, getById, create, update, uploadCv methods

## 7. Frontend — Hook

- [x] 7.1 Create frontend/src/hooks/useCandidates.ts with state, loadCandidates, createCandidate, updateCandidate

## 8. Frontend — CandidateForm Component

- [x] 8.1 Create frontend/src/components/CandidateForm.tsx with all fields: firstName, lastName, email, phone, address, postalCode, province, municipality
- [x] 8.2 Add sector combo (loads GET /sectors) and jobType combo (loads GET /jobtypes?sectorId=X) with chained logic and auto-fill on jobType selection
- [x] 8.3 Add dynamic education section: list of {institution, degree, startYear, endYear} rows with add/remove
- [x] 8.4 Add dynamic workExperience section: list of {company, position, startYear, endYear, description} rows with add/remove
- [x] 8.5 Add CV upload button (visible only in edit mode): file input (PDF/DOCX, max 5 MB) that calls POST /candidates/:id/cv

## 9. Frontend — CandidatesPage

- [x] 9.1 Create frontend/src/pages/CandidatesPage.tsx with candidate table (Nombre, Apellido, Email, Teléfono, Sector, Tipo de Puesto, Acciones)
- [x] 9.2 Add column filters: nombre (text), apellido (text), sector (combo), tipo de puesto (combo filtered by selected sector)
- [x] 9.3 Wire "Nuevo candidato" button and double-click row to open CandidateForm in create/edit mode

## 10. Frontend — App Shell Update

- [x] 10.1 Replace AddCandidatePage import and /candidates route in App.tsx with CandidatesPage

## 11. Tests — Backend

- [x] 11.1 Write unit tests for CandidateService extended methods (new fields, validation errors)
- [x] 11.2 Write integration tests for POST /candidates with new fields and validation errors
- [x] 11.3 Write integration test for POST /candidates/:id/cv (valid file, wrong mime type, file too large, candidate not found)

## 12. Tests — Frontend

- [x] 12.1 Write unit tests for CandidatesPage (renders table, opens form on button click, opens edit form on double-click)
- [x] 12.2 Write unit tests for CandidateForm (create mode, edit mode, chained combos, add/remove education and experience rows, CV button visibility)
