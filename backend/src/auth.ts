import express from "express";
import { query } from "./db";

const router = express.Router();

const HTU_INDEX_NUMBER = /^032\d{7}$/;

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

    // Accept voter credentials without database lookup
    // Actual validation will happen during identity verification
    const sessionId = `voter-${Date.now()}`;
    req.session.user = { id: sessionId, email, role: "voter" };
    res.json({ ok: true, user: { id: sessionId, email, role: "voter" } });
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
