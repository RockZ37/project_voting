import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION || "";

if (!connectionString) {
  // eslint-disable-next-line no-console
  console.warn("No DATABASE_URL or PG_CONNECTION provided. DB functions will fail until configured.");
}

export const pool = new Pool({ connectionString });

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}
