import * as React from "react";
import { Landmark, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/src/components/ui/Card";
import { Election, AppView } from "@/src/types";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/Button";

interface ElectionsViewProps {
  onSelectElection: (election: Election) => void;
  onViewChange: (view: AppView) => void;
}

const ELECTIONS: Election[] = [
  {
    id: "1",
    title: "Presidential Election",
    category: "University Leadership",
    description: "Vote for the next President of the University",
    status: "Open",
    voteCount: 3456,
    candidates: [
      {
        id: "1",
        name: "Dr. Elena Cooper",
        party: "Academic Progressive",
        description: "Expert in curriculum innovation and student welfare",
        photoUrl: "https://picsum.photos/seed/elena-cooper/200/200",
        platform: ["Education", "Innovation", "Inclusion"]
      },
      {
        id: "2",
        name: "Prof. Robert Hayes",
        party: "Traditional Values",
        description: "Focused on academic excellence and institutional stability",
        photoUrl: "https://picsum.photos/seed/robert-hayes/200/200",
        platform: ["Excellence", "Stability", "Tradition"]
      },
      {
        id: "3",
        name: "Dr. Amara Okafor",
        party: "Independent Reformer",
        description: "Advocating for modern campus facilities and student voice",
        photoUrl: "https://picsum.photos/seed/amara-okafor/200/200",
        platform: ["Facilities", "Transparency", "Student Voice"]
      }
    ]
  },
  {
    id: "2",
    title: "Vice Presidential Election",
    category: "University Leadership",
    description: "Vote for the next Vice President of the University",
    status: "Open",
    voteCount: 2987,
    candidates: [
      {
        id: "4",
        name: "Dr. James Mitchell",
        party: "Academic Progressive",
        description: "Senior faculty with strong administrative experience",
        photoUrl: "https://picsum.photos/seed/james-mitchell/200/200",
        platform: ["Administration", "Resources", "Support"]
      },
      {
        id: "5",
        name: "Prof. Susan Khan",
        party: "Independent Reformer",
        description: "Advocate for student support services and diversity",
        photoUrl: "https://picsum.photos/seed/susan-khan/200/200",
        platform: ["Support", "Diversity", "Wellbeing"]
      }
    ]
  },
  {
    id: "3",
    title: "Student Senate President",
    category: "Student Government",
    description: "Vote for the Student Senate President",
    status: "Open",
    voteCount: 5234,
    candidates: [
      {
        id: "6",
        name: "Aisha Mohammed",
        party: "Student Voice",
        description: "Dedicated to student rights and campus improvements",
        photoUrl: "https://picsum.photos/seed/aisha-mohammed/200/200",
        platform: ["Rights", "Facilities", "Activities"]
      },
      {
        id: "7",
        name: "David Chen",
        party: "Campus Action",
        description: "Focused on budgeting and event organization",
        photoUrl: "https://picsum.photos/seed/david-chen/200/200",
        platform: ["Budget", "Events", "Community"]
      }
    ]
  },
  {
    id: "4",
    title: "Faculty Senate President",
    category: "Faculty Government",
    description: "Vote for the Faculty Senate President",
    status: "Upcoming",
    voteCount: 0,
    candidates: [
      {
        id: "8",
        name: "Prof. Michael Johnson",
        party: "Faculty First",
        description: "Committed to faculty welfare and research support",
        photoUrl: "https://picsum.photos/seed/michael-johnson/200/200",
        platform: ["Welfare", "Research", "Development"]
      }
    ]
  },
  {
    id: "5",
    title: "General Election 2024",
    category: "National Election",
    description: "Vote in the national general election",
    status: "Closed",
    voteCount: 8765,
    candidates: []
  }
];

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

export function ElectionsView({ onSelectElection, onViewChange }: ElectionsViewProps) {
  const categories = Array.from(new Set(ELECTIONS.map(e => e.category)));

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

      {categories.map((category) => {
        const categoryElections = ELECTIONS.filter(e => e.category === category);
        return (
          <div key={category} className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface uppercase tracking-wider px-4 sm:px-0">
              {category}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryElections.map((election) => (
                <Card
                  key={election.id}
                  className={cn(
                    "p-5 sm:p-6 transition-all cursor-pointer hover:shadow-lg group border-2",
                    getStatusColor(election.status)
                  )}
                >
                  <div className="space-y-4">
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

                    <div className="flex items-center gap-2 py-2 px-3 bg-white/60 rounded-lg w-fit">
                      {getStatusIcon(election.status)}
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        election.status === "Open" ? "text-green-700" :
                        election.status === "Upcoming" ? "text-orange-700" :
                        "text-red-700"
                      )}>
                        {election.status}
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
                        disabled={election.status !== "Open"}
                        className="ml-2"
                      >
                        {election.status === "Open" ? "Vote" : "View"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
