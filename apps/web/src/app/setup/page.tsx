"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useCurrentUser } from "@/hooks";
import { Loader2, ShieldCheck, AlertCircle, ShieldX } from "lucide-react";
import { useRouter } from "next/navigation";

// Allowed email for bootstrapping admin access
const BOOTSTRAP_EMAIL = "manapuljasper@gmail.com";

export default function AdminSetupPage() {
  const router = useRouter();
  const { user, role, isLoading: userLoading, isAuthenticated } = useCurrentUser();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if any super admins exist
  const existingAdmins = useQuery(api.admin.checkSuperAdminExists);
  const createSuperAdmin = useMutation(api.admin.createSuperAdminProfile);

  // Check if user has access to this page
  const isAllowedEmail = user?.email === BOOTSTRAP_EMAIL;
  const isSuperAdmin = role === "super_admin";
  const hasAccess = isAllowedEmail || isSuperAdmin;

  const handleCreateAdmin = async () => {
    if (!user?._id) return;

    setIsCreating(true);
    setError(null);

    try {
      await createSuperAdmin({
        userId: user._id,
        permissions: ["all"],
      });
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create admin profile");
    } finally {
      setIsCreating(false);
    }
  };

  // Loading state
  if (userLoading || existingAdmins === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
          <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="max-w-md mx-4 rounded-2xl bg-[var(--background-white)] border border-[var(--border)] p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--primary)] mb-2">
            Authentication Required
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            Please log in first to set up your admin account.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-2.5 font-medium text-white hover:bg-[var(--primary-light)] transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Access denied - not allowed email and not a super admin
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="max-w-md mx-4 rounded-2xl bg-[var(--background-white)] border border-[var(--border)] p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <ShieldX className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--primary)] mb-2">
            Access Denied
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            You don&apos;t have permission to access this page.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-2.5 font-medium text-white hover:bg-[var(--primary-light)] transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  // Super admin already exists
  if (existingAdmins) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="max-w-md mx-4 rounded-2xl bg-[var(--background-white)] border border-[var(--border)] p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--primary)] mb-2">
            Setup Already Complete
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            A super admin already exists. Contact an existing admin to grant you access.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-2.5 font-medium text-white hover:bg-[var(--primary-light)] transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  // Show setup form
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="max-w-md mx-4 rounded-2xl bg-[var(--background-white)] border border-[var(--border)] p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
            <ShieldCheck className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--primary)] mb-2">
            Admin Setup
          </h1>
          <p className="text-[var(--text-secondary)]">
            No super admin exists yet. Set up your admin account to manage the system.
          </p>
        </div>

        <div className="rounded-xl bg-[var(--background)] border border-[var(--border)] p-4 mb-6">
          <p className="text-sm text-[var(--text-muted)] mb-1">Logged in as</p>
          <p className="font-medium text-[var(--primary)]">
            {user.fullName || user.name || "User"}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={handleCreateAdmin}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white hover:bg-[var(--primary-light)] disabled:opacity-50 transition-colors"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <ShieldCheck className="h-5 w-5" />
              Make Me Super Admin
            </>
          )}
        </button>

        <p className="text-xs text-[var(--text-muted)] text-center mt-4">
          This will grant you full administrative access to the system.
        </p>
      </div>
    </div>
  );
}
