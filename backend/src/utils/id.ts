import crypto from "crypto";

export function generateId() {
  // Generate a v4-like UUID string (without proper validation, but compatible format)
  // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return crypto.randomUUID();
}
