import * as React from "react";
import { Shield, User, LogOut, Bell, Landmark, ChevronDown } from "lucide-react";
import { AppView, NotificationItem } from "@/src/types";
import { Student } from "@/src/types";

interface HeaderProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  isAdmin: boolean;
  student?: Student | null;
  notifications?: NotificationItem[];
  onNotificationsToggle?: () => void;
  onLogout?: () => void;
}

export function Header({
  currentView,
  setView,
  isAdmin,
  student,
  notifications = [],
  onNotificationsToggle,
  onLogout,
}: HeaderProps) {
  const isAnonymous = currentView === AppView.AUTH || currentView === AppView.REGISTRY_LOOKUP || currentView === AppView.VERIFY || currentView === AppView.VERIFY_CONFIRM;
  const [showProfile, setShowProfile] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <header className="bg-white border-b border-outline-variant fixed top-0 w-full z-50 h-16">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        <button 
          className="flex items-center gap-2 cursor-pointer group hover:opacity-80"
          onClick={() => setView(isAdmin ? AppView.ADMIN_DASHBOARD : AppView.AUTH)}
        >
          <Landmark className="text-primary-container fill-primary-container" />
          <span className="text-xl font-bold tracking-widest uppercase text-on-surface">CivicVote</span>
        </button>

        <div className="flex items-center gap-4">
          {isAnonymous ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full border border-outline-variant">
              <Shield className="w-4 h-4 text-secondary fill-secondary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Encrypted</span>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowProfile(false);
                  setShowNotifications((p) => !p);
                  onNotificationsToggle?.();
                }}
                className="relative p-2 hover:bg-surface-container rounded-full"
              >
                <Bell className="w-5 h-5 text-on-surface-variant" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-[10px] font-black bg-secondary text-white rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowProfile((p) => !p)}
                className="flex items-center gap-1 p-2 hover:bg-surface-container rounded-lg"
              >
                <User className="w-5 h-5" />
                <ChevronDown className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setShowProfile(false);
                  onLogout?.();
                  setView(AppView.AUTH);
                }}
                className="p-2 hover:text-error"
              >
                <LogOut className="w-5 h-5 text-on-surface-variant" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
