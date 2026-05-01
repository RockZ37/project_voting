import { Landmark, Vote } from "lucide-react";
import { Sidebar, SidebarSection, Widget } from "@/src/components/layout/Sidebar";
import { Election } from "@/src/types";
import { Button } from "@/src/components/ui/Button";

interface BallotSidebarProps {
  voteCount: number;
  currentElection?: Election | null;
  selectedCandidateName?: string | null;
  showResults?: boolean;
  onViewElections?: () => void;
  onViewResults?: () => void;
}

export function BallotSidebar({ voteCount, currentElection, selectedCandidateName, showResults = false, onViewElections, onViewResults }: BallotSidebarProps) {
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

          {showResults && (
            <SidebarSection title="Election Results">
              <Widget>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant pb-1">
                      Result
                    </p>
                    <p className="text-sm font-bold text-on-surface leading-tight">
                      {currentElection.candidates.length} candidates included in this election
                    </p>
                  </div>
                  <div className="space-y-2">
                    {currentElection.candidates.map((candidate) => {
                      const isRecordedChoice = candidate.name === selectedCandidateName;

                      return (
                        <div
                          key={candidate.id}
                          className={`rounded-xl border px-3 py-2 ${isRecordedChoice ? "border-secondary bg-secondary/5" : "border-outline-variant/30 bg-white/60"}`}
                        >
                          <p className="text-sm font-bold text-on-surface">{candidate.name}</p>
                          <p className="text-xs text-on-surface-variant">{candidate.party}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant">Updated votes</span>
                    <span className="text-sm font-black text-secondary">{voteCount.toLocaleString()}</span>
                  </div>
                </div>
              </Widget>
            </SidebarSection>
          )}

          <SidebarSection title="Actions">
            <Button onClick={onViewResults} className="w-full">
              View Results
            </Button>
          </SidebarSection>
        </>
      ) : (
        <>
          <SidebarSection title="University Elections">
            <Widget>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                    <Landmark size={16} className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">Browse elections</p>
                    <p className="text-xs text-on-surface-variant">Select a university election to review candidates.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button onClick={onViewElections} className="w-full">
                    Browse All Elections
                  </Button>
                  <Button onClick={onViewResults} variant="outline" className="w-full">
                    View Results
                  </Button>
                </div>
              </div>
            </Widget>
          </SidebarSection>
        </>
      )}
    </Sidebar>
  );
}