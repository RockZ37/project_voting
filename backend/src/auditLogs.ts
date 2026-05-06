import express from "express";
import { query } from "./db";
import { requireAuth, requireRole } from "./middleware/authz";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 100), 500);
  try {
    const r = await query("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT $1", [limit]);
    res.json({ logs: r.rows });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
