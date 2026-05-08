/// <reference types="vite/client" />

import type { AuditLog, Candidate, Election, SessionUser, Student, Voter, VoteReceipt } from "@/src/types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

type RequestOptions = RequestInit & { skipJson?: boolean };

function extractErrorMessage(errorPayload: unknown, status: number, path: string): string {
  if (!errorPayload || typeof errorPayload !== "object") {
    return `Request failed (${status}) at ${path}`;
  }

  const payload = errorPayload as { error?: unknown; message?: unknown };
  const candidate = payload.error ?? payload.message;

  if (typeof candidate === "string" && candidate.trim()) {
    return candidate;
  }

  if (candidate && typeof candidate === "object") {
    const flat = JSON.stringify(candidate);
    if (flat && flat !== "{}") {
      return `Validation error: ${flat}`;
    }
  }

  return `Request failed (${status}) at ${path}`;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = options.skipJson ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(extractErrorMessage(data, response.status, path));
  }

  return data as T;
}

function mapElectionStatus(status?: string): Election["status"] {
  if (status === "active") return "Open";
  if (status === "closed") return "Closed";
  return "Upcoming";
}

function toCandidate(row: any): Candidate {
  return {
    id: row.id,
    name: row.name,
    party: row.party || "Independent",
    description: row.description || "",
    photoUrl: row.photo_url || "https://picsum.photos/seed/candidate/200/200",
    platform: Array.isArray(row.platform) ? row.platform : [],
    voteCount: Number(row.vote_count || 0),
  };
}

function toElection(row: any, candidates: Candidate[] = []): Election {
  return {
    id: row.id,
    title: row.title,
    category: row.category || "General",
    description: row.description || "",
    status: mapElectionStatus(row.status),
    ballotType: row.ballot_type === "multi" ? "multi" : "single",
    maxVotesPerVoter: Number(row.max_votes_per_voter || 1),
    bannerUrl: row.banner_url || undefined,
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
    voteCount: Number(row.vote_count || 0),
    candidates,
  };
}

function toStudent(row: any): Student {
  return {
    id: row.index_number || row.id,
    name: row.name,
    email: row.email || "",
    photoUrl: row.profile_photo_url || "https://picsum.photos/seed/student/200/240",
    department: row.course || "Unknown",
    registrationDate: row.issue_date || "",
    indexNumber: row.index_number || row.id,
    course: row.course || "Unknown",
    validUntil: row.valid_until || "",
    status: row.status === "active" ? "Active" : row.status === "suspended" ? "Suspended" : "Inactive",
  };
}

function toVoter(row: any): Voter {
  const status = String(row.status || "pending").toLowerCase();
  return {
    id: row.id,
    name: row.name,
    email: row.email || "",
    registrationDate: row.registration_date || "",
    status: status === "active" || status === "verified" ? "Verified" : status === "flagged" ? "Flagged" : "Pending Review",
    photoUrl: row.photo_url || "https://picsum.photos/seed/voter/100/100",
  };
}

function normalizePlatform(platform: Candidate["platform"] | undefined) {
  if (!platform) return {};
  if (!Array.isArray(platform)) return platform;

  return platform.reduce<Record<string, string>>((acc, value, index) => {
    const trimmed = String(value || "").trim();
    if (trimmed) {
      acc[`priority_${index + 1}`] = trimmed;
    }
    return acc;
  }, {});
}

