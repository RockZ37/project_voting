import type { Request, Response, NextFunction } from "express";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function applySecurityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "0");
  next();
}

export function basicRateLimit(maxPerMinute = 120) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip || "unknown";
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + 60_000 });
      return next();
    }

    if (current.count >= maxPerMinute) {
      return res.status(429).json({ error: "Too many requests" });
    }

    current.count += 1;
    buckets.set(key, current);
    return next();
  };
}
