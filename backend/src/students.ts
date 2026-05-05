import express from "express";
import { z } from "zod";
import { query } from "./db";

const router = express.Router();

const StudentCreate = z.object({
  indexNumber: z.string().min(1),
  name: z.string().min(1),
  course: z.string().optional(),
  profilePhotoUrl: z.string().url().optional(),
  idCardFrontUrl: z.string().url().optional(),
  idCardBackUrl: z.string().url().optional(),
  issueDate: z.string().optional(),
  validUntil: z.string().optional(),
});

router.post("/", async (req, res) => {
  const parsed = StudentCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });

  const { indexNumber, name, course, profilePhotoUrl, idCardFrontUrl, idCardBackUrl, issueDate, validUntil } = parsed.data;

  try {
    const insert = await query(
      `INSERT INTO student_identities (index_number, name, course, profile_photo_url, id_card_front_url, id_card_back_url, issue_date, valid_until)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [indexNumber, name, course ?? null, profilePhotoUrl ?? null, idCardFrontUrl ?? null, idCardBackUrl ?? null, issueDate ?? null, validUntil ?? null]
    );

    res.status(201).json({ student: insert.rows[0] });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Student with that index number already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/index/:indexNumber", async (req, res) => {
  const { indexNumber } = req.params;
  try {
    const r = await query("SELECT * FROM student_identities WHERE index_number = $1", [indexNumber]);
    if (r.rowCount === 0) return res.status(404).json({ student: null });
    res.json({ student: r.rows[0] });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// current student's profile (based on session -> voter -> student link if present)
router.get("/me", async (req, res) => {
  // if user is linked to a voter record which links to student_identity_id
  const user = req.session.user;
  if (!user) return res.status(200).json({ student: null });

  try {
    // try to find voter record by email or user id
    const r = await query(
      `SELECT s.* FROM student_identities s
       JOIN voters v ON v.student_identity_id = s.id
       JOIN users u ON u.email = v.email
       WHERE u.id = $1 LIMIT 1`,
      [user.id]
    );
    if (r.rowCount === 0) return res.json({ student: null });
    return res.json({ student: r.rows[0] });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

const StudentPatch = z.object({
  name: z.string().optional(),
  course: z.string().optional(),
  profilePhotoUrl: z.string().url().optional(),
  idCardFrontUrl: z.string().url().optional(),
  idCardBackUrl: z.string().url().optional(),
  issueDate: z.string().optional(),
  validUntil: z.string().optional(),
  status: z.string().optional(),
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const parsed = StudentPatch.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });

  const fields = parsed.data;
  const setParts: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue;
    setParts.push(`${k === "profilePhotoUrl" ? "profile_photo_url" : k === "idCardFrontUrl" ? "id_card_front_url" : k === "idCardBackUrl" ? "id_card_back_url" : k === "issueDate" ? "issue_date" : k === "validUntil" ? "valid_until" : k} = $${idx}`);
    values.push(v);
    idx += 1;
  }
  if (setParts.length === 0) return res.status(400).json({ error: "No updatable fields provided" });

  try {
    const sql = `UPDATE student_identities SET ${setParts.join(", ")}, updated_at = now() WHERE id = $${idx} RETURNING *`;
    values.push(id);
    const r = await query(sql, values);
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
    return res.json({ student: r.rows[0] });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
