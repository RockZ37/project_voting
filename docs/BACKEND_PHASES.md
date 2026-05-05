# Backend Phases

This document defines the backend roadmap for the CivicVote frontend. The goal is to move from the current frontend-only experience to a secure, API-driven application without breaking the flows already implemented in the UI.

## 1) Backend Goals

The backend should provide:

- authentication and role-based access control
- election and candidate persistence
- voter registry storage and CSV import support
- ballot submission and vote counting
- identity verification support
- student identity and ID card record storage
- audit logs and traceability
- API endpoints that match the existing frontend screens

The backend should be introduced in phases so the frontend can be connected incrementally instead of all at once.

## 2) Recommended Backend Shape

A practical backend for this project should include:

- REST API for core application flows
- relational database for elections, candidates, voters, and votes
- validation layer for request payloads and file uploads
- audit logging for security-sensitive actions
- role-based authorization for admin and voter actions
- server-side rules for voting eligibility and election status

## 3) Shared Domain Models

These are the core entities the backend should support.

### User

Represents a login identity.

Fields:

- id
- email or username
- password hash or external auth reference
- role (`admin`, `voter`)
- status
- createdAt
- updatedAt

### Voter

Represents a voter record used by the registry and ballot flow.

Fields:

- id
- name
- email
- registrationDate
- status
- photoUrl
- department or course
- external index number if needed

### StudentIdentity

Represents the student ID card data used by authentication and verification.

Fields:

- id
- indexNumber
- name
- course
- profilePhotoUrl
- idCardFrontUrl
- idCardBackUrl
- issueDate
- validUntil
- status
- createdAt
- updatedAt

Notes:

- The front of the card should carry the student name, index number, course, and profile picture.
- The back of the card should carry the issue date and valid until date.
- If the backend stores only one student record per person, the StudentIdentity model can be merged into User or Voter, but the same fields should still exist.

### Election

Represents an election shown on the frontend.

Fields:

- id
- title
- category
- description
- status (`Open`, `Upcoming`, `Closed`)
- ballotType
- maxVotesPerVoter
- bannerUrl
- createdAt
- updatedAt

### Candidate

Represents a candidate under a specific election.

Fields:

- id
- electionId
- name
- party or department
- description
- photoUrl
- platform or priorities
- voteCount
- createdAt
- updatedAt

### Vote

Represents a cast ballot.

Fields:

- id
- electionId
- candidateId
- voterId
- castAt
- verificationStatus
- receiptCode

### AuditLog

Represents security and administrative activity.

Fields:

- id
- timestamp
- type
- actorId
- actorRole
- targetId
- ip
- status
- metadata

## 4) Phase Plan

### Phase 1: Core Backend Foundation

This phase creates the base infrastructure that all frontend screens will use.

#### Scope

- initialize the server project
- choose database and ORM
- define shared models and migrations, including student identity records
- set up configuration and environment variables
- add API response conventions
- implement health check and base error handling

#### Deliverables

- backend project scaffold
- database schema for users, student identities, voters, elections, candidates, votes, and logs
- basic `/health` endpoint
- centralized validation and error responses

#### Frontend impact

- none yet, except future API readiness
- frontend can continue using local state until the next phases are ready

#### Acceptance criteria

- server starts cleanly
- database schema is created successfully
- all core entities exist in the backend model
- student identity fields match the ID card layout used by the frontend
- validation and error handling are available

---

### Phase 2: Authentication and Roles

This phase connects the login and admin entry flow to the backend.

#### Scope

- user login endpoint
- role detection for admin and voter
- session or token-based authentication
- protected routes and authorization middleware
- admin and voter session payloads

#### Deliverables

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- role checks for admin-only endpoints

#### Frontend impact

- replaces local admin/student session assumptions
- supports the current Auth screen and admin entry path
- provides profile data for the header and session state
- exposes student card details for verification and profile rendering

#### Acceptance criteria

- admin users can log in and receive an admin session
- voter users can log in and receive a voter session
- unauthorized requests are blocked correctly
- frontend can display the current session identity
- student identity payloads include name, index number, course, profile picture, issue date, and valid until date

---

### Phase 2.5: Student Identity and Verification Records

This phase can be introduced alongside authentication or before the full verification flow if the student record shape needs to be established early.

#### Scope

- create and store student identity records
- validate card issue and expiry dates
- link student identity to login and verification
- expose read-only student profile data for the header and account views

#### Deliverables

- `GET /students/:indexNumber`
- `GET /students/me`
- `POST /students`
- `PATCH /students/:id`

#### Frontend impact

- the profile icon can render real student or admin identity data
- the verification screen can confirm the student record before advancing
- the header can show card-related fields without relying on local mock data

#### Acceptance criteria

- student records include the fields shown on the physical ID card
- issue date and valid until date are validated server-side
- the frontend can request the current student profile from the backend

---

### Phase 3: Election and Candidate Management

This phase powers the admin dashboard and the sidebar grouping.

#### Scope

- create elections
- list elections
- fetch a single election with nested candidates
- create candidates under a selected election
- update candidate ordering or metadata if needed
- close or archive elections

#### Deliverables

- `GET /elections`
- `GET /elections/:id`
- `POST /elections`
- `PATCH /elections/:id`
- `POST /elections/:id/candidates`
- `GET /elections/:id/candidates`

#### Frontend impact

