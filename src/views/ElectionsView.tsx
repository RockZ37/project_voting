import * as React from "react";
import { Landmark, Clock, CheckCircle, AlertCircle, CalendarDays } from "lucide-react";
import { Card } from "@/src/components/ui/Card";
import { Election, AppView } from "@/src/types";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/Button";
import { resolveElectionStatus } from "@/src/lib/api";

interface ElectionsViewProps {
  elections: Election[];
  onSelectElection: (election: Election) => void;
  onViewChange: (view: AppView) => void;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "Open":
      return <CheckCircle className="text-green-600" size={16} />;
    case "Upcoming":
      return <Clock className="text-orange-600" size={16} />;
    case "Closed":
      return <AlertCircle className="text-red-600" size={16} />;
    default:
      return null;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "Open":
      return "bg-green-50 border-green-200";
    case "Upcoming":
      return "bg-orange-50 border-orange-200";
    case "Closed":
      return "bg-red-50 border-red-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
}

function formatDateTime(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function ElectionsView({ elections, onSelectElection, onViewChange }: ElectionsViewProps) {
  const categories = Array.from(new Set(elections.map((e) => e.category)));

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-on-surface flex items-center gap-3">
          <Landmark className="text-secondary" size={32} />
          University Elections
        </h1>
        <p className="text-on-surface-variant text-base leading-relaxed max-w-2xl">
          Browse and participate in ongoing university elections. Select an election to view candidates and cast your vote.
        </p>
      </header>

      {elections.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-on-surface-variant">No elections available at this time.</p>
        </Card>
      ) : (
        <>
          {categories.map((category) => {
            const categoryElections = elections.filter((e) => e.category === category);
        return (
          <div key={category} className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface uppercase tracking-wider px-4 sm:px-0">
              {category}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryElections.map((election) => (
                (() => {
                  const liveStatus = resolveElectionStatus(election);
                  return (
                <Card
                  key={election.id}
                  className={cn(
                    "p-5 sm:p-6 transition-all cursor-pointer hover:shadow-lg group border-2",
                    getStatusColor(liveStatus)
                  )}
                >
                  <div className="space-y-4">
                    {election.bannerUrl && (
                      <div className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container">
                        <img src={election.bannerUrl} alt={`${election.title} banner`} className="w-full h-40 object-cover" />
                      </div>
                    )}

                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-on-surface mb-1">
                          {election.title}
                        </h3>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {election.description}
                        </p>
                      </div>
                    </div>

                    {formatDateTime(election.createdAt) && (
                      <div className="flex items-center gap-2 py-2 px-3 bg-white/60 rounded-lg w-fit text-[11px] font-semibold text-on-surface-variant">
                        <CalendarDays size={14} />
                        Created {formatDateTime(election.createdAt)}
                      </div>
                    )}

                    <div className="flex items-center gap-2 py-2 px-3 bg-white/60 rounded-lg w-fit">
                      {getStatusIcon(liveStatus)}
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        liveStatus === "Open" ? "text-green-700" :
                        liveStatus === "Upcoming" ? "text-orange-700" :
                        "text-red-700"
                      )}>
                        {liveStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-center">
                        <p className="text-2xl sm:text-3xl font-black text-on-surface">
                          {election.candidates.length}
                        </p>
                        <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                          Candidates
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl sm:text-3xl font-black text-secondary">
                          {election.voteCount.toLocaleString()}
                        </p>
                        <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                          Votes
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          onSelectElection(election);
                          onViewChange(AppView.ELECTION_DETAIL);
                        }}
                        className="ml-2"
                      >
                        {liveStatus === "Open" ? "Vote" : "View"}
                      </Button>
                    </div>
                  </div>
                </Card>
                  );
                })()
              ))}
            </div>
          </div>
        );
          })}
        </>
      )}
    </div>
  );
}
