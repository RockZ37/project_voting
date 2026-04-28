import { Shield, User, LogOut, Bell, Landmark } from "lucide-react";
import { AppView } from "@/src/types";

interface HeaderProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  isAdmin: boolean;
}

export function Header({ currentView, setView, isAdmin }: HeaderProps) {
  const isAnonymous = currentView === AppView.AUTH || currentView === AppView.VERIFY;

  return (
    <header className="bg-white border-b border-outline-variant fixed top-0 w-full z-50 h-16">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setView(isAdmin ? AppView.ADMIN_DASHBOARD : AppView.AUTH)}
        >
          <Landmark className="text-primary-container fill-primary-container group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold tracking-widest uppercase text-on-surface">CivicVote</span>
        </div>

        {!isAnonymous && (
          <nav className="hidden md:flex gap-8">
            {isAdmin ? (
              <>
                <button 
                  onClick={() => setView(AppView.ADMIN_DASHBOARD)}
                  className={currentView === AppView.ADMIN_DASHBOARD ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary"}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setView(AppView.ADMIN_REGISTRY)}
                  className={currentView === AppView.ADMIN_REGISTRY ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary"}
                >
                  Registry
                </button>
                <button 
                  onClick={() => setView(AppView.ADMIN_LOGS)}
                  className={currentView === AppView.ADMIN_LOGS ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary"}
                >
                  Logs
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setView(AppView.BALLOT)}
                  className={currentView === AppView.BALLOT ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary"}
                >
                  Ballot
                </button>
                <button className="text-on-surface-variant hover:text-primary">Status</button>
                <button className="text-on-surface-variant hover:text-primary">Support</button>
              </>
            )}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {isAnonymous ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full border border-outline-variant">
              <Shield className="w-4 h-4 text-secondary fill-secondary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Encrypted Session</span>
            </div>
          ) : (
            <>
              <div className="relative group">
                <Bell className="w-5 h-5 text-on-surface-variant cursor-pointer group-hover:text-primary" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
              </div>
              <User className="w-5 h-5 text-on-surface-variant cursor-pointer hover:text-primary" />
              <LogOut 
                className="w-5 h-5 text-on-surface-variant cursor-pointer hover:text-error" 
                onClick={() => setView(AppView.AUTH)}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
