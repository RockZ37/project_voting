import type { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  return next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.session.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  };
}
