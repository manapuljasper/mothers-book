"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "./Avatar";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  logo?: string;
  navigation: NavSection[];
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
  settingsHref?: string;
  onLogout?: () => void;
}

export function Sidebar({ logo = "MaternaMD", navigation, user, settingsHref = "/settings", onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-8 flex items-center">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--primary)]">{logo}</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 flex flex-col gap-2 overflow-y-auto">
        {navigation.map((section, idx) => (
          <div key={idx} className={idx === 0 ? "py-2" : "py-4"}>
            <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-4">
              {section.title}
            </p>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-0 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-[var(--primary)] border-r-2 border-[var(--primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--primary)]",
                    item.badge && "flex justify-between items-center"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                  {item.badge && (
                    <span className="text-[10px] font-bold text-[var(--text-muted)]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Settings at bottom */}
        <div className="mt-auto py-6">
          <Link
            href={settingsHref}
            className="block px-0 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Settings
          </Link>
        </div>
      </nav>

      {/* User Profile */}
      {user && (
        <div className="p-6 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar src={user.avatar} name={user.name} size="sm" />
              <div className="flex flex-col overflow-hidden">
                <p className="text-xs font-semibold text-[var(--primary)] truncate">{user.name}</p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">{user.role}</p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--background-white)] border border-[var(--border)] shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? (
          <X className="h-5 w-5 text-[var(--primary)]" />
        ) : (
          <Menu className="h-5 w-5 text-[var(--primary)]" />
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 w-[240px] flex flex-col border-r border-[var(--border)] bg-[var(--background-white)] z-40 transform transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[240px] flex-col border-r border-[var(--border)] bg-[var(--background-white)] flex-shrink-0 relative z-20">
        <SidebarContent />
      </aside>
    </>
  );
}
