"use client";

import { useCurrentUser } from "@/hooks";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/ui/Sidebar";
import { Loader2 } from "lucide-react";

const doctorNavigation = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/doctor" }],
  },
  {
    title: "Maternal Care",
    items: [
      { label: "Mothers", href: "/doctor/mothers" },
      { label: "Schedule", href: "/doctor/schedule" },
      { label: "Deliveries", href: "/doctor/deliveries" },
      { label: "Messages", href: "/doctor/messages", badge: "3" },
    ],
  },
];

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, doctorProfile, role, isLoading, isAuthenticated } = useCurrentUser();

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

  // Redirect if not authenticated or not a doctor
  if (!isAuthenticated) {
    redirect("/login");
  }

  if (role !== "doctor") {
    if (role === "mother") redirect("/mother");
    if (role === "super_admin") redirect("/admin");
    redirect("/login");
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        logo="MaternaMD"
        navigation={doctorNavigation}
        user={
          user
            ? {
                name: user.fullName || user.name || "Doctor",
                role: doctorProfile?.specialization || "Obstetrician",
              }
            : undefined
        }
        settingsHref="/doctor/settings"
      />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--background)] relative z-10 lg:ml-0">
        {children}
      </main>
    </div>
  );
}
