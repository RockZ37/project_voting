import { Eye, Vote, ClipboardCheck } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";

interface BallotSidebarProps {
  onGoIdentityCheck: () => void;
  onReview: () => void;
  canReview: boolean;
}

export function BallotSidebar({ onGoIdentityCheck, onReview, canReview }: BallotSidebarProps) {
  return (
    <Card className="p-4 sm:p-6 bg-surface-container-low border-outline-variant/50 lg:sticky lg:top-20">
      <h2 className="text-lg font-bold mb-4">Navigation</h2>

      <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 justify-start gap-2 lg:w-full"
          onClick={onGoIdentityCheck}
        >
          <Eye size={14} />
          Identity Check
        </Button>

        <div className="shrink-0 lg:w-full flex items-center gap-2 rounded-lg border border-secondary bg-secondary/10 px-3 py-2 text-secondary">
          <Vote size={14} />
          <span className="text-sm font-bold">Ballot</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="shrink-0 justify-start gap-2 lg:w-full"
          onClick={onReview}
          disabled={!canReview}
        >
          <ClipboardCheck size={14} />
          Review
        </Button>
      </div>

      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
        Step 2 of 4: Candidate Selection
      </p>
    </Card>
  );
}