- admin dashboard uses backend election data instead of local arrays
- admin sidebar can show elections and their candidates from the API
- create election screen persists to the backend
- create candidate screen attaches candidates to the correct election

#### Acceptance criteria

- a new election appears in the elections list after creation
- a new candidate appears under the correct election
- the frontend can render nested election/candidate data without local-only state

---

### Phase 4: Voter Registry and CSV Import

This phase replaces the registry demo behavior with real stored voter data.

#### Scope

- store voter records in the database
- search and filter voters server-side or client-side through API results
- import voter CSV files
- deduplicate voter records
- validate required columns and row formats

#### Deliverables

- `GET /voters`
- `GET /voters/:id`
- `POST /voters/import-csv`
- optional `GET /voters/search?q=` for server-side search

#### Frontend impact

- registry table can load from backend data
- search button can query real records
- CSV upload can persist records instead of only updating local state

#### Acceptance criteria

- admins can upload a CSV 
- invalid CSV files return useful validation errors
- registry search returns matching records consistently

---

### Phase 5: Voting and Ballot Submission

This phase supports the ballot flow used by voters.

#### Scope

- fetch active elections available to a voter
- return election details and candidate list
- record ballot submission
- enforce one vote per voter per election
- prevent voting in closed elections
- generate receipt or verification code

#### Deliverables

- `GET /ballots/available`
- `GET /ballots/:electionId`
- `POST /votes`
- `GET /votes/:receiptCode`
- vote count aggregation for results screens

#### Frontend impact

- ballot selection becomes server-backed
- review and success screens can use real vote receipts
- results view can read actual vote counts

#### Acceptance criteria

- only eligible voters can cast a vote
- duplicate votes are rejected
- closed elections cannot accept ballots
- vote counts update correctly after submission

---

### Phase 6: Identity Verification Support

This phase integrates backend support for the verification screen.

#### Scope

- verification session tracking
- identity lookup by index number or voter record
- optional biometric verification state storage
- progress tracking and verification outcome recording

#### Deliverables

- `POST /verification/start`
- `POST /verification/confirm`
- `GET /verification/:sessionId`

#### Frontend impact

- verification screen can report status to the backend
- admin and voter verification sessions can be tracked
- the app can store whether a session was approved, pending, or rejected

#### Acceptance criteria

- verification sessions can be started and completed
- verification results are persisted
- frontend can continue to show progress feedback

---

### Phase 7: Audit Logs and Security

This phase hardens the system and supports the admin logs screen.

#### Scope

- log authentication events
- log election management actions
- log registry imports
- log vote submission events
- store IP, timestamp, and action metadata
- add rate limiting and request auditing

#### Deliverables

- `GET /logs`
- `GET /logs/:id`
- internal audit hook for sensitive actions

#### Frontend impact

- admin logs page can read actual backend events
- security events become visible in the UI

#### Acceptance criteria

- every sensitive admin action creates an audit record
- logs are queryable and filterable
- failed security actions are also tracked

---

### Phase 8: Reporting, Monitoring, and Deployment Readiness

This phase prepares the system for production-style use.

#### Scope

- dashboard metrics
- election statistics
- voter and candidate summaries
- logging and monitoring hooks
- deployment configuration
- environment separation for local, staging, and production

#### Deliverables

- admin metrics endpoints
- health and readiness endpoints
- deployment documentation
- environment variable reference

#### Frontend impact

- dashboard cards and charts can read real metrics
- app is ready for deployment against a stable API

#### Acceptance criteria

- backend can be deployed reliably
- frontend can point to environment-specific API URLs
- basic system monitoring is available

## 5) Suggested API Categories

A clean API structure for the frontend would look like this:

- `/auth` for login and session data
- `/elections` for election management
- `/elections/:id/candidates` for nested candidate operations
- `/voters` for registry management
- `/votes` for ballot submission
- `/verification` for identity verification support
- `/logs` for audit and admin history
- `/me` or `/profile` for current session details

## 6) Frontend-to-Backend Mapping

This is the practical order for integration.

1. Auth and current session data
2. Admin profile and header identity
3. Election list and election creation
4. Candidate creation under election
5. Registry loading and CSV import
6. Registry search/filter behavior
7. Ballot and vote submission
8. Verification status support
9. Audit logs and metrics

## 7) Recommended Implementation Order

If the backend work starts now, the safest sequence is:

1. Define schema and API contracts
2. Build auth and role checks
3. Connect election and candidate endpoints
4. Add registry import and search
5. Add voting endpoints
6. Add verification support
7. Add audit logs and analytics
8. Replace remaining local frontend state

## 8) Non-Goals for the First Backend Pass

To keep the first version manageable, avoid these until the core flows are working:

- real payment or external identity integrations
- advanced analytics pipelines
- multi-tenant organization management
- live websocket updates
- complex approval workflows beyond the current frontend needs

## 9) Phase Success Criteria

The backend phase rollout is complete when:

- the frontend no longer depends on mock arrays for core admin data
- elections and candidates persist between refreshes
- voter registry uploads are stored in the backend
- votes are submitted and counted server-side
- audit and verification records are available
- the admin and voter experiences match the current UI flows

## 10) Summary

The backend should be built in the same order as the frontend experiences:

- foundation first
- auth next
- elections and candidates after that
- registry and voting flows next
- security, logs, and deployment last

That approach keeps the existing frontend usable while the backend is introduced incrementally.
