import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db";

async function runMigrations() {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  const file = path.resolve(currentDir, "../database/schema.sql");
  const sql = fs.readFileSync(file, "utf8");
  try {
    await pool.query("BEGIN");
    await pool.query(sql);
    await pool.query("COMMIT");
    console.log("Migrations applied successfully.");
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error(err);
  process.exit(1);
});
