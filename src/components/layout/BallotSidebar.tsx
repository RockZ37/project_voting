import { Landmark, Vote } from "lucide-react";
import { Sidebar, SidebarSection, SidebarLink, Widget } from "@/src/components/layout/Sidebar";

interface BallotSidebarProps {
  voteCount: number;
}

const elections = [
  { name: "Presidential Election", active: true },
  { name: "Student Senate", active: false },
  { name: "Local Council", active: false },
];

export function BallotSidebar({ voteCount }: BallotSidebarProps) {
  return (
    <Sidebar>
      <SidebarSection title="Elections">
        {elections.map((election) => (
          <SidebarLink
            key={election.name}
            href="#"
            active={election.active}
            icon={<Landmark size={16} />}
          >
            {election.name}
          </SidebarLink>
        ))}
      </SidebarSection>

      <SidebarSection title="Live Voting Count">
        <Widget>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                    <Vote size={16} className="text-secondary" />
                </div>
                <div>
                    <p className="text-2xl font-black tracking-tight text-on-surface" aria-live="polite">
                    {voteCount.toLocaleString()}
                    </p>
                    <p className="text-xs text-on-surface-variant">Votes cast</p>
                </div>
            </div>
        </Widget>
      </SidebarSection>
    </Sidebar>
  );
}