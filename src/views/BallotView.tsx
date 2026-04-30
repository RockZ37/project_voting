import * as React from "react";
import { motion } from "motion/react";
import { CheckCircle2, Info, Landmark, ShieldCheck, Send, RotateCcw, Lock } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Candidate, Student } from "@/src/types";
import { cn } from "@/src/lib/utils";
import { BallotSidebar } from "@/src/components/layout/BallotSidebar";

interface BallotViewProps {
  student?: Student | null;
  onSelect: (candidate: Candidate) => void;
  onReview: () => void;
  onGoIdentityCheck: () => void;
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

export function BallotView({ student, onSelect, onReview, onGoIdentityCheck }: BallotViewProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const handleSelect = (candidate: Candidate) => {
    setSelectedId(candidate.id);
    onSelect(candidate);
  };

  const selectedCandidate = CANDIDATES.find(c => c.id === selectedId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-36">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
        <aside className="lg:col-span-3 order-first">
          <BallotSidebar
            onGoIdentityCheck={onGoIdentityCheck}
            onReview={onReview}
            canReview={Boolean(selectedId)}
          />
        </aside>

        {/* Main Ballot */}
        <div className="lg:col-span-9 space-y-8 order-last">
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

                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-outline-variant/20 flex justify-between items-center">
                  <button className="flex items-center gap-2 text-secondary font-bold text-[10px] uppercase tracking-widest hover:underline">
                    <Info size={14} />
                    View Platform
                  </button>
                  {selectedId === candidate.id && (
                    <div className="flex items-center gap-1.5 text-secondary font-bold text-[10px] uppercase tracking-widest">
                      <CheckCircle2 size={14} className="fill-current" />
                      Selected
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {/* Write-in Option */}
            <Card className="p-5 sm:p-8 border-dashed border-outline-variant bg-surface-container-lowest/50 hover:bg-white transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline">
                <RotateCcw size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-on-surface">Write-in Candidate</h3>
                <p className="text-sm text-on-surface-variant">Specify your own candidate choice</p>
              </div>
              <Button variant="outline" size="sm" className="font-bold">Enter Name</Button>
            </Card>
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
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 w-full bg-white border-t border-outline-variant/50 p-4 sm:p-6 shadow-[0_-8px_24px_rgba(0,0,0,0.05)] z-40"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="hidden md:flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-secondary" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-outline uppercase tracking-widest">Current Selection</p>
              <p className="text-lg font-bold text-primary">
                {selectedCandidate ? `${selectedCandidate.name} (${selectedCandidate.party})` : "No Selection Made"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center w-full md:w-auto">
            <Button 
              size="xl" 
              className="w-full md:w-80 h-14 sm:h-16 group relative"
              disabled={!selectedId}
              onClick={onReview}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Continue to Review
                <Send size={18} />
              </span>
            </Button>
            <p className="mt-3 text-[10px] font-black text-outline uppercase tracking-[0.2em]">Step 2 of 4</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
