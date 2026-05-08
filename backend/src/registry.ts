import express from "express";
import { z } from "zod";
import { query, withTransaction, isSqliteMode } from "./db";
import { requireAuth } from "./middleware/authz";
import { logAuditEvent } from "./audit";
import { generateId } from "./utils/id";
import { parseCsv, type CsvRow } from "./utils/csv";

const router = express.Router();

/**
 * Registry CSV schema: index_number, name, course, profile_picture_url, date, issue_date, valid_until
 */
function parseRegistryCsv(rows: CsvRow[]) {
  return rows.map((row) => ({
    index_number: (row.index_number || row["index number"] || "").trim(),
    name: (row.name || "").trim(),
    course: (row.course || "").trim(),
    profile_photo_url: (row.profile_picture_url || row["profile_picture"] || "").trim(),
    date: (row.date || "").trim(),
    issue_date: (row.issue_date || row["issue date"] || "").trim(),
    valid_until: (row.valid_until || row["valid until"] || "").trim(),
  }));
}

function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

function isDateExpired(validUntilStr: string): boolean {
  if (!validUntilStr || !isValidDate(validUntilStr)) return false;
  const validUntil = new Date(validUntilStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return validUntil < today;
}

/**
 * POST /registry/upload
 * Admin uploads student registry CSV
 * Replaces existing registry entries
 */
router.post("/upload", requireAuth, async (req, res) => {
  const actor = req.session.user;

  if (actor?.role !== "admin") {
    return res.status(403).json({ error: "Only admins can upload registry" });
  }

  try {
    const { csvText } = req.body as { csvText: string };
    if (!csvText) {
      return res.status(400).json({ error: "csvText is required" });
    }

    const parsed = parseCsv(csvText);
    if (parsed.length === 0) {
      return res.status(400).json({ error: "No valid rows in CSV" });
    }

    const registryRows = parseRegistryCsv(parsed);

    // Validate all rows before inserting
    const invalid = registryRows.filter((row) => !row.index_number || !row.name);
    if (invalid.length > 0) {
      return res.status(400).json({
        error: `${invalid.length} rows missing index_number or name`,
      });
    }

    const result = await withTransaction(async (tx) => {
      // Clear existing registry or update
      let inserted = 0;
      let updated = 0;

      for (const row of registryRows) {
        const existing = await tx("SELECT id FROM student_identities WHERE index_number = $1 LIMIT 1", [row.index_number]);

        if (existing.rows.length > 0) {
          const upResult = await tx(
            `UPDATE student_identities
             SET name = $1, course = $2, profile_photo_url = $3,
                 issue_date = $4, valid_until = $5, status = 'active', updated_at = CURRENT_TIMESTAMP
             WHERE index_number = $6`,
            [row.name, row.course || null, row.profile_photo_url || null, row.issue_date || null, row.valid_until || null, row.index_number]
          );
          if (upResult.rowCount) updated += 1;
        } else {
          const insResult = await tx(
            `INSERT INTO student_identities (id, index_number, name, course, profile_photo_url, issue_date, valid_until, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')`,
            [generateId(), row.index_number, row.name, row.course || null, row.profile_photo_url || null, row.issue_date || null, row.valid_until || null]
          );
          if (insResult.rowCount) inserted += 1;
        }
      }

      return { inserted, updated, total: inserted + updated };
    });

    await logAuditEvent({
      type: "registry.upload",
      actorId: actor?.id,
      actorRole: actor?.role,
      ip: req.ip,
      status: "success",
      metadata: { rowsInserted: result.inserted, rowsUpdated: result.updated, totalRows: registryRows.length },
    });

    res.json({
      message: "Registry uploaded successfully",
      stats: result,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);

    await logAuditEvent({
      type: "registry.upload",
      actorId: actor?.id,
      actorRole: actor?.role,
      ip: req.ip,
      status: "error",
      metadata: { error: message },
    });

    res.status(500).json({ error: "Server error during registry upload" });
  }
});

/**
 * GET /registry
 * Admin lists uploaded registry records
 */
router.get("/", requireAuth, async (req, res) => {
  const actor = req.session.user;

  if (actor?.role !== "admin") {
    return res.status(403).json({ error: "Only admins can view registry" });
  }

  try {
    const q = String(req.query.q || "").trim();
    const like = `%${q}%`;

    const result = await query(
      `SELECT id, index_number, name, course, profile_photo_url, issue_date, valid_until, status, created_at, updated_at
       FROM student_identities
       WHERE ($1 = '' OR index_number LIKE $2 OR name LIKE $2 OR course LIKE $2 OR status LIKE $2)
       ORDER BY updated_at DESC, created_at DESC
       LIMIT 500`,
      [q, like]
    );

    res.json({ students: result.rows });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Lightweight debug endpoint to verify registry router is reachable
router.get("/ping", (_req, res) => {
  res.json({ ok: true, route: "/registry/upload (POST) available for admins" });
});

/**
 * GET /registry/lookup/:indexNumber
 * Student looks up their details by index number
 */
router.get("/lookup/:indexNumber", async (req, res) => {
  const { indexNumber } = req.params;

  try {
    if (!indexNumber || indexNumber.length === 0) {
      return res.status(400).json({ error: "Index number is required" });
    }

    const result = await query("SELECT id, index_number, name, course, profile_photo_url, issue_date, valid_until, status FROM student_identities WHERE index_number = $1 LIMIT 1", [
      indexNumber,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Student not found in registry" });
    }

    const student = result.rows[0];

    // Check if expired
    if (student.valid_until && isDateExpired(student.valid_until)) {
      return res.status(403).json({
        error: "Student registration has expired",
        student: {
          ...student,
          expired: true,
        },
      });
    }

    // Check status
    if (student.status !== "active") {
      return res.status(403).json({ error: `Student status is ${student.status}`, student });
    }

    res.json({
      student: {
        id: student.id,
        index_number: student.index_number,
        name: student.name,
        course: student.course,
        profile_photo_url: student.profile_photo_url,
        issue_date: student.issue_date,
        valid_until: student.valid_until,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
