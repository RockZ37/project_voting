import { query } from "./db";

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
  await query(
    `INSERT INTO audit_logs (type, actor_id, actor_role, target_id, ip, status, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
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
