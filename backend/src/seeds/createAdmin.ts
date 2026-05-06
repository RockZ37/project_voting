import bcrypt from "bcryptjs";
import { closeDb, query } from "../db";
import { generateId } from "../utils/id";

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@civicvote.local";
  const password = process.env.ADMIN_PASSWORD || "adminpass";
  const role = "admin";

  const hash = await bcrypt.hash(password, 10);

  try {
    const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
    if ((existing.rowCount ?? 0) > 0) {
      console.log("Admin user already exists");
      return;
    }
    const id = generateId();
    await query("INSERT INTO users (id, email, password_hash, role, status) VALUES ($1, $2, $3, $4, 'active')", [id, email, hash, role]);
    console.log(`Admin user created: ${email}`);
  } finally {
    await closeDb();
  }
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
