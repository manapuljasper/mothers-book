"use client";

import { useCurrentUser, useSignOut } from "@/hooks";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/ui/Sidebar";
import { Loader2 } from "lucide-react";

const adminNavigation = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/admin" }],
  },
  {
    title: "Catalog Management",
    items: [
      { label: "Medicines", href: "/admin/medicines" },
      { label: "Laboratory Tests", href: "/admin/laboratory" },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const signOut = useSignOut();
  const { user, superAdminProfile, role, isLoading, isAuthenticated } = useCurrentUser();

  const handleLogout = () => {
    signOut();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
          <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not a super admin
  if (!isAuthenticated) {
    redirect("/login");
  }

  if (role !== "super_admin") {
    if (role === "doctor") redirect("/doctor");
    if (role === "mother") redirect("/login");
    redirect("/login");
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        logo="MaternaMD Admin"
        navigation={adminNavigation}
        user={
          user
            ? {
                name: user.fullName || user.name || "Admin",
                role: "System Administrator",
              }
            : undefined
        }
        settingsHref="/admin/settings"
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--background)] relative z-10 lg:ml-0">
        {children}
      </main>
    </div>
  );
}
