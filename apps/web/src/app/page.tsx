"use client";

import { useCurrentUser } from "@/hooks";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, isLoading, role } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      redirect("/login");
    }

    // Redirect based on role
    if (role === "super_admin") {
      redirect("/admin");
    } else if (role === "doctor") {
      redirect("/doctor");
    } else if (role === "mother") {
      redirect("/mother");
    } else {
      // No profile yet, go to login
      redirect("/login");
    }
  }, [isAuthenticated, isLoading, role]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--accent)]" />
        <p className="mt-4 text-[var(--text-secondary)]">Loading...</p>
      </div>
    </div>
  );
}
