## MODIFIED Requirements

### Requirement: Candidates route loads CandidatesPage
The `/candidates` route SHALL render `CandidatesPage` instead of `AddCandidatePage`. `AddCandidatePage` SHALL be removed from `App.tsx` imports and routing.

#### Scenario: /candidates renders CandidatesPage
- **WHEN** an authenticated user navigates to /candidates
- **THEN** the system SHALL render CandidatesPage (table + form) and NOT render AddCandidatePage

#### Scenario: AddCandidatePage is no longer imported
- **WHEN** App.tsx is inspected
- **THEN** there SHALL be no import or Route referencing AddCandidatePage
