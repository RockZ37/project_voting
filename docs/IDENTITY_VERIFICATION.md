# Identity Verification

## Overview

The identity verification system combines client-side face scanning with server-side biometric matching. The browser captures a live face using TensorFlow face detection and generates a pixel-histogram embedding. The backend stores this embedding on first verification (enrollment) and compares subsequent scans against the stored template using cosine similarity.

This is a working biometric identity system suitable for development and staging environments. It verifies face presence, captures biometric data, enrolls users, and matches faces with a configurable threshold.

## Where It Lives

- Frontend scan UI: `src/views/VerifyIdentityView.tsx`
- Embedding capture: `src/views/VerifyIdentityView.tsx` (pixel-histogram encoder)
- Verification confirmation screen: `src/views/VerificationConfirmView.tsx`
- API client: `src/lib/api.ts`
- App flow and state: `src/App.tsx`
- Backend verification: `backend/src/verification.ts`
- Database schema: `backend/database/schema.sql` (and `.sqlite.sql`)
- Face embedding storage: `student_face_embeddings` table

## User Flow

### First Verification (Enrollment)

1. User logs in via credentials.
2. App switches to face scan screen.
3. Browser requests camera permission.
4. TensorFlow MediaPipe detector finds a face.
5. Scan completes at 100% confidence.
6. Client captures a 16×16 pixel-histogram embedding.
7. Embedding is sent to the backend.
8. Backend auto-enrolls the user (stores embedding in `student_face_embeddings`).
9. Session marked as `verified`.
10. User sees confirmation screen and proceeds to ballot.

### Subsequent Verifications (Matching)

1. User logs in and scans face again.
2. Client captures a new 16×16 embedding.
3. Backend retrieves the stored enrollment.
4. Server computes cosine similarity between live and enrolled embedding.
5. If similarity ≥ threshold (default 0.78), session is `verified`.
6. If similarity < threshold, session is `rejected`.
7. User can proceed or learn that re-enrollment is needed.

## Client-Side Scan Logic

The verification screen (`VerifyIdentityView.tsx`) does the following:

1. Opens the user-facing camera with `getUserMedia`.
2. Uses `@tensorflow-models/face-detection` with the MediaPipe face detector.
3. Runs face detection in a loop (~180 ms intervals).
4. Increases progress when one face is detected; decreases otherwise.
5. When progress reaches 100%, stops the camera.
6. Captures a 16×16 pixel-histogram embedding from the video frame:
   - Downsamples the video frame to 16×16 pixels.
   - Converts RGB to grayscale.
   - Center the pixel values (subtract mean).
   - Normalize using L2 norm.
7. Passes the embedding to the backend via `api.completeVerification({ embedding })`.

### Error Handling

- Camera permission denied
- Browser does not support camera access
- Device not in secure context (HTTPS required)
- Face detector initialization fails
- Unable to capture embedding from live frame

## Verification Confirmation Screen

After scanning, the app shows the student record in `VerificationConfirmView`.

The user can:

- **Proceed to Ballot** if `student.status === "Active"` and verification succeeded.
- **Enroll Face** to save/update the biometric template (optional on confirmation).
- **Cancel and Return** to re-authenticate.

If verification failed (match score below threshold), an error message guides the user to try scanning again.

## Backend Verification API

### Start Session

`POST /verification/start`

Request:
```json
{
  "electionId": "uuid",
  "voterId": "uuid (optional)",
  "method": "face",
  "ttlMinutes": 15,
  "metadata": { "custom": "data" }
}
```

Response: New verification session with `status: "pending"`.

### Complete Session (with Embedding)

`POST /verification/:id/complete`

Request (with biometric matching):
```json
{
  "embedding": [0.1, 0.2, ..., 0.3],
  "notes": "optional notes"
}
```

Backend behavior:
- Retrieves the latest stored embedding for the voter's student identity.
- If no enrollment exists:
  - Stores the incoming embedding as the enrollment.
  - Sets `status: "verified"` and `score: 1.0`.
  - Records `notes: "Auto-enrolled biometric template from first verification"`.
