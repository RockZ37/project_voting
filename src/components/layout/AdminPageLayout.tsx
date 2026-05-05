import * as React from "react";
import { Menu, X } from "lucide-react";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { AppView, Election } from "@/src/types";

interface AdminPageLayoutProps {
  currentView?: AppView;
  onNavigate?: (view: AppView) => void;
  onCreateElection?: () => void;
  onCreateCandidate?: () => void;
  onAddCandidate?: () => void;
  children: React.ReactNode;
  currentElection?: Election | null;
  elections?: Election[];
}

export function AdminPageLayout({
  currentView,
  onNavigate,
  onCreateElection,
  onCreateCandidate,
  onAddCandidate,
  children,
}: AdminPageLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };

    if (sidebarOpen) {
      window.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const doNavigate = (view: AppView) => {
    if (onNavigate) return onNavigate(view);
    const mapping = {
      [AppView.ADMIN_DASHBOARD]: 'dashboard',
      [AppView.ADMIN_REGISTRY]: 'registry',
      [AppView.ADMIN_LOGS]: 'logs',
      [AppView.ADMIN_CREATE]: 'create-election',
      [AppView.ADMIN_CREATE_CANDIDATE]: 'create-candidate',
    } as Record<AppView, string>;
    window.dispatchEvent(new CustomEvent('admin-nav', { detail: mapping[view] }));
  };
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
      {/* Mobile drawer backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile hamburger button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-6 left-6 z-40 lg:hidden flex items-center justify-center w-14 h-14 rounded-full bg-secondary shadow-lg hover:bg-secondary/90 transition-colors text-white"
        aria-label="Toggle admin sidebar"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile drawer */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 w-72 bg-surface-container border-r border-outline-variant overflow-y-auto transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Admin</h3>
            <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-on-surface/10 rounded-lg">
              <X size={20} className="text-on-surface-variant" />
            </button>
          </div>
          <div className="space-y-2">
            <Button className="w-full text-left" onClick={() => { doNavigate(AppView.ADMIN_DASHBOARD); setSidebarOpen(false); }}>Dashboard</Button>
            <Button className="w-full text-left" onClick={() => { doNavigate(AppView.ADMIN_REGISTRY); setSidebarOpen(false); }}>Registry</Button>
            <Button className="w-full text-left" onClick={() => { doNavigate(AppView.ADMIN_LOGS); setSidebarOpen(false); }}>Logs</Button>
            <Button className="w-full text-left" onClick={() => { doNavigate(AppView.ADMIN_CREATE); setSidebarOpen(false); }}>Create Election</Button>
            <Button className="w-full text-left" onClick={() => { doNavigate(AppView.ADMIN_CREATE_CANDIDATE); setSidebarOpen(false); }}>Create Candidate</Button>
          </div>
        </div>
      </aside>

      {/* Desktop layout */}
      <aside className="hidden lg:block w-72 shrink-0 self-stretch overflow-y-auto">
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
            <Button className="text-left" onClick={() => { if (onCreateElection) onCreateElection(); else doNavigate(AppView.ADMIN_CREATE); }}>
              Create Election
            </Button>
            <Button className="text-left" onClick={() => { if (onCreateCandidate) onCreateCandidate(); else doNavigate(AppView.ADMIN_CREATE_CANDIDATE); }}>
              Create Candidate
            </Button>
          </div>
        </Card>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

export default AdminPageLayout;
