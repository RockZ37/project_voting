import { Landmark, Vote } from "lucide-react";
import { Card } from "@/src/components/ui/Card";

interface BallotSidebarProps {
  voteCount: number;
}

const elections = [
  { name: "Presidential Election", active: true },
  { name: "Student Senate", active: false },
  { name: "Local Council", active: false },
];

export function BallotSidebar({ voteCount }: BallotSidebarProps) {
  return (
    <Card className="p-4 sm:p-6 bg-surface-container-low border-outline-variant/50 lg:sticky lg:top-20 space-y-6">
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Live Voting Count</p>
        <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/30 bg-white px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
            <Vote size={16} className="text-secondary" />
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight text-on-surface" aria-live="polite">
              {voteCount.toLocaleString()}
            </p>
            <p className="text-xs text-on-surface-variant">Votes cast and updating in real time</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Elections</p>
        <div className="space-y-2">
          {elections.map((election) => (
            <div
              key={election.name}
              className={
                election.active
                  ? "flex items-center justify-between gap-3 rounded-xl border border-secondary bg-secondary/10 px-4 py-3 text-secondary"
                  : "flex items-center justify-between gap-3 rounded-xl border border-outline-variant/30 bg-white px-4 py-3 text-on-surface-variant"
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <Landmark size={14} className={election.active ? "text-secondary shrink-0" : "text-on-surface-variant shrink-0"} />
                <span className="text-sm font-bold truncate">{election.name}</span>
              </div>
              {election.active && <span className="text-[10px] font-black uppercase tracking-widest">Active</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
        <div className="shrink-0 lg:w-full flex items-center gap-2 rounded-lg border border-secondary bg-secondary/10 px-3 py-2 text-secondary">
          <Vote size={14} />
          <span className="text-sm font-bold">Ballot</span>
        </div>
      </div>
    </Card>
  );
}