- If enrollment exists:
  - Computes cosine similarity between stored and incoming embeddings.
  - If similarity ≥ `FACE_MATCH_THRESHOLD` (default 0.78): `status: "verified"`.
  - If similarity < threshold: `status: "rejected"`.
  - Stores the computed `score` and descriptive `notes`.

Response: Updated session with `status`, `score`, and embedded metadata.

### Explicit Enrollment Endpoint

`POST /verification/enroll`

Request:
```json
{
  "embedding": [0.1, 0.2, ..., 0.3],
  "metadata": { "enrollmentSource": "manual" }
}
```

Response: Created enrollment record.

Use this endpoint to let users proactively enroll a face outside of voting verification.

### Get Session

`GET /verification/:id`

Returns the current session state (status, score, notes, metadata).

## Server-Side Biometric Matching

The matching algorithm:

1. **Normalization**: Each embedding is L2-normalized (divide by magnitude).
2. **Similarity**: Computes the dot product (cosine similarity) between normalized embeddings.
3. **Threshold**: Compares similarity to `FACE_MATCH_THRESHOLD` (environment variable, default 0.78).
4. **Decision**: 
   - Similarity ≥ threshold → verified
   - Similarity < threshold → rejected

Environment variable: `FACE_MATCH_THRESHOLD=0.78` (or customize).

## Data Model

### `student_face_embeddings` Table

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `student_identity_id` | UUID | Foreign key to `student_identities` |
| `model` | TEXT | Embedding model (e.g., "pixel-histogram-v1") |
| `embedding` | JSONB | Normalized embedding vector + metadata |
| `created_at` | TIMESTAMP | Enrollment timestamp |

Indexes: `idx_student_face_embeddings_student_id` for fast lookups.

### `verification_sessions` Table Updates

Extended to support biometric results:

| Column | Type | Notes |
|--------|------|-------|
| `score` | NUMERIC | Match similarity score (0–1) |
| `metadata` | JSONB | Includes `biometricModel`, `matchThreshold`, `embeddingLength`, `matchScore` |

## What the Current System Verifies

The system now verifies:

✅ The user can access a live camera  
✅ A single face is present and stable in the frame  
✅ The user has a matching student record  
✅ The student record is marked Active  
✅ **The live face embedding matches the enrolled template (new)**  
✅ The match score is above the configured threshold  
✅ Verification session is recorded server-side with audit trail  

Still NOT verified:

- Liveness (is the face real or a replay/photo?)
- Anti-spoofing checks
- Multi-factor identity (e.g., liveness + ID card scan)
- Continuous liveness during voting

## Production Readiness

### Current Limitations

- **Embedding model** is a simple pixel-histogram, not a deep CNN. Suitable for development; not resilient to lighting, pose, or scale changes.
- **No liveness detection**. An attacker could replay a recorded video or hold up a photo.
- **No anti-spoofing**. Depth, texture, or 3D checks are not implemented.
- **Threshold is static**. Environment-based configuration; no per-student or adaptive thresholds.
- **No re-enrollment flow**. Users cannot update their biometric if lighting or appearance changes significantly.
- **Match score is not persisted long-term**. Only stored in the session; not kept for audit trails beyond session lifetime.

### To Deploy to Production

1. **Replace the embedding model**:
   - Use a deep face recognition model (e.g., `@tensorflow-models/coco-ssd` for detection, custom CNN or OpenFace for embeddings).
   - Or integrate a third-party service (AWS Rekognition, Azure Face, or on-prem solution).
   - Retrain or fine-tune the model on representative student photos from your institution.

2. **Add liveness detection**:
   - Implement a challenge-response (e.g., "blink twice" or "nod your head").
   - Or use a pre-trained liveness model (e.g., `face-api.js` or custom TensorFlow model).

3. **Implement enrollment UX**:
   - Let students enroll during registration (not during voting).
   - Capture multiple angles or frames to improve robustness.
   - Validate enrollment quality before storing.

