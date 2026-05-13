import express from "express";
import { z } from "zod";
import { query, withTransaction, isSqliteMode } from "./db";
import { requireAuth } from "./middleware/authz";
import { logAuditEvent } from "./audit";
import { generateId } from "./utils/id";

const router = express.Router();

const EMBEDDING_MODEL = "pixel-histogram-v1";
const MATCH_THRESHOLD = Number(process.env.FACE_MATCH_THRESHOLD || 0.78);

const StartSchema = z.object({
  electionId: z.string().uuid(),
  voterId: z.string().uuid().optional(),
  studentIdentityId: z.string().uuid().optional(),
  indexNumber: z.string().optional(),
  method: z.string().optional(),
  ttlMinutes: z.number().int().positive().max(120).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const CompleteSchema = z.object({
  status: z.enum(["verified", "rejected"]).optional(),
  score: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  embedding: z.array(z.number().finite()).min(64).optional(),
});

const EnrollSchema = z.object({
  studentIdentityId: z.string().uuid().optional(),
  embedding: z.array(z.number().finite()).min(64),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

function normalizeEmbedding(values: number[]) {
  const clean = values.map((value) => Number(value)).filter((value) => Number.isFinite(value));
  const magnitude = Math.sqrt(clean.reduce((sum, value) => sum + value * value, 0)) || 1;
  return clean.map((value) => value / magnitude);
}

function cosineSimilarity(a: number[], b: number[]) {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
  }
  return dot;
}

function extractStoredEmbedding(row: any): number[] {
  if (!row) return [];
  if (Array.isArray(row.embedding)) return row.embedding;
  if (row.embedding && Array.isArray(row.embedding.embedding)) return row.embedding.embedding;
  return [];
}

async function resolveStudentIdentityForActor(tx: typeof query, input: { studentIdentityId?: string; indexNumber?: string }) {
  if (input.studentIdentityId) {
    const byId = await tx("SELECT id, index_number, name, course FROM student_identities WHERE id = $1 LIMIT 1", [input.studentIdentityId]);
    return byId.rows[0] || null;
  }

  if (input.indexNumber) {
    const byIndex = await tx("SELECT id, index_number, name, course FROM student_identities WHERE index_number = $1 LIMIT 1", [input.indexNumber]);
    return byIndex.rows[0] || null;
  }

  return null;
}

async function resolveStudentIdentityId(tx: typeof query, voterId: string) {
  const voter = await tx("SELECT student_identity_id FROM voters WHERE id = $1 LIMIT 1", [voterId]);
  const studentIdentityId = voter.rows[0]?.student_identity_id;
  if (!studentIdentityId) {
    throw new Error("No student identity linked to voter");
  }
  return studentIdentityId as string;
}

async function getLatestFaceEmbedding(tx: typeof query, studentIdentityId: string) {
  const embedding = await tx(
    `SELECT id, student_identity_id, model, embedding, created_at
     FROM student_face_embeddings
     WHERE student_identity_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [studentIdentityId]
  );
  return embedding.rows[0] || null;
}

async function insertFaceEmbedding(tx: typeof query, studentIdentityId: string, embedding: number[], metadata?: Record<string, unknown>) {
  const row = await tx(
    `INSERT INTO student_face_embeddings (id, student_identity_id, model, embedding)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [generateId(), studentIdentityId, EMBEDDING_MODEL, { embedding: normalizeEmbedding(embedding), metadata: metadata ?? null }]
  );
  return row.rows[0];
}

async function resolveVoterIdForActor(tx: typeof query, actor: { id?: string; email?: string } | undefined) {
  if (!actor?.id) return undefined;

  const byUserId = await tx("SELECT id, user_id FROM voters WHERE user_id = $1 LIMIT 1", [actor.id]);
  const voterRow = byUserId.rows[0];
  if (voterRow?.id) return voterRow.id as string;

  if (actor.email) {
    const byEmail = await tx("SELECT id, user_id FROM voters WHERE email = $1 LIMIT 1", [actor.email]);
    const emailRow = byEmail.rows[0];
    if (emailRow?.id) {
      if (emailRow.user_id !== actor.id) {
        await tx("UPDATE voters SET user_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [actor.id, emailRow.id]);
      }
      return emailRow.id as string;
    }
  }

  return undefined;
}

async function resolveOrCreateVoterId(
  tx: typeof query,
  actor: { id?: string; email?: string } | undefined,
  studentRow: { id: string; index_number?: string; name?: string; course?: string } | null
) {
  if (actor?.id) {
    const byUserId = await tx("SELECT id, user_id, student_identity_id, name, email, department FROM voters WHERE user_id = $1 LIMIT 1", [actor.id]);
    const voterRow = byUserId.rows[0];
    if (voterRow?.id) {
      if (studentRow && voterRow.student_identity_id !== studentRow.id) {
        await tx(
          "UPDATE voters SET student_identity_id = $1, name = COALESCE(NULLIF(name, email), $2), department = COALESCE(department, $3), updated_at = CURRENT_TIMESTAMP WHERE id = $4",
          [studentRow.id, studentRow.name, studentRow.course ?? null, voterRow.id]
        );
      }
      return voterRow.id as string;
    }
  }

  if (studentRow?.id) {
    const byStudent = await tx("SELECT id, user_id FROM voters WHERE student_identity_id = $1 LIMIT 1", [studentRow.id]);
    const voterRow = byStudent.rows[0];
    if (voterRow?.id) {
      if (actor?.id && voterRow.user_id !== actor.id) {
        await tx("UPDATE voters SET user_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [actor.id, voterRow.id]);
      }
      return voterRow.id as string;
    }

    if (actor?.id || actor?.email || studentRow) {
      const voterId = generateId();
      await tx(
        `INSERT INTO voters (id, user_id, student_identity_id, name, email, registration_date, status, department)
         VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 'active', $6)` ,
        [voterId, actor?.id ?? null, studentRow.id, studentRow.name || actor?.email || "Voter", actor?.email ?? null, studentRow.course ?? null]
      );
      return voterId;
    }
  }

  return resolveVoterIdForActor(tx, actor);
}

router.use(requireAuth);

router.post("/start", async (req, res) => {
  const parsed = StartSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const actor = req.session.user;

  try {
    const electionId = parsed.data.electionId;
    const method = parsed.data.method ?? "manual";
    let voterId: string | undefined;

    const r = await withTransaction(async (tx) => {
      voterId = parsed.data.voterId;
      if (!voterId) {
        const studentRow = await resolveStudentIdentityForActor(tx, {
          studentIdentityId: parsed.data.studentIdentityId,
          indexNumber: parsed.data.indexNumber,
        });
        voterId = await resolveOrCreateVoterId(tx, actor, studentRow);
      }
      if (!voterId) {
        throw new Error("No voter profile linked to user");
      }

      const sessionId = generateId();
      const ttlMinutes = parsed.data.ttlMinutes ?? 15;
      const expiresExpr = isSqliteMode()
        ? "datetime('now', '+' || $6 || ' minutes')"
        : "now() + ($6::text || ' minutes')::interval";
      const result = await tx(
        `INSERT INTO verification_sessions (id, voter_id, election_id, status, expires_at, method, metadata)
         VALUES ($1,$2,$3,'pending', ${expiresExpr}, $4, $5)
         RETURNING *`,
        [sessionId, voterId, electionId, method, parsed.data.metadata ?? null, ttlMinutes]
      );
      return result;
    });

    await logAuditEvent({
      type: "verification.start",
      actorId: actor?.id,
      actorRole: actor?.role,
      targetId: r.rows[0].id,
      ip: req.ip,
      status: "success",
      metadata: { electionId, voterId, method },
    });

    res.status(201).json({ session: r.rows[0] });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    if (/No voter profile linked to user/i.test(message)) {
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/enroll", async (req, res) => {
  const parsed = EnrollSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const actor = req.session.user;

  try {
    const enrollment = await withTransaction(async (tx) => {
      const voterResult = await tx("SELECT id FROM voters WHERE user_id = $1 LIMIT 1", [actor?.id]);
      const voterId = voterResult.rows[0]?.id;
      const studentIdentityId = parsed.data.studentIdentityId || (voterId ? await resolveStudentIdentityId(tx, voterId) : null);

      if (!studentIdentityId) {
        throw new Error("No student identity available for enrollment");
      }

      const inserted = await insertFaceEmbedding(tx, studentIdentityId, parsed.data.embedding, parsed.data.metadata);
      return inserted;
    });

    await logAuditEvent({
      type: "verification.enroll",
      actorId: actor?.id,
      actorRole: actor?.role,
      targetId: enrollment.id,
      ip: req.ip,
      status: "success",
      metadata: { studentIdentityId: enrollment.student_identity_id, model: enrollment.model },
    });

    res.status(201).json({ enrollment });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    if (/No student identity available for enrollment|No student identity linked to voter/i.test(message)) {
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/complete", async (req, res) => {
  const { id } = req.params;
  const parsed = CompleteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const actor = req.session.user;

  try {
    const r = await withTransaction(async (tx) => {
      const sessionResult = await tx("SELECT * FROM verification_sessions WHERE id = $1 LIMIT 1", [id]);
      const sessionRow = sessionResult.rows[0];
      if (!sessionRow) {
        throw new Error("Verification session not found");
      }

      let status = parsed.data.status ?? sessionRow.status;
      let score = parsed.data.score ?? null;
      let notes = parsed.data.notes ?? null;
      let metadata = parsed.data.metadata ?? null;

      if (parsed.data.embedding) {
        const voterId = sessionRow.voter_id as string | undefined;
        if (!voterId) {
          throw new Error("Verification session is missing voter linkage");
        }

        const studentIdentityId = await resolveStudentIdentityId(tx, voterId);
        const incomingEmbedding = normalizeEmbedding(parsed.data.embedding);
        const enrollment = await getLatestFaceEmbedding(tx, studentIdentityId);

        if (!enrollment) {
          await insertFaceEmbedding(tx, studentIdentityId, incomingEmbedding, parsed.data.metadata);
          status = "verified";
          score = 1;
          notes = notes || "Auto-enrolled biometric template from first verification";
        } else {
          const storedEmbedding = normalizeEmbedding(extractStoredEmbedding(enrollment));
          const similarity = cosineSimilarity(storedEmbedding, incomingEmbedding);
          score = Number(Math.max(0, Math.min(1, similarity)).toFixed(4));
          status = similarity >= MATCH_THRESHOLD ? "verified" : "rejected";
          notes = notes || (status === "verified" ? "Biometric match approved" : "Biometric match below threshold");
        }

        metadata = {
          ...(metadata || {}),
          biometricModel: EMBEDDING_MODEL,
          matchThreshold: MATCH_THRESHOLD,
          embeddingLength: incomingEmbedding.length,
          matchScore: score,
        };
      }

      const updated = await tx(
        `UPDATE verification_sessions
         SET status = $1, score = $2, notes = $3, metadata = COALESCE($4, metadata), completed_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [status, score, notes, metadata ?? null, id]
      );

      return updated;
    });

    if (r.rowCount === 0) return res.status(404).json({ error: "Verification session not found" });

    await logAuditEvent({
      type: "verification.complete",
      actorId: actor?.id,
      actorRole: actor?.role,
      targetId: id,
      ip: req.ip,
      status: r.rows[0].status,
      metadata: { score: r.rows[0].score ?? null },
    });

    res.json({ session: r.rows[0] });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    if (/Verification session not found|Verification session is missing voter linkage|No student identity linked to voter/i.test(message)) {
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const r = await query("SELECT * FROM verification_sessions WHERE id = $1", [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Verification session not found" });
    res.json({ session: r.rows[0] });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
