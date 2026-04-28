export enum AppView {
  AUTH = 'AUTH',
  VERIFY = 'VERIFY',
  BALLOT = 'BALLOT',
  REVIEW = 'REVIEW',
  SUCCESS = 'SUCCESS',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  ADMIN_REGISTRY = 'ADMIN_REGISTRY',
  ADMIN_LOGS = 'ADMIN_LOGS',
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  description: string;
  photoUrl: string;
  platform: string[];
}

export interface Voter {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
  status: 'Verified' | 'Pending Review' | 'Flagged';
  photoUrl: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  type: string;
  voterId: string;
  ip: string;
  status: 'SUCCESS' | 'REJECTED' | 'MFA PENDING';
}
