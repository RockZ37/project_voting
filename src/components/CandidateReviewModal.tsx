import * as React from "react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Candidate } from "@/src/types";
import { X, Check } from "lucide-react";

interface CandidateReviewModalProps {
  candidate: Candidate | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (candidate: Candidate) => void;
}

export function CandidateReviewModal({ candidate, open, onClose, onConfirm }: CandidateReviewModalProps) {
  if (!open || !candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <Card className="relative z-10 max-w-2xl w-full mx-4 p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden border border-outline-variant/30">
              <img src={candidate.photoUrl} alt={candidate.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{candidate.party}</p>
              <h3 className="text-2xl font-black text-on-surface">{candidate.name}</h3>
              <p className="text-sm text-on-surface-variant mt-1">{candidate.description}</p>
            </div>
          </div>

          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <X />
          </button>
        </div>

        <div className="mt-6">
          <p className="font-bold text-on-surface mb-2">Platform</p>
          <ul className="list-disc pl-5 text-on-surface-variant">
            {candidate.platform.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="gap-2">
            Cancel
          </Button>
          <Button onClick={() => onConfirm(candidate)} className="gap-2">
            <Check size={16} />
            Confirm Selection
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default CandidateReviewModal;
