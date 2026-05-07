# Identity Verification

## Overview

The current identity verification flow is a camera-based gate that runs in the browser before a voter can proceed to the ballot. It uses TensorFlow face detection to confirm that a single face is present and steady, then advances the user to a confirmation screen where the student record is checked.

This is a demo verification flow, not a full biometric identity system. It verifies presence and student status, but it does not compare the live face against an enrolled biometric template.

## Where It Lives

- Frontend scan UI: `src/views/VerifyIdentityView.tsx`
- Verification confirmation screen: `src/views/VerificationConfirmView.tsx`
- App flow and screen transitions: `src/App.tsx`
- Backend session tracking: `backend/src/verification.ts`

## User Flow

1. The user logs in through the auth screen.
2. The app switches to the verification screen.
3. The browser requests camera access.
4. TensorFlow face detection starts watching the live video feed.
5. When exactly one face is detected, progress increases.
6. When progress reaches 100, scanning stops.
7. The app loads the student record and shows the confirmation screen.
8. If the student is active, the user can continue to the elections.

## Client-Side Verification Logic

The verification screen does the following:

- Opens the user-facing camera with `getUserMedia`.
- Uses `@tensorflow-models/face-detection` with the MediaPipe face detector.
- Checks the live feed about every 180 ms.
- Increases progress when one face is visible.
- Decreases progress when no face or multiple faces are visible.
- Stops the camera once progress reaches 100.
- Calls the parent callback to move the app forward.

### Error Handling

The screen handles several failure cases:

- Camera permission denied
- Browser does not support camera access
- Device is not in a secure context
- Face detector initialization fails

## Confirmation Screen Logic

After scanning, the app shows the student record in `VerificationConfirmView`.

The user can continue only if:

- `student.status === "Active"`

If the student is not active, ballot access is blocked.

## Backend Verification Sessions

The backend stores verification session records in the `verification_sessions` table.

### Start Session

`POST /verification/start`

This endpoint:

- Accepts `electionId`, optional `voterId`, optional `method`, and optional metadata
- Resolves the voter when `voterId` is missing
- Creates a session with status `pending`
- Sets an expiration time
- Writes an audit log entry

### Complete Session

`POST /verification/:id/complete`

This endpoint:

- Marks the session as `verified` or `rejected`
- Stores score, notes, and metadata
- Writes an audit log entry

### Read Session

`GET /verification/:id`

This endpoint returns the stored verification session.

## What the Current System Actually Verifies

The current implementation verifies:

- The user can access a live camera
- A face is present in the frame
- The user has a matching student record in the app
- The student record is marked Active
- The verification session is recorded in the backend

It does not verify:

- That the detected face belongs to the student record
- That the user is alive and not replaying a photo or video
- That the face matches an enrolled biometric template
- That identity checks are performed server-side

## Limitations

This approach is suitable for demos and prototypes, but it is not production-grade biometric verification.

Main limitations:

- No enrolled face template
- No liveness detection
- No anti-spoofing checks
- No server-side biometric comparison
- No threshold-based matching score

## What True Identity Verification Would Take

A real identity verification system would need:

### 1. Enrollment

- Capture a reference face during registration
- Extract a biometric embedding
- Store the embedding securely and link it to the student record

### 2. Live Matching

- Capture a live face during login
- Extract a live embedding
- Compare it to the enrolled template
- Apply a confidence threshold for acceptance

### 3. Liveness Detection

- Detect real-time human presence
- Prevent photo, screen, and replay attacks
- Use blink, motion, challenge-response, or depth checks

### 4. Secure Storage

- Encrypt biometric data at rest
- Restrict access to biometric records
- Define retention and deletion rules

### 5. Backend Enforcement

- Move the match decision to the backend
- Store match scores and audit trails
- Reject session progression if verification fails

### 6. Privacy and Compliance

- Require explicit consent
- Publish a privacy notice
- Allow fallback/manual review
- Define appeal and deletion workflows

## Suggested Production Architecture

A production-grade flow would look like this:

1. Student enrolls a face during registration.
2. The system stores a biometric embedding.
3. The user logs in with credentials.
4. The app captures a live scan.
5. The scan is checked for liveness.
6. The live embedding is matched to the enrolled embedding.
7. The backend records the outcome.
8. Only verified sessions can access the ballot.

## Troubleshooting

### Camera Does Not Start

- Make sure the app is opened over HTTPS
- Allow camera permissions in the browser
- Use the secure mobile preview if testing on a phone

### Verification Never Completes

- Make sure one face is clearly visible
- Avoid multiple people in frame
- Keep the face centered and steady
- Check whether the browser supports WebGL and camera access

### User Advances But Still Cannot Vote

- Confirm the student record is active
- Confirm the login session is valid
- Confirm the election is open

## Summary

The current verification system is a browser-based face presence gate plus a student eligibility check. It is enough for the app’s demo flow, but true identity verification would require biometric enrollment, liveness detection, and server-side matching.
