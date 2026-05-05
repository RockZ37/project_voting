import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import authRouter from "./auth";
import studentsRouter from "./students";

dotenv.config();

const PORT = process.env.PORT || 4000;
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-session-secret";

const app = express();

const PgSession = connectPgSimple(session as any);

app.use(cors({ credentials: true, origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json({ limit: "5mb" }));

app.use(
  session({
    store: new PgSession({ pool, tableName: "session" }),
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
