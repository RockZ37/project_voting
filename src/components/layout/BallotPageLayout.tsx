import * as React from "react";
import { Menu, X } from "lucide-react";
import { BallotSidebar } from "@/src/components/layout/BallotSidebar";

interface BallotPageLayoutProps {
  voteCount: number;
  children: React.ReactNode;
}

export function BallotPageLayout({ voteCount, children }: BallotPageLayoutProps) {
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

  return (
    <div className="min-h-screen">
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
        aria-label="Toggle sidebar"
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed left-0 top-16 bottom-0 z-40 w-72 bg-white border-r border-outline-variant overflow-y-auto transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <BallotSidebar voteCount={voteCount} />
        </div>
      </aside>

      {/* Desktop + Mobile layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-36">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
          {/* Desktop sidebar - hidden on mobile */}
          <aside className="hidden lg:block lg:col-span-3 order-first">
            <BallotSidebar voteCount={voteCount} />
          </aside>

          <div className="lg:col-span-9 space-y-8 order-last">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default BallotPageLayout;