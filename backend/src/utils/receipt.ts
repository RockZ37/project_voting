import crypto from "crypto";

export function generateReceiptCode() {
  return `rcpt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}
