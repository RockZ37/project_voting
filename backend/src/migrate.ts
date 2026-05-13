import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { closeDb, exec, isSqliteMode, query } from "./db";

async function ensureElectionScheduleColumns() {
  if (isSqliteMode()) {
    try {
      await query("ALTER TABLE elections ADD COLUMN start_at TIMESTAMP", []);
    } catch (err) {
      if (!String(err).includes("duplicate column name")) throw err;
    }
    try {
      await query("ALTER TABLE elections ADD COLUMN end_at TIMESTAMP", []);
    } catch (err) {
      if (!String(err).includes("duplicate column name")) throw err;
    }
    return;
  }

  await query("ALTER TABLE elections ADD COLUMN IF NOT EXISTS start_at TIMESTAMP WITH TIME ZONE", []);
  await query("ALTER TABLE elections ADD COLUMN IF NOT EXISTS end_at TIMESTAMP WITH TIME ZONE", []);
}

async function runMigrations() {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  const file = path.resolve(currentDir, isSqliteMode() ? "../database/schema.sqlite.sql" : "../database/schema.sql");
  const sql = fs.readFileSync(file, "utf8");
  try {
    await exec(sql);
    await ensureElectionScheduleColumns();
    console.log("Migrations applied successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await closeDb();
  }
}

runMigrations().catch((err) => {
  console.error(err);
  process.exit(1);
});
