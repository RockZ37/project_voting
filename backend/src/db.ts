import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import session from "express-session";
import { Pool } from "pg";
import connectPgSimple from "connect-pg-simple";
import Database from "better-sqlite3";

dotenv.config();

type QueryResult = {
  rows: any[];
  rowCount: number;
};

const useSqlite = process.env.USE_SQLITE === "true";
const sqlitePath = path.resolve(process.cwd(), process.env.SQLITE_PATH || "./data/civicvote.db");
const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION || "";
const useSsl = process.env.DATABASE_SSL === "true" || /\.supabase\.co/i.test(connectionString);

let pgPool: Pool | null = null;
let sqliteDb: Database.Database | null = null;

function getPgPool() {
  if (!pgPool) {
    if (!connectionString) {
      // eslint-disable-next-line no-console
      console.warn("No DATABASE_URL or PG_CONNECTION provided. DB functions will fail until configured.");
    }
    pgPool = new Pool({
      connectionString: connectionString || undefined,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pgPool;
}

function getSqliteDb() {
  if (!sqliteDb) {
    fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
    sqliteDb = new Database(sqlitePath);
    sqliteDb.pragma("foreign_keys = ON");
    sqliteDb.pragma("journal_mode = WAL");
  }
  return sqliteDb;
}

export function isSqliteMode() {
  return useSqlite;
}

function toSqliteParams(params: any[] = []) {
  return params.map((value) => {
    if (value === null || value === undefined) return value;
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return JSON.stringify(value);
    if (typeof value === "object") return JSON.stringify(value);
    return value;
  });
}

function mapSql(sql: string) {
  let mapped = sql.replace(/\bILIKE\b/gi, "LIKE").replace(/\bnow\(\)\b/gi, "CURRENT_TIMESTAMP");
  const order: number[] = [];
  mapped = mapped.replace(/\$(\d+)/g, (_match, index) => {
    order.push(Number(index));
    return "?";
  });
  return {
    sql: mapped,
    order,
  };
}

function normalizeRow(row: any) {
  if (!row || typeof row !== "object") return row;
  const normalized = { ...row };
  for (const key of ["platform", "metadata", "sess", "embedding"]) {
    const value = normalized[key];
    if (typeof value === "string") {
      try {
        normalized[key] = JSON.parse(value);
      } catch {
        // leave as-is
      }
    }
  }
  return normalized;
}

function asQueryResult(rows: any[]): QueryResult {
  return { rows: rows.map(normalizeRow), rowCount: rows.length };
}

export async function query(text: string, params: any[] = []): Promise<QueryResult> {
  if (useSqlite) {
    const db = getSqliteDb();
    const { sql, order } = mapSql(text);
    const bind = toSqliteParams(order.map((index) => params[index - 1]));
    const stmt = db.prepare(sql);
    const isReturning = /\bRETURNING\b/i.test(sql);
    const isSelect = /^\s*(SELECT|WITH|PRAGMA)/i.test(sql);

    if (isSelect || isReturning) {
      return asQueryResult(stmt.all(...bind));
    }

    const result = stmt.run(...bind);
    return { rows: [], rowCount: Number(result.changes || 0) };
  }

  const pool = getPgPool();
  const res = await pool.query(text, params);
  return { rows: res.rows, rowCount: Number(res.rowCount || res.rows.length) };
}

export async function exec(sql: string) {
  if (useSqlite) {
    getSqliteDb().exec(sql);
    return;
  }
  await getPgPool().query(sql);
}

export async function withTransaction<T>(fn: (txQuery: typeof query) => Promise<T>): Promise<T> {
  if (useSqlite) {
    const db = getSqliteDb();
    db.exec("BEGIN");
    try {
      const result = await fn(query);
      db.exec("COMMIT");
      return result;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  const pool = getPgPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const txQuery = async (text: string, params: any[] = []) => {
      const res = await client.query(text, params);
      return { rows: res.rows, rowCount: Number(res.rowCount || res.rows.length) };
    };
    const result = await fn(txQuery);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

class SqliteSessionStore extends session.Store {
  get(sid: string, callback: (err?: any, session?: session.SessionData | null) => void) {
    try {
      const row = getSqliteDb().prepare(
        "SELECT sess FROM session WHERE sid = ? AND (expires IS NULL OR expires > CURRENT_TIMESTAMP)"
      ).get(sid) as { sess?: string } | undefined;
      if (!row?.sess) return callback(null, null);
      callback(null, JSON.parse(row.sess));
    } catch (error) {
      callback(error);
    }
  }

  set(sid: string, sess: session.SessionData, callback?: (err?: any) => void) {
    try {
      const expires = sess.cookie?.expires ? new Date(sess.cookie.expires).toISOString() : null;
      getSqliteDb()
        .prepare(
          `INSERT INTO session (sid, sess, expires)
           VALUES (?, ?, ?)
           ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expires = excluded.expires`
        )
        .run(sid, JSON.stringify(sess), expires);
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  destroy(sid: string, callback?: (err?: any) => void) {
    try {
      getSqliteDb().prepare("DELETE FROM session WHERE sid = ?").run(sid);
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  touch(sid: string, sess: session.SessionData, callback?: () => void) {
    this.set(sid, sess, callback);
  }
}

export function createSessionStore() {
  if (useSqlite) {
    getSqliteDb().exec(
      `CREATE TABLE IF NOT EXISTS session (
        sid TEXT PRIMARY KEY,
        sess TEXT NOT NULL,
        expires TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_session_expires ON session(expires);`
    );
    return new SqliteSessionStore();
  }

  const PgSession = connectPgSimple(session as any);
  return new PgSession({ pool: getPgPool(), tableName: "session", createTableIfMissing: true });
}

export async function closeDb() {
  if (useSqlite) {
    sqliteDb?.close();
    sqliteDb = null;
    return;
  }

  if (pgPool) {
    await pgPool.end();
    pgPool = null;
  }
}
