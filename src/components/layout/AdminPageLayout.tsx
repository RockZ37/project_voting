import * as React from "react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { AppView, Election } from "@/src/types";

interface AdminPageLayoutProps {
  currentView?: AppView;
  onNavigate?: (view: AppView) => void;
  onCreateElection?: () => void;
  onAddCandidate?: () => void;
  children: React.ReactNode;
  currentElection?: Election | null;
  elections?: Election[];
}

export function AdminPageLayout({
  currentView,
  onNavigate,
  onCreateElection,
  onAddCandidate,
  children,
}: AdminPageLayoutProps) {
  const doNavigate = (view: AppView) => {
    if (onNavigate) return onNavigate(view);
    // fallback to existing event-based navigation for compatibility
    const mapping = {
      [AppView.ADMIN_DASHBOARD]: 'dashboard',
      [AppView.ADMIN_REGISTRY]: 'registry',
      [AppView.ADMIN_LOGS]: 'logs',
    } as Record<AppView, string>;
    window.dispatchEvent(new CustomEvent('admin-nav', { detail: mapping[view] }));
  };
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 lg:shrink-0 lg:sticky lg:top-24 lg:h-[calc(100vh-96px)] lg:overflow-y-auto">
          <Card className="p-4 space-y-4">
            <h4 className="text-sm font-black uppercase text-on-surface-variant">Admin</h4>
            <div className="flex flex-col gap-2">
              <Button
                className={currentView === AppView.ADMIN_DASHBOARD ? "text-left" : "text-left opacity-80"}
                onClick={() => doNavigate(AppView.ADMIN_DASHBOARD)}
              >
                Dashboard
              </Button>
              <Button
                className={currentView === AppView.ADMIN_REGISTRY ? "text-left" : "text-left opacity-80"}
                onClick={() => doNavigate(AppView.ADMIN_REGISTRY)}
              >
                Registry
              </Button>
              <Button
                className={currentView === AppView.ADMIN_LOGS ? "text-left" : "text-left opacity-80"}
                onClick={() => doNavigate(AppView.ADMIN_LOGS)}
              >
                Logs
              </Button>
            </div>

            {(onCreateElection || onAddCandidate) && (
              <div className="pt-4 border-t">
                <p className="text-[10px] font-black text-on-surface-variant uppercase">Quick Actions</p>
                <div className="flex flex-col gap-2 mt-2">
                  {onCreateElection && (
                    <Button className="w-full" onClick={onCreateElection}>
                      Create Election
                    </Button>
                  )}
                  {onAddCandidate && (
                    <Button variant="outline" className="w-full" onClick={onAddCandidate}>
                      Add Candidate
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

export default AdminPageLayout;
