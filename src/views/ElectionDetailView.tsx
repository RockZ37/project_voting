import * as React from "react";
import { CheckCircle2, Landmark, ChevronLeft } from "lucide-react";
import { Card } from "@/src/components/ui/Card";
import { Candidate, Student, Election } from "@/src/types";
import { cn } from "@/src/lib/utils";
import { CandidateReviewModal } from "@/src/components/CandidateReviewModal";
import { BallotPageLayout } from "@/src/components/layout/BallotPageLayout";
import { Button } from "@/src/components/ui/Button";

interface ElectionDetailViewProps {
  election: Election | null;
  student?: Student | null;
  onSelect: (candidate: Candidate) => void;
  onBack: () => void;
  hasVoted?: boolean;
}

export function ElectionDetailView({ election, student, onSelect, onBack, hasVoted = false }: ElectionDetailViewProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalCandidate, setModalCandidate] = React.useState<Candidate | null>(null);

  if (!election) {
    return (
      <BallotPageLayout voteCount={0}>
        <div className="text-center py-12">
          <p className="text-on-surface-variant">No election selected</p>
        </div>
      </BallotPageLayout>
    );
  }

  const handleSelect = (candidate: Candidate) => {
    if (hasVoted) return;
    setModalCandidate(candidate);
    setModalOpen(true);
  };

  const handleConfirmSelection = (candidate: Candidate) => {
    setSelectedId(candidate.id);
    onSelect(candidate);
    setModalOpen(false);
    setModalCandidate(null);
  };

  const selectedCandidate = election.candidates.find(c => c.id === selectedId);

  return (
    <BallotPageLayout voteCount={election.voteCount}>
      <div className="space-y-8">
        {hasVoted && (
          <Card className="p-5 border-2 border-secondary bg-secondary/5">
            <p className="text-sm font-semibold text-on-surface">
              Your vote has already been recorded for this election. You can review the candidates, but you cannot vote again.
            </p>
          </Card>
        )}

        <button
          onClick={onBack}
          className="flex items-center gap-2 text-secondary hover:text-secondary/80 font-semibold transition-colors"
        >
          <ChevronLeft size={20} />
          Back to Elections
        </button>

        <header className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-on-surface">
            {election.title}
          </h1>
          <p className="text-on-surface-variant text-base leading-relaxed">
            {election.description} - Select one candidate from the list below. You can review your choice before final submission.
          </p>
        </header>

        {election.candidates.length === 0 ? (
          <Card className="p-8 text-center bg-surface-container border-outline-variant/30">
            <p className="text-on-surface-variant">No candidates available for this election.</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {election.candidates.map((candidate) => (
                <Card 
                  key={candidate.id}
                  className={cn(
                    "p-5 sm:p-8 transition-all group relative hover:shadow-lg",
                    hasVoted ? "cursor-not-allowed opacity-70" : "cursor-pointer",
                    selectedId === candidate.id ? "border-3 border-secondary bg-surface-container-low shadow-md scale-[1.01]" : "hover:border-outline"
                  )}
                  onClick={() => handleSelect(candidate)}
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div className="w-full h-44 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-outline-variant/30 shrink-0">
                      <img 
                        src={candidate.photoUrl} 
                        alt={candidate.name} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            selectedId === candidate.id ? "text-secondary" : "text-on-surface-variant"
                          )}>
                            {candidate.party}
                          </p>
                          <h3 className="text-lg sm:text-xl font-bold text-on-surface leading-tight">{candidate.name}</h3>
                        </div>
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                          selectedId === candidate.id ? "border-secondary" : "border-outline-variant"
                        )}>
                          {selectedId === candidate.id && <div className="w-3 h-3 bg-secondary rounded-full" />}
                        </div>
                      </div>
                      <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed">{candidate.description}</p>
                    </div>
                  </div>

                  {selectedId === candidate.id && (
                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-outline-variant/20 flex justify-end items-center">
                      <div className="flex items-center gap-1.5 text-secondary font-bold text-[10px] uppercase tracking-widest">
                        <CheckCircle2 size={14} className="fill-current" />
                        Selected
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            <Card className="p-6 bg-surface-container border-outline-variant/30">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <Landmark className="text-secondary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-on-surface">Vote Integrity Assurance</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Your selection will be anonymized and recorded on the immutable ledger. Once you hold the submit button, your vote is final and cannot be changed.
                  </p>
                </div>
              </div>
            </Card>

            {/* Candidate review modal */}
            <CandidateReviewModal
              candidate={modalCandidate}
              open={modalOpen}
              onClose={() => { setModalOpen(false); setModalCandidate(null); }}
              onConfirm={handleConfirmSelection}
            />
          </>
        )}
      </div>
    </BallotPageLayout>
  );
}