4. **Threshold tuning**:
   - Run A/B tests to find an optimal threshold for your user population.
   - Consider False Acceptance Rate (FAR) vs. False Rejection Rate (FRR) trade-offs.
   - Document the business decision and audit implications.

5. **Audit and compliance**:
   - Log all verification attempts (already done).
   - Retain biometric data for the required retention period (be explicit about duration).
   - Provide transparent opt-out or fallback verification (e.g., manual review).
   - Consult legal/privacy teams on GDPR, BIPA, or local biometric laws.

6. **Infrastructure**:
   - Deploy the model on GPU or TPU if using a larger CNN.
   - Monitor inference latency and optimize for real-time responsiveness.
   - Add performance metrics and alerting (e.g., match time, matching timeout).

## Troubleshooting

### Camera Does Not Start

- Make sure the app is opened over HTTPS (use `pnpm run dev:mobile` for secure tunnel).
- Allow camera permissions in the browser.
- Check that your device supports `getUserMedia` API.

### Verification Scan Stalls

- Ensure one face is clearly visible and well-lit.
- Avoid multiple people in frame.
- Keep the face centered and steady (scanning takes ~10 seconds at 4% per frame).
- Check browser console for TensorFlow/WebGL errors.

### Verification Succeeds But Match Fails

- This happens when the enrolled embedding is from a different lighting or pose.
- Suggested fix: re-enroll by clicking "Enroll Face" on the confirmation screen, then try voting again.
- Or lower `FACE_MATCH_THRESHOLD` environment variable if false rejections are too high.

### User Session Expires

- Verification sessions expire after `ttlMinutes` (default 15 minutes).
- The user must log in and re-scan to create a new session.

### User Advances But Cannot Vote

- Confirm the student record is marked Active.
- Confirm the login session is still valid (check cookies in dev tools).
- Confirm the election is open (`status = "active"`).
- Check audit logs for verification failure details.

## API Reference

### Frontend API Client (`src/lib/api.ts`)

```typescript
api.startVerification(electionId: string, method?: string)
// Start a new verification session

api.completeVerification(sessionId: string, options: { embedding?: number[], ... })
// Complete verification with biometric matching

api.enrollFace(embedding: number[])
// Explicitly enroll a face for the current user
```

### Backend Endpoints

```
POST   /verification/start        - Create session
POST   /verification/:id/complete - Complete with embedding and matching
POST   /verification/enroll       - Explicit enrollment
GET    /verification/:id          - Retrieve session
```

## Environment Configuration

**Backend** (`.env` or system env vars):

- `FACE_MATCH_THRESHOLD=0.78` — Cosine similarity threshold (0–1, higher = stricter)
- `USE_SQLITE=true` — Use SQLite instead of PostgreSQL
- `DATABASE_URL=...` — PostgreSQL connection string (if not SQLite)
- `SESSION_SECRET=...` — Session encryption key

**Frontend** (Vite `.env` or in `vite.config.ts`):

- `VITE_API_BASE_URL=""` — Same-origin (or set to backend URL for CORS)

Run migrations after configuration:

```bash
pnpm -C backend migrate
```

## Deployment Checklist

- [ ] Database migrations applied (`student_face_embeddings` table exists)
- [ ] `backend/src/verification.ts` deployed with matching logic
- [ ] Frontend updated to capture and send embeddings
- [ ] `FACE_MATCH_THRESHOLD` configured appropriately
- [ ] HTTPS enabled (camera access requires secure context)
- [ ] Audit logs monitored for verification failures
- [ ] Privacy policy updated to mention biometric collection
- [ ] Legal review completed for biometric data handling
- [ ] Optional: Set up alerting for unusual match failures or session timeouts
- [ ] Optional: Implement re-enrollment flow in admin dashboard

## Summary

The system captures live face embeddings, auto-enrolls on first verification, and matches subsequent scans server-side using cosine similarity. It is suitable for development and staging environments with known user populations. For production elections, add liveness detection, upgrade the embedding model, and conduct threshold tuning and compliance review.
