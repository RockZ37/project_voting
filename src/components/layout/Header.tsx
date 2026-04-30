import * as React from "react";
import { Shield, User, LogOut, Bell, Landmark, ChevronDown } from "lucide-react";
import { AppView } from "@/src/types";
import { Student } from "@/src/types";

interface HeaderProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  isAdmin: boolean;
  student?: Student | null;
}

export function Header({ currentView, setView, isAdmin, student }: HeaderProps) {
  const isAnonymous = currentView === AppView.AUTH || currentView === AppView.VERIFY;
  const [showProfile, setShowProfile] = React.useState(false);

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
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfile((prev) => !prev)}
                  className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <User className="w-5 h-5" />
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showProfile && student && !isAdmin && (
                  <div className="absolute right-0 top-10 w-[280px] sm:w-[320px] rounded-2xl border border-outline-variant bg-white shadow-2xl overflow-hidden z-50">
                    <div className="p-4 bg-surface-container-low border-b border-outline-variant/30">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">Profile</p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container border border-outline-variant/30 shrink-0">
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-on-surface truncate">{student.name}</p>
                          <p className="text-xs text-on-surface-variant truncate">{student.department}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">HTU Index Number</p>
                        <p className="font-mono text-sm font-bold text-on-surface break-all">{student.id}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Status</p>
                        <p className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700">
                          {student.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Email</p>
                        <p className="text-sm font-medium text-on-surface break-all">{student.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <LogOut 
                className="w-5 h-5 text-on-surface-variant cursor-pointer hover:text-error" 
                onClick={() => {
                  setShowProfile(false);
                  setView(AppView.AUTH);
                }}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
