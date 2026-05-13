import express from "express";
import { query } from "./db";
import { generateId } from "./utils/id";

const router = express.Router();

const HTU_INDEX_NUMBER = /^032\d{7}$/;

async function resolveStudentIdentityByIndex(indexNumber: string) {
  const r = await query("SELECT id, index_number, name, course FROM student_identities WHERE index_number = $1 LIMIT 1", [indexNumber]);
  return r.rows[0] ?? null;
}

router.post("/login", async (req, res) => {
  // eslint-disable-next-line no-console
  console.log("Login request body:", JSON.stringify(req.body, null, 2));
  const { email, indexNumber, isAdmin } = req.body as { email?: string; indexNumber?: string; isAdmin?: boolean };
  
  if (!email) return res.status(400).json({ error: "Missing email" });

  try {
    // For admin login: accept email only, no database validation
    if (isAdmin) {
      const sessionId = `admin-${Date.now()}`;
      req.session.user = { id: sessionId, email, role: "admin" };
      return res.json({ ok: true, user: { id: sessionId, email, role: "admin" } });
    }

    // For voter login: accept email + index, validate index format only
    if (!indexNumber) {
      return res.status(400).json({ error: "Missing HTU index number" });
    }
    if (!HTU_INDEX_NUMBER.test(indexNumber)) {
      return res.status(400).json({ error: "HTU index number must start with 032 and contain 10 digits total" });
    }

    const studentRow = await resolveStudentIdentityByIndex(indexNumber);

    const existingUser = await query("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
    let userId = existingUser.rows[0]?.id as string | undefined;

    if (!userId) {
      userId = generateId();
      await query("INSERT INTO users (id, email, password_hash, role, status) VALUES ($1, $2, NULL, $3, 'active')", [userId, email, "voter"]);
    }

    const existingVoter = await query("SELECT id, user_id, student_identity_id, name, email, department FROM voters WHERE email = $1 LIMIT 1", [email]);
    const voterRow = existingVoter.rows[0];

    if (voterRow) {
      const updates: string[] = [];
      const values: unknown[] = [];

      if (voterRow.user_id !== userId) {
        updates.push(`user_id = $${values.length + 1}`);
        values.push(userId);
      }

      if (studentRow) {
        if (voterRow.student_identity_id !== studentRow.id) {
          updates.push(`student_identity_id = $${values.length + 1}`);
          values.push(studentRow.id);
        }
        if (!voterRow.name || voterRow.name === voterRow.email) {
          updates.push(`name = $${values.length + 1}`);
          values.push(studentRow.name);
        }
        if (!voterRow.department && studentRow.course) {
          updates.push(`department = $${values.length + 1}`);
          values.push(studentRow.course);
        }
      }

      if (updates.length > 0) {
        values.push(voterRow.id);
        await query(`UPDATE voters SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length}`, values);
      }
    } else {
      const voterId = generateId();
      await query(
        "INSERT INTO voters (id, user_id, student_identity_id, name, email, registration_date, status, department) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 'active', $6)",
        [voterId, userId, studentRow?.id ?? null, studentRow?.name ?? email, email, studentRow?.course ?? null]
      );
    }

    req.session.user = { id: userId, email, role: "voter" };
    res.json({ ok: true, user: { id: userId, email, role: "voter" } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return res.status(500).json({ error: "Failed to destroy session" });
    }
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

router.get("/me", async (req, res) => {
  if (!req.session.user) return res.status(200).json({ user: null });
  const user = req.session.user;

  // optionally enrich with student identity if role is voter
  if (user.role === "voter") {
    try {
      const r = await query(
        `SELECT s.*
         FROM student_identities s
         JOIN voters v ON v.student_identity_id = s.id
         WHERE v.user_id = $1
         LIMIT 1`,
        [user.id]
      );
      const student = r.rows[0] ?? null;
      return res.json({ user: { ...user }, student });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return res.json({ user: { ...user }, student: null });
    }
  }

  return res.json({ user });
});

export default router;
