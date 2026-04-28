import { Voter } from "@/src/types";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Search, Filter, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";

const VOTERS: Voter[] = [
  { id: '1', name: 'James Wilson', email: 'j.wilson@mail.gov', registrationDate: '2024-01-12', status: 'Verified', photoUrl: 'https://picsum.photos/seed/v1/100/100' },
  { id: '2', name: 'Maria Garcia', email: 'm.garcia@mail.gov', registrationDate: '2024-02-05', status: 'Verified', photoUrl: 'https://picsum.photos/seed/v2/100/100' },
  { id: '3', name: 'Robert Lee', email: 'r.lee@mail.gov', registrationDate: '2024-02-14', status: 'Pending Review', photoUrl: 'https://picsum.photos/seed/v3/100/100' },
  { id: '4', name: 'Sarah Chen', email: 's.chen@mail.gov', registrationDate: '2024-03-01', status: 'Flagged', photoUrl: 'https://picsum.photos/seed/v4/100/100' },
];

export function AdminRegistryView() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black tracking-tight text-on-surface">Voter Registry</h1>
        <Button className="font-bold">Register New Voter</Button>
      </div>

      <Card className="p-4 bg-surface-container-low flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
          <input 
            className="w-full h-10 pl-10 pr-4 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            placeholder="Search by name, ID, or email..."
          />
        </div>
        <Button variant="outline" className="gap-2 font-bold">
          <Filter size={18} />
          Filters
        </Button>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
              <th className="px-6 py-4">Voter Identity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Registration Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {VOTERS.map((voter) => (
              <tr key={voter.id} className="hover:bg-surface-container-highest/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img src={voter.photoUrl} className="w-10 h-10 rounded-full border border-outline-variant/30 grayscale group-hover:grayscale-0 transition-all" />
                    <div>
                      <p className="font-bold text-on-surface">{voter.name}</p>
                      <p className="text-xs text-on-surface-variant">{voter.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                    voter.status === 'Verified' ? "bg-green-100 text-green-700" : 
                    voter.status === 'Flagged' ? "bg-error-container text-error" : "bg-yellow-100 text-yellow-700"
                  )}>
                    {voter.status === 'Verified' ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
                    {voter.status}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-on-surface-variant">{voter.registrationDate}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" className="font-bold text-secondary">Manage</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// Inline utils for this small view
