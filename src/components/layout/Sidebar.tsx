import { Card } from "@/src/components/ui/Card";
import * as React from "react";

export function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
}

export function SidebarSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant px-4">{title}</p>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

export function Widget({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-surface-container-low border-outline-variant/50 rounded-2xl p-4">
            {children}
        </div>
    )
}

interface SidebarLinkProps {
    href: string;
    children: React.ReactNode;
    active?: boolean;
    icon?: React.ReactNode;
}

export function SidebarLink({ href, children, active, icon }: SidebarLinkProps) {
    return (
        <a
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-bold ${
                active
                ? "bg-secondary/10 text-secondary"
                : "text-on-surface-variant hover:bg-on-surface/5"
            }`}
        >
            {icon && <span className={active ? "text-secondary" : "text-on-surface-variant"}>{icon}</span>}
            <span className="truncate">{children}</span>
        </a>
    )
}