export const api = {
  async login(email: string, indexNumber?: string, isAdmin = false) {
    const body = { email, indexNumber, isAdmin };
    console.log("Frontend sending login request:", JSON.stringify(body, null, 2));
    const data = await request<{ user: SessionUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return data.user;
  },

  async logout() {
    await request<{ ok: boolean }>("/auth/logout", { method: "POST" });
  },

  async me() {
    return request<{ user: SessionUser | null; student?: any }>("/auth/me");
  },

  async getElections() {
    const list = await request<{ elections: any[] }>("/elections");
    const detailed = await Promise.all(
      list.elections.map(async (e) => {
        const detail = await request<{ election: any; candidates: any[] }>(`/elections/${e.id}`);
        return toElection(detail.election, detail.candidates.map(toCandidate));
      })
    );
    return detailed;
  },

  async createElection(input: Partial<Election>) {
    const data = await request<{ election: any }>("/elections", {
      method: "POST",
      body: JSON.stringify({
        title: input.title,
        category: input.category,
        description: input.description,
        status: input.status === "Open" ? "active" : input.status === "Closed" ? "closed" : "draft",
        ballotType: input.ballotType || "single",
        maxVotesPerVoter: input.maxVotesPerVoter || 1,
        bannerUrl: input.bannerUrl,
      }),
    });
    return toElection(data.election, []);
  },

  async addCandidate(electionId: string, input: Partial<Candidate>) {
    const data = await request<{ candidate: any }>(`/elections/${electionId}/candidates`, {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        party: input.party,
        description: input.description,
        photoUrl: input.photoUrl,
        platform: normalizePlatform(input.platform),
      }),
    });
    return toCandidate(data.candidate);
  },

  async getStudentByIndex(indexNumber: string) {
    const data = await request<{ student: any | null }>(`/students/index/${encodeURIComponent(indexNumber)}`);
    return data.student ? toStudent(data.student) : null;
  },

  async getStudentMe() {
    const data = await request<{ student: any | null }>("/students/me");
    return data.student ? toStudent(data.student) : null;
  },

  async getVoters(query = "") {
    const data = await request<{ voters: any[] }>(`/voters${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    return data.voters.map(toVoter);
  },

  async importVotersCsv(csvText: string) {
    return request<{ ok: boolean; imported: number; totalRows: number }>("/voters/import-csv", {
      method: "POST",
      body: JSON.stringify({ csvText }),
    });
  },

  async getAuditLogs() {
    const data = await request<{ logs: any[] }>("/audit-logs");
    const logs: AuditLog[] = data.logs.map((row) => ({
      id: row.id,
      timestamp: row.timestamp,
      type: row.type,
      voterId: row.target_id || "UNKNOWN",
      ip: row.ip || "-",
      status: row.status || "UNKNOWN",
    }));
    return logs;
  },

  async startVerification(electionId: string, method = "face") {
    const data = await request<{ session: any }>("/verification/start", {
      method: "POST",
      body: JSON.stringify({ electionId, method }),
    });
    return data.session;
  },

  async enroll(embedding: number[], studentIdentityId?: string) {
    const body: any = { embedding };
    if (studentIdentityId) body.studentIdentityId = studentIdentityId;
    const data = await request<{ enrollment: any }>("/verification/enroll", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return data.enrollment;
  },

  async completeVerification(
    sessionId: string,
    options: { embedding?: number[]; status?: "verified" | "rejected"; score?: number; notes?: string; metadata?: Record<string, unknown> } = {}
  ) {
    const data = await request<{ session: any }>(`/verification/${sessionId}/complete`, {
      method: "POST",
      body: JSON.stringify(options),
    });
    return data.session;
  },

  async enrollFace(embedding: number[]) {
    const data = await request<{ enrollment: any }>("/verification/enroll", {
      method: "POST",
      body: JSON.stringify({ embedding }),
    });
    return data.enrollment;
  },

  async castVote(payload: { electionId: string; candidateId: string; verificationSessionId?: string; voterId?: string }) {
    const data = await request<{ vote: VoteReceipt }>("/votes/cast", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data.vote;
  },

  async lookupStudent(indexNumber: string) {
    const data = await request<{ student: any }>(`/registry/lookup/${encodeURIComponent(indexNumber)}`);
    return data.student;
  },

  async uploadRegistry(csvText: string) {
    const data = await request<{ message: string; stats: { inserted: number; updated: number; total: number } }>("/registry/upload", {
      method: "POST",
      body: JSON.stringify({ csvText }),
    });
    return data;
  },

  async getRegistryStudents(query = "") {
    const data = await request<{ students: any[] }>(`/registry${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    return data.students;
  },
};
