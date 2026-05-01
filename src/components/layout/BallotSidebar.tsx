import { Landmark, Vote, ChevronRight } from "lucide-react";
import { Sidebar, SidebarSection, SidebarLink, Widget } from "@/src/components/layout/Sidebar";
import { Election } from "@/src/types";
import * as React from "react";
import { Button } from "@/src/components/ui/Button";

interface BallotSidebarProps {
  voteCount: number;
  currentElection?: Election | null;
  onElectionChange?: (election: Election) => void;
  onViewElections?: () => void;
}

const ACTIVE_ELECTIONS: Election[] = [
  {
    id: "1",
    title: "Presidential Election",
    category: "University Leadership",
    description: "Vote for the next President",
    status: "Open",
    voteCount: 3456,
    candidates: []
  },
  {
    id: "3",
    title: "Student Senate President",
    category: "Student Government",
    description: "Vote for Student Senate President",
    status: "Open",
    voteCount: 5234,
    candidates: []
  },
  {
    id: "2",
    title: "Vice Presidential Election",
    category: "University Leadership",
    description: "Vote for Vice President",
    status: "Open",
    voteCount: 2987,
    candidates: []
  }
];

export function BallotSidebar({ voteCount, currentElection, onElectionChange, onViewElections }: BallotSidebarProps) {
  return (
    <Sidebar>
      {currentElection ? (
        <>
          <SidebarSection title="Current Election">
            <Widget>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant pb-1">
                    {currentElection.category}
                  </p>
                  <p className="text-sm font-bold text-on-surface leading-tight">
                    {currentElection.title}
                  </p>
                </div>
                <div className="pt-2 border-t border-outline-variant/30">
                  <p className="text-xs text-on-surface-variant pb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${currentElection.status === 'Open' ? 'bg-green-600' : 'bg-orange-600'}`}></div>
                    <span className="text-sm font-semibold text-on-surface">{currentElection.status}</span>
                  </div>
                </div>
              </div>
            </Widget>
          </SidebarSection>

          <SidebarSection title="Live Voting Count">
            <Widget>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <Vote size={16} className="text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-black tracking-tight text-on-surface" aria-live="polite">
                    {currentElection.voteCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-on-surface-variant">Votes cast</p>
                </div>
              </div>
            </Widget>
          </SidebarSection>

          <SidebarSection title="Other Elections">
            <div className="space-y-1.5">
              {ACTIVE_ELECTIONS.filter(e => e.id !== currentElection.id).map((election) => (
                <button
                  key={election.id}
                  onClick={() => onElectionChange?.(election)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors text-sm font-bold text-on-surface-variant hover:bg-on-surface/5 group"
                >
                  <span className="text-left truncate group-hover:text-secondary">{election.title}</span>
                  <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
            <Button onClick={onViewElections} variant="outline" className="w-full mt-3">
              View All Elections
            </Button>
          </SidebarSection>
        </>
      ) : (
        <>
          <SidebarSection title="Elections">
            <div className="space-y-1">
              {ACTIVE_ELECTIONS.map((election) => (
                <button
                  key={election.id}
                  onClick={() => onElectionChange?.(election)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-bold text-on-surface-variant hover:bg-secondary/10 hover:text-secondary group"
                >
                  <Landmark size={16} className="group-hover:text-secondary" />
                  <span className="truncate">{election.title}</span>
                </button>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection title="Actions">
            <Button onClick={onViewElections} className="w-full">
              Browse All Elections
            </Button>
          </SidebarSection>
        </>
      )}
    </Sidebar>
  );
}