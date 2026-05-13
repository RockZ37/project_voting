import express from "express";
import { z } from "zod";
import { query } from "./db";
import { generateId } from "./utils/id";

const router = express.Router();

const ElectionCreate = z.object({
  title: z.string().min(1),
  category: z.string().optional(),
  description: z.string().optional(),
  status: z.string().default("draft"),
  startAt: z.union([z.string(), z.null()]).optional(),
  endAt: z.union([z.string(), z.null()]).optional(),
  ballotType: z.string().default("single"),
  maxVotesPerVoter: z.number().int().positive().optional(),
  bannerUrl: z.union([z.string().url(), z.string().startsWith("data:image/")]).optional(),
});

const CandidateCreate = z.object({
  name: z.string().min(1),
  party: z.string().optional(),
  description: z.string().optional(),
  photoUrl: z.union([z.string().url(), z.string().startsWith("data:image/")]).optional(),
  platform: z.union([z.array(z.string()), z.record(z.string(), z.unknown())]).optional(),
});

const ElectionPatch = ElectionCreate.partial();
const CandidatePatch = CandidateCreate.partial();

function parseDate(value: unknown) {
  if (!value || typeof value !== "string") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function resolveElectionStatus(row: { status?: string; start_at?: string | null; end_at?: string | null; created_at?: string | null }) {
  const rawStatus = String(row.status || "draft").toLowerCase();
  if (rawStatus === "closed") return "closed";

  const startAt = row.start_at ? new Date(row.start_at).getTime() : null;
  const endAt = row.end_at ? new Date(row.end_at).getTime() : null;
  const createdAt = row.created_at ? new Date(row.created_at).getTime() : null;
  const now = Date.now();

  if (endAt !== null && now >= endAt) return "closed";
  if (startAt !== null && now < startAt) return "upcoming";
  if (startAt !== null && now >= startAt) return "active";
  if (rawStatus === "active") return "active";
  if (rawStatus === "draft") return createdAt !== null && now >= createdAt ? "active" : "upcoming";
  if (rawStatus === "upcoming") return "upcoming";
  return rawStatus;
}

function serializeElection(row: any) {
  return {
    ...row,
    status: resolveElectionStatus(row),
  };
}

router.post("/", async (req, res) => {
  const parsed = ElectionCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const { title, category, description, status, startAt, endAt, ballotType, maxVotesPerVoter, bannerUrl } = parsed.data;
  try {
    const id = generateId();
    const r = await query(
      `INSERT INTO elections (id, title, category, description, status, start_at, end_at, ballot_type, max_votes_per_voter, banner_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [id, title, category ?? null, description ?? null, status, parseDate(startAt), parseDate(endAt), ballotType, maxVotesPerVoter ?? 1, bannerUrl ?? null]
    );
    res.status(201).json({ election: serializeElection(r.rows[0]) });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const r = await query("SELECT * FROM elections ORDER BY created_at DESC");
    res.json({ elections: r.rows.map(serializeElection) });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const er = await query("SELECT * FROM elections WHERE id = $1", [id]);
    if (er.rowCount === 0) return res.status(404).json({ election: null });
    const cr = await query("SELECT * FROM candidates WHERE election_id = $1 ORDER BY created_at", [id]);
    res.json({ election: serializeElection(er.rows[0]), candidates: cr.rows });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const parsed = ElectionPatch.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });

  const colMap: Record<string, string> = {
    title: "title",
    category: "category",
    description: "description",
    status: "status",
    startAt: "start_at",
    endAt: "end_at",
    ballotType: "ballot_type",
    maxVotesPerVoter: "max_votes_per_voter",
    bannerUrl: "banner_url",
  };

  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  Object.entries(parsed.data).forEach(([k, v]) => {
    if (v === undefined) return;
    updates.push(`${colMap[k]} = $${idx}`);
    values.push(v);
    idx += 1;
  });

  if (!updates.length) return res.status(400).json({ error: "No updatable fields provided" });

  try {
    values.push(id);
    const sql = `UPDATE elections SET ${updates.join(", ")}, updated_at = now() WHERE id = $${idx} RETURNING *`;
    const r = await query(sql, values);
    if (r.rowCount === 0) return res.status(404).json({ error: "Election not found" });
    res.json({ election: serializeElection(r.rows[0]) });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const r = await query("DELETE FROM elections WHERE id = $1 RETURNING id", [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Election not found" });
    res.json({ ok: true, id: r.rows[0].id });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/candidates", async (req, res) => {
  const { id } = req.params; // election id
  const parsed = CandidateCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const { name, party, description, photoUrl, platform } = parsed.data;
  try {
    // ensure election exists
    const er = await query("SELECT id FROM elections WHERE id = $1", [id]);
    if (er.rowCount === 0) return res.status(404).json({ error: "Election not found" });
    const candidateId = generateId();
    const r = await query(
      `INSERT INTO candidates (id, election_id, name, party, description, photo_url, platform)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [candidateId, id, name, party ?? null, description ?? null, photoUrl ?? null, platform ?? null]
    );
    res.status(201).json({ candidate: r.rows[0] });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id/candidates", async (req, res) => {
  const { id } = req.params;
  try {
    const r = await query("SELECT * FROM candidates WHERE election_id = $1 ORDER BY created_at", [id]);
    res.json({ candidates: r.rows });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/candidates/:candidateId", async (req, res) => {
  const { candidateId } = req.params;
  const parsed = CandidatePatch.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });

  const colMap: Record<string, string> = {
    name: "name",
    party: "party",
    description: "description",
    photoUrl: "photo_url",
    platform: "platform",
  };

  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  Object.entries(parsed.data).forEach(([k, v]) => {
    if (v === undefined) return;
    updates.push(`${colMap[k]} = $${idx}`);
    values.push(v);
    idx += 1;
  });

  if (!updates.length) return res.status(400).json({ error: "No updatable fields provided" });

  try {
    values.push(candidateId);
    const sql = `UPDATE candidates SET ${updates.join(", ")}, updated_at = now() WHERE id = $${idx} RETURNING *`;
    const r = await query(sql, values);
    if (r.rowCount === 0) return res.status(404).json({ error: "Candidate not found" });
    res.json({ candidate: r.rows[0] });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/candidates/:candidateId", async (req, res) => {
  const { candidateId } = req.params;
  try {
    const r = await query("DELETE FROM candidates WHERE id = $1 RETURNING id", [candidateId]);
    if (r.rowCount === 0) return res.status(404).json({ error: "Candidate not found" });
    res.json({ ok: true, id: r.rows[0].id });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
