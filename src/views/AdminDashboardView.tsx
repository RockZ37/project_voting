import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Vote, Percent, Activity, RefreshCw, PlayCircle, StopCircle, RotateCcw, AlertTriangle, ShieldCheck, History, Lock } from "lucide-react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { Election } from "@/src/types";

interface AdminDashboardViewProps {
  currentElection?: Election | null;
  onCloseElection?: () => void;
}

const DATA = [
  { name: 'Dr. Elena Sterling', votes: 382400, color: '#0051d5' },
  { name: 'Marcus Thorne', votes: 312109, color: '#316bf3' },
  { name: 'Sarah Jenkins', votes: 148402, color: '#bec6e0' },
];

export function AdminDashboardView({ currentElection, onCloseElection }: AdminDashboardViewProps) {
  const totalVotes = DATA.reduce((acc, curr) => acc + curr.votes, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
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

          {/* Controls */}
          <Card className="p-8 space-y-10">
            <h3 className="text-2xl font-bold tracking-tight">Global Election Controls</h3>
            <div className="flex flex-wrap gap-4">
              <Button className="flex-1 min-w-[200px] h-14 font-bold bg-zinc-900 gap-3" disabled>
                <PlayCircle size={20} />
                Start Election
              </Button>
              <Button className="flex-1 min-w-[200px] h-14 font-bold bg-error text-white gap-3" onClick={onCloseElection} disabled={!currentElection || currentElection?.status === 'Closed'}>
                <StopCircle size={20} />
                Close Current Election
              </Button>
              <Button variant="outline" className="flex-1 min-w-[200px] h-14 font-bold gap-3">
                <RotateCcw size={20} />
                Emergency Reset
              </Button>
            </div>
            <div className="p-4 bg-error-container/40 rounded-lg flex items-center gap-4 border border-error/10">
              <AlertTriangle className="text-error shrink-0" size={20} />
              <p className="text-xs font-bold text-on-error-container leading-tight">
                Note: Ending the election is irreversible and will trigger automatic final auditing procedures.
              </p>
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

          <div className="bg-primary-container text-white rounded-xl p-8 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-8">
              <h3 className="text-2xl font-bold tracking-tight">Secure Admin Link</h3>
              <div className="aspect-square bg-white/5 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-6 group cursor-pointer">
                <div className="w-40 h-40 border-2 border-secondary rounded-full flex items-center justify-center animate-pulse group-hover:scale-110 transition-transform">
                  <Users className="text-secondary w-16 h-16" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-on-primary-container">Biometric Sensor Ready</p>
                    <div className="inline-flex px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest rounded-full">Active</div>
                </div>
              </div>
              <Button className="w-full h-14 font-black uppercase tracking-widest bg-secondary text-white hover:bg-blue-700">
                Re-Authenticate Now
              </Button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
