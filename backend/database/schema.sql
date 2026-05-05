-- CivicVote initial schema (PostgreSQL)

-- Users (login identities)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Student identity / ID card
CREATE TABLE IF NOT EXISTS student_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  course TEXT,
  profile_photo_url TEXT,
  id_card_front_url TEXT,
  id_card_back_url TEXT,
  issue_date DATE,
  valid_until DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Voters (registry entries) -- can link to student identities
CREATE TABLE IF NOT EXISTS voters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_identity_id UUID REFERENCES student_identities(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  registration_date DATE,
  status TEXT,
  photo_url TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Elections
CREATE TABLE IF NOT EXISTS elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  status TEXT NOT NULL,
  ballot_type TEXT NOT NULL DEFAULT 'single',
  max_votes_per_voter INT DEFAULT 1,
  banner_url TEXT,
  vote_count BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Candidates
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  party TEXT,
  description TEXT,
  photo_url TEXT,
  platform JSONB,
  vote_count BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Votes
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES voters(id) ON DELETE SET NULL,
  cast_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verification_status TEXT,
  receipt_code TEXT UNIQUE,
  metadata JSONB
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  type TEXT,
  actor_id UUID,
  actor_role TEXT,
  target_id UUID,
  ip TEXT,
  status TEXT,
  metadata JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_student_index_number ON student_identities(index_number);
CREATE INDEX IF NOT EXISTS idx_voter_email ON voters(email);
CREATE INDEX IF NOT EXISTS idx_election_status ON elections(status);

-- Note: gen_random_uuid() requires the pgcrypto or pgcrypto-like extension.
-- Use: CREATE EXTENSION IF NOT EXISTS pgcrypto;
