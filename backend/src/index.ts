import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import authRouter from "./auth";
import studentsRouter from "./students";
import electionsRouter from "./elections";
import votersRouter from "./voters";
import votesRouter from "./votes";
import verificationRouter from "./verification";
import auditLogsRouter from "./auditLogs";
import { applySecurityHeaders, basicRateLimit } from "./middleware/security";

dotenv.config();

const PORT = process.env.PORT || 4000;
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-session-secret";

const app = express();

const PgSession = connectPgSimple(session as any);

app.use(cors({ credentials: true, origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json({ limit: "5mb" }));
app.use(applySecurityHeaders);
app.use(basicRateLimit(180));

app.use(
  session({
    store: new PgSession({ pool, tableName: "session", createTableIfMissing: true }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8,
    },
  }) as any
);

app.use("/auth", authRouter);
app.use("/students", studentsRouter);
app.use("/elections", electionsRouter);
app.use("/voters", votersRouter);
app.use("/votes", votesRouter);
app.use("/verification", verificationRouter);
app.use("/audit-logs", auditLogsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/", (_req, res) => {
  res.json({ message: "CivicVote backend scaffold. See /health" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
