"use client";

import { useCurrentUser } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, role } = useCurrentUser();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && role !== "mother") {
      setIsRedirecting(true);
      // Redirect based on role
      if (role === "super_admin") {
        router.replace("/admin");
      } else if (role === "doctor") {
        router.replace("/doctor");
      } else {
        // No role yet, go to role selection
        router.replace("/role-select");
      }
    }
  }, [isLoading, isAuthenticated, role, router]);

  // Show loading while checking auth or redirecting
  if (isLoading || isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
          <p className="text-sm text-[var(--text-secondary)]">
            {isRedirecting ? "Redirecting..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // If authenticated (and not mother), show loading until redirect state kicks in
  if (isAuthenticated && role !== "mother") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
          <p className="text-sm text-[var(--text-secondary)]">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
