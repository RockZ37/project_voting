import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { closeDb, exec, isSqliteMode } from "./db";

async function runMigrations() {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  const file = path.resolve(currentDir, isSqliteMode() ? "../database/schema.sqlite.sql" : "../database/schema.sql");
  const sql = fs.readFileSync(file, "utf8");
  try {
    await exec(sql);
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
