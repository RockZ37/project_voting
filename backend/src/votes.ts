import express from "express";
import { z } from "zod";
import { pool, query } from "./db";
import { requireAuth } from "./middleware/authz";
import { generateReceiptCode } from "./utils/receipt";
import { logAuditEvent } from "./audit";

const router = express.Router();

const CastVoteSchema = z.object({
  electionId: z.string().uuid(),
  candidateId: z.string().uuid(),
  voterId: z.string().uuid().optional(),
  verificationSessionId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

router.use(requireAuth);

router.post("/cast", async (req, res) => {
  const parsed = CastVoteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });

  const { electionId, candidateId, verificationSessionId, metadata } = parsed.data;
  const actor = req.session.user;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let voterId = parsed.data.voterId;
    if (!voterId) {
      const vr = await client.query("SELECT id FROM voters WHERE user_id = $1 LIMIT 1", [actor?.id]);
      voterId = vr.rows[0]?.id;
    }
    if (!voterId) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "No voter profile linked to user" });
    }

    const election = await client.query("SELECT id, status FROM elections WHERE id = $1", [electionId]);
    if (election.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Election not found" });
    }
    if (election.rows[0].status !== "active") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Election is not active" });
    }

    const cand = await client.query("SELECT id FROM candidates WHERE id = $1 AND election_id = $2", [candidateId, electionId]);
    if (cand.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Candidate does not belong to election" });
    }

    if (verificationSessionId) {
      const vr = await client.query(
        "SELECT id FROM verification_sessions WHERE id = $1 AND voter_id = $2 AND election_id = $3 AND status = 'verified'",
        [verificationSessionId, voterId, electionId]
      );
      if (vr.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Verification session is not verified" });
      }
    }

    const existing = await client.query("SELECT id FROM votes WHERE election_id = $1 AND voter_id = $2", [electionId, voterId]);
    if ((existing.rowCount ?? 0) > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Vote already cast for this election" });
    }

    const receiptCode = generateReceiptCode();
    const inserted = await client.query(
      `INSERT INTO votes (election_id, candidate_id, voter_id, verification_status, receipt_code, metadata)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, cast_at, receipt_code`,
      [electionId, candidateId, voterId, verificationSessionId ? "verified" : "unverified", receiptCode, metadata ?? null]
    );

    await client.query("UPDATE elections SET vote_count = vote_count + 1, updated_at = now() WHERE id = $1", [electionId]);
    await client.query("UPDATE candidates SET vote_count = vote_count + 1, updated_at = now() WHERE id = $1", [candidateId]);

    await client.query("COMMIT");

    await logAuditEvent({
      type: "vote.cast",
      actorId: actor?.id,
      actorRole: actor?.role,
      targetId: inserted.rows[0].id,
      ip: req.ip,
      status: "success",
      metadata: { electionId, candidateId, voterId },
    });

    res.status(201).json({ vote: inserted.rows[0] });
  } catch (err: any) {
    await client.query("ROLLBACK");
    // eslint-disable-next-line no-console
    console.error(err);
    if (err?.code === "23505") {
      return res.status(409).json({ error: "Duplicate vote attempt" });
    }
    return res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

router.get("/elections/:electionId/results", async (req, res) => {
  const { electionId } = req.params;
  try {
    const election = await query("SELECT id, title, status, vote_count FROM elections WHERE id = $1", [electionId]);
    if (election.rowCount === 0) return res.status(404).json({ error: "Election not found" });

    const results = await query(
      `SELECT c.id, c.name, c.party, c.vote_count,
              COALESCE((c.vote_count::decimal / NULLIF(e.vote_count, 0)) * 100, 0) AS percentage
       FROM candidates c
       JOIN elections e ON e.id = c.election_id
       WHERE c.election_id = $1
       ORDER BY c.vote_count DESC, c.created_at ASC`,
      [electionId]
    );

    res.json({ election: election.rows[0], results: results.rows });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
