import { Vote, ClipboardCheck } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";

interface BallotSidebarProps {
  onReview: () => void;
  canReview: boolean;
}

export function BallotSidebar({ onReview, canReview }: BallotSidebarProps) {
  return (
    <Card className="p-4 sm:p-6 bg-surface-container-low border-outline-variant/50 lg:sticky lg:top-20">
      <h2 className="text-lg font-bold mb-4">Navigation</h2>

      <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
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
    </Card>
  );
}