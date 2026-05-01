import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Vote, Percent, Activity, RefreshCw, PlayCircle, StopCircle, RotateCcw, AlertTriangle, ShieldCheck, History, Lock } from "lucide-react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { Election, AppView } from "@/src/types";

interface AdminDashboardViewProps {
  currentElection?: Election | null;
  onCloseElection?: () => void;
  onCreateElection?: (election: Election) => void;
  onAddCandidate?: (electionId: string, candidate: import("@/src/types").Candidate) => void;
  onNavigate?: (view: AppView) => void;
  elections?: Election[];
}

const DATA = [
  { name: 'Dr. Elena Sterling', votes: 382400, color: '#0051d5' },
  { name: 'Marcus Thorne', votes: 312109, color: '#316bf3' },
  { name: 'Sarah Jenkins', votes: 148402, color: '#bec6e0' },
];

export function AdminDashboardView({ currentElection, onCloseElection, onCreateElection, onAddCandidate, onNavigate, elections = [] }: AdminDashboardViewProps) {
  const totalVotes = DATA.reduce((acc, curr) => acc + curr.votes, 0);
  const [showCreate, setShowCreate] = React.useState(false);
  const [showAddCandidate, setShowAddCandidate] = React.useState(false);
  const [newElectionTitle, setNewElectionTitle] = React.useState("");
  const [newElectionCategory, setNewElectionCategory] = React.useState("");
  const [newElectionDescription, setNewElectionDescription] = React.useState("");

  const [candidateElectionId, setCandidateElectionId] = React.useState<string | undefined>(undefined);
  const [candidateName, setCandidateName] = React.useState("");
  const [candidateParty, setCandidateParty] = React.useState("");
  const [candidateDescription, setCandidateDescription] = React.useState("");
  const [candidatePhoto, setCandidatePhoto] = React.useState("");

  const submitCreateElection = () => {
    if (!newElectionTitle.trim()) return;
    const election = {
      id: crypto.randomUUID(),
      title: newElectionTitle,
      category: newElectionCategory || "Uncategorized",
      description: newElectionDescription || "",
      status: "Upcoming" as const,
      ballotType: "single" as const,
      maxVotesPerVoter: 1,
      bannerUrl: "",
      voteCount: 0,
      candidates: [],
    };
    onCreateElection?.(election);
    setNewElectionTitle("");
    setNewElectionCategory("");
    setNewElectionDescription("");
    setShowCreate(false);
  };

  const submitAddCandidate = () => {
    if (!candidateElectionId || !candidateName.trim()) return;
    const candidate = {
      id: crypto.randomUUID(),
      name: candidateName,
      party: candidateParty || "Independent",
      description: candidateDescription || "",
      photoUrl: candidatePhoto || `https://picsum.photos/seed/${encodeURIComponent(candidateName)}/200/200`,
      platform: [],
      voteCount: 0,
    };
    onAddCandidate?.(candidateElectionId, candidate);
    setCandidateElectionId(undefined);
    setCandidateName("");
    setCandidateParty("");
    setCandidateDescription("");
    setCandidatePhoto("");
    setShowAddCandidate(false);
  };

  React.useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<string>;
      if (ce?.detail === 'create-election') setShowCreate(true);
      if (ce?.detail === 'add-candidate') setShowAddCandidate(true);
    };
    window.addEventListener('admin-action', handler as any);
    return () => window.removeEventListener('admin-action', handler as any);
  }, []);

  return (
    <div className="space-y-10">
      {/* Main admin content continues below */}
          {showCreate && (
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-bold">Create Election</h3>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <input value={newElectionTitle} onChange={(e) => setNewElectionTitle(e.target.value)} placeholder="Title" className="p-2 border rounded" />
                <input value={newElectionCategory} onChange={(e) => setNewElectionCategory(e.target.value)} placeholder="Category" className="p-2 border rounded" />
                <textarea value={newElectionDescription} onChange={(e) => setNewElectionDescription(e.target.value)} placeholder="Description" className="p-2 border rounded" />
                <div className="flex gap-2">
                  <Button onClick={submitCreateElection}>Create</Button>
                  <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </div>
            </Card>
          )}

          {showAddCandidate && (
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-bold">Add Candidate</h3>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <select value={candidateElectionId} onChange={(e) => setCandidateElectionId(e.target.value)} className="p-2 border rounded">
                  <option value="">Select Election</option>
                  {elections.map((el) => (
                    <option key={el.id} value={el.id}>{el.title} ({el.status})</option>
                  ))}
                </select>
                <input value={candidateName} onChange={(e) => setCandidateName(e.target.value)} placeholder="Candidate name" className="p-2 border rounded" />
                <input value={candidateParty} onChange={(e) => setCandidateParty(e.target.value)} placeholder="Party" className="p-2 border rounded" />
                <input value={candidatePhoto} onChange={(e) => setCandidatePhoto(e.target.value)} placeholder="Photo URL (optional)" className="p-2 border rounded" />
                <textarea value={candidateDescription} onChange={(e) => setCandidateDescription(e.target.value)} placeholder="Short bio / description" className="p-2 border rounded" />
                <div className="flex gap-2">
                  <Button onClick={submitAddCandidate}>Add Candidate</Button>
                  <Button variant="outline" onClick={() => setShowAddCandidate(false)}>Cancel</Button>
                </div>
              </div>
            </Card>
          )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-on-surface">Election Dashboard</h1>
          <p className="text-on-surface-variant text-base">Real-time oversight of the General Election lifecycle.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-secondary/10 text-secondary border border-secondary/20 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-black tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Status: {currentElection ? `${currentElection.title} • ${currentElection.status}` : "Active"}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest">Total Registered Voters</span>
            <Users className="text-secondary" size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-4xl font-black">1,248,502</h3>
            <div className="flex items-center gap-1.5 text-green-600 text-[10px] font-black uppercase tracking-wider">
              <Activity size={12} /> +2.4% from last period
            </div>
          </div>
        </Card>

        <Card className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest">Total Votes Cast</span>
            <Vote className="text-secondary" size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-4xl font-black">{totalVotes.toLocaleString()}</h3>
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Update: 12 seconds ago</p>
          </div>
        </Card>

        <Card className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest">Voter Turnout %</span>
            <Percent className="text-secondary" size={24} />
          </div>
          <div className="space-y-4">
            <h3 className="text-4xl font-black">67.5%</h3>
            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[67.5%] rounded-full shadow-[0_0_10px_rgba(49,107,243,0.3)]" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Results Bar Chart */}
        <div className="lg:col-span-8 space-y-10">
          <Card className="p-8">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-bold tracking-tight">Real-Time Election Results</h3>
              <div className="flex items-center gap-4">
                <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-black tracking-widest uppercase rounded">Encrypted Stream</span>
                <button className="text-on-surface-variant hover:text-primary transition-colors">
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DATA} layout="vertical" margin={{ left: 40, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 13, fontWeight: 700, fill: '#191c1e' }} 
                    width={150}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f2f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={40}>
                    {DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-10 pt-8 border-t border-surface-container flex items-center gap-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-secondary fill-secondary/10" />
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Blockchain Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-secondary fill-secondary/10" />
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">End-to-End Encrypted</span>
              </div>
            </div>
          </Card>

         
        </div>

        {/* Sidebar Logs */}
        <div className="lg:col-span-4 space-y-10">
          <Card className="overflow-hidden bg-white shadow-lg">
            <div className="p-5 bg-surface-container-low border-b border-surface-container-high flex justify-between items-center">
              <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Recent System Logs</h3>
              <History size={18} className="text-on-surface-variant" />
            </div>
            <div className="divide-y divide-surface-container">
              {[
                { type: 'error', title: 'Failed Verification', time: '2m ago', desc: 'Fingerprint mismatch detected on Terminal ID: #4492. Lockout initiated.' },
                { type: 'info', title: 'Login Attempt', time: '12m ago', desc: 'Admin user \'J.Doe\' successfully authenticated via hardware key.' },
                { type: 'success', title: 'Ballot Encrypted', time: '14m ago', desc: 'Finalized block #492,021 hash: 0x82f...a12c' },
                { type: 'warning', title: 'Server Latency', time: '45m ago', desc: 'Node-4 reporting higher than average response times (340ms).' },
              ].map((log, i) => (
                <div key={i} className="p-5 hover:bg-surface-container-low transition-colors cursor-default">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      log.type === 'error' ? "bg-error" : 
                      log.type === 'warning' ? "bg-yellow-500" :
                      log.type === 'success' ? "bg-green-500" : "bg-blue-500"
                    )} />
                    <span className="text-sm font-bold text-on-surface">{log.title}</span>
                    <span className="ml-auto text-[10px] font-bold text-on-surface-variant uppercase">{log.time}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed opacity-80">{log.desc}</p>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full h-12 text-[10px] font-black tracking-widest text-secondary hover:text-blue-700">
              View All Audit Logs
            </Button>
          </Card>

          
        </div>
      </div>
    </div>
  );
}
