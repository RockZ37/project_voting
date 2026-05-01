import * as React from "react";
import { CheckCircle2, Landmark } from "lucide-react";
import { Card } from "@/src/components/ui/Card";
import { Candidate, Student, Election } from "@/src/types";
import { cn } from "@/src/lib/utils";
import { CandidateReviewModal } from "@/src/components/CandidateReviewModal";
import { BallotPageLayout } from "@/src/components/layout/BallotPageLayout";

interface BallotViewProps {
  student?: Student | null;
  onSelect: (candidate: Candidate) => void;
  voteCount: number;
  currentElection?: Election | null;
}

const CANDIDATES: Candidate[] = [
  {
    id: "1",
    name: "Dr. Elena Sterling",
    party: "Progressive Union",
    description: "Advocating for digital infrastructure, sustainable energy transitions, and educational reform.",
    photoUrl: "https://picsum.photos/seed/elena/200/200",
    platform: ["Infrastructure", "Sustainability", "Education"]
  },
  {
    id: "2",
    name: "Marcus Thorne",
    party: "Heritage Alliance",
    description: "Focused on fiscal responsibility, traditional industry support, and national security strength.",
    photoUrl: "https://picsum.photos/seed/marcus/200/200",
    platform: ["Security", "Economy", "Tradition"]
  },
  {
    id: "3",
    name: "Sarah Jenkins",
    party: "Independent Frontier",
    description: "Championing grassroots governance, local business incentives, and healthcare transparency.",
    photoUrl: "https://picsum.photos/seed/sarah/200/200",
    platform: ["Healthcare", "Local", "Transparency"]
  }
];

export function BallotView({ student, onSelect, voteCount, currentElection }: BallotViewProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalCandidate, setModalCandidate] = React.useState<Candidate | null>(null);

  const handleSelect = (candidate: Candidate) => {
    setModalCandidate(candidate);
    setModalOpen(true);
  };

  const handleConfirmSelection = (candidate: Candidate) => {
    setSelectedId(candidate.id);
    onSelect(candidate);
    setModalOpen(false);
    setModalCandidate(null);
  };

  const selectedCandidate = CANDIDATES.find(c => c.id === selectedId);

  return (
    <BallotPageLayout voteCount={voteCount} currentElection={currentElection}>
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-on-surface">General Election: Presidential</h1>
        <p className="text-on-surface-variant text-base leading-relaxed">
          Please select one candidate from the list below. You can review your choice before final submission.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {CANDIDATES.map((candidate) => (
          <Card 
            key={candidate.id}
            className={cn(
              "p-5 sm:p-8 transition-all cursor-pointer group relative hover:shadow-lg",
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
    </BallotPageLayout>
  );
}
