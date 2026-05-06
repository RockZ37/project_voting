import express from "express";
import { z } from "zod";
import { query, withTransaction } from "./db";
import { parseCsv } from "./utils/csv";
import { logAuditEvent } from "./audit";
import { requireAuth, requireRole } from "./middleware/authz";
import { generateId } from "./utils/id";

const router = express.Router();

const VoterCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  registrationDate: z.string().optional(),
  status: z.string().optional(),
  photoUrl: z.string().url().optional(),
  department: z.string().optional(),
  studentIdentityId: z.string().uuid().optional(),
});

router.use(requireAuth);

router.get("/", async (req, res) => {
  const q = String(req.query.q || "").trim();
  const status = String(req.query.status || "").trim();
  try {
    const values: string[] = [];
    const filters: string[] = [];
    if (q) {
      values.push(`%${q}%`);
      filters.push(`(v.name ILIKE $${values.length} OR v.email ILIKE $${values.length})`);
    }
    if (status) {
      values.push(status);
      filters.push(`v.status = $${values.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const sql = `
      SELECT v.*, s.index_number, s.course
      FROM voters v
      LEFT JOIN student_identities s ON s.id = v.student_identity_id
      ${whereClause}
      ORDER BY v.created_at DESC
    `;
    const r = await query(sql, values);
    res.json({ voters: r.rows });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", requireRole("admin"), async (req, res) => {
  const parsed = VoterCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });

  const data = parsed.data;
  try {
    const id = generateId();
    const r = await query(
      `INSERT INTO voters (id, name, email, registration_date, status, photo_url, department, student_identity_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        id,
        data.name,
        data.email ?? null,
        data.registrationDate ?? null,
        data.status ?? "active",
        data.photoUrl ?? null,
        data.department ?? null,
        data.studentIdentityId ?? null,
      ]
    );

    await logAuditEvent({
      type: "voter.create",
      actorId: req.session.user?.id,
      actorRole: req.session.user?.role,
      targetId: r.rows[0].id,
      ip: req.ip,
      status: "success",
      metadata: { email: data.email ?? null },
    });

    res.status(201).json({ voter: r.rows[0] });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/import-csv", requireRole("admin"), async (req, res) => {
  const csvText = String(req.body?.csvText || "");
  if (!csvText.trim()) return res.status(400).json({ error: "csvText is required" });

  const rows = parseCsv(csvText);
  if (rows.length === 0) return res.status(400).json({ error: "No CSV rows found" });

  try {
    let created = 0;
    await withTransaction(async (tx) => {
      for (const row of rows) {
        const name = row.name || row.full_name || "";
        if (!name) continue;

        const id = generateId();
        const email = row.email || null;
        const department = row.department || row.course || null;
        const status = row.status || "active";
        const registrationDate = row.registration_date || row.registrationdate || null;

        await tx(
          `INSERT INTO voters (id, name, email, department, status, registration_date)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [id, name, email, department, status, registrationDate]
        );
        created += 1;
      }
    });

    await logAuditEvent({
      type: "voter.import_csv",
      actorId: req.session.user?.id,
      actorRole: req.session.user?.role,
      ip: req.ip,
      status: "success",
      metadata: { rows: rows.length, created },
    });

    res.status(201).json({ ok: true, imported: created, totalRows: rows.length });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/:id", requireRole("admin"), async (req, res) => {
  const { id } = req.params;
  const allowed: Record<string, string> = {
    name: "name",
    email: "email",
    registrationDate: "registration_date",
    status: "status",
    photoUrl: "photo_url",
    department: "department",
    studentIdentityId: "student_identity_id",
  };

  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  Object.entries(req.body || {}).forEach(([key, value]) => {
    if (value === undefined || !(key in allowed)) return;
    updates.push(`${allowed[key]} = $${idx}`);
    values.push(value);
    idx += 1;
  });

  if (updates.length === 0) return res.status(400).json({ error: "No valid fields provided" });

  try {
    values.push(id);
    const sql = `UPDATE voters SET ${updates.join(", ")}, updated_at = now() WHERE id = $${idx} RETURNING *`;
    const r = await query(sql, values);
    if (r.rowCount === 0) return res.status(404).json({ error: "Voter not found" });
    res.json({ voter: r.rows[0] });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
