import express from "express";
import bcrypt from "bcrypt";
import { query } from "./db";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

  try {
    const result = await query("SELECT id, email, password_hash, role FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash || "");
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    // attach to session
    req.session.user = { id: user.id, email: user.email, role: user.role };
    res.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
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
      const r = await query("SELECT * FROM student_identities WHERE id = (SELECT student_identity_id FROM voters WHERE id = (SELECT id FROM voters WHERE id = (SELECT id FROM users WHERE id = $1) LIMIT 1) LIMIT 1)", [user.id]);
      // note: this is a placeholder; linking between users and voters/student identities depends on your model
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
