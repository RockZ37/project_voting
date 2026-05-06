import { query } from "./db";
import { generateId } from "./utils/id";

type AuditPayload = {
  type: string;
  actorId?: string | null;
  actorRole?: string | null;
  targetId?: string | null;
  ip?: string | null;
  status?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function logAuditEvent(payload: AuditPayload) {
  const id = generateId();
  await query(
    `INSERT INTO audit_logs (id, type, actor_id, actor_role, target_id, ip, status, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      id,
      payload.type,
      payload.actorId ?? null,
      payload.actorRole ?? null,
      payload.targetId ?? null,
      payload.ip ?? null,
      payload.status ?? null,
      payload.metadata ?? null,
    ]
  );
}
