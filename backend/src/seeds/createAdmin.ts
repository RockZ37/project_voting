import bcrypt from "bcrypt";
import { pool } from "../db";

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@civicvote.local";
  const password = process.env.ADMIN_PASSWORD || "adminpass";
  const role = "admin";

  const hash = await bcrypt.hash(password, 10);

  const client = await pool.connect();
  try {
    const existing = await client.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rowCount > 0) {
      console.log("Admin user already exists");
      return;
    }
    await client.query(
      "INSERT INTO users (id, email, password_hash, role, status) VALUES (gen_random_uuid(), $1, $2, $3, 'active')",
      [email, hash, role]
    );
    console.log(`Admin user created: ${email}`);
  } finally {
    client.release();
    await pool.end();
  }
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
