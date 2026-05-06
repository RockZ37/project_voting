import express from "express";
import { z } from "zod";
import { pool, query } from "./db";
import { requireAuth } from "./middleware/authz";
import { logAuditEvent } from "./audit";

const router = express.Router();

const StartSchema = z.object({
  electionId: z.string().uuid(),
  voterId: z.string().uuid().optional(),
  method: z.string().optional(),
  ttlMinutes: z.number().int().positive().max(120).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const CompleteSchema = z.object({
  status: z.enum(["verified", "rejected"]),
  score: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

router.use(requireAuth);

router.post("/start", async (req, res) => {
  const parsed = StartSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const actor = req.session.user;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const electionId = parsed.data.electionId;

    let voterId = parsed.data.voterId;
    if (!voterId) {
      const vr = await client.query("SELECT id FROM voters WHERE user_id = $1 LIMIT 1", [actor?.id]);
      voterId = vr.rows[0]?.id;
    }
    if (!voterId) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "No voter profile linked to user" });
    }

    const ttlMinutes = parsed.data.ttlMinutes ?? 15;
    const method = parsed.data.method ?? "manual";
    const r = await client.query(
      `INSERT INTO verification_sessions (voter_id, election_id, status, expires_at, method, metadata)
       VALUES ($1,$2,'pending', now() + ($3::text || ' minutes')::interval, $4, $5)
       RETURNING *`,
      [voterId, electionId, ttlMinutes, method, parsed.data.metadata ?? null]
    );
    await client.query("COMMIT");

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
    await client.query("ROLLBACK");
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

router.post("/:id/complete", async (req, res) => {
  const { id } = req.params;
  const parsed = CompleteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const actor = req.session.user;

  try {
    const r = await query(
      `UPDATE verification_sessions
       SET status = $1, score = $2, notes = $3, metadata = COALESCE($4, metadata), completed_at = now()
       WHERE id = $5
       RETURNING *`,
      [parsed.data.status, parsed.data.score ?? null, parsed.data.notes ?? null, parsed.data.metadata ?? null, id]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Verification session not found" });

    await logAuditEvent({
      type: "verification.complete",
      actorId: actor?.id,
      actorRole: actor?.role,
      targetId: id,
      ip: req.ip,
      status: parsed.data.status,
      metadata: { score: parsed.data.score ?? null },
    });

    res.json({ session: r.rows[0] });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
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
