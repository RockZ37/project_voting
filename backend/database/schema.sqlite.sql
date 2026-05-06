-- CivicVote initial schema (SQLite)

-- Users (login identities)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student identity / ID card
CREATE TABLE IF NOT EXISTS student_identities (
  id TEXT PRIMARY KEY,
  index_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  course TEXT,
  profile_photo_url TEXT,
  id_card_front_url TEXT,
  id_card_back_url TEXT,
  issue_date DATE,
  valid_until DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voters (registry entries) -- can link to student identities
CREATE TABLE IF NOT EXISTS voters (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  student_identity_id TEXT REFERENCES student_identities(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  registration_date DATE,
  status TEXT,
  photo_url TEXT,
  department TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Elections
CREATE TABLE IF NOT EXISTS elections (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  status TEXT NOT NULL,
  ballot_type TEXT NOT NULL DEFAULT 'single',
  max_votes_per_voter INTEGER DEFAULT 1,
  banner_url TEXT,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidates
CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  election_id TEXT REFERENCES elections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  party TEXT,
  description TEXT,
  photo_url TEXT,
  platform TEXT,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Votes
CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  election_id TEXT REFERENCES elections(id) ON DELETE CASCADE,
  candidate_id TEXT REFERENCES candidates(id) ON DELETE CASCADE,
  voter_id TEXT REFERENCES voters(id) ON DELETE SET NULL,
  cast_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verification_status TEXT,
  receipt_code TEXT UNIQUE,
  metadata TEXT
);

-- Verification sessions (face/ID/manual checks before casting)
CREATE TABLE IF NOT EXISTS verification_sessions (
  id TEXT PRIMARY KEY,
  voter_id TEXT REFERENCES voters(id) ON DELETE CASCADE,
  election_id TEXT REFERENCES elections(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  completed_at TIMESTAMP,
  method TEXT,
  score REAL,
  notes TEXT,
  metadata TEXT
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  type TEXT,
  actor_id TEXT,
  actor_role TEXT,
  target_id TEXT,
  ip TEXT,
  status TEXT,
  metadata TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_student_index_number ON student_identities(index_number);
CREATE INDEX IF NOT EXISTS idx_voter_email ON voters(email);
CREATE INDEX IF NOT EXISTS idx_election_status ON elections(status);
CREATE INDEX IF NOT EXISTS idx_votes_election_id ON votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_verification_voter_election ON verification_sessions(voter_id, election_id);

-- Allow only one recorded vote per voter per election when voter_id exists
CREATE UNIQUE INDEX IF NOT EXISTS uq_votes_election_voter
ON votes (election_id, voter_id)
WHERE voter_id IS NOT NULL;
